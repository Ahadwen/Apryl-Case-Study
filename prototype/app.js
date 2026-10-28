// Document upload prototype: upload → OCR in the browser → identifiers matched and removed →
// anonymised text to Claude → one list of details the patient confirms or edits → claim.

import {
  FIELDS, DOCUMENTS, DOCUMENT_TYPES, CLAIM_TYPES, COUNTRIES, RULES,
  ruleApplies, requirements, formatValue, formatDate,
} from './fields.js';
import { readDocument } from './ocr.js';
import { anonymise } from './identifiers.js';
import { extractFields } from './extract.js';
import { compareValues } from './compare.js';

// ?inline: the deck places the prototype beside its own column and sets the spacing itself.
if (new URLSearchParams(location.search).has('inline')) document.documentElement.classList.add('inline');

const SAMPLES = [
  { file: 'clinic-invoice.pdf', preview: 'clinic-invoice-preview.png', label: 'Clinic invoice', kind: 'PDF', type: 'application/pdf' },
  { file: 'pharmacy-label.jpg', preview: 'pharmacy-label.jpg', label: 'Prescription label', kind: 'Photo', type: 'image/jpeg' },
  { file: 'medical-letter.pdf', preview: 'medical-letter-preview.png', label: 'Medical necessity letter', kind: 'PDF', type: 'application/pdf' },
  { file: 'pharmacy-label-no-id.jpg', preview: 'pharmacy-label-no-id.jpg', label: 'Label, no name', kind: 'Photo', type: 'image/jpeg',
    note: 'No name or date of birth, so it won\'t count' },
];

const DEFAULT_PROFILE = { name: 'Jane Smith', dob: '1990-02-03', country: 'GB', nationalId: '' };

