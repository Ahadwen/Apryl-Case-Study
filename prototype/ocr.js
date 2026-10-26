// Turns an uploaded file into text, entirely in the browser: the file itself is never uploaded.
// PDFs with a text layer are read directly; scanned PDFs and photos go through Tesseract OCR.
// Both libraries are vendored (vendor/), so nothing is fetched from a CDN.

const vendor = (path) => new URL(`../vendor/${path}`, import.meta.url).href;

let workerPromise = null;
let onProgress = () => {};

function getWorker() {
  workerPromise ??= (async () => {
    await loadScript(vendor('tesseract/tesseract.min.js'));
    return window.Tesseract.createWorker('eng', 1, {
      workerPath: vendor('tesseract/worker.min.js'),
      corePath: vendor('tesseract/core'),
      langPath: vendor('tesseract/lang'),
      logger: (m) => { if (m.status === 'recognizing text') onProgress(m.progress); },
    });
  })();
  return workerPromise;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`Couldn't load ${src}`));
    document.head.append(s);
  });
}

async function ocrImage(image) {
  const worker = await getWorker();
  const { data } = await worker.recognize(image);
  return data.text;
}

async function readPdf(file, progress) {
  const pdfjs = await import(vendor('pdfjs/pdf.min.mjs'));
  pdfjs.GlobalWorkerOptions.workerSrc = vendor('pdfjs/pdf.worker.min.mjs');
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    let text = content.items.map((it) => it.str + (it.hasEOL ? '\n' : ' ')).join('');
    if (text.replace(/\s/g, '').length < 20) {
      // No usable text layer: a scanned page. Render it and OCR the image.
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      onProgress = (p) => progress((i - 1 + p) / pdf.numPages);
      text = await ocrImage(canvas);
    }
    pages.push(text);
    progress(i / pdf.numPages);
  }
  return pages.join('\n\n');
}

/** @returns {Promise<string>} */
export async function readDocument(file, progress = () => {}) {
  progress(0);
  if (file.type === 'application/pdf') return readPdf(file, progress);
  onProgress = progress;
  const text = await ocrImage(file);
  progress(1);
  return text;
}
