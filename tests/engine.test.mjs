import {test} from 'node:test';import assert from 'node:assert/strict';import {answer} from '../server/engine.mjs';
import {startConversation,addTurn} from '../server/store.mjs';import {randomUUID} from 'node:crypto';
test('unknown blue screen is never mapped to a generic laptop procedure',async()=>{const id=randomUUID();assert.equal((await answer('Brand new laptop has a blue screen, what do I do?',id)).kind,'unknown')});
test('ambiguous login asks for a choice',async()=>{const id=randomUUID();const result=await answer('User cannot access the system',id);assert.equal(result.kind,'clarification');assert.equal(result.options.length,3)});
test('BitLocker follow-up does not invent missing-key handling',async()=>{const id=randomUUID();startConversation(id);const first=await answer('Where do I find a BitLocker recovery key?',id);assert.equal(first.platform,'Microsoft Intune');addTurn(id,'assistant',first.title,'bitlocker');const second=await answer('What if I do not find it?',id);assert.equal(second.kind,'unknown')});
test('Mac key missing follows documented escalation',async()=>{const id=randomUUID();const first=await answer('Where is the Mac personal recovery key?',id);startConversation(id);addTurn(id,'assistant',first.title,'mac-key');const next=await answer('What if it is missing?',id);assert.match(next.failureHandling[0],/next-level support/)});

