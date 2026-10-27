// What a claim needs, in two layers:
//   DOCUMENTS: evidence a reviewer must see (an invoice, proof of payment, sometimes proof of
//              medical necessity). Ticked by recognising the document, not by reading fields.
//   FIELDS:    the information, extracted from whatever was uploaded; any document can supply any item.
// Which ones apply depends on the claim type and country (RULES). All of this is assumed for now;
// extend it (and SCHEMA in extract.js) as the real requirements come in.
//
// source "profile": matched in the browser against the logged-in patient; never sent to Claude.
// source "claude":  read by Claude from the anonymised text.

export const FIELDS = [
  { key: 'name', label: 'Name', source: 'profile', input: 'none',
    hint: 'Usually near the top of an invoice, or on a prescription label.' },
  { key: 'dob', label: 'Date of birth', source: 'profile', input: 'none',
    hint: 'Usually on the prescription label or the clinic invoice.' },
  // varies: different documents legitimately differ (a pharmacy label vs a clinic invoice), so no conflict warning.
  { key: 'provider', label: 'Clinic / provider', source: 'claude', input: 'text', varies: true,
    hint: 'Usually printed at the top of an invoice or receipt.' },
  { key: 'treatment', label: 'Treatment', source: 'claude', input: 'text',
    hint: 'Usually listed on the clinic invoice or treatment plan.' },
  { key: 'treatment_date', label: 'Treatment date', source: 'claude', input: 'date',
    hint: 'Usually next to the treatment on the clinic invoice.' },
  { key: 'medication', label: 'Medication', source: 'claude', input: 'text', varies: true,
    hint: 'Usually on the prescription, drug label or pharmacy receipt.' },
  { key: 'amount_paid', label: 'Amount paid', source: 'claude', input: 'amount',
    hint: 'Usually the total on an invoice or receipt.' },
  { key: 'invoice_number', label: 'Invoice no.', source: 'claude', input: 'text',
    hint: 'Usually at the top of the clinic invoice.' },
];

// A document requirement is met by a document of one of these types, or one the model says has
// the flag (e.g. an invoice marked "paid" also proves payment).
export const DOCUMENTS = {
  invoice: { label: 'Invoice', types: ['clinic_invoice', 'pharmacy_receipt'],
    hint: 'From your clinic or pharmacy.' },
  proof_of_payment: { label: 'Proof of payment', types: ['receipt', 'pharmacy_receipt', 'bank_statement'], flag: 'shows_payment',
    hint: 'A receipt, a bank or card statement, or an invoice marked as paid.' },
  medical_necessity: { label: 'Proof of medical necessity', types: ['medical_letter'], flag: 'states_medical_necessity',
    hint: 'Usually a referral letter, a diagnosis letter or a statement from your doctor.' },
  prescription: { label: 'Prescription', types: ['prescription', 'drug_label'],
    hint: 'The prescription, or the pharmacy label on the medication.' },
};

export const CLAIM_TYPES = {
  ivf: 'IVF cycle',
  egg_freezing: 'Egg freezing',
  iui: 'IUI',
  medication: 'Fertility medication',
  consultation: 'Consultation or tests',
};

export const COUNTRIES = { GB: 'United Kingdom', DE: 'Germany', NL: 'Netherlands', SE: 'Sweden' };

// The requirements matrix: each rule adds documents and details when its conditions hold.
// ASSUMED, pending confirmation from the claims team.
export const RULES = [
  { when: 'Every claim', documents: ['invoice', 'proof_of_payment'], details: ['name', 'dob', 'provider', 'amount_paid', 'invoice_number'] },
  { when: 'Treatment claims', claims: ['ivf', 'egg_freezing', 'iui', 'consultation'], details: ['treatment', 'treatment_date'] },
  { when: 'IVF or egg freezing', claims: ['ivf', 'egg_freezing'], documents: ['medical_necessity'] },
  { when: 'IUI in Germany', claims: ['iui'], countries: ['DE'], documents: ['medical_necessity'] },
  { when: 'Medication', claims: ['medication'], documents: ['prescription'], details: ['medication'] },
];

export const ruleApplies = (rule, claim, country) =>
  (!rule.claims || rule.claims.includes(claim)) && (!rule.countries || rule.countries.includes(country));

export function requirements(claim, country) {
  const documents = new Set();
  const details = new Set();
  for (const rule of RULES) {
    if (!ruleApplies(rule, claim, country)) continue;
    rule.documents?.forEach((d) => documents.add(d));
    rule.details?.forEach((d) => details.add(d));
  }
  return {
    documents: Object.keys(DOCUMENTS).filter((k) => documents.has(k)),
    fields: FIELDS.filter((f) => details.has(f.key)),
  };
}

// Document types, as returned by extract.js. Used to name uploads, since photo filenames are
// usually meaningless ("IMG_4021.jpg").
export const DOCUMENT_TYPES = {
  clinic_invoice: 'Clinic invoice',
  receipt: 'Receipt',
  prescription: 'Prescription',
  drug_label: 'Drug label',
  pharmacy_receipt: 'Pharmacy receipt',
  treatment_plan: 'Treatment plan',
  medical_letter: 'Medical letter',
  bank_statement: 'Bank or card statement',
  other: 'Other document',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  return m ? `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}` : iso;
}

// Amounts are stored as { value: "4250.00", currency: "GBP" }.
export function formatAmount(amount) {
  const n = Number(amount.value);
  if (!Number.isFinite(n)) return amount.value;
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: amount.currency || 'GBP' }).format(n);
  } catch {
    return `${amount.currency} ${n.toFixed(2)}`;
  }
}

export function formatValue(field, value) {
  if (value == null || value === '') return '';
  if (field.input === 'date' || field.key === 'dob') return formatDate(value);
  if (field.input === 'amount') return formatAmount(value);
  return value;
}
