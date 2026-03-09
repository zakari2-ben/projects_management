export function sanitizeHtml(rawHtml) {
  if (!rawHtml || typeof window === 'undefined') return ''

  const parser = new DOMParser()
  const document = parser.parseFromString(rawHtml, 'text/html')

  document.querySelectorAll('script, style, iframe, object, embed').forEach((node) => {
    node.remove()
  })

  document.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.trim().toLowerCase()

      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name)
      }

      if ((name === 'href' || name === 'src') && value.startsWith('javascript:')) {
        element.removeAttribute(attribute.name)
      }
    })
  })

  return document.body.innerHTML
}
