const BULLET_PREFIX = /^(?:[-*+•●◦▪–—]|o)\s+/
const ORDERED_PREFIX = /^(\d+)[.)]\s+/

export function persistEmptyParagraphs(html: string): string {
  return html.replace(/<p(\s[^>]*)?>(?:\s|&nbsp;)*<\/p>/gi, '<p$1><br></p>')
}

export function looksLikePlainList(text: string): boolean {
  const lines = normalizeNewlines(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return false

  const listLines = lines.filter(
    (line) => BULLET_PREFIX.test(line) || ORDERED_PREFIX.test(line)
  )

  return listLines.length >= 1 && listLines.length >= Math.ceil(lines.length / 2)
}

export function plainTextToHtml(text: string): string {
  const lines = normalizeNewlines(text).split('\n')
  const parts: string[] = []
  let buffer: { type: 'ul' | 'ol'; items: string[] } | null = null

  const flush = () => {
    if (!buffer) return
    const tag = buffer.type
    parts.push(
      `<${tag}>${buffer.items.map((item) => `<li><p>${escapeHtml(item)}</p></li>`).join('')}</${tag}>`
    )
    buffer = null
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00a0/g, ' ')

    if (BULLET_PREFIX.test(line.trim())) {
      const item = line.trim().replace(BULLET_PREFIX, '')
      if (buffer?.type !== 'ul') {
        flush()
        buffer = { type: 'ul', items: [] }
      }
      buffer.items.push(item)
      continue
    }

    if (ORDERED_PREFIX.test(line.trim())) {
      const item = line.trim().replace(ORDERED_PREFIX, '')
      if (buffer?.type !== 'ol') {
        flush()
        buffer = { type: 'ol', items: [] }
      }
      buffer.items.push(item)
      continue
    }

    flush()
    if (line.trim() === '') {
      parts.push('<p><br></p>')
    } else {
      parts.push(`<p>${escapeHtml(line)}</p>`)
    }
  }

  flush()
  return parts.join('')
}

export function normalizePastedHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return html

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const owner = doc

  doc.querySelectorAll('style, meta, link, script').forEach((el) => el.remove())
  unwrapConditionalComments(doc.body)
  convertWordLists(doc)
  convertPrefixedParagraphs(doc.body)
  preserveBlankParagraphs(doc.body, owner)

  return doc.body.innerHTML
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n?/g, '\n')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function unwrapConditionalComments(root: HTMLElement) {
  const owner = root.ownerDocument
  const walker = owner.createTreeWalker(root, NodeFilter.SHOW_COMMENT)
  const comments: Comment[] = []
  while (walker.nextNode()) {
    comments.push(walker.currentNode as Comment)
  }
  comments.forEach((comment) => comment.remove())
}

function convertWordLists(doc: Document) {
  const paragraphs = Array.from(doc.body.querySelectorAll('p')).filter(isWordListParagraph)
  const visited = new Set<Element>()

  for (const start of paragraphs) {
    if (visited.has(start)) continue

    const group: HTMLParagraphElement[] = [start]
    visited.add(start)

    let sibling = start.nextElementSibling
    while (sibling instanceof HTMLParagraphElement && isWordListParagraph(sibling)) {
      group.push(sibling)
      visited.add(sibling)
      sibling = sibling.nextElementSibling
    }

    const list = buildListFromParagraphs(doc, group)
    group[0].replaceWith(list)
    group.slice(1).forEach((paragraph) => paragraph.remove())
  }
}

function isWordListParagraph(paragraph: Element): boolean {
  const className = paragraph.getAttribute('class') || ''
  const style = paragraph.getAttribute('style') || ''
  return /MsoList/i.test(className) || /mso-list/i.test(style)
}

