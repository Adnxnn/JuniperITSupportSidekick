import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const port=process.env.TEST_PORT||'3077';
const origin=`http://127.0.0.1:${port}`;
const env={...process.env,PORT:port,HOST:'127.0.0.1',TEST_ORIGIN:origin,APP_ORIGIN:origin,OPENAI_API_KEY:'',NODE_ENV:'test'};
const server=spawn(process.execPath,['server/index.mjs'],{env,stdio:['ignore','pipe','pipe']});let logs='';server.stdout.on('data',d=>logs+=d);server.stderr.on('data',d=>logs+=d);
async function run(file){await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[file],{env,stdio:'inherit'});child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(`${file} failed (${code})`)))})}
try{let ready=false;for(let i=0;i<50;i++){if(server.exitCode!==null)throw Error(logs);try{const r=await fetch(origin+'/api/health');if(r.ok){ready=true;break}}catch{}await delay(100)}if(!ready)throw Error('Server did not become ready. '+logs);await run('tests/api.mjs');await run('tests/acceptance.mjs')}finally{server.kill()}
