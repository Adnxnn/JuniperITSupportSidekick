import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base='http://127.0.0.1:3077';
let browser;try{browser=await chromium.launch({headless:true});}catch(e){console.error('Browser unavailable:',e.message);process.exit(2)}
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>console.error('PAGE ERROR',e));
await page.goto(base);await page.getByRole('heading',{name:/Find the right step/}).waitFor();await page.screenshot({path:'/tmp/juniper-home.png',fullPage:true});
await page.getByRole('button',{name:/Password Reset/}).click();await page.getByText('Which password does the user mean?').waitFor();assert.match(page.url(),/assistant/);
await page.getByRole('button',{name:/Network password/}).click();await page.getByText('AD Manager').waitFor();
await page.getByRole('button',{name:'Copy Answer'}).click();await page.getByText('Copied').first().waitFor();
await page.getByRole('button',{name:/Clear conversation/}).click();await page.getByRole('heading',{name:'How can I help?'}).waitFor();
await page.getByLabel('Ask the training assistant').fill('User cannot access the system');await page.getByRole('button',{name:'Send question'}).click();await page.getByRole('button',{name:/VPN/}).click();await page.getByText('Contractor VPN access').waitFor();
await page.getByRole('link',{name:'Quick Links'}).click();await page.getByRole('heading',{name:'Quick Links'}).waitFor();await page.getByLabel('Search tools and websites').fill('meeting');assert.equal(await page.locator('.link-card').count(),1);assert.match(await page.locator('.link-card').first().getAttribute('href'),/teams.microsoft.com/);
await page.reload();await page.getByRole('heading',{name:'Quick Links'}).waitFor();await page.goBack();await page.getByRole('heading',{name:'AI Assistant'}).waitFor();
await page.setViewportSize({width:390,height:844});await page.goto(base);await page.getByRole('button',{name:'Open navigation'}).click();await page.getByRole('link',{name:'AI Assistant'}).click();await page.getByRole('heading',{name:'AI Assistant'}).waitFor();await page.screenshot({path:'/tmp/juniper-mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
console.log('UI acceptance passed');await browser.close();
