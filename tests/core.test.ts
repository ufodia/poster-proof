import {describe,it,expect}from'vitest';
import QRCode from'qrcode';
import jsQR from'jsqr';
import {proofText,checkQr,printDensity}from'../src/core';
describe('poster proofreading',()=>{
it('detects a date change without calling it truth',()=>{const r=proofText('OPEN STUDIO 14 NOVEMBER','OPEN STUDIO 19 NOVEMBER');expect(r.findings.some(f=>f.expected==='14'&&f.observed==='19')).toBe(true);expect(r.matched).toBe(3);});
it('normalizes case and decorative punctuation',()=>expect(proofText('Open Studio!','OPEN STUDIO.').findings).toHaveLength(0));
it('tracks repeated text in order',()=>expect(proofText('GO GO NOW','GO NOW').findings.some(f=>f.expected==='go')).toBe(true));
it('flags additional words',()=>expect(proofText('ENTRY FREE','ENTRY FREE TODAY').findings.some(f=>f.kind==='extra')).toBe(true));
it('includes source image coordinates only for an unchanged OCR transcript',()=>{const word={text:'WRONG',confidence:95,bbox:{x0:1,y0:2,x1:3,y1:4}};expect(proofText('RIGHT','WRONG',[word]).findings[0].boxes).toHaveLength(1);expect(proofText('RIGHT','MANUAL',[word]).findings[0].boxes).toHaveLength(0);});
it('flags low-confidence words',()=>expect(proofText('OPEN','OPEN',[{text:'OPEN',confidence:40,bbox:{x0:0,y0:0,x1:20,y1:10}}]).findings[0].kind).toBe('uncertain'));
it('handles no recognized text as missing content',()=>expect(proofText('OPEN STUDIO','').findings[0].expected).toBe('open studio'));
it('rejects missing approved text and oversized inputs',()=>{expect(()=>proofText('','test')).toThrow();expect(()=>proofText('x'.repeat(30001),'x')).toThrow();});
it('compares exact QR destinations',()=>{expect(checkQr('https://example.com/a','https://example.com/a').state).toBe('match');expect(checkQr('https://example.com/b','https://example.com/a').state).toBe('mismatch');expect(checkQr(null,'https://example.com').state).toBe('unreadable');});
it('decodes a real generated QR fixture',()=>{const value='https://example.com/tickets';const qr=QRCode.create(value,{errorCorrectionLevel:'M'});const scale=6,border=4,size=(qr.modules.size+border*2)*scale,data=new Uint8ClampedArray(size*size*4);data.fill(255);for(let y=0;y<qr.modules.size;y++)for(let x=0;x<qr.modules.size;x++)if(qr.modules.get(y,x))for(let dy=0;dy<scale;dy++)for(let dx=0;dx<scale;dx++){const at=(((y+border)*scale+dy)*size+(x+border)*scale+dx)*4;data[at]=data[at+1]=data[at+2]=0;}expect(jsQR(data,size,size)?.data).toBe(value);});
it('calculates print density and rejects invalid sizes',()=>{expect(printDensity(2480,3508,210,297)).toEqual({xDpi:300,yDpi:300});expect(()=>printDensity(100,100,0,10)).toThrow();});
});
