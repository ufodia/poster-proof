import './style.css';
import {createWorker,type Worker}from'tesseract.js';
import jsQR from'jsqr';
import {proofText,checkQr,printDensity,type OcrWord,type ProofReport}from'./core';
import {makeDemo,approvedDemo,expectedQrDemo}from'./demo';

document.querySelector('#app')!.innerHTML=`<header><a class="brand" href="#"><span class="mark">P<span>•</span></span>PosterProof<span class="byline">AN UFODIA TOOL</span></a><nav aria-label="Main navigation"><a href="#desk">Proof desk</a><a href="#method">How it works</a><a class="support" href="https://buymeacoffee.com/ufodia" target="_blank" rel="noopener noreferrer">☕ Buy us a coffee ↗</a></nav></header>
<main><section class="intro"><div><p class="eyebrow">FOR THE MOMENT BEFORE “PRINT”</p><h1>Beautiful poster.<br><em>Wrong date?</em></h1><p class="lead">A final look at the words, links, and tiny details inside your AI-generated artwork.</p></div><div class="intro-note"><span class="note-number">01 /</span><p>Check the details.<br>Keep the design.</p><span>LOCAL OCR · HUMAN REVIEW</span></div></section>
<section id="desk" class="proof-desk"><div class="desk-top"><div><span class="live-dot"></span><h2>Your proof desk</h2><span class="version">v0.1</span></div><div><button id="demo" class="quiet">Load demo</button><label class="upload">Upload artwork ↑<input type="file" id="file" accept="image/png,image/jpeg"></label></div></div><div class="desk-grid"><section class="artwork"><div class="art-meta"><span id="filename">open-studio-demo.png</span><span id="dimensions">900 × 1200 px</span></div><div class="art-stage"><div class="image-frame" id="frame"><img id="poster" alt="Poster being proofread"><div id="overlay" aria-hidden="true"></div></div></div><div class="art-footer"><span><i></i> Highlighted areas need your attention</span><button id="download-demo" class="quiet">Save artwork ↓</button></div></section><section class="inspection" aria-labelledby="inspection-title"><div class="inspection-heading"><p class="eyebrow">THE REFERENCE</p><h3 id="inspection-title">What should it say?</h3><p>Paste the approved copy in reading order.</p></div><label for="expected" class="sr-only">Approved poster text</label><textarea id="expected" rows="7" maxlength="30000" spellcheck="false"></textarea><label for="qr-target">Expected QR destination <span>optional</span></label><input id="qr-target" type="url" placeholder="https://your-site.com/tickets"><div class="print-fields"><div><label for="print-width">Print width · mm</label><input id="print-width" type="number" value="210" min="1" max="10000"></div><div><label for="print-height">Print height · mm</label><input id="print-height" type="number" value="297" min="1" max="10000"></div></div><button id="scan" class="primary">Run local OCR <span>↗</span></button><p class="processing-note" id="processing" role="status">Demo transcript loaded. Rescan to run real OCR.</p><div class="ocr-details"><label for="transcript">Recognized text <span>Editable</span></label><textarea id="transcript" rows="4" maxlength="30000" spellcheck="false"></textarea><button id="compare" class="text-button">Compare current text →</button></div><p id="error" class="error" role="alert" hidden></p></section></div></section>
<section class="review"><div class="review-top"><div><p class="eyebrow">THE SECOND LOOK</p><h2>Catch it here. Not on 500 copies.</h2></div><button id="export" class="outline" disabled>Export proof report ↓</button></div><div class="stats"><div><span>TEXT FINDINGS</span><strong id="finding-count">—</strong></div><div><span>QR DESTINATION</span><strong id="qr-state">Not checked</strong></div><div><span>EFFECTIVE RESOLUTION</span><strong id="density">—</strong></div><div><span>REVIEWED</span><strong id="review-count">0</strong></div></div><div id="qr-message" class="qr-message"></div><div id="findings" class="findings" aria-live="polite"></div></section>
<section class="method" id="method"><p class="eyebrow">YOUR ARTWORK STAYS ON YOUR DEVICE</p><div><h2>A checkpoint for details.<br>A human for the final call.</h2><div><p>PosterProof runs an English OCR model and QR decoder in your browser. Compare the recognized text with approved copy, inspect the marked regions, and record your review.</p><p>OCR can be wrong. Punctuation and letter case are normalized; image coordinates are hidden after manual transcript edits. A clear report does not certify legibility, meaning, color, bleed, or print readiness.</p><a href="https://github.com/ufodia/poster-proof" target="_blank" rel="noopener noreferrer">Explore the source & documentation ↗</a></div></div></section></main>
<footer><span>PosterProof <b>×</b> Ufodia</span><span>Open source under MIT. Made for a careful last look.</span><a href="https://buymeacoffee.com/ufodia" target="_blank" rel="noopener noreferrer">Support independent tools ↗</a></footer>`;

