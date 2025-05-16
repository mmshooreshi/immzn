// server/api/data/all.ts
import { defineEventHandler } from 'h3';
import { getOctokit } from '~/server/utils/octokit';

export default defineEventHandler(async () => {
  const githubRepo = 'mmshooreshi/immzn';
  const [owner, repo] = githubRepo.split('/');

  const octokit = getOctokit();

  try {
    // Step 1: List all files in data/home folder
    const filesResponse = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/{path}',
      {
        owner,
        repo,
        path: 'data/home',
      },
    );


    const filesData = filesResponse.data;

    if (!Array.isArray(filesData)) {
    throw new Error('Expected an array of files');
    }

    const files = filesData
    .filter((file) => file.type === 'file' && file.name.endsWith('.json'))
    .map((file) => file.name);


    // Step 2: Fetch all files content in parallel
    const fileContents = await Promise.all(
        
      files.map(async (filename: string) => {
        try {
          const response = await octokit.request(
            'GET /repos/{owner}/{repo}/contents/{path}',
            {
              owner,
              repo,
              path: `data/home/${filename}`,
              headers: {
                Accept: 'application/vnd.github.v3.raw', // raw content (JSON)
              },
            },
          );
          return { filename, content: response.data };
        } catch (error) {
          // Return error info per file if needed
          return { filename, error: `Failed to fetch ${filename}` };
        }
      }),
    );

    // Step 3: Aggregate data with your key convention
    const result: Record<string, any> = {};
    for (const file of fileContents) {
      if (file.error) {
        // Could log or skip or add error key
        console.warn(file.error);
        continue;
      }
      const key = file.filename
        .replace(/\.json$/, '')
        .replace(/^\d+[_-]?/, '')
        .replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase());


      result[key] = JSON.parse(file.content?.toString() || '')
    }

    // Step 4: Return aggregated data
    return result;
  } catch (error: any) {
    console.error('Failed to fetch all files:', error);
    return {
      error: `Failed to fetch all files: ${error.message}`,
      status: error.status || 500,
    };
  }
});
