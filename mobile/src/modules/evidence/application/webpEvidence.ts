import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import { isAcceptedEvidenceSize } from './evidenceLimits';

export { MAX_EVIDENCE_BYTES } from './evidenceLimits';

export type WebpEvidence = {
  uri: string;
  fileName: string;
  mimeType: 'image/webp';
  sizeBytes: number;
};

type CapturedAsset = { uri: string; width: number; height: number };

// Reduce progresivamente resolución y calidad hasta cumplir el límite de bytes.
const conversionOptions = [
  { longestSide: 1600, compress: 0.8 },
  { longestSide: 1280, compress: 0.7 },
  { longestSide: 1024, compress: 0.6 },
  { longestSide: 800, compress: 0.5 },
];

// Devuelve la primera conversión aceptable; distingue el exceso de tamaño del fallo de conversión.
export async function convertCaptureToWebp(asset: CapturedAsset): Promise<WebpEvidence> {
  try {
    for (const option of conversionOptions) {
      const result = await manipulateAsync(asset.uri, [{ resize: resizeToLongestSide(asset, option.longestSide) }], {
        compress: option.compress,
        format: SaveFormat.WEBP,
      });
      const resolvedSize = new File(result.uri).info().size;
      if (resolvedSize === undefined) throw new EvidenceConversionError('CONVERSION_ERROR');
      if (isAcceptedEvidenceSize(resolvedSize)) {
        return { uri: result.uri, fileName: `evidence-${Date.now()}.webp`, mimeType: 'image/webp', sizeBytes: resolvedSize };
      }
    }
  } catch {
    throw new EvidenceConversionError('CONVERSION_ERROR');
  }
  throw new EvidenceConversionError('SIZE_LIMIT');
}

// Limita el lado mayor sin ampliar fotografías que ya son más pequeñas.
function resizeToLongestSide(asset: CapturedAsset, longestSide: number) {
  if (asset.width >= asset.height) return { width: Math.min(asset.width, longestSide) };
  return { height: Math.min(asset.height, longestSide) };
}

export class EvidenceConversionError extends Error {
  constructor(readonly code: 'SIZE_LIMIT' | 'CONVERSION_ERROR') {
    super(code === 'SIZE_LIMIT' ? 'La fotografia supera el limite permitido.' : 'No fue posible convertir la fotografia.');
    this.name = 'EvidenceConversionError';
  }
}
