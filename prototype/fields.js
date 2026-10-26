// The details a claim needs. Assumed for now; extend this list (and SCHEMA in extract.js) as the
// real requirements come in.
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

export const DOCUMENT_EXAMPLES = ['Clinic invoice', 'Receipt', 'Prescription', 'Drug label', 'Pharmacy receipt', 'Treatment plan'];

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