const state = {
  profile: { ...DEFAULT_PROFILE },
  docs: [],          // { id, file, name, status, progress, text, method, anon, result, error, target, targetMiss, type }
  claimType: null,   // key of CLAIM_TYPES, chosen by the patient first: it decides what's required
  overrides: {},     // key -> { value, source: 'manual' | 'document', docId }
  docOverrides: {},  // document requirement -> { docId, source: 'manual' } when the patient points at a document
  toast: null,
  confirmed: {},     // key -> signature of the value that was confirmed
  sheet: null,       // { key } or { profile: true }
  preview: null,     // index into SAMPLES while a sample is shown full size
  collapsed: new Set(), // behind-the-scenes panels the viewer has closed
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

// The patient's choice of type wins over the model's guess.
const docType = (doc) => doc.type ?? doc.result?.document_type;

// Documents are named by type ("Clinic invoice", "Receipt 2"), not by filename.
function docLabel(doc) {
  const type = docType(doc);
  if (!type) return `Document ${state.docs.indexOf(doc) + 1}`;
  const same = state.docs.filter((d) => docType(d) === type);
  return same.length > 1 ? `${DOCUMENT_TYPES[type]} ${same.indexOf(doc) + 1}` : DOCUMENT_TYPES[type];
}
const norm = (v) => JSON.stringify(v).toLowerCase().replace(/\s+/g, ' ');

// Every piece of information must come from a document that identifies the patient: their name,
// date of birth or national ID number is on it. Anything else on an anonymous document is ignored.
const identifiesPatient = (doc) => Boolean(doc.anon && (doc.anon.found.name || doc.anon.found.dob || doc.anon.found.nationalId));

function docValue(doc, field) {
  if (field.source === 'profile') {
    return doc.anon?.found[field.key] ? state.profile[field.key] : undefined;
  }
  return doc.status === 'done' && identifiesPatient(doc) ? doc.result?.[field.key] : undefined;
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

const reqs = () => requirements(state.claimType, state.profile.country);

// A document requirement is met by a recognised document of the right type, or one the model
// flagged (an invoice marked paid also proves payment), or one the patient points at (flagged).
function docSatisfies(doc, key) {
  const req = DOCUMENTS[key];
  return doc.status === 'done' && identifiesPatient(doc)
    && (req.types.includes(docType(doc)) || Boolean(req.flag && doc.result?.[req.flag]));
}

function resolveDoc(key) {
  const override = state.docOverrides[key];
  if (override && docById(override.docId)) return override;
  const doc = state.docs.find((d) => docSatisfies(d, key));
  return doc ? { docId: doc.id, source: 'document' } : null;
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
  for (const [key, o] of Object.entries(state.docOverrides)) if (o.docId === id) delete state.docOverrides[key];
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
  const typePicker = docType(doc)
    ? `<label class="type-pick small muted">Type
        <select data-change="doc-type" data-id="${doc.id}">${Object.entries(DOCUMENT_TYPES).map(([k, v]) => `<option value="${k}" ${k === docType(doc) ? 'selected' : ''}>${v}</option>`).join('')}</select></label>` : '';
  const head = `
    <div class="doc-head">
      <span class="doc-name">${esc(docLabel(doc))}</span>
      <button class="link" data-action="remove-doc" data-id="${doc.id}">Remove</button>
    </div>
    <div class="doc-meta"><span class="small muted file">${esc(doc.name)}</span>${typePicker}</div>`;
  const target = doc.target ? `<p class="small muted">Uploaded for: ${esc(FIELDS.find((f) => f.key === doc.target).label)}</p>` : '';
  let body = '';
  if (doc.status === 'queued' || doc.status === 'reading') {
    body = `<p class="small">Reading your document… ${Math.round(doc.progress * 100)}%</p>
      <div class="bar"><i style="width:${doc.progress * 100}%"></i></div>`;
  } else if (doc.status === 'analysing') {
    body = '<p class="small">Finding your details…</p><div class="bar"><i class="indeterminate"></i></div>';
  } else if (doc.status === 'error') {
    body = `<p class="small warn">${doc.anon ? 'Something went wrong reading the details from this document.' : esc(doc.error)}</p>
      <button class="btn sm" data-action="${doc.anon ? 'analyse' : 'retry-read'}" data-id="${doc.id}">Try again</button>`;
  } else if (doc.status === 'done') {
    const { documents, fields } = reqs();
    const added = [
      ...documents.filter((k) => docSatisfies(doc, k)).map((k) => DOCUMENTS[k].label),
      ...fields.filter((f) => docValue(doc, f) !== undefined).map((f) => f.label),
    ];
    const notYours = !identifiesPatient(doc);
    body = `
      ${notYours ? '' : `<p class="small">${added.length ? `<span class="tick">✓</span> ${esc(added.join(', '))}` : "We couldn't find any claim details on this document."}</p>`}
      ${notYours ? '<p class="small warn">This document doesn\'t show your name, date of birth or ID number, so we can\'t use it: everything on your claim has to come from a document that identifies you. Check it\'s yours, or upload a version that shows your details.</p>' : ''}
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
      <td>${seen.map((x) => `<div><span class="muted">${esc(docLabel(x.doc))}:</span> ${esc(formatValue(field, x.value))}</div>`).join('')}</td>
      <td><span class="verdict ${cls}">${text}</span></td></tr>`);
  }
  return panel('xcheck', 'Cross-document check', `
    <p class="small">Details that appear on more than one document are compared, ignoring formatting. A real difference is flagged to the patient and recorded on the claim for the reviewer; "expected" means documents legitimately differ, e.g. pharmacy vs clinic.</p>
    ${rows.length ? `<table class="xcheck"><tr><th>Detail</th><th>Values</th><th>Result</th></tr>${rows.join('')}</table>` : '<p class="small muted">No detail appears on more than one document yet.</p>'}`);
}

// A collapsible white panel. Open/closed is kept in state, since every render rebuilds the DOM.
function panel(key, title, body) {
  return `<details class="bs-doc" data-panel="${key}" ${state.collapsed.has(key) ? '' : 'open'}>
    <summary class="bs-name">${title}</summary>
    <div class="bs-body">${body}</div>
  </details>`;
}

// The requirements matrix, with the rules that apply to this claim highlighted.
function rulesPanel() {
  const label = (keys, map) => (keys ?? []).map((k) => map(k)).join(', ') || '–';
  const rows = RULES.map((rule) => {
    const on = state.claimType && ruleApplies(rule, state.claimType, state.profile.country);
    return `<tr class="${on ? 'on' : ''}"><td>${on ? '✓ ' : ''}${esc(rule.when)}</td>
      <td>${esc(label(rule.documents, (k) => DOCUMENTS[k].label))}</td>
      <td>${esc(label(rule.details, (k) => FIELDS.find((f) => f.key === k).label))}</td></tr>`;
  }).join('');
  return panel('rules', 'Requirements matrix', `
    <p class="small">Claim type (chosen by the patient) and country (from their account) decide which documents and details are required. <strong class="warn">Assumed rules, pending confirmation from the claims team.</strong></p>
    <table class="xcheck"><tr><th>When</th><th>Documents</th><th>Details</th></tr>${rows}</table>
    <p class="small muted">${state.claimType ? `This claim: ${esc(CLAIM_TYPES[state.claimType])} in ${esc(COUNTRIES[state.profile.country])}.` : 'Choose a claim type on the left to see which rules apply.'}</p>`);
}

// The prototype's explainer, beside the patient's screen: what happens to each document.
function backstage() {
  const docs = state.docs.filter((d) => d.status !== 'queued');
  const step = (n, title, content) => `<div class="bs-step"><span class="bs-n">${n}</span><div><strong>${title}</strong>${content}</div></div>`;
  const title = (doc) => `${esc(docLabel(doc))} <span class="small muted">· ${esc(doc.name)}</span>`;
  const cards = docs.map((doc) => {
    if (!doc.anon) {
      return panel(`doc-${doc.id}`, title(doc), step(1, 'Read on the device', `<p>${doc.status === 'error' ? esc(doc.error) : `${Math.round(doc.progress * 100)}%…`}</p>`));
    }
    const counts = {};
    for (const [, label] of doc.anon.redacted.matchAll(/\[([A-Z]+)\]/g)) counts[label] = (counts[label] ?? 0) + 1;
    const removed = Object.entries(counts).map(([label, n]) => `<span class="red">${label}</span>${n > 1 ? ` ×${n}` : ''}`).join(' ');
    const f = doc.anon.found;
    const matched = `Name ${f.name ? '✓' : '✗'} · Date of birth ${f.dob ? '✓' : '✗'}${state.profile.nationalId ? ` · National ID ${f.nationalId ? '✓' : '✗'}` : ''}`;
    const identifies = identifiesPatient(doc)
      ? '<p class="tick">Identifies the patient: its details can be used.</p>'
      : '<p class="warn"><strong>Doesn\'t identify the patient: nothing from it is used.</strong></p>';
    let returned = '<p>Waiting…</p>';
    if (doc.status === 'done') returned = `<pre class="json">${esc(JSON.stringify(doc.result, null, 2))}</pre>`;
    if (doc.status === 'error') returned = `<p class="warn">${esc(doc.error)}</p>`;
    return panel(`doc-${doc.id}`, title(doc), `
      ${step(1, 'Read on the device', `<p>${esc(doc.method)}. The file itself is never uploaded.</p>`)}
      ${step(2, 'Identifiers matched and removed in the browser', `<p>${matched} (matched against the patient's account)</p>${identifies}<p>Removed: ${removed || 'nothing'}</p>`)}
      ${step(3, 'Sent to Claude: anonymised text only', `<pre class="redacted">${redactedHtml(doc.anon.redacted.trim())}</pre>`)}
      ${step(4, 'Returned: fixed JSON shape', returned)}`);
  }).join('');
  return `
    <aside class="backstage">
      <div class="bs-head"><h2>Behind the scenes</h2><span class="bs-badge">Not shown to the patient</span></div>
      ${state.submitted ? panel('claim', 'Claim record: what a reviewer receives', `
        ${state.submitted.flags.length
          ? `<p class="small"><strong class="warn">${state.submitted.flags.length} flag${state.submitted.flags.length > 1 ? 's' : ''} for the reviewer:</strong></p><ul class="small flags">${state.submitted.flags.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`
          : '<p class="small">No flags: every detail was read from a document and the documents agree.</p>'}
        <pre class="json">${esc(JSON.stringify(state.submitted, null, 2))}</pre>`) : ''}
      ${panel('try', 'Try it', `
        <p class="small">Upload your own documents on the left, or use a sample (all details invented):</p>
        <div class="samples">${SAMPLES.map((smp, i) => `
          <div class="sample">
            <button class="thumb" data-action="preview" data-i="${i}" title="View full size"><img src="samples/${smp.preview}" alt="${esc(smp.label)} sample"></button>
            <div class="small"><strong>${esc(smp.label)}</strong> · ${smp.kind}${smp.note ? `<br><span class="warn">${esc(smp.note)}</span>` : ''}</div>
            <button class="btn sm" data-action="sample" data-i="${i}">Use this sample</button>
          </div>`).join('')}
        </div>
        <p class="small">Demo patient: <strong>${esc(state.profile.name)}</strong> · ${esc(formatDate(state.profile.dob))}${state.profile.nationalId ? ` · ID ${esc(state.profile.nationalId)}` : ''} · ${esc(COUNTRIES[state.profile.country])} <button class="link" data-action="profile">Change</button><br>
          <span class="muted">In the real app the patient is signed in. Change this to try documents with another name on them.</span></p>`)}
      ${rulesPanel()}
      <p class="small">GDPR data minimisation: documents are read on the patient's device, their name, date of birth and other identifiers are removed there, and only the anonymised text is sent for analysis. Name and date of birth are filled in from the patient's own account, never from the model.</p>
      <p class="small">Only documents that identify the patient (name, date of birth or national ID number on them) count towards the claim.</p>
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
  const from = doc ? `<span class="from">${r.source === 'manual' ? 'you said it\'s shown on' : 'from'} ${esc(docLabel(doc))}</span>` : '';
  const conflict = r.conflicts.length
    ? `<span class="hint warn">${r.conflicts.map((c) => `${esc(docLabel(c.doc))} says ${esc(formatValue(field, c.value))}`).join('; ')}. Check which is right.</span>` : '';
  const acts = isConfirmed(field, r)
    ? `<span class="ok">✓ Confirmed</span><button class="link" data-action="edit" data-key="${field.key}">Edit</button>`
    : `<button class="btn sm primary" data-action="confirm" data-key="${field.key}">Confirm</button><button class="btn sm" data-action="edit" data-key="${field.key}">Edit</button>`;
  return `<li class="row">${label}<span class="v ${cls}">${esc(formatValue(field, r.value))}${flag}</span>${from}${conflict}<span class="acts">${acts}</span></li>`;
}

// A required document: ticked when a matching document is recognised. If we didn't recognise it,
// the patient can point at the upload that is it (flagged for the reviewer).
function docReqRow(key) {
  const req = DOCUMENTS[key];
  const r = resolveDoc(key);
  const label = `<span class="k">${esc(req.label)}</span>`;
  if (!r) {
    const tried = state.docs.some((d) => d.status === 'done');
    return `<li class="row ${tried ? 'missing' : ''}">${label}<span class="v ${tried ? 'miss' : 'todo'}">${tried ? 'Missing' : 'Needed'}</span>
      <span class="hint">${esc(req.hint)}</span>
      ${tried ? `<span class="acts"><button class="btn sm" data-action="upload">Upload document</button><button class="btn sm" data-action="point-doc" data-key="${key}">I've uploaded it</button></span>` : ''}</li>`;
  }
  const doc = docById(r.docId);
  return `<li class="row">${label}<span class="v ${r.source === 'manual' ? 'manual' : 'ok-doc'}">✓ ${esc(docLabel(doc))}${r.source === 'manual' ? ' <span class="flag">Manual</span>' : ''}</span>
    ${r.source === 'manual' ? '<span class="from">you said it\'s this document</span>' : ''}</li>`;
}

function checklistPanel() {
  const { documents, fields } = reqs();
  const docsHave = documents.filter((k) => resolveDoc(k)).length;
  const resolved = fields.map((f) => [f, resolve(f)]);
  const found = resolved.filter(([, r]) => r).length;
  const confirmed = resolved.filter(([f, r]) => isConfirmed(f, r)).length;
  const docsMissing = documents.length - docsHave;
  const missing = fields.length - found;
  const toConfirm = found - confirmed;
  const ready = docsMissing === 0 && missing === 0 && toConfirm === 0;
  const parts = [];
  if (docsMissing) parts.push(`${docsMissing} document${docsMissing > 1 ? 's' : ''} missing`);
  if (missing) parts.push(`${missing} detail${missing > 1 ? 's' : ''} missing`);
  if (toConfirm) parts.push(`${toConfirm} to confirm`);
  return `
    <section class="card details">
      <h2>What we need</h2>
      <h3 class="sub">Documents <span class="muted">${docsHave} of ${documents.length}</span></h3>
      <ul class="fields">${documents.map(docReqRow).join('')}</ul>
      <h3 class="sub">Your details <span class="muted">${found} of ${fields.length} found · ${confirmed} confirmed</span></h3>
      <div class="bar"><i style="width:${(found / fields.length) * 100}%"></i></div>
      <ul class="fields">${fields.map(fieldRow).join('')}</ul>
      <button class="btn primary block" data-action="submit" ${ready ? '' : 'disabled'}>${ready ? 'Submit claim' : state.docs.length ? parts.join(' · ') : 'Add your documents to start'}</button>
      ${ready ? '' : '<button class="btn block secondary" data-action="save-later">Save and finish later</button>'}
    </section>`;
}

// The patient asks their clinic for the letter; we draft it from what the documents already show.
// Written in the patient's voice: it's their record to request, which clinics deal with routinely.
function clinicLetter() {
  const value = (key) => { const f = FIELDS.find((x) => x.key === key); const r = resolve(f); return r && formatValue(f, r.value); };
  const clinic = value('provider') ?? '[clinic name]';
  const treatment = value('treatment') ?? CLAIM_TYPES[state.claimType];
  const date = value('treatment_date');
  const subject = 'Letter confirming medical necessity for my treatment';
  const body = `Dear ${clinic},

I'm claiming reimbursement for ${treatment}${date ? ` on ${date}` : ''} through my fertility benefit. To process the claim, they need a letter from you confirming that the treatment was medically necessary.

Could you please send me a signed letter on clinic letterhead that includes:
- my name and date of birth
- the treatment and date(s)
- the medical reason for the treatment (diagnosis or indication)
- the name and signature of the treating clinician

Thank you,
${state.profile.name}`;
  return { subject, body };
}

// The few documents that are mandatory, then: everything else is information, from any document.
function uploadIntro() {
  const { documents } = reqs();
  return `
    <p>For this claim we need <strong>${documents.length} document${documents.length > 1 ? 's' : ''}</strong>:</p>
    <ul class="must">${documents.map((k) => `<li><strong>${esc(DOCUMENTS[k].label)}</strong>: ${esc(DOCUMENTS[k].hint.charAt(0).toLowerCase() + DOCUMENTS[k].hint.slice(1).replace(/\.$/, ''))}</li>`).join('')}</ul>
    <p class="small muted">One document can cover more than one of these, e.g. an invoice marked as paid.</p>
    <p class="lead"><strong>After that, we just need a few details</strong> (listed under <em>What we need</em>). They can come from any of your documents: upload as many as you like, and we'll combine them into one claim.</p>`;
}

function necessityCallout() {
  if (!reqs().documents.includes('medical_necessity') || resolveDoc('medical_necessity')) return '';
  const { subject, body } = clinicLetter();
  return `
    <section class="card callout">
      <h2>This claim needs proof of medical necessity</h2>
      <p>That's usually a referral letter, a diagnosis letter or a statement from your doctor. Clinics can take a few days to send one, so it's worth asking now.</p>
      <details class="letter" ${state.collapsed.has('letter') ? '' : 'open'} data-panel="letter">
        <summary>A message you can send your clinic</summary>
        <pre class="letter-text">${esc(`Subject: ${subject}

${body}`)}</pre>
        <div class="acts">
          <button class="btn sm primary" data-action="copy-letter">Copy message</button>
          <a class="btn sm" href="mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}">Email it</a>
        </div>
        <p class="small muted">${resolve(FIELDS.find((f) => f.key === 'provider')) ? 'Filled in from your invoice.' : 'Upload your invoice first and we\'ll fill in the clinic and treatment for you.'}</p>
      </details>
      <p class="small">You can save this claim and come back when the letter arrives.</p>
    </section>`;
}

// A sample shown full size over the page, closed with the X, Escape or a click outside it.
function lightbox() {
  if (state.preview == null) return '';
  const smp = SAMPLES[state.preview];
  return `<div class="scrim lightbox" data-action="close-preview">
    <figure>
      <button class="x" data-action="close-preview" aria-label="Close">×</button>
      <img src="samples/${smp.preview}" alt="${esc(smp.label)} sample">
      <figcaption><span><strong>${esc(smp.label)}</strong> · ${smp.kind} (sample, details invented)</span>
        <button class="btn sm primary" data-action="sample" data-i="${state.preview}">Use this sample</button></figcaption>
    </figure>
  </div>`;
}

function sheet() {
  if (!state.sheet) return '';
  if (state.sheet.profile) {
    return `<div class="scrim"><form class="sheet" data-form="profile">
      <h2>Demo patient</h2>
      <p class="small muted">In the real app the patient is logged in, so we already know who they are. Change these to try your own documents. This clears the current claim.</p>
      <label class="lbl">Name<input name="name" required value="${esc(state.profile.name)}"></label>
      <label class="lbl">Date of birth<input name="dob" type="date" required value="${esc(state.profile.dob)}"></label>
      <label class="lbl">National ID number <span class="small muted">optional, e.g. a Swedish personnummer</span><input name="nationalId" value="${esc(state.profile.nationalId)}" placeholder="19900203-1234"></label>
      <label class="lbl">Country<select name="country">${Object.entries(COUNTRIES).map(([k, v]) => `<option value="${k}" ${k === state.profile.country ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <div class="acts"><button class="btn primary" type="submit">Save</button><button class="btn" type="button" data-action="close">Cancel</button></div>
    </form></div>`;
  }
  if (state.sheet.docReq) {
    const req = DOCUMENTS[state.sheet.docReq];
    const docs = state.docs.filter(identifiesPatient);
    return `<div class="scrim"><form class="sheet" data-form="doc" data-key="${state.sheet.docReq}">
      <h2>${esc(req.label)}</h2>
      <div class="attention">
        <strong>⚠ We didn't recognise this among your documents</strong>
        <span>If one of your uploads is your ${esc(req.label.toLowerCase())}, tell us which. It will be checked by a person. If not, upload it.</span>
      </div>
      <label class="lbl">Which document is it? <span class="req">Required</span>
        <select name="doc" required><option value="">Choose a document…</option>
        ${docs.map((d) => `<option value="${d.id}">${esc(docLabel(d))} (${esc(d.name)})</option>`).join('')}</select></label>
      <div class="acts">
        <button class="btn primary" type="submit">Save</button>
        <button class="btn" type="button" data-action="upload">Upload it instead</button>
        <button class="btn" type="button" data-action="close">Cancel</button>
      </div>
    </form></div>`;
  }
  const field = FIELDS.find((f) => f.key === state.sheet.key);
  const r = resolve(field);
  const docs = state.docs.filter(identifiesPatient);
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
        ${docs.map((d) => `<option value="${d.id}" ${r?.source === 'manual' && r.docId === d.id ? 'selected' : ''}>${esc(docLabel(d))} (${esc(d.name)})</option>`).join('')}</select></label>`
    : '<p class="small warn">None of your uploads shows your name, date of birth or ID number yet.</p>';
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
  const manual = Object.values(claim.details).filter((d) => d.source === 'manual').length;
  const docRows = Object.entries(claim.documents_required).map(([k, c]) =>
    `<li class="row"><span class="k">${esc(DOCUMENTS[k].label)}</span><span class="v ${c.source === 'manual' ? 'manual' : ''}">✓ ${esc(c.document)}${c.source === 'manual' ? ' <span class="flag">Manual</span>' : ''}</span></li>`).join('');
  const rows = reqs().fields.map((f) => {
    const c = claim.details[f.key];
    return `<li class="row"><span class="k">${esc(f.label)}</span><span class="v ${c.source === 'manual' ? 'manual' : ''}">${esc(formatValue(f, c.value))}${c.source === 'manual' ? ' <span class="flag">Manual</span>' : ''}</span><span class="from">${c.source === 'manual' ? 'you said it\'s shown on' : 'from'} ${esc(c.document)}</span></li>`;
  }).join('');
  return `
    <section class="card">
      <h2>Claim submitted</h2>
      <p>Thanks. We'll review your claim and let you know.${manual ? ` ${manual} detail${manual > 1 ? 's were' : ' was'} entered manually, so ${manual > 1 ? 'they' : 'it'} may be checked against your documents.` : ''}</p>
      <ul class="fields">${docRows}${rows}</ul>
      <button class="btn" data-action="restart">Start a new claim</button>
    </section>`;
}

function render() {
  const profile = `<span class="profile">Signed in as <strong>${esc(state.profile.name)}</strong></span>`;

  if (state.submitted) {
    app.innerHTML = `<main class="layout"><div class="patient"><header class="top"><h1>Claim reimbursement</h1>${profile}</header>${submittedView()}</div>${backstage()}</main>${lightbox()}`;
    return;
  }

  app.innerHTML = `
    <main class="layout">
      <div class="patient">
        <header class="top"><h1>Claim reimbursement</h1>${profile}</header>
        <section class="card">
          <label class="lbl claim-type"><strong>What are you claiming for?</strong>
            <select data-change="claim-type"><option value="">Choose…</option>
            ${Object.entries(CLAIM_TYPES).map(([k, v]) => `<option value="${k}" ${k === state.claimType ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        </section>
        ${state.claimType ? `
        ${necessityCallout()}
        <section class="card">
          <h2>Upload your documents</h2>
          ${uploadIntro()}
          <button class="drop" data-action="upload">
            <strong>${state.docs.length ? 'Add another document' : 'Choose photos or PDFs'}</strong>
            <span class="small muted">or drop them here</span>
          </button>
        </section>
        ${state.docs.length ? `<section class="docs">${state.docs.map(docCard).join('')}</section>` : ''}
        ${checklistPanel()}` : ''}
      </div>
      ${backstage()}
    </main>
    ${sheet()}${lightbox()}${state.toast ? `<div class="toast" role="status">${esc(state.toast)}</div>` : ''}`;
}

let toastTimer;
function toast(message) {
  state.toast = message;
  render();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { state.toast = null; render(); }, 3500);
}

// ---------- Actions ----------

function submit() {
  const details = {};
  const flags = [];
  const { documents, fields } = reqs();
  const documentsRequired = {};
  for (const k of documents) {
    const r = resolveDoc(k);
    documentsRequired[k] = { document: docLabel(docById(r.docId)), source: r.source };
    if (r.source === 'manual') flags.push(`${DOCUMENTS[k].label}: not recognised automatically; patient says it's ${docLabel(docById(r.docId))}`);
  }
  for (const f of fields) {
    const r = resolve(f);
    const doc = docById(r.docId);
    details[f.key] = { value: r.value, source: r.source, document: doc ? docLabel(doc) : null };
    if (r.source === 'manual') flags.push(`${f.label} entered manually; patient says it's shown on ${docLabel(doc)}`);
    for (const c of r.conflicts) flags.push(`${f.label}: ${docLabel(c.doc)} says ${formatValue(f, c.value)}; patient confirmed ${formatValue(f, r.value)}`);
  }
  state.submitted = {
    submitted_at: new Date().toISOString(),
    claim_type: state.claimType,
    country: state.profile.country,
    documents_required: documentsRequired,
    details,
    documents: state.docs.map((d) => ({
      name: docLabel(d), type: docType(d) ?? null, file: d.name,
      type_set_by: d.type ? 'patient' : 'model',
    })),
    flags,
  };
  render();
  window.scrollTo(0, 0);
}

function reset() {
  Object.assign(state, { docs: [], claimType: null, overrides: {}, docOverrides: {}, confirmed: {}, sheet: null, submitted: null });
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
    case 'sample': state.preview = null; render(); return loadSample(SAMPLES[Number(el.dataset.i)]);
    case 'preview': state.preview = Number(el.dataset.i); return render();
    case 'close-preview':
      // The backdrop carries this action too; ignore clicks that land on the image or caption.
      if (el.classList.contains('lightbox') && e.target !== el) return;
      state.preview = null; return render();
    case 'remove-doc': return removeDoc(Number(id));
    case 'analyse': return analyse(doc);
    case 'retry-read':
      Object.assign(doc, { status: 'queued', progress: 0, error: null });
      queue.push(doc);
      render();
      return pump();
    case 'confirm': state.confirmed[key] = signature(resolve(field)); return render();
    case 'edit':
    case 'type-in': state.sheet = { key }; return render();
    case 'upload-for': state.sheet = null; render(); return upload(key);
    case 'upload': state.sheet = null; render(); return upload();
    case 'close': state.sheet = null; return render();
    case 'profile': state.sheet = { profile: true }; return render();
    case 'point-doc': state.sheet = { docReq: key }; return render();
    case 'copy-letter': {
      const { subject, body } = clinicLetter();
      navigator.clipboard?.writeText(`Subject: ${subject}\n\n${body}`).catch(() => {});
      return toast('Message copied. Paste it into an email or your clinic\'s patient portal.');
    }
    // Concept only: saving isn't built in the prototype.
    case 'save-later': return toast("Claim saved. We'll remind you to finish it, and you can pick it up any time from your claims.");
    case 'submit': return submit();
    case 'restart': return reset();
  }
});

app.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  if (form.dataset.form === 'profile') {
    state.profile = { name: data.get('name').trim(), dob: data.get('dob'), country: data.get('country'), nationalId: data.get('nationalId').trim() };
    return reset();
  }
  if (form.dataset.form === 'doc') {
    state.docOverrides[form.dataset.key] = { docId: Number(data.get('doc')), source: 'manual' };
    state.sheet = null;
    return render();
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

// <details> toggle events don't bubble, so listen in the capture phase.
app.addEventListener('toggle', (e) => {
  const key = e.target.dataset?.panel;
  if (!key) return;
  if (e.target.open) state.collapsed.delete(key);
  else state.collapsed.add(key);
}, true);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && state.preview != null) { state.preview = null; render(); }
  // Embedded in the deck: hand ← / → and 1–8 back to it, unless the patient is typing or a dialog is open.
  if (window.parent === window || e.target.closest('input, textarea, select') || state.sheet || state.preview != null) return;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    window.parent.postMessage({ deckNav: e.key === 'ArrowRight' ? 1 : -1 }, location.origin);
  }
  if (/^[1-9]$/.test(e.key)) window.parent.postMessage({ deckSlide: Number(e.key) }, location.origin);
});

app.addEventListener('change', (e) => {
  if (e.target.dataset.change === 'doc-type') {
    docById(Number(e.target.dataset.id)).type = e.target.value;
    render();
  }
  if (e.target.dataset.change === 'claim-type') {
    state.claimType = e.target.value || null;
    render();
  }
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
