import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

async function getDownload(page,button){
  const wait=page.waitForEvent('download');
  await button.click();
  const download=await wait;
  return {download,content:await readFile(await download.path(),'utf8')};
}

test('local workbench: analysis, evidence, export and responsive layout',async({page},testInfo)=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const done=[];
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang','en');
      await expect(page.locator('#poster')).toHaveAttribute('src',/^data:image\/png/);await expect(page.locator('#qr-state')).toHaveText('Mismatch');
      await page.locator('#qr-target').fill('https://example.com/studio');await page.locator('#compare').click();await expect(page.locator('#qr-state')).toHaveText('Matches');
      await page.locator('#scan').click();await expect(page.locator('#processing')).toContainText('Local OCR complete',{timeout:120000});expect((await page.locator('#transcript').inputValue()).length).toBeGreaterThan(40);
      const report=await getDownload(page,page.locator('#export'));expect(JSON.parse(report.content).transcriptSource).toBe('local-ocr');
      await page.locator('#transcript').fill('Manually edited text');await expect(page.locator('#export')).toBeDisabled();await page.locator('#compare').click();await expect(page.locator('.box')).toHaveCount(0);
      await page.locator('#demo').click();done.push('Real QR decode and destination match','Real local OCR worker + WASM + bundled language','JSON export provenance','Manual edits invalidate coordinate evidence');
  await page.screenshot({path:testInfo.outputPath('desktop.png'),fullPage:false});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:testInfo.outputPath('mobile.png'),fullPage:false});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1)).toBe(false);
  expect(errors).toEqual([]);
});

test('pending artwork disables OCR and cannot overwrite a later demo',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#poster')).toHaveAttribute('src',/^data:image\/png/);
  const png=Buffer.from(await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=2;canvas.height=3;return canvas.toDataURL().split(',')[1];}),'base64');
  await page.evaluate(()=>{const decode=window.createImageBitmap;window.createImageBitmap=async(...args)=>{const image=await decode(...args);return args[0]?.name==='slow.png'?new Promise(resolve=>{window.finishArtwork=()=>resolve(image);}):image;};});
  await page.locator('#file').setInputFiles({name:'slow.png',mimeType:'image/png',buffer:png});
  await expect.poll(()=>page.evaluate(()=>typeof window.finishArtwork)).toBe('function');
  await expect(page.locator('#scan')).toBeDisabled();
  await page.locator('#demo').click();
  await expect(page.locator('#processing')).toContainText('Demo transcript loaded');
  await expect(page.locator('#scan')).toBeEnabled();
  await page.evaluate(()=>window.finishArtwork());
  await expect(page.locator('#filename')).toHaveText('open-studio-demo.png');
  await expect(page.locator('#dimensions')).toHaveText('900 × 1200 px');
});

test('very narrow valid artwork keeps a nonempty analysis canvas',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('#poster')).toHaveAttribute('src',/^data:image\/png/);
  const png=Buffer.from(await page.evaluate(()=>{const canvas=document.createElement('canvas');canvas.width=1;canvas.height=7000;return canvas.toDataURL().split(',')[1];}),'base64');
  await page.locator('#file').setInputFiles({name:'narrow.png',mimeType:'image/png',buffer:png});
  await expect(page.locator('#filename')).toHaveText('narrow.png');
  await expect(page.locator('#dimensions')).toHaveText('1 × 7000 px · resized for analysis');
  await expect(page.locator('#error')).toBeHidden();
  await expect(page.locator('#scan')).toBeEnabled();
  expect(errors).toEqual([]);
});
