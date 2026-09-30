/**
 * Rendu Markdown, volontairement restreint.
 *
 * Le besoin est un compte rendu lisible : des titres, du gras, des listes. Pas
 * un moteur complet. Le choix d'écrire ces quarante lignes plutôt que d'ajouter
 * une bibliothèque tient à une raison précise : les analyseurs courants
 * laissent passer le HTML brut du texte source. Ici le texte est échappé
 * d'abord, et seule la grammaire ci-dessous est réintroduite — on ne peut donc
 * pas injecter de balise, même par accident.
 *
 * Reconnu : `#` à `###`, `**gras**`, `*italique*`, listes `-` et `1.`, `---`,
 * et les paragraphes séparés par une ligne vide.
 */

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Gras et italique, appliqués après échappement. */
const inline = (value: string) =>
  escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')

export function renderMarkdown(source: string): string {
  const lines = (source || '').split('\n')
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null
  let paragraph: string[] = []

  const closeParagraph = () => {
    if (!paragraph.length) return
    out.push(`<p>${paragraph.map(inline).join('<br>')}</p>`)
    paragraph = []
  }

  const closeList = () => {
    if (!list) return
    out.push(`</${list}>`)
    list = null
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (!line.trim()) {
      closeParagraph()
      closeList()
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      closeParagraph()
      closeList()
      const level = heading[1].length
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }

    if (/^-{3,}$/.test(line.trim())) {
      closeParagraph()
      closeList()
      out.push('<hr>')
      continue
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    if (bullet) {
      closeParagraph()
      if (list !== 'ul') {
        closeList()
        out.push('<ul>')
        list = 'ul'
      }
      out.push(`<li>${inline(bullet[1])}</li>`)
      continue
    }

    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/)
    if (numbered) {
      closeParagraph()
      if (list !== 'ol') {
        closeList()
        out.push('<ol>')
        list = 'ol'
      }
      out.push(`<li>${inline(numbered[1])}</li>`)
      continue
    }

    closeList()
    paragraph.push(line)
  }

  closeParagraph()
  closeList()

  return out.join('\n')
}

/**
 * Texte nu, pour les extraits de liste.
 *
 * Un aperçu de liste affichait « ## Motif Vomissements depuis **deux jours** » :
 * la syntaxe Markdown, lisible seulement une fois rendue, encombrait la ligne.
 * On retire les marques sans rien interpréter — c'est un extrait, pas un
 * document.
 */
export function markdownToPlainText(source: string): string {
  return (source || '')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^\s*-{3,}\s*$/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1$2')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
