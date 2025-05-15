// server/api/revert/[name].post.ts
import { defineEventHandler, readBody } from 'h3';
import { getOctokit } from '~/server/utils/octokit';

export default defineEventHandler(async (event) => {
  const name = event.context.params!.name;
  const { sha } = (await readBody(event)) as { sha: string };
  const {
    public: { githubOwner, githubRepo },
  } = useRuntimeConfig();
  const octokit = getOctokit();

  // fetch old content at that SHA
  const { data: content } = (await octokit.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path: `data/home/${name}`,
    ref: sha,
  })) as any;

  // commit it back
  const { data: latest } = (await octokit.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path: `data/home/${name}`,
  })) as any;

  await octokit.repos.createOrUpdateFileContents({
    owner: githubOwner,
    repo: githubRepo,
    path: `data/home/${name}`,
    message: `Revert ${name} to ${sha}`,
    content: content.content,
    sha: latest.sha,
  });

  return { ok: true };
});
