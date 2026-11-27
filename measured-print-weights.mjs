// Physical weighing records already reported in the real-print section.
// These describe selected 100 mm prints, NOT the 60 mm display GLBs or their
// illustrative support fragments. Keep them separate from slicer estimates.
const records = Object.freeze({
  'koala-sas': Object.freeze({body:17, total:22, sourceSection:'print-koala'}),
  'koala-trellis2': Object.freeze({body:19, total:22, sourceSection:'print-koala'}),
  'kangaroo-sas': Object.freeze({body:15, total:17, sourceSection:'print-kangaroo'}),
  'kangaroo-trellis2': Object.freeze({body:11, total:13, sourceSection:'print-kangaroo'}),
});

export function measuredPrintWeight(key) {
  if (!Object.hasOwn(records, key)) return null;
  const record = records[key];
  const support = record.total - record.body;
  return {...record, support, percent:100 * support / record.total,
    heightMm:100, resolutionG:1, source:'physical-print'};
}
