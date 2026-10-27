// Sends one document's anonymised text to Claude and gets back a fixed JSON shape.
// Only the redacted text is sent: identifiers were already replaced in identifiers.js.

import { callClaude } from '../src/api.js';

const SYSTEM = `You read documents a patient uploads to claim reimbursement for fertility treatment:
clinic invoices, receipts, prescriptions, drug labels, pharmacy receipts, treatment plans, medical
letters and bank or card statements.

The text comes from OCR, so expect odd spacing and the occasional misread character.
Personal identifiers have been replaced with placeholders such as [NAME], [DOB], [ID], [ADDRESS],
[POSTCODE], [PHONE] and [EMAIL]. Ignore them.

Extract only what the document states. Never guess. Use "" for anything the document doesn't show.
- provider: the clinic, hospital or pharmacy that provided the treatment or medication.
- treatment: the fertility treatment or procedure, short, e.g. "IVF – egg collection". Not medication. "" on a medication-only document.
- treatment_date: the date the treatment was carried out, as yyyy-mm-dd. Not an invoice, payment or dispensing date.
- medication: name, strength and quantity, e.g. "Gonal-f 900 IU × 2". Separate several with "; ".
- amount_paid: the total the patient paid or was charged, as a plain number like "4250.00".
- currency: ISO code for amount_paid, e.g. "GBP"; "" if there's no amount.
- invoice_number: the invoice or receipt number exactly as printed.
- shows_payment: true if the document shows the amount was actually paid (a receipt, "paid in full", a card payment line); false for an invoice that is only a bill.
- states_medical_necessity: true if the document is a clinician's statement that the treatment is medically necessary or medically indicated (e.g. a referral or diagnosis letter).
- readability_issues: a short note if parts of the text look garbled, otherwise "".`;

// Structured output: additionalProperties must be false on every object.
const SCHEMA = {
  type: 'object',
  properties: {
    document_type: { type: 'string', enum: ['clinic_invoice', 'receipt', 'prescription', 'drug_label', 'pharmacy_receipt', 'treatment_plan', 'medical_letter', 'bank_statement', 'other'] },
    provider: { type: 'string' },
    treatment: { type: 'string' },
    treatment_date: { type: 'string' },
    medication: { type: 'string' },
    amount_paid: { type: 'string' },
    currency: { type: 'string' },
    invoice_number: { type: 'string' },
    shows_payment: { type: 'boolean' },
    states_medical_necessity: { type: 'boolean' },
    readability_issues: { type: 'string' },
  },
  required: ['document_type', 'provider', 'treatment', 'treatment_date', 'medication', 'amount_paid', 'currency', 'invoice_number', 'shows_payment', 'states_medical_necessity', 'readability_issues'],
  additionalProperties: false,
};

/**
 * @param {string} redactedText
 * @returns {Promise<Record<string, unknown>>} field values keyed as in fields.js; missing fields omitted
 */
export async function extractFields(redactedText) {
  const response = await callClaude({
    max_tokens: 1000,
    system: SYSTEM,
    messages: [{ role: 'user', content: `Document text:\n\n${redactedText}` }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  });
  if (response.stop_reason === 'refusal') throw new Error('The model declined to read this document.');
  const text = response.content.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('No answer from the model.');
  const raw = JSON.parse(text);

  const out = {
    document_type: raw.document_type,
    shows_payment: raw.shows_payment === true,
    states_medical_necessity: raw.states_medical_necessity === true,
    readability_issues: raw.readability_issues,
  };
  for (const key of ['provider', 'treatment', 'medication', 'invoice_number']) {
    if (raw[key]?.trim()) out[key] = raw[key].trim();
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw.treatment_date)) out.treatment_date = raw.treatment_date;
  const amount = Number(String(raw.amount_paid).replace(/[^\d.]/g, ''));
  if (raw.amount_paid && Number.isFinite(amount) && amount > 0) {
    out.amount_paid = { value: amount.toFixed(2), currency: raw.currency || 'GBP' };
  }
  return out;
}
