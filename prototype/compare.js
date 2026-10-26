// Compares the same detail as read from two documents, ignoring differences that don't matter:
// case, punctuation, spacing, accents, date and amount formatting.
//   'same'      equal once normalised
//   'similar'   one wording contains the other, or most words overlap ("IVF egg collection" vs
//               "IVF – egg collection under sedation")
//   'different' anything else

const words = (s) => String(s)
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function compareValues(field, a, b) {
  if (field.input === 'amount') {
    return Number(a.value) === Number(b.value) && (a.currency || 'GBP') === (b.currency || 'GBP') ? 'same' : 'different';
  }
  if (field.input === 'date' || field.key === 'dob') return a === b ? 'same' : 'different';

  const x = words(a);
  const y = words(b);
  if (x === y) return 'same';
  const xs = new Set(x.split(' '));
  const ys = new Set(y.split(' '));
  const shared = [...xs].filter((w) => ys.has(w)).length;
  const subset = shared === Math.min(xs.size, ys.size);
  const jaccard = shared / (xs.size + ys.size - shared);
  return subset || jaccard >= 0.6 ? 'similar' : 'different';
}
