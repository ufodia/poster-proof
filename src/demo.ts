import QRCode from 'qrcode';
import type {OcrWord} from './core';
export const approvedDemo='OPEN STUDIO\n14 NOVEMBER 2026\n18:00 - 22:00\nTHE FOUNDRY\n12 RIVER STREET\nENTRY FREE';
export const expectedQrDemo='https://example.com/tickets';
export async function makeDemo(){
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=1200;
  const c=canvas.getContext('2d')!;c.fillStyle='#eedaca';c.fillRect(0,0,900,1200);
  c.fillStyle='#b64631';c.fillRect(0,0,900,15);c.fillStyle='#273728';
  c.beginPath();c.arc(750,305,220,0,Math.PI*2);c.fill();c.fillStyle='#d0d98b';c.beginPath();c.arc(750,305,155,0,Math.PI*2);c.fill();
  c.fillStyle='#b64631';c.beginPath();c.arc(120,540,130,0,Math.PI*2);c.fill();c.fillStyle='#eedaca';c.fillRect(0,540,300,200);
  const words:OcrWord[]=[];const lines:string[]=[];
  function text(s:string,x:number,y:number,size:number,weight=500,color='#263427'){
    c.font=`${weight} ${size}px Arial`;c.fillStyle=color;c.fillText(s,x,y);lines.push(s);
    let at=x;for(const w of s.split(' ')){const width=c.measureText(w).width;words.push({text:w,confidence:97,bbox:{x0:at,y0:y-size*.8,x1:at+width,y1:y+size*.2}});at+=c.measureText(w+' ').width;}
  }
  text('OPEN',64,190,120,800);text('STUDIO',64,305,120,800);
  text('19 NOVEMBER 2026',67,666,39,600);text('18:00 - 22:00',67,724,39,500);
  text('THE FOUNDRY',67,834,32,700);text('12 RIVER STREET',67,884,27,500);
  text('ENTRY FREE',67,1085,32,700);
  const qr=await QRCode.toDataURL('https://example.com/studio',{width:170,margin:2,color:{dark:'#263427',light:'#eedaca'}});
  const img=new Image();img.src=qr;await img.decode();c.drawImage(img,650,970,170,170);
  c.strokeStyle='#b78e76';c.lineWidth=2;c.beginPath();c.moveTo(65,941);c.lineTo(835,941);c.stroke();
  return{canvas,text:lines.join('\n'),words};
}
