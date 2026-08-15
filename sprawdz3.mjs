import { chromium } from 'playwright';
const OUT='/tmp/claude-0/-home-user-blogoklockach/f5cc32c1-2559-5f6e-a731-008065a8ea0f/scratchpad';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1280,height:1000}});
await p.goto('http://localhost:4321/zestaw/21372/',{waitUntil:'domcontentloaded'});
await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(()=>{
  const el=document.querySelector('.foto-glowna,.foto-placeholder');
  const r=el.getBoundingClientRect();
  return {klasa:el.className, szer:Math.round(r.width), wys:Math.round(r.height), naturalne:[el.naturalWidth,el.naturalHeight]};
})));
await p.screenshot({path:`${OUT}/zestaw-21372.png`});
// tabela po zmianie rozmiaru zdjecia
await p.goto('http://localhost:4321/wycofania/',{waitUntil:'domcontentloaded'});
await p.evaluate(()=>window.scrollTo(0,1400)); await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate(()=>{
  const tr=[...document.querySelectorAll('.tabela-setow tbody tr')][1];
  const rTr=tr.getBoundingClientRect();
  const rImg=tr.querySelector('.set-mini,.set-mini-placeholder').getBoundingClientRect();
  return {wysWiersza:Math.round(rTr.height), wysFoto:Math.round(rImg.height)};
})));
await p.screenshot({path:`${OUT}/wycofania-duze-foto.png`});
await b.close();
