using System.Text;
using System.Text.Json;
using LibDat2;
using BundleIndex = LibBundle3.Index;

Console.OutputEncoding = Encoding.UTF8;

if (args.Length < 2)
{
    Console.Error.WriteLine("Usage:");
    Console.Error.WriteLine("  dotnet run -- <index.bin> list <needle>");
    Console.Error.WriteLine("  dotnet run -- <index.bin> extract <ggpk-path> <output-path>");
    Console.Error.WriteLine("  dotnet run -- dat <dat-path> <dat-name> [row-count]");
    Console.Error.WriteLine("  dotnet run -- base-map <english-dat> <traditional-chinese-dat> <output-json>");
    return 2;
}

if (args[0] == "base-map")
{
    if (args.Length < 4)
    {
        Console.Error.WriteLine("base-map requires <english-dat>, <traditional-chinese-dat>, and <output-json>.");
        return 2;
    }

    LoadSchemaMinDefinitions();
    using var englishStream = File.OpenRead(args[1]);
    using var chineseStream = File.OpenRead(args[2]);
    var englishDat = new DatContainer(englishStream, "BaseItemTypes.dat64", SchemaMin: true);
    var chineseDat = new DatContainer(chineseStream, "BaseItemTypes.dat64", SchemaMin: true);
    var count = Math.Min(englishDat.FieldDatas.Count, chineseDat.FieldDatas.Count);
    var map = new SortedDictionary<string, string>(StringComparer.OrdinalIgnoreCase);

    for (var i = 0; i < count; i++)
    {
        var englishName = englishDat.FieldDatas[i][4].Value?.ToString()?.Trim();
        var chineseName = chineseDat.FieldDatas[i][4].Value?.ToString()?.Trim();
        if (!string.IsNullOrWhiteSpace(englishName) &&
            !string.IsNullOrWhiteSpace(chineseName) &&
            !englishName.Equals(chineseName, StringComparison.Ordinal))
        {
            map[englishName] = chineseName;
        }
    }

    var outputPath = Path.GetFullPath(args[3]);
    Directory.CreateDirectory(Path.GetDirectoryName(outputPath)!);
    File.WriteAllText(outputPath, JsonSerializer.Serialize(map, new JsonSerializerOptions
    {
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        WriteIndented = true,
    }));
    Console.WriteLine($"{outputPath} ({map.Count} entries)");
    return 0;
}

if (args[0] == "dat")
{
    if (args.Length < 3)
    {
        Console.Error.WriteLine("dat requires <dat-path> and <dat-name>.");
        return 2;
    }

    var rowCount = args.Length >= 4 && int.TryParse(args[3], out var parsedRows) ? parsedRows : 10;
    LoadSchemaMinDefinitions();
    using var stream = File.OpenRead(args[1]);
    var dat = new DatContainer(stream, args[2], SchemaMin: true);
    Console.WriteLine($"Rows: {dat.FieldDatas.Count}");
    for (var rowIndex = 0; rowIndex < Math.Min(rowCount, dat.FieldDatas.Count); rowIndex++)
    {
        var row = dat.FieldDatas[rowIndex];
        Console.WriteLine($"Row {rowIndex}: fields={row.Count()}");
        for (var fieldIndex = 0; fieldIndex < row.Count(); fieldIndex++)
        {
            var value = row[fieldIndex].Value;
            Console.WriteLine($"  [{fieldIndex}] {value?.GetType().Name ?? "null"} = {FormatValue(value)}");
        }
    }
    return 0;
}

var indexPath = args[0];
var command = args[1];

using var index = new BundleIndex(indexPath, parsePaths: true);

if (command == "list")
{
    var needle = args.Length >= 3 ? args[2] : "";
    foreach (var file in index.Files.Values
        .Where(file => file.Path is not null)
        .Select(file => file.Path!)
        .Where(path => path.Contains(needle, StringComparison.OrdinalIgnoreCase))
        .OrderBy(path => path))
    {
        Console.WriteLine(file);
    }
    return 0;
}

if (command == "extract")
{
    if (args.Length < 4)
    {
        Console.Error.WriteLine("extract requires <ggpk-path> and <output-path>.");
        return 2;
    }

    var ggpkPath = args[2].Replace('\\', '/');
    var outputPath = args[3];

    if (!index.TryGetFile(ggpkPath, out var file))
    {
        Console.Error.WriteLine($"File not found in index: {ggpkPath}");
        return 1;
    }

    Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(outputPath))!);
    File.WriteAllBytes(outputPath, file.Read().ToArray());
    Console.WriteLine(outputPath);
    return 0;
}

Console.Error.WriteLine($"Unknown command: {command}");
return 2;

static string FormatValue(object? value)
{
    if (value is null)
    {
        return "null";
    }

    if (value is Array array)
    {
        var values = array.Cast<object?>().Take(8).Select(FormatValue);
        var suffix = array.Length > 8 ? ", ..." : "";
        return $"[{string.Join(", ", values)}{suffix}]";
    }

    return value.ToString() ?? "";
}

static void LoadSchemaMinDefinitions()
{
    var schemaPath = Environment.GetEnvironmentVariable("POE_DAT_SCHEMA")
        ?? Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", ".cache", "schema.min.json"));
    if (!File.Exists(schemaPath))
    {
        return;
    }

    using var schema = JsonDocument.Parse(File.ReadAllBytes(schemaPath));
    var tables = schema.RootElement.GetProperty("tables");
    var definitions = new Dictionary<string, KeyValuePair<string, string>[]>();
    foreach (var table in tables.EnumerateArray())
    {
        if (table.TryGetProperty("validFor", out var validFor) && validFor.GetInt32() == 2)
        {
            continue;
        }

        var columns = table.GetProperty("columns");
        var fields = new KeyValuePair<string, string>[columns.GetArrayLength()];
        var unknownIndex = 0;
        var fieldIndex = 0;
        foreach (var column in columns.EnumerateArray())
        {
            var name = column.GetProperty("name").GetString() ?? $"Unknown{unknownIndex++}";
            var type = column.GetProperty("type").GetString() ?? "i32";
            if (type == "array")
            {
                type = "i32";
            }

            if (column.GetProperty("array").GetBoolean())
            {
                type = $"array|{type}";
            }

            fields[fieldIndex++] = new KeyValuePair<string, string>(name, type);
        }

        definitions.TryAdd(table.GetProperty("name").GetString()!.ToLowerInvariant(), fields);
    }

    DatContainer.SchemaMinDatDefinitions = definitions;
}
