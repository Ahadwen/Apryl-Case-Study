// Document upload prototype: upload → OCR in the browser → identifiers matched and removed →
// anonymised text to Claude → one list of details the patient confirms or edits → claim.

import { FIELDS, DOCUMENT_EXAMPLES, formatValue, formatDate } from './fields.js';
import { readDocument } from './ocr.js';
import { anonymise } from './identifiers.js';
import { extractFields } from './extract.js';
import { compareValues } from './compare.js';

const SAMPLES = [
  { file: 'clinic-invoice.pdf', label: 'Clinic invoice (PDF)', type: 'application/pdf' },
  { file: 'pharmacy-label.jpg', label: 'Prescription label (photo)', type: 'image/jpeg' },
];

const DEFAULT_PROFILE = { name: 'Jane Smith', dob: '1990-02-03' };

const state = {
  profile: { ...DEFAULT_PROFILE },
  docs: [],          // { id, file, name, status, progress, text, method, anon, result, error, target, targetMiss }
  overrides: {},     // key -> { value, source: 'manual' | 'document', docId }
  confirmed: {},     // key -> signature of the value that was confirmed
  sheet: null,       // { key } or { profile: true }
  submitted: null,
};

let nextId = 1;
const app = document.getElementById('app');
const fileInput = Object.assign(document.createElement('input'), {
  type: 'file', multiple: true, accept: 'application/pdf,image/jpeg,image/png,image/webp',
});
let uploadTarget = null;
fileInput.addEventListener('change', () => {
  addFiles([...fileInput.files], uploadTarget);
  fileInput.value = '';
  uploadTarget = null;
});

// ---------- Field resolution ----------

const docById = (id) => state.docs.find((d) => d.id === id);
const norm = (v) => JSON.stringify(v).toLowerCase().replace(/\s+/g, ' ');

function docValue(doc, field) {
  if (field.source === 'profile') {
    return doc.anon?.found[field.key] ? state.profile[field.key] : undefined;
  }
  return doc.status === 'done' ? doc.result?.[field.key] : undefined;
}

// Where a field's value comes from: a manual entry or chosen re-upload first, then the first
// document that shows it. Other documents that disagree are reported as conflicts.
function resolve(field) {
  const override = state.overrides[field.key];
  let found = override ?? null;
  const conflicts = [];
  for (const doc of state.docs) {
    const value = docValue(doc, field);
    if (value === undefined) continue;
    if (!found) found = { value, source: 'document', docId: doc.id };
    else if (!field.varies && compareValues(field, value, found.value) === 'different') conflicts.push({ value, doc });
  }
  return found && { ...found, conflicts };
}

const signature = (r) => r && `${r.source}|${r.docId}|${norm(r.value)}`;
const isConfirmed = (field, r) => r && state.confirmed[field.key] === signature(r);

function anyDone(field) {
  return field.source === 'profile'
    ? state.docs.some((d) => d.anon)
    : state.docs.some((d) => d.status === 'done');
}

// ---------- Documents ----------

const queue = [];
let reading = false;

function addFiles(files, target = null) {
  for (const file of files) {
    const doc = { id: nextId++, file, name: file.name, status: 'queued', progress: 0, target };
    state.docs.push(doc);
    queue.push(doc);
  }
  render();
  pump();
}

// Tesseract runs one recognition at a time, so documents are read in order. Each one is anonymised
// and sent for analysis as soon as it's read; the patient never has to do anything in between.
async function pump() {
  if (reading) return;
  reading = true;
  while (queue.length) {
    const doc = queue.shift();
    if (!state.docs.includes(doc)) continue;
    doc.status = 'reading';
    render();
    try {
      ({ text: doc.text, method: doc.method } = await readDocument(doc.file, (p) => { doc.progress = p; renderSoon(); }));
      doc.anon = anonymise(doc.text, state.profile);
      analyse(doc);
    } catch (e) {
      console.error(e);
      doc.status = 'error';
      doc.error = `We couldn't read this file. Try a clearer photo or a PDF.`;
      render();
    }
  }
  reading = false;
}

