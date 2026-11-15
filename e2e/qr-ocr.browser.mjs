import {test,expect} from '@playwright/test';
import QRCode from 'qrcode';
import {readFile} from 'node:fs/promises';

test('OCR ignores the detected QR without altering nearby words or artwork',async({page})=>{
  test.setTimeout(120000);
  await page.goto('/');
  const qr=await QRCode.toDataURL('https://example.com/tickets?source=poster',{width:300,margin:2});
  const image=await page.evaluate(async(qrData)=>{
    const c=document.createElement('canvas');c.width=1100;c.height=900;const g=c.getContext('2d');g.fillStyle='white';g.fillRect(0,0,c.width,c.height);g.fillStyle='black';g.font='bold 64px Arial';g.fillText('OPEN STUDIO',50,125);g.font='bold 45px Arial';g.fillText('14 NOVEMBER 2026',50,220);g.fillText('ENTRY FREE',50,310);g.fillText('TICKETS BELOW',50,570);
    const q=new Image();q.src=qrData;await q.decode();g.drawImage(q,700,470);return c.toDataURL('image/png').split(',')[1];
  },qr);
  await page.locator('#file').setInputFiles({name:'qr-poster.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
  await expect(page.locator('#processing')).toContainText('Artwork loaded');
  await page.locator('#expected').fill('OPEN STUDIO\n14 NOVEMBER 2026\nENTRY FREE\nTICKETS BELOW');
  await page.locator('#qr-target').fill('https://example.com/tickets?source=poster');
  const posterBefore=await page.locator('#poster').getAttribute('src');
  await page.locator('#scan').click();
  await expect(page.locator('#processing')).toContainText('Local OCR complete',{timeout:120000});
  await expect(page.locator('#processing')).toContainText('QR area excluded; inspect overlapping text manually');
  await expect(page.locator('#qr-state')).toHaveText('Matches');
  await expect(page.locator('#finding-count')).toHaveText('0');
  await expect(page.locator('#poster')).toHaveAttribute('src',posterBefore);
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);
  const report=JSON.parse(await readFile(await download.path(),'utf8'));
  expect(report.limitations).toContain('detected QR area was excluded from OCR');
  await page.locator('#expected').fill('OPEN STUDIO\n15 NOVEMBER 2026\nENTRY FREE\nTICKETS BELOW');
  await page.locator('#qr-target').fill('https://example.com/other');
  await page.locator('#compare').click();
  await expect(page.locator('#qr-state')).toHaveText('Mismatch');
  await expect(page.locator('#findings')).toContainText('15');
  await expect(page.locator('#findings')).toContainText('14');
  await page.locator('#transcript').fill('OPEN STUDIO\n14 NOVEMBER 2026\nENTRY FREE\nTICKETS BELOW');
  await page.locator('#compare').click();
  const [editedDownload]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);
  const editedReport=JSON.parse(await readFile(await editedDownload.path(),'utf8'));
  expect(editedReport.transcriptSource).toBe('manual-transcript');
  expect(editedReport.limitations).toContain('detected QR area was excluded from OCR');

  const noQrImage=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1100;c.height=900;const g=c.getContext('2d');g.fillStyle='white';g.fillRect(0,0,c.width,c.height);g.fillStyle='black';g.font='bold 64px Arial';g.fillText('NOTICE',700,600);return c.toDataURL('image/png').split(',')[1];});
  await page.locator('#file').setInputFiles({name:'no-qr.png',mimeType:'image/png',buffer:Buffer.from(noQrImage,'base64')});
  await expect(page.locator('#processing')).toContainText('Artwork loaded');
  await page.locator('#expected').fill('NOTICE');
  await page.locator('#scan').click();
  await expect(page.locator('#processing')).toContainText('Local OCR complete',{timeout:120000});
  await expect(page.locator('#processing')).not.toContainText('QR area excluded');
  await expect(page.locator('#transcript')).toHaveValue(/NOTICE/i);
  await expect(page.locator('#qr-state')).toHaveText('Not decoded');
});
