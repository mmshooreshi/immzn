// server/api/save/[name].post.ts
import { defineEventHandler, readBody } from 'h3';
import { getOctokit } from '~/server/utils/octokit';

export default defineEventHandler(async (event) => {
  const name = event.context.params!.name;
  const newData = await readBody(event);
  const {
    public: { githubOwner, githubRepo },
  } = useRuntimeConfig();
  const octokit = getOctokit();

  // 1) get current file SHA
  const { data: file } = (await octokit.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path: `data/home/${name}`,
  })) as any;

  // 2) commit update
  await octokit.repos.createOrUpdateFileContents({
    owner: githubOwner,
    repo: githubRepo,
    path: `data/home/${name}`,
    message: `Edit ${name} via UI skip-vercel`,
    content: Buffer.from(JSON.stringify(newData, null, 2)).toString('base64'),
    sha: file.sha,
  });

  return { ok: true };
});
