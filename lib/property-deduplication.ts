type Listing = { id?: string | number; imagen?: string | null; galeria?: string[] | null }

function photoKey(value: string): string {
  if (!value || /placeholder|^data:/i.test(value)) return ''
  // Ignore transformation parameters, keeping the full host/path identity.
  return value.trim().split(/[?#]/)[0]
}

export function propertyPhotos(property: Listing): string[] {
  return [...new Set([property.imagen || '', ...(property.galeria || [])].map(photoKey).filter(Boolean))]
}

/** Keep the first listing in the caller's order; never delete stored records. */
export function uniqueProperties<T extends Listing>(properties: T[]): T[] {
  const ids = new Set<string>()
  const photos = new Set<string>()
  return properties.filter((property) => {
    const id = property.id == null ? '' : String(property.id)
    const keys = propertyPhotos(property)
    const duplicate = Boolean(id && ids.has(id)) || keys.some(key => photos.has(key))
    if (id) ids.add(id)
    keys.forEach(key => photos.add(key))
    return !duplicate
  })
}
