// server/api/data/[file].ts
import { defineEventHandler, getRouterParam, H3Event } from 'h3';
import { getOctokit } from '~/server/utils/octokit';
export default defineEventHandler(async (event: H3Event) => {
  const file = getRouterParam(event, 'file');
  if (!file) return { error: 'Missing filename' };

  const githubRepo = 'mmshooreshi/immzn';
  const githubPath = `data/home/${file}${file.endsWith('.json') ? '' : '.json'}`;
  
  const [owner, repo] = githubRepo.split('/');

  const octokit = getOctokit();

  try {
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner,
        repo,
        path: githubPath,
        headers: {
          Accept: 'application/vnd.github.v3.raw',
        },
      },
    );

    // If the Accept header worked, response.data is already parsed JSON
    return response.data;
  } catch (error: any) {
    console.error(error);
    return {
      error: `Failed to fetch file from GitHub: ${error.message}`,
      status: error.status || 500,
    };
  }
});