const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const expected=el<HTMLTextAreaElement>('expected'),transcript=el<HTMLTextAreaElement>('transcript'),qrTarget=el<HTMLInputElement>('qr-target');
let canvas:HTMLCanvasElement|null=null,words:OcrWord[]=[],report:ProofReport|null=null,worker:Worker|null=null;
let decoded:string|null=null,reviewed=new Set<string>(),busy=false,filename='open-studio-demo.png';
let imageGeneration=0,imageLoading=false;
let originalWidth=900,originalHeight=1200,mode='demo-fixture';
const error=(message:string)=>{el('error').textContent=message;el('error').hidden=!message;};
function download(content:Blob,name:string){const url=URL.createObjectURL(content);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function qrScan(){if(!canvas)return;const c=canvas.getContext('2d')!;const pixels=c.getImageData(0,0,canvas.width,canvas.height);decoded=jsQR(pixels.data,pixels.width,pixels.height,{inversionAttempts:'attemptBoth'})?.data||null;}
function setImage(next:HTMLCanvasElement,name:string,width=next.width,height=next.height){canvas=next;filename=name;originalWidth=width;originalHeight=height;el<HTMLImageElement>('poster').src=canvas.toDataURL('image/png');el('filename').textContent=name;el('dimensions').textContent=`${width} × ${height} px${width!==next.width||height!==next.height?' · resized for analysis':''}`;qrScan();}
function render(){
  if(!report)return;
  const qr=checkQr(decoded,qrTarget.value);
  el('finding-count').textContent=String(report.findings.filter(f=>!reviewed.has(f.id)).length);
  el('review-count').textContent=`${reviewed.size} / ${report.findings.length}`;
  el('qr-state').textContent={match:'Matches',mismatch:'Mismatch',unreadable:'Not decoded','not-configured':'Not configured'}[qr.state];
  el('qr-state').className=qr.state==='match'?'good':qr.state==='mismatch'?'bad':'';
  el('qr-message').textContent=qr.message;el('qr-message').className=`qr-message ${qr.state}`;
  try{const d=printDensity(originalWidth,originalHeight,Number(el<HTMLInputElement>('print-width').value),Number(el<HTMLInputElement>('print-height').value));el('density').textContent=`${d.xDpi} × ${d.yDpi} DPI`;}catch{el('density').textContent='Set print size';}
  const list=el('findings');list.replaceChildren();const overlay=el('overlay');overlay.replaceChildren();
  if(!report.findings.length){const empty=document.createElement('p');empty.className='empty';empty.textContent='No configured text differences found. Inspect the artwork at full size before printing.';list.append(empty);}
  for(const f of report.findings){
    const row=document.createElement('article');row.className=`finding ${reviewed.has(f.id)?'reviewed':''}`;
    const flag=document.createElement('span');flag.className='flag';flag.textContent=f.kind==='uncertain'?'?':'!';
    const body=document.createElement('div');const heading=document.createElement('h3');heading.textContent=f.kind==='uncertain'?'Low-confidence reading':f.kind==='missing'?'Approved copy differs':'Extra recognized text';
    const message=document.createElement('p');message.textContent=f.message;body.append(heading,message);
    const button=document.createElement('button');button.className='review-button';button.textContent=reviewed.has(f.id)?'✓ Reviewed':'Mark reviewed';button.setAttribute('aria-pressed',String(reviewed.has(f.id)));button.onclick=()=>{reviewed.has(f.id)?reviewed.delete(f.id):reviewed.add(f.id);render();};row.append(flag,body,button);list.append(row);
    if(canvas&&!reviewed.has(f.id))for(const box of f.boxes){const mark=document.createElement('div');mark.className='box';mark.style.left=`${box.x0/canvas.width*100}%`;mark.style.top=`${box.y0/canvas.height*100}%`;mark.style.width=`${(box.x1-box.x0)/canvas.width*100}%`;mark.style.height=`${(box.y1-box.y0)/canvas.height*100}%`;overlay.append(mark);}
  }
  el<HTMLButtonElement>('export').disabled=false;
}
function compare(){try{report=proofText(expected.value,transcript.value,words);reviewed=new Set();render();error('');}catch(e){error(e instanceof Error?e.message:String(e));}}
function invalidate(){report=null;reviewed.clear();el<HTMLButtonElement>('export').disabled=true;el('finding-count').textContent='—';el('review-count').textContent='—';el('qr-state').textContent='Not checked';el('qr-state').className='';el('qr-message').textContent='';el('overlay').replaceChildren();el('findings').replaceChildren();const p=document.createElement('p');p.className='empty';p.textContent='Content changed. Compare current text to refresh your proof.';el('findings').append(p);}
function loadingImage(loading:boolean){imageLoading=loading;for(const id of ['scan','compare','download-demo'])el<HTMLButtonElement>(id).disabled=busy||loading;}
async function loadDemo(){
  if(busy)return;
  const generation=++imageGeneration;loadingImage(true);invalidate();error('');
  try{
    const demo=await makeDemo();if(generation!==imageGeneration)return;
    words=demo.words;mode='demo-fixture';expected.value=approvedDemo;qrTarget.value=expectedQrDemo;transcript.value=demo.text;setImage(demo.canvas,'open-studio-demo.png');el('processing').textContent='Demo transcript loaded. Rescan to run real OCR.';compare();
  }catch(e){if(generation===imageGeneration)error(e instanceof Error?e.message:'The demo artwork could not be loaded.');}
  finally{if(generation===imageGeneration)loadingImage(false);}
}
el('demo').onclick=()=>void loadDemo();el('compare').onclick=compare;
for(const input of [expected,qrTarget])input.oninput=invalidate;
transcript.oninput=()=>{words=[];mode='manual-transcript';invalidate();};
for(const id of ['print-width','print-height'])el(id).oninput=()=>report&&render();
el<HTMLInputElement>('file').onchange=async e=>{
  const input=e.target as HTMLInputElement,file=input.files?.[0];if(!file||busy)return;
  const generation=++imageGeneration;let image:ImageBitmap|undefined;
  loadingImage(true);invalidate();el('processing').textContent='Reading artwork locally…';error('');
  try{
    if(!['image/png','image/jpeg'].includes(file.type))throw new Error('Choose a PNG or JPEG image.');
    if(file.size>12*1024*1024)throw new Error('Choose an image smaller than 12 MB.');
    image=await createImageBitmap(file);if(generation!==imageGeneration)return;
    if(image.width*image.height>40000000)throw new Error('Use an image with 40 megapixels or fewer.');
    const next=document.createElement('canvas'),scale=Math.min(1,3200/Math.max(image.width,image.height));
    next.width=Math.max(1,Math.round(image.width*scale));next.height=Math.max(1,Math.round(image.height*scale));
    const c=next.getContext('2d')!;c.fillStyle='white';c.fillRect(0,0,next.width,next.height);c.drawImage(image,0,0,next.width,next.height);
    setImage(next,file.name,image.width,image.height);words=[];transcript.value='';mode='uploaded';invalidate();el('processing').textContent='Artwork loaded. Run local OCR to read its text.';error('');
  }catch(e){if(generation===imageGeneration){error(e instanceof Error?e.message:String(e));el('processing').textContent='Artwork was not loaded. Choose another image or load the demo.';}}
  finally{image?.close();if(generation===imageGeneration){loadingImage(false);input.value='';}}
};
el('scan').onclick=async()=>{
  if(!canvas||busy||imageLoading)return;busy=true;invalidate();const scan=el<HTMLButtonElement>('scan');scan.disabled=true;el<HTMLButtonElement>('demo').disabled=true;el<HTMLInputElement>('file').disabled=true;el<HTMLButtonElement>('compare').disabled=true;for(const input of [expected,transcript,qrTarget])input.disabled=true;error('');
  // Freeze an image snapshot; edits during processing cannot change the recognized pixels.
  const snapshot=document.createElement('canvas');snapshot.width=canvas.width;snapshot.height=canvas.height;snapshot.getContext('2d')!.drawImage(canvas,0,0);
  try{
    if(!worker){const base=new URL('ocr/',document.baseURI).href;worker=await createWorker('eng',1,{workerPath:base+'worker.min.js',corePath:base+'core',langPath:base,workerBlobURL:false,cacheMethod:'none',logger:message=>{el('processing').textContent=`${message.status.replace(/\b\w/g,c=>c.toUpperCase())} ${Math.round((message.progress||0)*100)}%`;}});}
    const {data}=await worker.recognize(snapshot,{}, {text:true,blocks:true});
    words=(data.blocks||[]).flatMap(block=>block.paragraphs.flatMap(p=>p.lines.flatMap(line=>line.words.map(w=>({text:w.text,confidence:w.confidence,bbox:w.bbox})))));
    transcript.value=data.text.trim();mode='local-ocr';el('processing').textContent=`Local OCR complete · ${Math.round(data.confidence)} confidence · English model`;compare();
  }catch(e){error(e instanceof Error?e.message:'OCR failed. Ensure the local OCR assets were prepared with npm run dev or npm run build.');el('processing').textContent='OCR did not finish. You can enter a transcript manually.';if(worker){await worker.terminate().catch(()=>{});worker=null;}}
  finally{busy=false;scan.disabled=false;el<HTMLButtonElement>('demo').disabled=false;el<HTMLInputElement>('file').disabled=false;el<HTMLButtonElement>('compare').disabled=false;for(const input of [expected,transcript,qrTarget])input.disabled=false;}
};
el('download-demo').onclick=()=>{const image=canvas,name=filename;image?.toBlob(blob=>{if(blob)download(blob,name.replace(/\.[^.]+$/,'')+'-analysis.png');});};
el('export').onclick=()=>{if(!report)return;const qr=checkQr(decoded,qrTarget.value);let density=null;try{density=printDensity(originalWidth,originalHeight,Number(el<HTMLInputElement>('print-width').value),Number(el<HTMLInputElement>('print-height').value));}catch{}download(new Blob([JSON.stringify({...report,image:{filename,width:originalWidth,height:originalHeight,analysisWidth:canvas?.width,analysisHeight:canvas?.height},transcriptSource:mode,qr:{...qr,decoded,expected:qrTarget.value},density,reviewed:[...reviewed]},null,2)+'\n'],{type:'application/json'}),'poster-proof-report.json');};
window.addEventListener('pagehide',()=>void worker?.terminate());
void loadDemo();
