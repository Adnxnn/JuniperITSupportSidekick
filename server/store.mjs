import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
const root=new URL('../',import.meta.url);
const seed=JSON.parse(readFileSync(new URL('../data/training.json',import.meta.url)));
const topics=JSON.parse(readFileSync(new URL('../data/topics.json',import.meta.url)));
const links=JSON.parse(readFileSync(new URL('../data/links.json',import.meta.url)));
const location=resolve(process.env.DATABASE_PATH||'./runtime/sidekick.sqlite');
mkdirSync(dirname(location),{recursive:true});
export const db=new DatabaseSync(location);
db.exec(`CREATE TABLE IF NOT EXISTS procedures(id TEXT PRIMARY KEY, payload TEXT NOT NULL, searchable TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS transcript_chunks(id TEXT PRIMARY KEY, source TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS conversations(id TEXT PRIMARY KEY, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS turns(id INTEGER PRIMARY KEY AUTOINCREMENT, conversation_id TEXT NOT NULL, role TEXT NOT NULL, message TEXT NOT NULL, procedure_id TEXT, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS turns_conversation ON turns(conversation_id,id);`);
for(const p of seed){db.prepare('INSERT OR IGNORE INTO procedures(id,payload,searchable) VALUES(?,?,?)').run(p.id,JSON.stringify(p),[p.title,p.platform,...p.aliases].join(' ').toLowerCase());}
export const allProcedures=()=>db.prepare('SELECT payload FROM procedures').all().map(r=>JSON.parse(r.payload));
export const getProcedure=id=>{const r=db.prepare('SELECT payload FROM procedures WHERE id=?').get(id);return r?JSON.parse(r.payload):null;};
export const getTopics=()=>topics.filter(t=>t.procedures.some(id=>!!getProcedure(id)));
export const getLinks=()=>links.filter(x=>/^https:\/\//.test(x.url));
export function startConversation(id){db.prepare('INSERT OR IGNORE INTO conversations(id,created_at) VALUES(?,?)').run(id,new Date().toISOString());}
export function addTurn(id,role,message,procedureId=null){db.prepare('INSERT INTO turns(conversation_id,role,message,procedure_id,created_at) VALUES(?,?,?,?,?)').run(id,role,message,procedureId,new Date().toISOString());}
export function history(id){return db.prepare('SELECT role,message,procedure_id AS procedureId FROM turns WHERE conversation_id=? ORDER BY id DESC LIMIT 12').all(id).reverse();}
export function clearConversation(id){db.prepare('DELETE FROM turns WHERE conversation_id=?').run(id);db.prepare('DELETE FROM conversations WHERE id=?').run(id);}
export function ingestChunk(id,source,body){db.prepare('INSERT INTO transcript_chunks(id,source,body,created_at) VALUES(?,?,?,?)').run(id,source,body,new Date().toISOString());}
export function chunks(){return db.prepare('SELECT id,source,body FROM transcript_chunks').all();}
