import assert from 'node:assert/strict';
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:3077';
const post=(body,cookie='',origin)=>fetch(base+'/api/assistant',{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{cookie}:{}),...(origin?{origin}:{})},body:JSON.stringify(body)});
const config=await (await fetch(base+'/api/config')).json();assert.equal(config.topics.length,10);
for(const t of config.topics){const r=await fetch(base+'/api/topics/'+t.id);assert.equal(r.status,200);const d=await r.json();assert.ok(d.procedures.length);assert.ok(d.procedures.every(p=>p.source&&p.evidence));}
assert.equal((await fetch(base+'/api/topics/no-such-topic')).status,404);
assert.equal((await post({message:'MFA',topicId:'fake'})).status,400);
assert.equal((await post({message:'MFA'},'','https://unrelated.example')).status,403);
assert.equal((await post({message:''})).status,400);
assert.equal((await post({message:'x'.repeat(1501)})).status,400);
const initial=await post({message:'Where is the Mac personal recovery key?',topicId:'mac'});const cookie=initial.headers.get('set-cookie').split(';')[0];const first=await initial.json();assert.equal(first.response.procedureId,'mac-key');
const next=await (await post({message:'What if it is missing?',topicId:'mac',conversationId:first.conversationId},cookie)).json();assert.match(next.response.failureHandling[0],/next-level/);
assert.equal((await post({message:'What next?',conversationId:first.conversationId})).status,403);
const scoped=await (await post({message:'How do I reset MFA?',topicId:'mac'},cookie)).json();assert.equal(scoped.response.kind,'unknown');
const clear=await fetch(base+'/api/conversation/clear',{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify({conversationId:first.conversationId})});assert.equal(clear.status,200);
const malformed=await fetch(base+'/api/assistant',{method:'POST',headers:{'Content-Type':'application/json',cookie:'sidekick_session=%bad'},body:'{'});assert.equal(malformed.status,400);assert.ok((await malformed.json()).error);
console.log('API checks passed: all topics, scope, sessions, follow-ups, clear, validation and origin.');
