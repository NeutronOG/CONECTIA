function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = source
  })
}

async function watermarkImage(source: string, index: number, propertyId: string | number, logo: HTMLImageElement): Promise<File | null> {
  try {
    const response = await fetch(source)
    if (!response.ok) return null
    const sourceBlob = await response.blob()
    if (!sourceBlob.type.startsWith('image/')) return null

    const objectUrl = URL.createObjectURL(sourceBlob)
    const image = await loadImage(objectUrl)
    URL.revokeObjectURL(objectUrl)

    // Un límite razonable permite compartir sin mandar originales gigantes.
    const scale = Math.min(1, 1920 / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return null

    context.drawImage(image, 0, 0, width, height)

    // Marca inferior derecha: fondo sólido + logo oficial para que siga
    // identificable incluso en fotos claras u oscuras.
    const padding = Math.max(12, Math.round(width * 0.018))
    const logoWidth = Math.min(Math.max(112, Math.round(width * 0.19)), 280)
    const logoHeight = Math.max(28, Math.round(logoWidth * (logo.naturalHeight / logo.naturalWidth)))
    const markWidth = logoWidth + padding * 2
    const markHeight = logoHeight + padding * 2
    const x = width - markWidth - padding
    const y = height - markHeight - padding

    context.fillStyle = 'rgba(23, 49, 58, 0.88)'
    context.fillRect(x, y, markWidth, markHeight)
    context.drawImage(logo, x + padding, y + padding, logoWidth, logoHeight)

    const watermarkedBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
    if (!watermarkedBlob) return null
    return new File([watermarkedBlob], `conectia-propiedad-${propertyId}-${index + 1}.jpg`, { type: 'image/jpeg' })
  } catch {
    return null
  }
}

/** Genera archivos de uso compartido; nunca devuelve el original sin marca. */
export async function createWatermarkedShareFiles(urls: string[], propertyId: string | number) {
  const uniqueUrls = [...new Set(urls.filter(Boolean))]
  const logo = await loadImage('/logoconectiaoficial.png').catch(() => null)
  if (!logo) return []
  const results = await Promise.all(uniqueUrls.map((url, index) => watermarkImage(url, index, propertyId, logo)))
  return results.filter((file): file is File => file !== null)
}
