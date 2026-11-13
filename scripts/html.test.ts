import { describe, expect, test } from 'bun:test'
import { assainirHtml, jsonPourScript } from '../src/lib/html'

const IMAGE = 'https://abc123.public.blob.vercel-storage.com/articles/photo-match.jpg'

// Balisage tel que l'éditeur de l'admin l'enregistre (StarterKit, Link, image redimensionnable)
const ARTICLE = [
  '<h2>Victoire des seniors</h2>',
  '<p>Belle soirée au gymnase&nbsp;: <strong>32-28</strong> face à Chambéry, <em>enfin</em>.<br>Merci au public.</p>',
  '<ul><li><p>Meilleure marqueuse : Léa</p></li><li><p>Prochain match samedi</p></li></ul>',
  '<p>Résumé sur <a target="_blank" rel="noopener noreferrer nofollow" href="https://www.ffhandball.fr/competitions" class="text-[color:var(--adm-orange-ink)] underline">le site fédéral</a>.</p>',
  `<p><img src="${IMAGE}" alt="L'équipe" title="Photo" width="320" containerstyle="width: 320px; height: auto; cursor: pointer; display: inline-block;" wrapperstyle="display: inline-block; float: left; padding-right: 8px;" class="rounded-lg max-w-full h-auto mx-auto block"></p>`,
].join('')

describe('assainirHtml conserve le contenu de l\'éditeur', () => {
  const propre = assainirHtml(ARTICLE)

  test('les neuf balises utilisées restent', () => {
    for (const balise of ['p', 'br', 'h2', 'strong', 'em', 'ul', 'li', 'a', 'img']) {
      expect(propre).toContain(`<${balise}`)
    }
  })

  test('le texte reste intact', () => {
    expect(propre).toContain('<h2>Victoire des seniors</h2>')
    expect(propre).toContain('<strong>32-28</strong>')
    expect(propre).toContain('<em>enfin</em>')
    expect(propre).toContain('<li><p>Prochain match samedi</p></li>')
  })

  test('le lien garde sa cible et son rel', () => {
    expect(propre).toContain('href="https://www.ffhandball.fr/competitions"')
    expect(propre).toContain('target="_blank"')
    expect(propre).toContain('rel="noopener noreferrer nofollow"')
  })

  test("l'image Blob garde ses attributs et sa mise en page", () => {
    expect(propre).toContain(`src="${IMAGE}"`)
    expect(propre).toContain('alt="L\'équipe"')
    expect(propre).toContain('title="Photo"')
    expect(propre).toContain('width="320"')
    expect(propre).toContain('containerstyle="width: 320px; height: auto; cursor: pointer; display: inline-block;"')
    expect(propre).toContain('wrapperstyle="display: inline-block; float: left; padding-right: 8px;"')
  })

  test('les classes de l\'éditeur sont retirées', () => {
    expect(propre).not.toContain('class=')
  })

  test('assainir deux fois ne change plus rien', () => {
    expect(assainirHtml(propre)).toBe(propre)
  })

  test('les autres balises de StarterKit passent', () => {
    const html = '<h3>T</h3><ol><li>a</li></ol><blockquote><p>c</p></blockquote><pre><code>x</code></pre><hr><p><s>s</s><u>u</u><b>b</b><i>i</i></p>'
    // sanitize-html normalise les éléments vides en `<hr />`
    expect(assainirHtml(html)).toBe(html.replace('<hr>', '<hr />'))
  })
})

describe('assainirHtml retire le dangereux', () => {
  test('script, iframe et style disparaissent avec leur contenu', () => {
    const propre = assainirHtml('<p>a</p><script>alert(1)</script><iframe src="https://evil.example"></iframe><style>body{display:none}</style><p>b</p>')
    expect(propre).toBe('<p>a</p><p>b</p>')
  })

  test('les gestionnaires d\'événements sont retirés', () => {
    const propre = assainirHtml(`<p onclick="alert(1)">a</p><img src="${IMAGE}" onerror="alert(1)">`)
    expect(propre).not.toContain('onclick')
    expect(propre).not.toContain('onerror')
    expect(propre).toContain(`<img src="${IMAGE}" />`)
  })

  test('un lien javascript: perd son href', () => {
    const propre = assainirHtml('<a href="javascript:alert(1)">x</a><a href="JaVaScRiPt:alert(1)">y</a>')
    expect(propre.toLowerCase()).not.toContain('javascript')
    expect(propre).toBe('<a>x</a><a>y</a>')
  })

  test('mailto et tel restent permis', () => {
    expect(assainirHtml('<a href="mailto:contact@club.fr">m</a>')).toBe('<a href="mailto:contact@club.fr">m</a>')
    expect(assainirHtml('<a href="tel:+33600000000">t</a>')).toBe('<a href="tel:+33600000000">t</a>')
  })

  test('une image en http: ou data: est retirée', () => {
    expect(assainirHtml('<p>a<img src="http://exemple.fr/x.jpg">b</p>')).toBe('<p>ab</p>')
    expect(assainirHtml('<p>a<img src="data:image/png;base64,AAAA">b</p>')).toBe('<p>ab</p>')
    expect(assainirHtml('<p>a<img src="//exemple.fr/x.jpg">b</p>')).toBe('<p>ab</p>')
  })

  test('les attributs style et class sont retirés', () => {
    expect(assainirHtml('<p style="position:fixed" class="fixed inset-0">a</p>')).toBe('<p>a</p>')
  })

  test('la mise en page de l\'image ne garde que des déclarations bornées', () => {
    const propre = assainirHtml(`<img src="${IMAGE}" containerstyle="width: 50%; position: fixed; background: url(https://evil.example/x)" wrapperstyle="z-index: 999">`)
    expect(propre).toBe(`<img src="${IMAGE}" containerstyle="width: 50%;" />`)
  })

  test('une cible autre que _blank est retirée, _blank force noopener noreferrer', () => {
    expect(assainirHtml('<a href="https://a.fr" target="_top">x</a>')).toBe('<a href="https://a.fr">x</a>')
    expect(assainirHtml('<a href="https://a.fr" target="_blank" rel="opener">x</a>')).toBe('<a href="https://a.fr" target="_blank" rel="noopener noreferrer">x</a>')
  })

  test('une balise inconnue disparaît mais son texte reste', () => {
    expect(assainirHtml('<p><span style="color:red">rouge</span> <font>f</font></p>')).toBe('<p>rouge f</p>')
  })
})

describe('jsonPourScript', () => {
  test('ne peut pas fermer la balise script', () => {
    const objet = { t: '</script><script>alert(1)</script>', e: 'a & b' }
    const json = jsonPourScript(objet)
    expect(json).not.toContain('</script')
    expect(json).not.toContain('<')
    expect(json).not.toContain('>')
    expect(json).not.toContain('&')
    expect(JSON.parse(json)).toEqual(objet)
  })
})
