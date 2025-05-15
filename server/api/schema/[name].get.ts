import { defineEventHandler } from 'h3';
import generateSchema from 'generate-schema';
import { getOctokit } from '~/server/utils/octokit';

export default defineEventHandler(async (event) => {
  // Get the :name from /api/schema/:name
  const name = event.context.params!.name!;

  const {
    public: { githubOwner, githubRepo },
  } = useRuntimeConfig();
  const octokit = getOctokit();

  // >>> CORRECTED: no "~/" here, just the repo-relative path
  const res = await octokit.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path: `data/home/${name}`,
  });

  // res.data could be a file object
  const fileObj = res.data as any;
  const json = JSON.parse(
    Buffer.from(fileObj.content, 'base64').toString('utf-8'),
  );
  const schema = generateSchema.json(name.replace('.json', ''), json);

  return { schema, data: json };
});
