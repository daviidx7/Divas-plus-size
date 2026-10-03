// Reduz a foto antes de enviar: fotos de celular pesam vários MB e deixariam a loja lenta.
// Resultado: JPEG com no máximo 1600px no lado maior (~200-400 KB).
export async function compressImage(file, maxSize = 1600, quality = 0.85) {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const canvas = document.createElement('canvas');
  canvas.width = largura;
  canvas.height = altura;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // fundo branco (PNG com transparência)
  ctx.fillRect(0, 0, largura, altura);
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  if (bitmap.close) bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível processar a foto.'))),
      'image/jpeg',
      quality
    );
  });
}
