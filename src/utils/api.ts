/**
 * Safe fetch helper that validates JSON response and content-type,
 * preventing 'Unexpected token <' HTML error crashes.
 */
export async function safeFetchJson<T = any>(
  url: string,
  options: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(
      'Erro de conexão com o servidor. Verifique sua internet e tente novamente.'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  let data: any = {};
  if (
    contentType.includes('application/json') ||
    text.trim().startsWith('{') ||
    text.trim().startsWith('[')
  ) {
    try {
      data = JSON.parse(text);
    } catch {
      data = {};
    }
  }

  if (!response.ok || data.success === false) {
    const errorMsg =
      data.error ||
      (response.status === 413
        ? 'As imagens enviadas excederam o limite do servidor. Reduza a quantidade ou o tamanho das fotos.'
        : response.status === 500
        ? 'Ocorreu uma falha no servidor de Inteligência Pedagógica. Tente gerar novamente.'
        : response.status === 504 || response.status === 502
        ? 'O servidor demorou muito para responder. Tente com um texto mais curto ou menos imagens.'
        : `Erro na resposta do servidor (Código ${response.status}).`);
    throw new Error(errorMsg);
  }

  return data as T;
}

/**
 * Compresses an image file using HTML Canvas to prevent huge payload errors (413)
 * Resizes image to max 1600x1600 and compresses as JPEG (80% quality).
 */
export function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.8
): Promise<{ base64: string; compressedSize: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ base64: src, compressedSize: file.size });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        // Estimate size from base64
        const compressedSize = Math.round((compressedBase64.length * 3) / 4);

        resolve({ base64: compressedBase64, compressedSize });
      };
      img.onerror = () => resolve({ base64: src, compressedSize: file.size });
      img.src = src;
    };
    reader.onerror = () => resolve({ base64: '', compressedSize: 0 });
    reader.readAsDataURL(file);
  });
}
