import { Barlow, Barlow_Condensed } from 'next/font/google'
import '../../styles/admin.css'

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
})

// Les surcouches Radix sont rendues dans `body`, hors de l'arbre admin : la
// police est donc posée sur `:root`, là où le reste du thème vit déjà. La règle
// est hors couche et plus spécifique que la classe de police du site public.
const fontCss = `:root:has([data-admin]){--font-sans:${barlow.style.fontFamily},system-ui,sans-serif;--font-display:${barlow.style.fontFamily},system-ui,sans-serif;--adm-font-condensed:${barlowCondensed.style.fontFamily},${barlow.style.fontFamily},system-ui,sans-serif}`

/**
 * Charge le thème « Le tracé » (jetons, polices). À rendre une fois, à côté
 * d'un élément portant `data-admin` : layout de l'admin et page de connexion.
 */
export function AdminTheme() {
  return <style dangerouslySetInnerHTML={{ __html: fontCss }} />
}
