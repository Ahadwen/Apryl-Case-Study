// Finds the patient's identifiers in OCR text and replaces them, before anything leaves the browser.
//
// Name and date of birth are matched against the logged-in patient's profile, so we know exactly
// what to look for (and finding them shows the document is theirs). Other identifiers are caught by
// pattern: NHS/patient numbers, email, phone, postcode, street address. Over-redacting is fine;
// the details we need from Claude (clinic, treatment, dates, amounts) don't look like any of these.

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// OCR misreads a letter here and there, so long name parts may be one edit away.
function closeEnough(a, b) {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 5 || Math.abs(a.length - b.length) > 1) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = row;
  }
  return prev[b.length] <= 1;
}

// Every way a UK document is likely to print this date of birth (yyyy-mm-dd).
function dobPattern(dob) {
  const [y, m, d] = dob.split('-').map(Number);
  const day = `0?${d}`;
  const mon = `0?${m}`;
  const year = `(?:${y}|${String(y).slice(2)})`;
  const name = MONTHS[m - 1];
  const monName = `(?:${name}|${name.slice(0, 3)}\\.?${name === 'september' ? '|sept\\.?' : ''})`;
  const ord = '(?:st|nd|rd|th)?';
  const sep = '\\s*[\\/.\\-]\\s*';
  return new RegExp([
    `\\b${day}${sep}${mon}${sep}${year}\\b`,           // 03/02/1990, 3.2.90
    `\\b${y}${sep}${mon}${sep}${day}\\b`,              // 1990-02-03
    `\\b${day}${ord}\\s+(?:of\\s+)?${monName},?\\s+${year}\\b`, // 3rd Feb 1990
    `\\b${monName}\\s+${day}${ord},?\\s+${year}\\b`,   // February 3, 1990
  ].join('|'), 'gi');
}

const PATTERNS = [
  // Labelled patient numbers: "NHS no: 485 777 3456", "Patient ID: AB12345", "MRN 00912"
  { label: 'ID', re: /\b(?:nhs|patient|hospital|mrn|chi|member(?:ship)?)\s*(?:no\.?|number|id|#)?\s*[:#]?\s*((?=[A-Z -]*\d)[A-Z0-9][A-Z0-9 -]{3,14}[A-Z0-9])\b/gi, group: 1 },
  { label: 'ID', re: /\b\d{3}[ -]?\d{3}[ -]?\d{4}\b/g },                                   // bare NHS-style number
  { label: 'EMAIL', re: /\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g },
  { label: 'PHONE', re: /(?:\+44\s?\(?0?\)?\s?\d{2,4}|\(?\b0\d{2,4}\)?)[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g },
  { label: 'POSTCODE', re: /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi },
  { label: 'ADDRESS', re: /\b\d{1,4}[A-Za-z]?,?\s+(?:[A-Z][a-z]+\s+){1,3}(?:Road|Rd|Street|St|Avenue|Ave|Lane|Ln|Drive|Dr|Close|Way|Place|Pl|Court|Ct|Gardens|Gdns|Crescent|Terrace|Grove|Square|Mews|Hill|Park|Row|Walk)\b\.?/g },
];

// Ranges of the name, as [start, end, label]. Returns whether the full name was found.
function findName(text, fullName) {
  const parts = fullName.toLowerCase().split(/\s+/).filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  const ranges = [];
  const hits = new Set();
  let initialHit = false;
  const initial = new RegExp(`\\b${escape(first[0])}\\.?\\s+$`, 'i');
  for (const m of text.matchAll(/[\p{L}'’-]+/gu)) {
    const word = m[0].toLowerCase();
    const i = parts.findIndex((p) => closeEnough(word, p));
    if (i === -1) continue;
    ranges.push([m.index, m.index + m[0].length, 'NAME']);
    hits.add(parts[i]);
    // "J. Smith" / "J Smith": an initial right before the surname.
    if (parts[i] === last) {
      const before = text.slice(Math.max(0, m.index - 4), m.index).match(initial);
      if (before) {
        ranges.push([m.index - before[0].length, m.index, 'NAME']);
        initialHit = true;
      }
    }
  }
  const found = hits.has(last) && (hits.has(first) || initialHit);
  return { ranges, found };
}

// Merge overlapping ranges; the earlier label wins.
function merge(ranges) {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const out = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else out.push([...r]);
  }
  return out;
}

/**
 * @param {string} text OCR text
 * @param {{ name: string, dob: string }} profile dob as yyyy-mm-dd
 * @returns {{ redacted: string, segments: {text: string, label?: string}[], found: {name: boolean, dob: boolean}, other: number }}
 */
export function anonymise(text, profile) {
  const name = findName(text, profile.name);
  const ranges = [...name.ranges];

  let dobFound = false;
  for (const m of text.matchAll(dobPattern(profile.dob))) {
    ranges.push([m.index, m.index + m[0].length, 'DOB']);
    dobFound = true;
  }

  let other = 0;
  for (const { label, re, group } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      const value = group ? m[group] : m[0];
      const start = m.index + m[0].indexOf(value);
      ranges.push([start, start + value.length, label]);
    }
  }

  const merged = merge(ranges);
  const segments = [];
  let pos = 0;
  for (const [start, end, label] of merged) {
    if (start > pos) segments.push({ text: text.slice(pos, start) });
    segments.push({ text: text.slice(start, end), label });
    if (label !== 'NAME' && label !== 'DOB') other++;
    pos = end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos) });

  // "[NAME] [NAME]" reads as one name; collapse runs so the redacted text stays natural.
  const redacted = segments
    .map((s) => (s.label ? `[${s.label}]` : s.text))
    .join('')
    .replace(/\[NAME\](?:[\s,.]+\[NAME\])+/g, '[NAME]');

  return { redacted, segments, found: { name: name.found, dob: dobFound }, other };
}
