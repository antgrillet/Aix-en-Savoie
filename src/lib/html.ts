import sanitizeHtml from 'sanitize-html'

// Liste blanche calée sur ce que produit l'éditeur de l'admin (RichTextEditor) :
// StarterKit, Link et l'image redimensionnable (tiptap-extension-resize-image).
// Toute extension ajoutée à l'éditeur doit être reflétée ici, sinon sa mise en
// forme disparaît à l'enregistrement.
const BALISES = [
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 's', 'u', 'code', 'pre',
  'blockquote', 'ul', 'ol', 'li', 'hr', 'a', 'img',
]

// L'image redimensionnable enregistre sa mise en page dans deux attributs
// propres à l'éditeur, relus au chargement : `containerstyle` et `wrapperstyle`.
// Le navigateur ne les applique pas, mais on n'y garde que des déclarations de
// taille, d'affichage, d'alignement et de marge aux valeurs simples.
const ATTRIBUTS_STYLE_IMAGE = ['containerstyle', 'wrapperstyle']

const DIMENSION = /^(?:-?\d+(?:\.\d+)?(?:px|em|rem|%|vw|vh)|auto|0)$/i
const estDimension = (valeur: string) => valeur.split(/\s+/).every((jeton) => DIMENSION.test(jeton))
const parmi = (valeurs: string[]) => (valeur: string) => valeurs.includes(valeur.toLowerCase())

const PROPRIETES_STYLE: Record<string, (valeur: string) => boolean> = {
  width: estDimension,
  height: estDimension,
  'min-width': estDimension,
  'max-width': estDimension,
  'min-height': estDimension,
  'max-height': estDimension,
  display: parmi(['block', 'inline-block', 'inline', 'flex']),
  float: parmi(['left', 'right', 'none']),
  'text-align': parmi(['left', 'center', 'right']),
  margin: estDimension,
  'margin-top': estDimension,
  'margin-right': estDimension,
  'margin-bottom': estDimension,
  'margin-left': estDimension,
  padding: estDimension,
  'padding-top': estDimension,
  'padding-right': estDimension,
  'padding-bottom': estDimension,
  'padding-left': estDimension,
  cursor: parmi(['pointer']),
}

function filtrerStyle(style: string): string {
  const declarations: string[] = []
  for (const brute of style.split(';')) {
    const deuxPoints = brute.indexOf(':')
    if (deuxPoints === -1) continue
    const propriete = brute.slice(0, deuxPoints).trim().toLowerCase()
    const valeur = brute.slice(deuxPoints + 1).trim()
    const valide = PROPRIETES_STYLE[propriete]
    if (valeur && valide && valide(valeur)) declarations.push(`${propriete}: ${valeur};`)
  }
  return declarations.join(' ')
}

const REL_AUTORISES = ['noopener', 'noreferrer', 'nofollow', 'ugc', 'sponsored']

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: BALISES,
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', ...ATTRIBUTS_STYLE_IMAGE],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['https'] },
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => {
      const attributs = { ...attribs }
      if (attributs.target !== undefined) {
        if (attributs.target === '_blank') {
          // Un lien ouvert dans un nouvel onglet ne doit pas pouvoir piloter la page d'origine
          const rel = (attributs.rel ?? '')
            .toLowerCase()
            .split(/\s+/)
            .filter((jeton) => REL_AUTORISES.includes(jeton))
          attributs.rel = [...new Set(['noopener', 'noreferrer', ...rel])].join(' ')
        } else {
          delete attributs.target
        }
      }
      return { tagName, attribs: attributs }
    },
    img: (tagName, attribs) => {
      const attributs = { ...attribs }
      for (const nom of ATTRIBUTS_STYLE_IMAGE) {
        if (attributs[nom] === undefined) continue
        const style = filtrerStyle(attributs[nom])
        if (style) attributs[nom] = style
        else delete attributs[nom]
      }
      return { tagName, attribs: attributs }
    },
  },
  // Une image dont la source a été refusée n'a plus rien à afficher
  exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src,
}

export function assainirHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS)
}

// JSON destiné à une balise <script> : `<`, `>` et `&` échappés pour qu'aucune
// valeur (un titre contenant `</script>`, par exemple) ne puisse fermer la balise.
export function jsonPourScript(valeur: unknown): string {
  return (JSON.stringify(valeur) ?? 'null')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
