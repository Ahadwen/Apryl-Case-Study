// Generates the prototype's sample documents (all details invented) with Playwright:
//   prototype/samples/clinic-invoice.pdf  a digital PDF with a text layer
//   prototype/samples/clinic-invoice-preview.png  an image of the invoice, for the sample thumbnail
//   prototype/samples/pharmacy-label.jpg  a slightly rotated "photo" of a dispensing label, read by OCR
//   prototype/samples/pharmacy-label-no-id.jpg  the same label with no name or date of birth: it can't be used
//   prototype/samples/medical-letter.pdf (+ -preview.png)  a clinic letter confirming medical necessity
// Run: node scripts/make-samples.cjs

const { chromium } = require('playwright');
const path = require('path');

const out = (f) => path.join(__dirname, '..', 'prototype', 'samples', f);

const invoice = `<!doctype html><html><head><style>
  body { font: 13px/1.5 Helvetica, Arial, sans-serif; color: #222; margin: 48px; }
  .head { display: flex; justify-content: space-between; border-bottom: 2px solid #3b5b7a; padding-bottom: 12px; }
  .brand { font-size: 22px; font-weight: 700; color: #3b5b7a; }
  h1 { font-size: 20px; margin: 24px 0 4px; letter-spacing: .05em; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #ddd; }
  td.r, th.r { text-align: right; }
  .tot td { font-weight: 700; border-bottom: 2px solid #222; }
  .grid { display: flex; gap: 48px; margin-top: 16px; }
  .muted { color: #666; }
</style></head><body>
  <div class="head">
    <div><div class="brand">Northbridge Fertility Clinic</div>
      <div class="muted">48 Wimpole Street, London W1G 8SD<br>Tel: 020 7946 0321 · accounts@northbridge-fertility.example</div></div>
    <div class="muted" style="text-align:right">VAT exempt (medical services)</div>
  </div>
  <h1>INVOICE</h1>
  <div class="grid">
    <div><strong>Invoice no:</strong> NFC-20931<br><strong>Invoice date:</strong> 14 September 2026<br><strong>Status:</strong> Paid in full</div>
    <div><strong>Patient:</strong> Ms Jane Smith<br><strong>DOB:</strong> 03/02/1990<br><strong>NHS no:</strong> 485 777 3456<br>22 Elm Road, London N1 4AB</div>
  </div>
  <table>
    <tr><th>Date</th><th>Description</th><th class="r">Amount</th></tr>
    <tr><td>12/09/2026</td><td>IVF cycle – egg collection under sedation</td><td class="r">£3,600.00</td></tr>
    <tr><td>12/09/2026</td><td>Anaesthetist fee</td><td class="r">£450.00</td></tr>
    <tr><td>12/09/2026</td><td>Embryology laboratory fee</td><td class="r">£200.00</td></tr>
    <tr class="tot"><td></td><td>Total</td><td class="r">£4,250.00</td></tr>
    <tr><td>14/09/2026</td><td>Paid by card</td><td class="r">£4,250.00</td></tr>
  </table>
  <p class="muted" style="margin-top:32px">Thank you. Please quote the invoice number in any correspondence.</p>
</body></html>`;

const label = `<!doctype html><html><head><style>
  body { margin: 0; width: 900px; height: 640px; display: grid; place-items: center;
         background: radial-gradient(circle at 30% 20%, #d8d2c6, #a9a196); }
  .label { width: 640px; background: #fdfcf8; padding: 22px 28px; transform: rotate(-2.2deg);
           box-shadow: 0 10px 30px rgba(0,0,0,.35); font: 18px/1.45 'Courier New', monospace; color: #1a1a1a; }
  .top { display: flex; justify-content: space-between; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px; margin-bottom: 10px; font-weight: 700; }
  .drug { font-size: 22px; font-weight: 700; margin: 6px 0; }
  .warn { border: 2px solid #1a1a1a; padding: 4px 8px; margin: 10px 0; font-weight: 700; }
  .foot { display: flex; justify-content: space-between; font-size: 15px; }
</style></head><body><div class="label">
  <div class="top"><span>ELMWOOD PHARMACY</span><span>Tel 020 7946 0874</span></div>
  <div class="drug">GONAL-F 900 IU/1.5 ml PEN</div>
  <div>Qty: 2 pens</div>
  <div>Inject as directed by your clinic.</div>
  <div class="warn">STORE IN A REFRIGERATOR 2-8°C</div>
  <div>SMITH, JANE &nbsp; DOB 3 Feb 1990</div>
  <div class="foot"><span>Prescriber: Northbridge Fertility Clinic</span><span>10/09/2026</span></div>
</div></body></html>`;

const letter = `<!doctype html><html><head><style>
  body { font: 14px/1.6 Georgia, 'Times New Roman', serif; color: #222; margin: 56px 64px; }
  .head { border-bottom: 2px solid #3b5b7a; padding-bottom: 12px; margin-bottom: 28px; font-family: Helvetica, Arial, sans-serif; }
  .brand { font-size: 22px; font-weight: 700; color: #3b5b7a; }
  .muted { color: #666; font-size: 12px; }
  .sig { margin-top: 36px; }
</style></head><body>
  <div class="head"><div class="brand">Northbridge Fertility Clinic</div>
    <div class="muted">48 Wimpole Street, London W1G 8SD · Tel: 020 7946 0321</div></div>
  <p>20 September 2026</p>
  <p><strong>To whom it may concern</strong></p>
  <p><strong>Re: Ms Jane Smith, DOB 03/02/1990</strong></p>
  <p>I confirm that Ms Smith is under the care of this clinic and that IVF treatment, including egg collection under sedation on 12/09/2026, was medically necessary.</p>
  <p>The treatment is indicated by a diagnosis of bilateral tubal factor infertility, confirmed by hysterosalpingogram in May 2026. In my clinical opinion there is no suitable alternative treatment.</p>
  <p>Please contact the clinic if you need any further information.</p>
  <div class="sig">Yours faithfully,<br><br><em>R. Okafor</em><br>Dr Rachel Okafor, MRCOG<br>Consultant in Reproductive Medicine</div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(invoice);
  await page.pdf({ path: out('clinic-invoice.pdf'), format: 'A4', printBackground: true });
  await page.setViewportSize({ width: 794, height: 640 }); // the content, not the empty rest of the A4 page
  await page.screenshot({ path: out('clinic-invoice-preview.png') });
  await page.setViewportSize({ width: 900, height: 640 });
  await page.setContent(letter);
  await page.pdf({ path: out('medical-letter.pdf'), format: 'A4', printBackground: true });
  await page.setViewportSize({ width: 794, height: 700 });
  await page.screenshot({ path: out('medical-letter-preview.png') });
  await page.setViewportSize({ width: 900, height: 640 });
  await page.setContent(label);
  await page.screenshot({ path: out('pharmacy-label.jpg'), type: 'jpeg', quality: 82 });
  await page.setContent(label.replace(/<div>SMITH, JANE[^<]*<\/div>/, ''));
  await page.screenshot({ path: out('pharmacy-label-no-id.jpg'), type: 'jpeg', quality: 82 });
  await browser.close();
})();
