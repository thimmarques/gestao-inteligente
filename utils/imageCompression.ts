import imageCompression from 'browser-image-compression';

export async function compressImage(
  file: File,
  isLogo: boolean = false
): Promise<string> {
  const options = {
    maxSizeMB: isLogo ? 0.2 : 0.5, // Logos são menores (200kb), fotos de perfil 500kb
    maxWidthOrHeight: isLogo ? 800 : 1024,
    useWebWorker: true,
    fileType: 'image/jpeg' as string,
  };

  try {
    // SVGs não precisam de compressão via esta lib
    if (file.type === 'image/svg+xml') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const compressedFile = await imageCompression(file, options);
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(compressedFile);
    });
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    // Fallback: Retornar original em base64 se falhar
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }
}
