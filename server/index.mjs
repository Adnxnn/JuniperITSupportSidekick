import express from 'express';
import {z} from 'zod';
import {randomUUID} from 'node:crypto';
import {existsSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {getTopics,getLinks,getProcedure,startConversation,addTurn,clearConversation,history} from './store.mjs';
import {answer} from './engine.mjs';
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'16kb'}));
app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('Cache-Control','no-store');next()});
app.get('/api/config',(req,res)=>res.json({topics:getTopics(),links:getLinks(),mode:process.env.OPENAI_API_KEY?'model-assisted':'transcript-search'}));
app.get('/api/topics/:id',(req,res)=>{const topic=getTopics().find(t=>t.id===req.params.id);if(!topic)return res.status(404).json({error:'Topic not found'});res.json({topic,procedures:topic.procedures.map(getProcedure).filter(Boolean)})});
const schema=z.object({message:z.string().trim().min(1).max(1500),conversationId:z.string().uuid().optional(),topicId:z.string().max(50).optional()}).strict();
const ids=z.object({conversationId:z.string().uuid()}).strict();
const token=(req,res)=>{let cookie=decodeURIComponent((req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('sidekick_session='))?.slice(17)||'');if(!/^[0-9a-f-]{36}$/i.test(cookie)){cookie=randomUUID();res.cookie('sidekick_session',cookie,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:86400000})}return cookie};
const ownership=new Map(); // conversations are scoped to the session; no shared chat state.
const validOrigin=(req)=>{const origin=req.get('origin');if(!origin)return true;const host=process.env.APP_ORIGIN||`${req.protocol}://${req.get('host')}`;return origin===host};
app.post('/api/assistant',async(req,res)=>{if(!validOrigin(req))return res.status(403).json({error:'Invalid origin'});const parsed=schema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Enter a question of up to 1500 characters.'});if(parsed.data.topicId&&!getTopics().some(t=>t.id===parsed.data.topicId))return res.status(400).json({error:'Unknown training topic.'});const session=token(req,res);let id=parsed.data.conversationId||randomUUID();if(ownership.has(id)&&ownership.get(id)!==session)return res.status(403).json({error:'Conversation unavailable'});if(!ownership.has(id)&&history(id).length)return res.status(403).json({error:'Conversation unavailable'});
 try{startConversation(id);ownership.set(id,session);const result=await answer(parsed.data.message,id,parsed.data.topicId);addTurn(id,'user',parsed.data.message);addTurn(id,'assistant',result.title,result.kind==='answer'?({ 'Juniper network password reset':'ad-password','BitLocker recovery key':'bitlocker','Mac personal recovery key':'mac-key','Reset MFA registration':'mfa','Locked iPhone or invalid passcode':'iphone','Contractor VPN access':'vpn','Employee cannot access a site':'zscaler','Create a P3 or P4 incident':'ticket','Verify the user':'verification','Password change after a reset':'password-wait','Contractor mobile Teams and Outlook':'mobile-mail'})[result.title]||null:null);res.json({conversationId:id,response:result});}
 catch(e){console.error('Assistant error:',e?.message);res.status(503).json({error:'Something went wrong while processing your request.'})}
});
app.post('/api/conversation/clear',(req,res)=>{if(!validOrigin(req))return res.status(403).json({error:'Invalid origin'});const parsed=ids.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid conversation'});const session=token(req,res);if(ownership.get(parsed.data.conversationId)!==session)return res.status(403).json({error:'Conversation unavailable'});clearConversation(parsed.data.conversationId);ownership.delete(parsed.data.conversationId);res.json({ok:true})});
app.get('/api/health',(_,res)=>res.json({ok:true}));
const root=resolve('dist');if(existsSync(root)){app.use(express.static(root,{index:false}));app.get(/.*/,(req,res)=>{if(req.path.startsWith('/api/'))return res.status(404).json({error:'Not found'});res.sendFile(join(root,'index.html'))});}else if(process.env.NODE_ENV!=='production'){
 const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);
}
const port=Number(process.env.PORT)||3000;app.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`SideKick ready on port ${port}`));

