/**
 * Ouvre un document prêt à imprimer — ou à enregistrer en PDF, ce que fait la
 * boîte d'impression de tous les navigateurs.
 *
 * Le logiciel imprimait déjà ses ordonnances ainsi : une fenêtre, du HTML, et
 * la main laissée au navigateur. On garde ce procédé plutôt que d'embarquer un
 * moteur PDF — il évite une dépendance lourde, et le praticien garde le choix
 * du format, des marges et de l'imprimante.
 */

export interface PrintHeader {
  clinicName?: string | null
  vetName?: string | null
  address?: string | null
  phone?: string | null
}

export interface PrintDocument {
  title: string
  subtitle?: string | null
  /** Corps déjà rendu en HTML — voir `renderMarkdown`. */
  bodyHtml: string
  header?: PrintHeader
  footerNote?: string | null
}

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function openPrintableDocument(doc: PrintDocument): boolean {
  const win = window.open('', '_blank')
  // Bloqué par le navigateur : on le signale à l'appelant plutôt que d'échouer
  // en silence, sans quoi le praticien clique et ne voit rien se produire.
  if (!win) return false

  const h = doc.header || {}
  const lignesEntete = [h.clinicName, h.vetName, h.address, h.phone]
    .filter(Boolean)
    .map((l) => `<p>${escape(String(l))}</p>`)
    .join('')

  win.document.write(`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${escape(doc.title)}</title>
<style>
  @page { margin: 18mm; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #1f2937; line-height: 1.55; }
  header { border-bottom: 1px solid #d1d5db; padding-bottom: 12px; margin-bottom: 24px; }
  header p { margin: 0; font-size: 13px; color: #6b7280; }
  header p:first-child { font-size: 15px; font-weight: 600; color: #111827; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .subtitle { color: #6b7280; margin: 0 0 24px; font-size: 14px; }
  h1, h2, h3 { color: #111827; }
  h2 { font-size: 17px; margin: 22px 0 8px; }
  h3 { font-size: 15px; margin: 18px 0 6px; }
  p { margin: 0 0 10px; }
  ul, ol { margin: 0 0 12px 20px; padding: 0; }
  li { margin-bottom: 4px; }
  hr { border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0; }
  footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  /* Les couleurs de fond ne survivent pas toujours à l'impression : on n'en
     dépend pas, tout reste lisible en noir et blanc. */
</style>
</head>
<body>
  ${lignesEntete ? `<header>${lignesEntete}</header>` : ''}
  <h1>${escape(doc.title)}</h1>
  ${doc.subtitle ? `<p class="subtitle">${escape(doc.subtitle)}</p>` : ''}
  ${doc.bodyHtml}
  ${doc.footerNote ? `<footer>${escape(doc.footerNote)}</footer>` : ''}
</body>
</html>`)

  win.document.close()
  win.focus()

  // Laisse le rendu se poser avant d'ouvrir la boîte d'impression : appelée
  // trop tôt, elle imprime une page vide sur certains navigateurs.
  setTimeout(() => win.print(), 250)
  return true
}