async function analyse(doc) {
  doc.status = 'analysing';
  doc.error = null;
  render();
  try {
    doc.result = await extractFields(doc.anon.redacted);
    doc.status = 'done';
    if (doc.target) {
      const field = FIELDS.find((f) => f.key === doc.target);
      const value = docValue(doc, field);
      if (value !== undefined) state.overrides[field.key] = { value, source: 'document', docId: doc.id };
      else doc.targetMiss = field.label;
    }
  } catch (e) {
    console.error(e);
    doc.status = 'error';
    doc.error = e.message;
  }
  render();
}

function removeDoc(id) {
  state.docs = state.docs.filter((d) => d.id !== id);
  for (const [key, o] of Object.entries(state.overrides)) if (o.docId === id) delete state.overrides[key];
  render();
}

async function loadSample(sample) {
  const res = await fetch(new URL(`samples/${sample.file}`, import.meta.url));
  const blob = await res.blob();
  addFiles([new File([blob], sample.file, { type: sample.type })]);
}

function upload(target = null) {
  uploadTarget = target;
  fileInput.click();
}

// ---------- Rendering ----------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let pending = false;
function renderSoon() {
  if (pending) return;
  pending = true;
  requestAnimationFrame(() => { pending = false; render(); });
}

function redactedHtml(text) {
  return esc(text).replace(/\[(NAME|DOB|ID|EMAIL|PHONE|POSTCODE|ADDRESS)\]/g, '<span class="red">$1</span>');
}

