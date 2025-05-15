import { Octokit } from '@octokit/rest';
import { useRuntimeConfig } from '#imports';

export function getOctokit() {
  const config = useRuntimeConfig();
  return new Octokit({ auth: config.githubToken });
}
