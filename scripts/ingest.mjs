import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { basename,resolve } from 'node:path';
import {randomUUID} from 'node:crypto';
import {ingestChunk} from '../server/store.mjs';
const file=process.argv[2];if(!file){console.error('Usage: npm run ingest -- path/to/transcript.txt');process.exit(1)}
const source=basename(file),raw=readFileSync(file,'utf8').trim();if(!raw){console.error('Empty transcript');process.exit(1)}
const parts=raw.split(/(?=\b(?:Recording|recording)\s+\d+\b)/).filter(Boolean);
for(const body of parts){for(let i=0;i<body.length;i+=5000)ingestChunk(randomUUID(),source,body.slice(i,i+5000));}
const destination=resolve('runtime','unreviewed-'+Date.now()+'.json');mkdirSync('runtime',{recursive:true});
writeFileSync(destination,JSON.stringify({source,reviewStatus:'pending',notice:'Transcript is stored for review. Extract exact procedures with supporting excerpts and add approved records to data/training.json; never publish raw text as an automatic operational procedure.',chunks:parts.length},null,2));
console.log(`Stored ${parts.length} transcript segment(s). Review receipt: ${destination}`);
