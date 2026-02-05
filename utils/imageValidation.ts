import { formatFileSize } from "./formatters";

interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export async function validateImageUpload(
  file: File,
  options: {
    maxSize?: number;
    minWidth?: number;
    minHeight?: number;
    allowedTypes?: string[];
  } = {},
): Promise<ImageValidationResult> {
  // 1. Validar tamanho
  const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB padrão
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `Arquivo muito grande. Máximo permitido: ${formatFileSize(maxSize)}`,
    };
  }

  // 2. Validar tipo
  const allowedTypes = options.allowedTypes || [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Formato de arquivo não suportado. Use JPG, PNG ou WebP.",
    };
  }

  // 3. Validar dimensões (Exceto para SVG)
  if (file.type === "image/svg+xml") return { isValid: true };

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const minWidth = options.minWidth || 200;
      const minHeight = options.minHeight || 200;

      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          isValid: true,
          warning: `A imagem é pequena (${img.width}x${img.height}px). Recomendamos pelo menos ${minWidth}x${minHeight}px para melhor qualidade.`,
        });
      } else {
        resolve({ isValid: true });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: "O arquivo de imagem parece estar corrompido.",
      });
    };

    img.src = objectUrl;
  });
}
