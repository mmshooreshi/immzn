// server/api/versions/[name].get.ts
import { defineEventHandler } from 'h3';
import { getOctokit } from '~/server/utils/octokit';

export default defineEventHandler(async (event) => {
  const name = event.context.params!.name;
  const {
    public: { githubOwner, githubRepo },
  } = useRuntimeConfig();
  const octokit = getOctokit();

  const { data: commits } = await octokit.repos.listCommits({
    owner: githubOwner,
    repo: githubRepo,
    path: `data/home/${name}`,
    per_page: 10,
  });
  return commits.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    date: c.commit.author?.date,
  }));
});