// What the patient sees: progress and what each document added. No redaction details.
function docCard(doc) {
  const head = `
    <div class="doc-head">
      <span class="doc-name">${esc(doc.name)}</span>
      <button class="link" data-action="remove-doc" data-id="${doc.id}">Remove</button>
    </div>`;
  const target = doc.target ? `<p class="small muted">Uploaded for: ${esc(FIELDS.find((f) => f.key === doc.target).label)}</p>` : '';
  let body = '';
  if (doc.status === 'queued' || doc.status === 'reading') {
    body = `<p class="small">Reading your document… ${Math.round(doc.progress * 100)}%</p>
      <div class="bar"><i style="width:${doc.progress * 100}%"></i></div>`;
  } else if (doc.status === 'analysing') {
    body = '<p class="small">Finding your details…</p><div class="bar"><i class="indeterminate"></i></div>';
  } else if (doc.status === 'error') {
    body = `<p class="small warn">${doc.anon ? "Something went wrong reading the details from this document." : esc(doc.error)}</p>
      ${doc.anon ? `<button class="btn sm" data-action="analyse" data-id="${doc.id}">Try again</button>` : ''}`;
  } else if (doc.status === 'done') {
    const added = FIELDS.filter((f) => docValue(doc, f) !== undefined).map((f) => f.label);
    const notYours = !doc.anon.found.name && !doc.anon.found.dob;
    body = `
      <p class="small">${added.length ? `<span class="tick">✓</span> ${esc(added.join(', '))}` : "We couldn't find any claim details on this document."}</p>
      ${notYours ? '<p class="small warn">We couldn\'t find your name or date of birth on this document. Check it\'s yours.</p>' : ''}
      ${doc.targetMiss ? `<p class="small warn">We couldn't find the ${esc(doc.targetMiss.toLowerCase())} on this document either.</p>` : ''}
      ${doc.result.readability_issues ? '<p class="small warn">Parts of this document were hard to read. A clearer photo may help.</p>' : ''}`;
  }
  return `<div class="doc">${head}${target}${body}</div>`;
}

const VERDICTS = {
  same: ['ok', '✓ Same'],
  similar: ['similar', '≈ Similar'],
  different: ['bad', '✗ Differs'],
  expected: ['muted', 'Differs (expected)'],
};

// Every detail that appears on more than one document, compared across them.
function crossCheck() {
  const done = state.docs.filter((d) => d.status === 'done');
  if (done.length < 2) return '';
  const rows = [];
  for (const field of FIELDS) {
    const seen = done.map((doc) => ({ doc, value: docValue(doc, field) })).filter((x) => x.value !== undefined);
    if (seen.length < 2) continue;
    const results = seen.slice(1).map((x) => compareValues(field, seen[0].value, x.value));
    let verdict = results.includes('different') ? 'different' : results.includes('similar') ? 'similar' : 'same';
    if (verdict === 'different' && field.varies) verdict = 'expected';
    const [cls, text] = VERDICTS[verdict];
    rows.push(`<tr><td>${esc(field.label)}</td>
      <td>${seen.map((x) => `<div><span class="muted">${esc(x.doc.name)}:</span> ${esc(formatValue(field, x.value))}</div>`).join('')}</td>
      <td><span class="verdict ${cls}">${text}</span></td></tr>`);
  }
  return `<div class="bs-doc">
    <div class="bs-name">Cross-document check</div>
    <p class="small">Details that appear on more than one document are compared, ignoring formatting. A real difference is flagged to the patient and recorded on the claim for the reviewer; "expected" means documents legitimately differ, e.g. pharmacy vs clinic.</p>
    ${rows.length ? `<table class="xcheck"><tr><th>Detail</th><th>Values</th><th>Result</th></tr>${rows.join('')}</table>` : '<p class="small muted">No detail appears on more than one document yet.</p>'}
  </div>`;
}

// The prototype's explainer, beside the patient's screen: what happens to each document.
function backstage() {
  const docs = state.docs.filter((d) => d.status !== 'queued');
  const step = (n, title, content) => `<div class="bs-step"><span class="bs-n">${n}</span><div><strong>${title}</strong>${content}</div></div>`;
  const cards = docs.map((doc) => {
    if (!doc.anon) {
      return `<div class="bs-doc"><div class="bs-name">${esc(doc.name)}</div>
        ${step(1, 'Read on the device', `<p>${doc.status === 'error' ? esc(doc.error) : `${Math.round(doc.progress * 100)}%…`}</p>`)}</div>`;
    }
    const counts = {};
    for (const [, label] of doc.anon.redacted.matchAll(/\[([A-Z]+)\]/g)) counts[label] = (counts[label] ?? 0) + 1;
    const removed = Object.entries(counts).map(([label, n]) => `<span class="red">${label}</span>${n > 1 ? ` ×${n}` : ''}`).join(' ');
    const matched = `Name ${doc.anon.found.name ? '✓ matched' : '✗ not found'} · Date of birth ${doc.anon.found.dob ? '✓ matched' : '✗ not found'}`;
    let returned = '<p>Waiting…</p>';
    if (doc.status === 'done') returned = `<pre class="json">${esc(JSON.stringify(doc.result, null, 2))}</pre>`;
    if (doc.status === 'error') returned = `<p class="warn">${esc(doc.error)}</p>`;
    return `<div class="bs-doc"><div class="bs-name">${esc(doc.name)}</div>
      ${step(1, 'Read on the device', `<p>${esc(doc.method)}. The file itself is never uploaded.</p>`)}
      ${step(2, 'Identifiers matched and removed in the browser', `<p>${matched} (against the patient's profile)</p><p>Removed: ${removed || 'nothing'}</p>`)}
      ${step(3, 'Sent to Claude: anonymised text only', `<pre class="redacted">${redactedHtml(doc.anon.redacted.trim())}</pre>`)}
      ${step(4, 'Returned: fixed JSON shape', returned)}
    </div>`;
  }).join('');
  return `
    <aside class="backstage">
      <div class="bs-head"><h2>Behind the scenes</h2><span class="bs-badge">Not shown to the patient</span></div>
      <p class="small">GDPR data minimisation: documents are read on the patient's device, their name, date of birth and other identifiers are removed there, and only the anonymised text is sent for analysis. Name and date of birth are filled in from the patient's own account, never from the model.</p>
      ${cards || '<p class="small muted">Upload a document (or a sample) to see what happens to it.</p>'}
      ${crossCheck()}
    </aside>`;
}

function fieldRow(field) {
  const r = resolve(field);
  const label = `<span class="k">${esc(field.label)}</span>`;
  if (!r) {
    if (!anyDone(field)) return `<li class="row">${label}<span class="blank"></span></li>`;
    return `<li class="row missing">${label}<span class="v miss">Missing</span>
      <span class="hint">${esc(field.hint)}</span>
      <span class="acts"><button class="btn sm" data-action="upload-for" data-key="${field.key}">Upload document</button><button class="btn sm" data-action="type-in" data-key="${field.key}">Type it in</button></span></li>`;
  }
  const doc = docById(r.docId);
  const cls = r.source === 'manual' ? 'manual' : field.source === 'profile' ? 'local' : 'ai';
  const flag = r.source === 'manual' ? ' <span class="flag">Manual</span>' : '';
  const from = doc ? `<span class="from">${r.source === 'manual' ? 'you said it\'s shown on' : 'from'} ${esc(doc.name)}</span>` : '';
  const conflict = r.conflicts.length
    ? `<span class="hint warn">${r.conflicts.map((c) => `${esc(c.doc.name)} says ${esc(formatValue(field, c.value))}`).join('; ')}. Check which is right.</span>` : '';
  const acts = isConfirmed(field, r)
    ? `<span class="ok">✓ Confirmed</span><button class="link" data-action="edit" data-key="${field.key}">Edit</button>`
    : `<button class="btn sm primary" data-action="confirm" data-key="${field.key}">Confirm</button><button class="btn sm" data-action="edit" data-key="${field.key}">Edit</button>`;
  return `<li class="row">${label}<span class="v ${cls}">${esc(formatValue(field, r.value))}${flag}</span>${from}${conflict}<span class="acts">${acts}</span></li>`;
}

function detailsPanel() {
  const resolved = FIELDS.map((f) => [f, resolve(f)]);
  const found = resolved.filter(([, r]) => r).length;
  const confirmed = resolved.filter(([f, r]) => isConfirmed(f, r)).length;
  const missing = FIELDS.length - found;
  const toConfirm = found - confirmed;
  const ready = missing === 0 && toConfirm === 0;
  const parts = [];
  if (missing) parts.push(`${missing} detail${missing > 1 ? 's' : ''} missing`);
  if (toConfirm) parts.push(`${toConfirm} to confirm`);
  return `
    <section class="card details">
      <h2>Your details</h2>
      <p class="count"><strong>${found} of ${FIELDS.length} details found</strong> · ${confirmed} confirmed</p>
      <div class="bar"><i style="width:${(found / FIELDS.length) * 100}%"></i></div>
      <ul class="fields">${FIELDS.map(fieldRow).join('')}</ul>
      <button class="btn primary block" data-action="submit" ${ready ? '' : 'disabled'}>${ready ? 'Submit claim' : state.docs.length ? parts.join(' · ') : 'Add your documents to start'}</button>
    </section>`;
}

function sheet() {
  if (!state.sheet) return '';
  if (state.sheet.profile) {
    return `<div class="scrim"><form class="sheet" data-form="profile">
      <h2>Demo patient</h2>
      <p class="small muted">In the real app the patient is logged in, so we already know who they are. Change these to try your own documents. This clears the current claim.</p>
      <label class="lbl">Name<input name="name" required value="${esc(state.profile.name)}"></label>
      <label class="lbl">Date of birth<input name="dob" type="date" required value="${esc(state.profile.dob)}"></label>
      <div class="acts"><button class="btn primary" type="submit">Save</button><button class="btn" type="button" data-action="close">Cancel</button></div>
    </form></div>`;
  }
  const field = FIELDS.find((f) => f.key === state.sheet.key);
  const r = resolve(field);
  const docs = state.docs.filter((d) => d.anon);
  const current = r?.value;
  let input = '';
  if (field.input === 'text') input = `<label class="lbl">${esc(field.label)}<input name="value" required value="${esc(current ?? '')}"></label>`;
  if (field.input === 'date') input = `<label class="lbl">${esc(field.label)}<input name="value" type="date" required value="${esc(current ?? '')}"></label>`;
  if (field.input === 'amount') {
    const cur = current?.currency ?? 'GBP';
    input = `<div class="lbl">${esc(field.label)}<div class="amount">
      <select name="currency">${['GBP', 'EUR', 'USD', 'CHF', 'SEK', 'DKK', 'NOK'].map((c) => `<option ${c === cur ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <input name="value" type="number" step="0.01" min="0" required value="${esc(current?.value ?? '')}"></div></div>`;
  }
  if (field.input === 'none') {
    input = `<p>${esc(field.label)}: <strong>${esc(formatValue(field, state.profile[field.key]))}</strong> <span class="small muted">(from your account)</span></p>`;
  }
  const picker = docs.length
    ? `<label class="lbl">Which document shows this? <span class="req">Required</span>
        <select name="doc" required><option value="">Choose a document…</option>
        ${docs.map((d) => `<option value="${d.id}" ${r?.source === 'manual' && r.docId === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></label>`
    : '<p class="small warn">You haven\'t uploaded any documents yet.</p>';
  return `<div class="scrim"><form class="sheet" data-form="field" data-key="${field.key}">
    <h2>${r ? 'Edit' : 'Type in'}: ${esc(field.label.toLowerCase())}</h2>
    <div class="attention">
      <strong>⚠ This must be shown on one of your documents</strong>
      <span>Your claim can only include details we can see on a document. If it's on one you've already uploaded, ${field.input === 'none' ? 'tell us which one' : 'type it below and tell us which one'}. If not, upload a document that shows it.</span>
    </div>
    ${input}
    ${picker}
    <p class="small muted">Details you enter yourself are marked as manual on your claim and may be checked.</p>
    <div class="acts">
      ${docs.length ? '<button class="btn primary" type="submit">Save</button>' : ''}
      <button class="btn" type="button" data-action="upload-for" data-key="${field.key}">Upload a document instead</button>
      <button class="btn" type="button" data-action="close">Cancel</button>
    </div>
  </form></div>`;
}

function submittedView() {
  const claim = state.submitted;
  const rows = FIELDS.map((f) => {
    const c = claim.details[f.key];
    return `<li class="row"><span class="k">${esc(f.label)}</span><span class="v ${c.source === 'manual' ? 'manual' : ''}">${esc(formatValue(f, c.value))}${c.source === 'manual' ? ' <span class="flag">Manual</span>' : ''}</span><span class="from">from ${esc(c.document)}</span></li>`;
  }).join('');
  return `
    <section class="card">
      <h2>Claim submitted</h2>
      <p>Thanks. We'll review your claim and let you know.${claim.flags.length ? ` ${claim.flags.length} detail${claim.flags.length > 1 ? 's were' : ' was'} entered manually, so ${claim.flags.length > 1 ? 'they' : 'it'} may be checked against your documents.` : ''}</p>
      <ul class="fields">${rows}</ul>
      <p class="small muted">The claim record (what a reviewer receives):</p>
      <pre class="json">${esc(JSON.stringify(claim, null, 2))}</pre>
      <button class="btn" data-action="restart">Start again</button>
    </section>`;
}

function render() {
  const profile = `<button class="profile" data-action="profile" title="Change demo patient">
    Demo patient: <strong>${esc(state.profile.name)}</strong> · ${esc(formatDate(state.profile.dob))} <span class="link">Change</span></button>`;

  if (state.submitted) {
    app.innerHTML = `<main class="layout"><div class="patient"><header class="top"><h1>Claim reimbursement</h1>${profile}</header>${submittedView()}</div>${backstage()}</main>`;
    return;
  }

  app.innerHTML = `
    <main class="layout">
      <div class="patient">
        <header class="top"><h1>Claim reimbursement</h1>${profile}</header>
        <section class="card">
          <h2>Upload your documents</h2>
          <p class="lead">We need the details listed under <em>Your details</em>. <strong>They don't have to be on one document</strong>: upload as many as you need, and we'll combine them into one claim.</p>
          <p class="small muted">For example:</p>
          <div class="chips">${DOCUMENT_EXAMPLES.map((d) => `<span class="chip">${esc(d)}</span>`).join('')}</div>
          <button class="drop" data-action="upload">
            <strong>${state.docs.length ? 'Add another document' : 'Choose photos or PDFs'}</strong>
            <span class="small muted">or drop them here</span>
          </button>
          <p class="small samples">No documents to hand? Try a sample: ${SAMPLES.map((s, i) => `<button class="link" data-action="sample" data-i="${i}">${esc(s.label)}</button>`).join(' · ')}</p>
        </section>
        ${state.docs.length ? `<section class="docs">${state.docs.map(docCard).join('')}</section>` : ''}
        ${detailsPanel()}
      </div>
      ${backstage()}
    </main>
    ${sheet()}`;
}

// ---------- Actions ----------

function submit() {
  const details = {};
  const flags = [];
  for (const f of FIELDS) {
    const r = resolve(f);
    const doc = docById(r.docId);
    details[f.key] = { value: r.value, source: r.source, document: doc?.name ?? null };
    if (r.source === 'manual') flags.push(`${f.label} entered manually; patient says it's shown on ${doc?.name}`);
    for (const c of r.conflicts) flags.push(`${f.label}: ${c.doc.name} says ${formatValue(f, c.value)}; patient confirmed ${formatValue(f, r.value)}`);
  }
  state.submitted = {
    submitted_at: new Date().toISOString(),
    details,
    documents: state.docs.map((d) => ({ name: d.name, type: d.result?.document_type ?? null })),
    flags,
  };
  render();
  window.scrollTo(0, 0);
}

function reset() {
  Object.assign(state, { docs: [], overrides: {}, confirmed: {}, sheet: null, submitted: null });
  queue.length = 0;
  render();
}

app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (!el) return;
  const { action, id, key } = el.dataset;
  const field = FIELDS.find((f) => f.key === key);
  const doc = id && docById(Number(id));
  switch (action) {
    case 'upload': return upload();
    case 'sample': return loadSample(SAMPLES[Number(el.dataset.i)]);
    case 'remove-doc': return removeDoc(Number(id));
    case 'analyse': return analyse(doc);
    case 'confirm': state.confirmed[key] = signature(resolve(field)); return render();
    case 'edit':
    case 'type-in': state.sheet = { key }; return render();
    case 'upload-for': state.sheet = null; render(); return upload(key);
    case 'close': state.sheet = null; return render();
    case 'profile': state.sheet = { profile: true }; return render();
    case 'submit': return submit();
    case 'restart': return reset();
  }
});

app.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  if (form.dataset.form === 'profile') {
    state.profile = { name: data.get('name').trim(), dob: data.get('dob') };
    return reset();
  }
  const field = FIELDS.find((f) => f.key === form.dataset.key);
  let value = data.get('value');
  if (field.input === 'none') value = state.profile[field.key];
  if (field.input === 'amount') value = { value: Number(value).toFixed(2), currency: data.get('currency') };
  if (typeof value === 'string') value = value.trim();
  state.overrides[field.key] = { value, source: 'manual', docId: Number(data.get('doc')) };
  // Typing it in is itself a confirmation.
  state.confirmed[field.key] = signature(resolve(field));
  state.sheet = null;
  render();
});

// Drag and drop anywhere on the page.
window.addEventListener('dragover', (e) => { e.preventDefault(); document.body.classList.add('dragging'); });
window.addEventListener('dragleave', (e) => { if (!e.relatedTarget) document.body.classList.remove('dragging'); });
window.addEventListener('drop', (e) => {
  e.preventDefault();
  document.body.classList.remove('dragging');
  const files = [...e.dataTransfer.files].filter((f) => fileInput.accept.includes(f.type));
  if (files.length) addFiles(files);
});

render();
