import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { EtatDesLieux } from '@/types/etatDesLieux'
import { INVENTAIRE_ETAT_LABELS, ETAT_PHYSIQUE_LABELS } from '@/types/inventaire'

function fmtDate(d?: string) {
  if (!d) return '_________________'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function etatDeclareLabel(etat?: string): string {
  if (!etat) return ''
  return ETAT_PHYSIQUE_LABELS[etat as keyof typeof ETAT_PHYSIQUE_LABELS] ?? etat
}

function etatAccordLabel(etat?: string): string {
  if (!etat) return ''
  return INVENTAIRE_ETAT_LABELS[etat as keyof typeof INVENTAIRE_ETAT_LABELS] ?? etat
}

export async function generateInventairePdf(data: EtatDesLieux): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const info = data.infosGenerales
  const inventaire = Array.isArray(data.inventaire) ? data.inventaire : []
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentW = pageW - margin * 2
  let y = 15

  const addPage = () => { doc.addPage(); y = 15 }
  const checkY = (needed = 20) => { if (y + needed > 275) addPage() }

  const h1 = (text: string) => {
    checkY(12)
    doc.setFont('helvetica', 'bold').setFontSize(13)
    doc.text(text, margin, y)
    y += 7
    doc.setFont('helvetica', 'normal').setFontSize(10)
  }

  const h2 = (text: string) => {
    checkY(10)
    doc.setFont('helvetica', 'bold').setFontSize(10)
    doc.text(text, margin, y)
    y += 5
    doc.setFont('helvetica', 'normal').setFontSize(9)
  }

  // ─── EN-TÊTE ────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold').setFontSize(13)
  doc.text("ANNEXE À L'ÉTAT DES LIEUX D'ENTRÉE & SORTIE", pageW / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(11)
  doc.text('INVENTAIRE ET ÉTAT DÉTAILLÉ DU MOBILIER', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFont('helvetica', 'normal').setFontSize(7.5)
  const legal = "Inventaire établi en application de l'article 25-4 de la loi n° 89-462 du 6 juillet 1989 et du décret n° 2015-981 du 31 juillet 2015 fixant la liste des éléments de mobilier d'un logement meublé."
  const legalLines = doc.splitTextToSize(legal, contentW)
  doc.text(legalLines, margin, y)
  y += legalLines.length * 4 + 6

  // ─── IDENTIFICATION ──────────────────────────────────────────────────────────
  h1('Identification')

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    showHead: false,
    body: [
      ['Logement', `${info.adresse}, ${info.codePostal} ${info.ville}`],
      ['Bailleur', `${info.bailleur.prenom} ${info.bailleur.nom}`.toUpperCase()],
      ['Locataire', `${info.locataire.prenom} ${info.locataire.nom}`.toUpperCase()],
      ['Bail du', info.bail?.dateDebut ? fmtDate(info.bail.dateDebut) : '_______________'],
      ["Date de l'inventaire", fmtDate(info.dateEtat)],
    ],
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
  })
  y = (doc as any).lastAutoTable.finalY + 6

  // ─── LÉGENDE ─────────────────────────────────────────────────────────────────
  checkY(16)
  doc.setFont('helvetica', 'bold').setFontSize(8)
  doc.text('Légende :', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text('Neuf  ·  Très bon  ·  Bon état  ·  Usagé  ·  Mauvais', margin + 20, y)
  y += 8

  // ─── TABLEAUX PAR SECTION ─────────────────────────────────────────────────────
  for (const { section, items } of inventaire) {
    if (!items || items.length === 0) continue
    checkY(15)
    h2(section)

    const rows = items.map(item => {
      const etatCol = etatDeclareLabel(item.etatDeclare) || item.noteInitiale || ''
      const accordCol = etatAccordLabel(item.etatEntree)
      const obs = item.observations || ''
      return [
        item.designation,
        item.quantite ?? '',
        etatCol,
        accordCol,
        obs,
      ]
    })

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [235, 240, 248], textColor: 20, fontStyle: 'bold', fontSize: 8 },
      head: [['Désignation', 'Qté', 'État déclaré', 'Accord locataire', 'Observations']],
      body: rows,
      columnStyles: {
        0: { cellWidth: 62 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: contentW - 62 - 20 - 28 - 22 },
      },
    })
    y = (doc as any).lastAutoTable.finalY + 4
  }

  // ─── OBSERVATIONS GÉNÉRALES ───────────────────────────────────────────────────
  checkY(30)
  h1('Observations générales')
  doc.rect(margin, y, contentW, 22)
  y += 26

  // ─── MENTION FINALE ───────────────────────────────────────────────────────────
  checkY(40)
  doc.setFontSize(8).setFont('helvetica', 'italic')
  const mention = "Le présent inventaire, établi contradictoirement entre les parties, fait partie intégrante du contrat de location et de l'état des lieux d'entrée. Toute observation relative à un manquement, un défaut ou une dégradation devra être signalée par écrit au bailleur dans un délai de dix jours à compter de la prise d'effet du bail."
  const mentionLines = doc.splitTextToSize(mention, contentW)
  doc.text(mentionLines, margin, y)
  y += mentionLines.length * 3.8 + 6

  doc.setFont('helvetica', 'normal').setFontSize(9)
  doc.text(`Fait en deux exemplaires originaux, à _________________________, le ${fmtDate(info.dateEtat)}`, margin, y)
  y += 12

  // ─── SIGNATURES ──────────────────────────────────────────────────────────────
  checkY(45)
  const sigW = (contentW - 10) / 2
  const sigY = y

  doc.setFont('helvetica', 'bold').setFontSize(9).text('Le bailleur', margin, sigY)
  doc.setFont('helvetica', 'normal').text(`${info.bailleur.prenom} ${info.bailleur.nom}`, margin, sigY + 5)
  doc.setFontSize(7.5).setFont('helvetica', 'italic')
  doc.text('Signature précédée de la mention « certifié exact »', margin, sigY + 10)
  doc.rect(margin, sigY + 14, sigW, 25)

  const locX = margin + sigW + 10
  doc.setFont('helvetica', 'bold').setFontSize(9).text('Le locataire', locX, sigY)
  doc.setFont('helvetica', 'normal').text(`${info.locataire.prenom} ${info.locataire.nom}`, locX, sigY + 5)
  doc.setFontSize(7.5).setFont('helvetica', 'italic')
  doc.text('Signature précédée de la mention « certifié exact »', locX, sigY + 10)
  doc.rect(locX, sigY + 14, sigW, 25)

  // ─── NUMÉROTATION PAGES ──────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7.5).setFont('helvetica', 'normal').setTextColor(150)
    doc.text(`Page ${i}/${pageCount}`, pageW - margin, 291, { align: 'right' })
    doc.text(`Inventaire — ${info.locataire.prenom} ${info.locataire.nom} — ${info.adresse}`, margin, 291)
    doc.setTextColor(0)
  }

  const fileName = `inventaire-${info.locataire.nom}-${info.locataire.prenom}-${info.dateEtat}.pdf`
  doc.save(fileName)
}
