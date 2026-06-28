import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { EtatDesLieux } from '@/types/etatDesLieux'
import { supabase } from './supabase'

const ETAT_LABEL: Record<string, string> = {
  bon: 'Bon état',
  usage: 'Usage normal',
  mauvais: 'Mauvais état',
  non_applicable: 'N/A',
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function fmtDate(d?: string) {
  if (!d) return '_________________'
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtMonth(m?: string) {
  if (!m) return '_________________'
  const [y, mo] = m.split('-')
  const months = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${months[parseInt(mo) - 1]} ${y}`
}

function etatCell(etat?: string, commentaire?: string) {
  const label = etat ? ETAT_LABEL[etat] ?? etat : '___________'
  return commentaire ? `${label}\n${commentaire}` : label
}

export async function generateEDLPdf(data: EtatDesLieux): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const info = data.infosGenerales
  const isEntree = info.typeMouvement === 'entree'
  const pageW = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentW = pageW - margin * 2
  let y = 15

  // ─── helpers ────────────────────────────────────────────────────────────────
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
    checkY(8)
    doc.setFont('helvetica', 'bold').setFontSize(10)
    doc.text(text, margin, y)
    y += 5
    doc.setFont('helvetica', 'normal').setFontSize(9)
  }

  // ─── EN-TÊTE ────────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold').setFontSize(15)
  doc.text('ÉTAT DES LIEUX', pageW / 2, y, { align: 'center' })
  y += 7
  doc.setFontSize(12)
  doc.text('ENTRÉE ET SORTIE', pageW / 2, y, { align: 'center' })
  y += 7
  doc.setFont('helvetica', 'normal').setFontSize(7.5)
  const legal = 'Établi conformément à l\'article 3-2 de la loi n° 89-462 du 6 juillet 1989 et au décret n° 2016-382 du 30 mars 2016. L\'état des lieux est dressé contradictoirement entre les parties lors de la remise des clés au locataire et lors de leur restitution en fin de bail.'
  const legalLines = doc.splitTextToSize(legal, contentW)
  doc.text(legalLines, margin, y)
  y += legalLines.length * 4 + 4

  // Dates entrée/sortie
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    head: [['', 'Date']],
    body: [
      ['Entrée, réalisée le', isEntree ? fmtDate(info.dateEtat) : '_____ / _____ / __________'],
      ['Sortie, réalisée le', !isEntree ? fmtDate(info.dateEtat) : '_____ / _____ / __________'],
    ],
    columnStyles: { 0: { cellWidth: 80 } },
  })
  y = (doc as any).lastAutoTable.finalY + 6

  // ─── I. IDENTIFICATION ──────────────────────────────────────────────────────
  h1('I. Identification du logement et des parties')

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Logement', '']],
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    body: [
      ['Type', 'Appartement'],
      ['Adresse', `${info.adresse}, ${info.codePostal} ${info.ville}`],
      ...(data.infosGenerales as any).surface ? [['Surface habitable', `${(data.infosGenerales as any).surface} m²`]] : [],
      ['Identifiant fiscal', info.identifiantFiscal || '_______________'],
    ],
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
  })
  y = (doc as any).lastAutoTable.finalY + 3

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Bailleur', '']],
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    body: [
      ['Nom et prénom', `${info.bailleur.prenom} ${info.bailleur.nom}`.toUpperCase()],
      ['Adresse', info.bailleur.adresse ?? ''],
      ['Email', info.bailleur.email ?? ''],
    ],
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
  })
  y = (doc as any).lastAutoTable.finalY + 3

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Locataire', '']],
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    body: [
      ['Nom et prénom', `${info.locataire.prenom} ${info.locataire.nom}`.toUpperCase()],
      ...(info.locataire.email ? [['Email', info.locataire.email]] : []),
      ...(info.locataire.telephone ? [['Téléphone', info.locataire.telephone]] : []),
      ...(info.bail?.dateDebut ? [['Bail du', `${fmtDate(info.bail.dateDebut)} — durée ${info.bail.duree ?? '1 an'}`]] : []),
    ],
    columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' } },
  })
  y = (doc as any).lastAutoTable.finalY + 6

  // ─── II. RELEVÉ DES COMPTEURS ────────────────────────────────────────────────
  checkY(30)
  h1('II. Relevé des compteurs')

  const cpt = info.releveCompteurs
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Électricité (compteur individuel)', '']],
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    body: [
      ['N° compteur (PDL)', cpt.electricite_pdl || '___________________________'],
      ['Relevé heures pleines (HP)', cpt.electricite_hp || '___________________________'],
      ['Relevé heures creuses (HC)', cpt.electricite_hc || '___________________________'],
    ],
    columnStyles: { 0: { cellWidth: 80, fontStyle: 'bold' } },
  })
  y = (doc as any).lastAutoTable.finalY + 3

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Eau', '']],
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    body: [
      ['N° compteur eau', cpt.eau_numero || '___________________________'],
      ['Eau froide (m³)', cpt.eau_froide || '___________________________'],
    ],
    columnStyles: { 0: { cellWidth: 80, fontStyle: 'bold' } },
  })
  y = (doc as any).lastAutoTable.finalY + 3

  doc.setFontSize(8).setFont('helvetica', 'italic')
  doc.text('Le logement n\'est pas raccordé au gaz naturel — chauffage et eau chaude individuels électriques.', margin, y)
  y += 7

  // ─── III. ÉQUIPEMENTS ÉNERGÉTIQUES ───────────────────────────────────────────
  checkY(35)
  h1('III. Équipements énergétiques')

  const ee = data.equipementsEnergetiques ?? {}
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Équipement', 'Détail']],
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    body: [
      ['Chauffage', 'Individuel — électrique'],
      ['Eau chaude sanitaire', 'Individuelle — électrique (ballon ECS)'],
      ['Climatisation', 'Salon et chambre'],
      ['Ballon d\'eau chaude — état général', etatCell(ee.ballon_etat)],
      ['Ballon d\'eau chaude — dernier entretien', fmtMonth(ee.ballon_date_entretien)],
      ['Climatisation — unité salon', etatCell(ee.clim_salon_etat)],
      ['Climatisation — unité chambre', etatCell(ee.clim_chambre_etat)],
      ['Climatisation — dernier entretien', fmtMonth(ee.clim_date_entretien)],
    ],
    columnStyles: { 0: { cellWidth: 90, fontStyle: 'bold' } },
  })
  y = (doc as any).lastAutoTable.finalY + 6

  // ─── IV. CLÉS ET BADGES ──────────────────────────────────────────────────────
  checkY(25)
  h1('IV. Clés et badges remis au locataire')

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Type', 'Nombre', 'Commentaires']],
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    body: (info.cles ?? []).map(c => [c.type, String(c.nombre), c.commentaire ?? '']),
    columnStyles: { 1: { cellWidth: 20, halign: 'center' } },
  })
  y = (doc as any).lastAutoTable.finalY + 6

  // ─── V. PARTIES PRIVATIVES ───────────────────────────────────────────────────
  checkY(20)
  h1('V. Parties privatives attachées au logement')

  const pp = data.partiesPrivatives ?? {}
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Élément', 'État entrée', 'Commentaires']],
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    body: Object.entries(pp).map(([k, v]) => [k, etatCell(v.etat), v.commentaire ?? '']),
    columnStyles: { 1: { cellWidth: 35 } },
  })
  y = (doc as any).lastAutoTable.finalY + 6

  // ─── VI. ÉQUIPEMENTS ET AMÉNAGEMENTS ─────────────────────────────────────────
  checkY(20)
  h1('VI. Équipements et aménagements')

  const eq = data.equipements ?? {}
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 2 },
    head: [['Élément', 'État entrée', 'Commentaires']],
    headStyles: { fillColor: [220, 230, 241], textColor: 20, fontStyle: 'bold' },
    body: Object.entries(eq).map(([k, v]) => [k, etatCell(v.etat), v.commentaire ?? '']),
    columnStyles: { 1: { cellWidth: 35 } },
  })
  y = (doc as any).lastAutoTable.finalY + 6

  // ─── VII. ÉTAT DES LIEUX PAR PIÈCE ───────────────────────────────────────────
  h1('VII. État des lieux par pièce')

  for (const piece of data.pieces) {
    checkY(20)
    h2(piece.nom)

    const rows = Object.entries(piece.elements).map(([k, v]) => [
      k,
      etatCell(v.etat, v.commentaire),
    ])

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8.5, cellPadding: 2 },
      head: [['Élément', 'État']],
      headStyles: { fillColor: [235, 240, 248], textColor: 20, fontStyle: 'bold', fontSize: 8.5 },
      body: rows,
      columnStyles: { 0: { cellWidth: 90 }, 1: { cellWidth: contentW - 90 } },
    })
    y = (doc as any).lastAutoTable.finalY + 4

    // Photos de la pièce
    if (piece.photos && piece.photos.length > 0) {
      const photoW = 85
      const photoH = 64
      const gap = 10
      for (let i = 0; i < piece.photos.length; i += 2) {
        checkY(photoH + 6)
        const batch = piece.photos.slice(i, i + 2)
        const dataUrls = await Promise.all(batch.map(async path => {
          try {
            const { data, error } = await supabase.storage.from('edl-photos').download(path)
            if (error || !data) return null
            return await blobToDataUrl(data)
          } catch {
            return null
          }
        }))
        for (let j = 0; j < batch.length; j++) {
          const dataUrl = dataUrls[j]
          if (!dataUrl) continue
          const x = margin + j * (photoW + gap)
          doc.addImage(dataUrl, 'JPEG', x, y, photoW, photoH)
        }
        y += photoH + 4
      }
    }

    if (piece.commentaireGeneral) {
      checkY(8)
      doc.setFontSize(8).setFont('helvetica', 'italic')
      doc.text(`Observations : ${piece.commentaireGeneral}`, margin, y)
      y += 6
    }
  }

  // ─── VIII. OBSERVATIONS GÉNÉRALES ────────────────────────────────────────────
  checkY(20)
  h1('VIII. Observations générales et commentaires')
  doc.setFontSize(9).setFont('helvetica', 'normal')
  if (data.observations?.trim()) {
    const obsLines = doc.splitTextToSize(data.observations, contentW)
    doc.text(obsLines, margin, y)
    y += obsLines.length * 4.5 + 4
  } else {
    doc.rect(margin, y, contentW, 20)
    y += 24
  }

  // ─── IX. MENTIONS IMPORTANTES ────────────────────────────────────────────────
  checkY(50)
  h1('IX. Mentions importantes')

  doc.setFontSize(8).setFont('helvetica', 'bold')
  doc.text('Demande de complément après l\'état des lieux d\'entrée', margin, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  const mentions1 = 'Le locataire peut demander au bailleur ou à son représentant de compléter l\'état des lieux d\'entrée dans les dix (10) jours suivant la date de réalisation, pour tout élément concernant le logement ; durant le premier mois de la période de chauffe, concernant l\'état des éléments de chauffage et de la climatisation.'
  const m1lines = doc.splitTextToSize(mentions1, contentW)
  doc.text(m1lines, margin, y)
  y += m1lines.length * 3.8 + 4

  doc.setFont('helvetica', 'bold').setFontSize(8)
  doc.text('Entretien courant et menues réparations', margin, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  const mentions2 = 'Le locataire doit veiller à maintenir en l\'état le logement qu\'il occupe. À ce titre, il assure l\'entretien normal du logement, du mobilier et des équipements, ainsi que les menues réparations définies par le décret n° 87-712 du 26 août 1987, sauf si elles sont occasionnées par vétusté, malfaçon, vice de construction, cas fortuit ou force majeure. À défaut, le bailleur peut retenir sur le dépôt de garantie les sommes correspondant aux réparations locatives non effectuées, justificatifs à l\'appui.'
  const m2lines = doc.splitTextToSize(mentions2, contentW)
  doc.text(m2lines, margin, y)
  y += m2lines.length * 3.8 + 6

  // ─── X. SIGNATURES ───────────────────────────────────────────────────────────
  checkY(55)
  h1(`X. Signatures — État des lieux d'${isEntree ? 'entrée' : 'sortie'}`)

  doc.setFontSize(9)
  doc.text(`Fait en deux exemplaires originaux,`, margin, y)
  y += 5
  doc.text(`À _________________________, le ${fmtDate(info.dateEtat)}`, margin, y)
  y += 10

  const sigW = (contentW - 10) / 2
  const sigY = y

  // Bailleur
  doc.setFont('helvetica', 'bold').text('Le bailleur', margin, sigY)
  doc.setFont('helvetica', 'normal').text(`${info.bailleur.prenom} ${info.bailleur.nom}`, margin, sigY + 5)
  doc.setFontSize(7.5).setFont('helvetica', 'italic')
  doc.text('Signature précédée de la mention « certifié exact »', margin, sigY + 10)
  doc.rect(margin, sigY + 14, sigW, 25)

  // Locataire
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
    doc.text(`État des lieux ${isEntree ? 'd\'entrée' : 'de sortie'} — ${info.locataire.prenom} ${info.locataire.nom} — ${info.adresse}`, margin, 291)
    doc.setTextColor(0)
  }

  // ─── SAUVEGARDE ──────────────────────────────────────────────────────────────
  const fileName = `EDL_${isEntree ? 'entree' : 'sortie'}_${info.locataire.nom}_${info.dateEtat}.pdf`
  doc.save(fileName)
}
