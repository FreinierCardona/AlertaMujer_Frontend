export const MAX_EVIDENCE_BYTES = 500_000;

export function isAcceptedEvidenceSize(sizeBytes: number) {
  return Number.isInteger(sizeBytes) && sizeBytes > 0 && sizeBytes <= MAX_EVIDENCE_BYTES;
}
