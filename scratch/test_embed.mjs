import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf-8');
const key = envFile.split('\n').find(l => l.startsWith('GOOGLE_MERGE_NO_NO_A_')).split('=')[1].trim(); // Actually find GOOGLE_GENERATIVE_AI
const line = envFile.split('\n').find(l => l.startsWith('GOOGLE_GENERATIVE_AI_API_KEY='));
if (line) process.env.GOOGLE_GENERATIVE_AI_API_KEY = line.split('=')[1].trim();

async function run() {
  try {
    console.log("Testing text-embedding-004...");
    const res2 = await embed({
      model: google.textEmbeddingModel('text-embedding-004'),
      value: "hello world"
    });
    console.log("text-embedding-004 success!", res2.embedding.length);
  } catch(e) {
    console.error("text-embedding-004 failed:", e.message);
  }

  try {
    console.log("Testing gemini-embedding-001...");
    const res1 = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: "hello world"
    });
    console.log("gemini-embedding-001 success!", res1.embedding.length);
  } catch(e) {
    console.error("gemini-embedding-001 failed:", e.message);
  }

}

run();
