export interface Bounds {x0:number;y0:number;x1:number;y1:number}
export interface OcrWord {text:string;confidence:number;bbox:Bounds}
export interface ProofFinding {id:string;kind:'missing'|'extra'|'uncertain';expected:string;observed:string;message:string;boxes:Bounds[]}
export interface ProofReport {version:1;expected:string;observed:string;findings:ProofFinding[];matched:number;total:number;limitations:string}
export const tokenize=(s:string)=>s.normalize('NFC').toLocaleLowerCase('en').replace(/[’‘]/g,"'").match(/[\p{L}\p{N}]+(?:[':./@+-][\p{L}\p{N}]+)*/gu)||[];
/** LCS alignment preserves the reading sequence and repeated token occurrences. */
export function proofText(expected:string,observed:string,words:OcrWord[]=[]):ProofReport {
  if(!expected.trim())throw new Error('Add the approved text before proofreading.');
  if(expected.length>30000||observed.length>30000)throw new Error('Use 30,000 characters or fewer per text.');
  const a=tokenize(expected),b=tokenize(observed);
  if(a.length>1500||b.length>1500)throw new Error('Use 1,500 tokens or fewer per text.');
  const grid=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
  for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)grid[i][j]=a[i]===b[j]?grid[i+1][j+1]+1:Math.max(grid[i+1][j],grid[i][j+1]);
  const flat=words.flatMap(w=>tokenize(w.text).map(token=>({token,word:w})));
  // Only trust token-to-box correspondence when the supplied transcript still matches.
  const boxMap=flat.map(w=>w.token).join(' ')===b.join(' ')?flat:null;
  const findings:ProofFinding[]=[];let i=0,j=0,matched=0;
  const add=(kind:ProofFinding['kind'],ex:string,ob:string,indices:number[],message:string)=>findings.push({id:`p-${findings.length+1}`,kind,expected:ex,observed:ob,message,boxes:boxMap?indices.map(k=>boxMap[k]?.word.bbox).filter(Boolean):[]});
  while(i<a.length||j<b.length){
    if(i<a.length&&j<b.length&&a[i]===b[j]){matched++;i++;j++;continue;}
    const missing:string[]=[],extra:string[]=[],indices:number[]=[];
    while((i<a.length||j<b.length)&&!(i<a.length&&j<b.length&&a[i]===b[j])){
      if(i<a.length&&(j>=b.length||grid[i+1][j]>=grid[i][j+1]))missing.push(a[i++]);
      else{extra.push(b[j]);indices.push(j++);}
    }
    add(missing.length?'missing':'extra',missing.join(' '),extra.join(' '),indices,missing.length?`Approved text differs here. Expected “${missing.join(' ')}”${extra.length?`, observed “${extra.join(' ')}”`:', but no matching words were found'}.`:`Unexpected OCR text: “${extra.join(' ')}”.`);
  }
  if(boxMap)for(const [index,item]of flat.entries())if(item.word.confidence<65)add('uncertain','',item.token,[index],`OCR confidence is ${Math.round(item.word.confidence)} for “${item.token}”. Inspect the image.`);
  return {version:1,expected,observed,findings,matched,total:a.length,limitations:'OCR can misread or omit text. This report compares token order and spelling after case/punctuation normalization; it does not certify visual legibility, layout, meaning, or print readiness.'};
}
export function checkQr(decoded:string|null,expected:string):{state:'match'|'mismatch'|'unreadable'|'not-configured';message:string}{
  if(!expected.trim())return{state:'not-configured',message:decoded?`Decoded content: ${decoded}. Add an expected destination to compare.`:'No expected QR destination configured.'};
  if(!decoded)return{state:'unreadable',message:'No QR code decoded at the analyzed image resolution. Inspect the artwork manually.'};
  return decoded===expected.trim()?{state:'match',message:'Decoded QR content exactly matches the expected destination.'}:{state:'mismatch',message:`Decoded “${decoded}”; expected “${expected.trim()}”.`};
}
export function printDensity(widthPx:number,heightPx:number,widthMm:number,heightMm:number){
  if(![widthPx,heightPx,widthMm,heightMm].every(v=>Number.isFinite(v)&&v>0))throw new Error('Print dimensions must be positive numbers.');
  return{xDpi:Math.round(widthPx/(widthMm/25.4)),yDpi:Math.round(heightPx/(heightMm/25.4))};
}
