export function getCrawlerUserAgent() {
  const repository = process.env.GITHUB_REPOSITORY;
  const repoUrl = repository ? `https://github.com/${repository}` : "https://github.com/your-org/poe-market-watch";
  return `POE Market Watch (${repoUrl})`;
}
