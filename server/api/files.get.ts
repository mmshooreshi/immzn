// server/api/files.get.ts
import { defineEventHandler } from 'h3';
import { getOctokit } from '~/server/utils/octokit';

export default defineEventHandler(async () => {
  const {
    public: { githubOwner, githubRepo },
  } = useRuntimeConfig();
  const octokit = getOctokit();
  const res = await octokit.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path: 'data/home',
  });
  if (!Array.isArray(res.data)) return [];
  return res.data
    .filter((item) => item.type === 'file' && item.name.endsWith('.json'))
    .map((f) => f.name);
});