function buildListFromParagraphs(
  doc: Document,
  paragraphs: HTMLParagraphElement[]
): HTMLOListElement | HTMLUListElement {
  const firstText = cleanListItemText(paragraphs[0].textContent || '')
  const ordered = /^\d+[.)]/.test(firstText)
  const list = doc.createElement(ordered ? 'ol' : 'ul')

  for (const paragraph of paragraphs) {
    const item = doc.createElement('li')
    const p = doc.createElement('p')
    p.innerHTML = cleanListItemHtml(doc, paragraph.innerHTML)
    item.appendChild(p)
    list.appendChild(item)
  }

  return list
}

function convertPrefixedParagraphs(root: HTMLElement) {
  const parents = new Set<HTMLElement>()
  root.querySelectorAll('p').forEach((paragraph) => {
    if (
      paragraph.parentElement &&
      prefixedParagraphKind(paragraph as HTMLParagraphElement)
    ) {
      parents.add(paragraph.parentElement)
    }
  })

  for (const parent of parents) {
    convertPrefixedParagraphsIn(parent)
  }
}

function convertPrefixedParagraphsIn(root: HTMLElement) {
  const blocks = Array.from(root.children)
  let index = 0

  while (index < blocks.length) {
    const block = blocks[index]
    if (!(block instanceof HTMLParagraphElement)) {
      index += 1
      continue
    }

    const kind = prefixedParagraphKind(block)
    if (!kind) {
      index += 1
      continue
    }

    const group = [block]
    let cursor = index + 1
    while (cursor < blocks.length) {
      const next = blocks[cursor]
      if (!(next instanceof HTMLParagraphElement)) break
      if (prefixedParagraphKind(next) !== kind) break
      group.push(next)
      cursor += 1
    }

    const owner = root.ownerDocument
    const list = owner.createElement(kind)
    for (const paragraph of group) {
      const item = owner.createElement('li')
      const p = owner.createElement('p')
      p.innerHTML = stripListPrefixHtml(owner, paragraph.innerHTML)
      item.appendChild(p)
      list.appendChild(item)
    }

    group[0].replaceWith(list)
    group.slice(1).forEach((paragraph) => paragraph.remove())
    blocks.splice(index, group.length, list)
    index += 1
  }
}

function prefixedParagraphKind(paragraph: HTMLParagraphElement): 'ul' | 'ol' | null {
  const text = (paragraph.textContent || '').replace(/\u00a0/g, ' ').trim()
  if (BULLET_PREFIX.test(text)) return 'ul'
  if (ORDERED_PREFIX.test(text)) return 'ol'
  return null
}

function stripListPrefixHtml(owner: Document, html: string): string {
  const container = owner.createElement('div')
  container.innerHTML = html
  const text = container.textContent || ''
  const cleaned = text.replace(/\u00a0/g, ' ').replace(BULLET_PREFIX, '').replace(ORDERED_PREFIX, '')

  if (container.childElementCount === 0) {
    return escapeHtml(cleaned)
  }

  stripPrefixFromFirstTextNode(container)
  return container.innerHTML
}

function stripPrefixFromFirstTextNode(root: HTMLElement) {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const value = node.nodeValue || ''
    if (!value.replace(/\u00a0/g, ' ').trim()) continue
    node.nodeValue = value
      .replace(/\u00a0/g, ' ')
      .replace(BULLET_PREFIX, '')
      .replace(ORDERED_PREFIX, '')
    break
  }
}

function cleanListItemText(text: string): string {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(BULLET_PREFIX, '')
    .replace(ORDERED_PREFIX, '')
    .trim()
}

function cleanListItemHtml(owner: Document, html: string): string {
  return stripListPrefixHtml(
    owner,
    html
      .replace(/<!--\[if !supportLists\]-->[\s\S]*?<!--\[endif\]-->/gi, '')
      .replace(/<span[^>]*>\s*(?:&nbsp;|\s)*<\/span>/gi, '')
  )
}

function preserveBlankParagraphs(root: HTMLElement, owner: Document) {
  root.querySelectorAll('p').forEach((paragraph) => {
    const text = (paragraph.textContent || '').replace(/\u00a0/g, '').trim()
    if (text === '' && !paragraph.querySelector('br, img')) {
      paragraph.replaceChildren(owner.createElement('br'))
    }
  })
}