test('clarification choices have usable labels and questions',async()=>{const r=await answer('Password reset',randomUUID());assert.equal(r.kind,'clarification');assert.ok(r.options.every(o=>o.label&&o.question))});
test('topic search cannot return another topic procedure',async()=>{const r=await answer('How do I reset MFA?',randomUUID(),'vpn');assert.equal(r.kind,'unknown')});
test('topic search ignores conversation history from other topics',async()=>{const id=randomUUID();startConversation(id);addTurn(id,'assistant','Mac personal recovery key','mac-key');const r=await answer('What if it is missing?',id,'vpn');assert.equal(r.kind,'unknown')});
test('topic clarification only offers in-topic procedures',async()=>{const r=await answer('Password reset',randomUUID(),'password');assert.equal(r.kind,'clarification');assert.ok(r.options.some(o=>o.label==='Network password'));assert.ok(!r.options.some(o=>o.label==='Phone passcode'))});
test('answers retain transcript source and evidence',async()=>{const r=await answer('How do I reset MFA?',randomUUID(),'mfa');assert.equal(r.kind,'answer');assert.match(r.source,/Recording 3/);assert.ok(r.evidence.length>20)});
test('general assistant includes contractor mobile mail',async()=>{const r=await answer('Contractor needs Teams on mobile',randomUUID());assert.equal(r.title,'Contractor mobile Teams and Outlook')});
const scenarios=[
 ['Which cybersecurity questions do I ask before resetting MFA?','verification'],
 ['User forgot their Juniper network password','ad-password'],
 ['Can the password be changed twice in 24 hours?','password-wait'],
 ['Reset the local Mac password','mac-password'],
 ['Where is the Mac personal recovery key?','mac-key'],
 ['Why is BitLocker asking for a key after an update?','bitlocker-prompts'],
 ['Where do I retrieve a BitLocker key?','bitlocker'],
 ['Authenticator setup still fails after we revoke MFA','mfa'],
 ['How do I get admin portal access?','mfa-admin'],
 ['iPhone has an invalid passcode','iphone'],
 ['My iPhone Juniper network password is wrong','ad-password'],
 ['Contractor VPN access on a non-Juniper laptop','vpn'],
 ['Join an application group or distribution list','groups-membership'],
 ['Employee cannot access a site','zscaler'],
 ['Create a P3 incident','ticket'],
 ['Contractor mobile Outlook access','mobile-mail']
];
for(const [q,id] of scenarios)test('transcript scenario: '+q,async()=>{const r=await answer(q,randomUUID());assert.equal(r.kind,'answer');assert.equal(r.procedureId,id);assert.ok(r.source);assert.ok(r.evidence)});
for(const q of ['Android phone passcode locked','New laptop blue screen','MFA for a broken printer','What is the weather?'])test('unsupported: '+q,async()=>{assert.equal((await answer(q,randomUUID())).kind,'unknown')});
test('employee VPN query never offers contractor assignment steps',async()=>{const r=await answer('Juniper employee VPN roles',randomUUID());assert.deepEqual(r.steps,[]);assert.match(r.notes.join(' '),/must not assign/)});
test('Mac password reset never presents recovery-key navigation',async()=>{const r=await answer('My MacBook password needs resetting',randomUUID());assert.equal(r.procedureId,'mac-password');assert.deepEqual(r.steps,[])});
test('unsupported new question cannot inherit old follow-up',async()=>{const id=randomUUID();startConversation(id);addTurn(id,'assistant','Reset MFA registration','mfa');assert.equal((await answer('What if the printer is not working?',id)).kind,'unknown')});
test('new explicit intent wins over old conversation',async()=>{const id=randomUUID();startConversation(id);addTurn(id,'assistant','Mac personal recovery key','mac-key');assert.equal((await answer('What if the user needs a P4 incident?',id)).procedureId,'ticket')});
test('all reviewed procedures have a topic and supporting evidence',async()=>{const {allProcedures,getTopics,db}=await import('../server/store.mjs');const ids=new Set(getTopics().flatMap(t=>t.procedures));for(const p of allProcedures()){assert.ok(ids.has(p.id),p.id);assert.ok(p.source&&p.evidence,p.id)}db.prepare('INSERT OR REPLACE INTO procedures(id,payload,searchable) VALUES(?,?,?)').run('stale-unsupported',JSON.stringify({id:'stale-unsupported'}),'test');assert.ok(!allProcedures().some(p=>p.id==='stale-unsupported'));db.prepare('DELETE FROM procedures WHERE id=?').run('stale-unsupported')});
test('model outage degrades to unknown without invented text',async()=>{const original=global.fetch,key=process.env.OPENAI_API_KEY;try{process.env.OPENAI_API_KEY='test-only';global.fetch=async()=>{throw Error('offline')};assert.equal((await answer('Unspecified unusual issue',randomUUID())).kind,'unknown')}finally{global.fetch=original;if(key===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=key}});
test('MFA on an iPhone does not trigger screen passcode removal',async()=>{assert.equal((await answer('Reset MFA on the users iPhone',randomUUID())).procedureId,'mfa')});
test('device compliance maps to the taught iPhone checks',async()=>{assert.equal((await answer('Where do I check device compliance?',randomUUID())).procedureId,'iphone')});
test('unspecified Juniper site access asks employment type',async()=>{const r=await answer('User cannot access Juniper sites',randomUUID());assert.equal(r.kind,'clarification');assert.ok(r.options.some(o=>o.label==='Juniper employee'))});
const newScenarios=[
 ['What is the Software Center procedure?','software-center-intro','software-self-service'],
 ['What are the self-service portal steps?','self-service-intro','software-self-service'],
 ['How do I use the networking template?','network-template-intro','software-self-service'],
 ['How do we choose the assignment group from a configuration item?','assignment-routing','assignment-groups'],
 ['Which group handles a networking related issue?','network-assignment','assignment-groups'],
 ['Route SAP Basis production issue','sap-basis','assignment-groups'],
 ['User cannot sign in to Concur','concur-support','assignment-groups'],
 ['Route enterprise data platform BI issue','adp-bi','assignment-groups'],
 ['SAP Security application access issue','sap-security','assignment-groups'],
 ['Which GTM Ops team handles this issue?','gtm-ops','assignment-groups'],
 ['SAP quotation management assignment group','sap-quotation','assignment-groups'],
 ['Demand supply management support group','demand-supply','assignment-groups'],
 ['Intune iOS enrollment with HPE account','ios-enrollment-recap','ios-zoom-recap'],
 ['Zoom licence expiry and Zoom Global Service','zoom-recap','ios-zoom-recap']
];
for(const [question,id,topic] of newScenarios)test('new excerpt: '+id,async()=>{const result=await answer(question,randomUUID(),topic);assert.equal(result.procedureId,id);assert.match(result.source,/New training excerpt/)});
test('topic questions cannot read a routing answer from another topic',async()=>{const result=await answer('Which group handles Concur sign-in?',randomUUID(),'software-self-service');assert.equal(result.kind,'unknown')});
test('the excerpt does not provide Software Center installation steps',async()=>{const result=await answer('How do I install from Software Center?',randomUUID(),'software-self-service');assert.deepEqual(result.steps,[]);assert.match(result.notes.join(' '),/no installation/)});
