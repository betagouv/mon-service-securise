#import "commun.typ": *

#let donnees = json(bytes(sys.inputs.payload))

#set text(font: "Marianne", size: 9pt, fill: encre, lang: "fr")
#set par(spacing: 0.65em, leading: 0.6em)
#set page(
  paper: "a4",
  margin: (x: 1.5cm, top: 1.2cm, bottom: 1.4cm),
  footer: context {
    set text(size: 7pt, fill: gris)
    v(1pt)
    grid(columns: (1fr, auto),
      [#text(fill: bleuFonce, weight: "bold")[MonServiceSécurisé] - #donnees.nomService],
      align(right)[Page #counter(page).get().first() / #counter(page).final().first()],
    )
  },
)


#grid(
  columns: (1fr, auto),
  align: horizon,
  image("assets/logo_republique.png", height: 12mm),
  grid(
    columns: 2,
    column-gutter: 4mm,
    align: horizon,
    image("assets/logo_mss.png", height: 12mm),
    image("assets/logo_anssi.png", height: 12mm),
  ),
)

#v(50pt)

#text(size: 11pt, weight: "bold")[#upper[Synthèse de la sécurité du service]]
#v(3pt)
#line(length: 8mm, stroke: 0.5pt + black)
#v(8pt)
#text(size: 9pt, weight: "medium", fill: gris)[#upper[#donnees.nomEntite]]
#v(2pt)
#text(size: 10pt, weight: "medium", fill: bleuFonce)[#donnees.nomService]
#v(20pt)

#let cartoucheBesoinsIdentifies = box(
  fill: bleuMSS,
  radius: 100pt,
  inset: (x: 14pt, y: 8pt),
)[#text(size: 7pt, fill: white, weight: "bold")[Besoins identifiés#linebreak()par l'ANSSI]]

#let cartoucheBesoinsSuperieurs(labelReco) = box(
  fill: orangeClair,
  stroke: 0.5pt + orange,
  radius: 3pt,
  inset: (x: 5pt, y: 4pt),
  width: 100%,
)[#grid(
  columns: (auto, 1fr),
  column-gutter: 4pt,
  align: top + left,
  image("assets/icone_alerte.svg", height: 10pt),
  align(left)[#text(size: 6pt)[
    Les besoins sélectionnés sont #text(weight: "bold")[supérieurs à ceux identifiés]
    à titre indicatif par l'ANSSI (#labelReco)
  ]],
)]

#layout(size => context {
  let gutter = 8pt

  // Hauteur de la pill (même spec que dans boite) — partagée avec boiteSansEtiquette
  let h-pill = measure(box(
    fill: grisClair,
    stroke: 1pt + bordBleu,
    radius: 20pt,
    inset: (x: 9pt, y: 6pt),
  )[#text(fill: bleuFonce, weight: "bold", size: 8pt)[X]]).height

  // 2fr + 1fr + 1fr = 4fr, 2 gouttières
  let w-left  = (size.width - 2 * gutter) / 2
  let w-mid   = (size.width - 2 * gutter) / 4
  let w-right = (size.width - 2 * gutter) / 4

  let resume-contenu = [
    #dl("Type :", donnees.typeService)
    #dl("Données stockées :", donnees.localisationDonnees)
    #dl("Statut :", donnees.statutDeploiement)
    #dl("Présentation :", donnees.at("presentation", default: ""))
  ]

  let besoins-contenu = align(center)[
    #text(size: 10pt, weight: "medium", fill: grisTexte)[Besoins de sécurité]
    #v(2pt)
    #text(size: 13pt, weight: "bold")[#donnees.labelNiveauSecurite]
    #v(12pt)
    #image("assets/" + donnees.niveauSecurite + ".svg", width: 75pt)
    #v(10pt)
    #if donnees.niveauSuperieurAuxRecommandations [
      #cartoucheBesoinsSuperieurs(donnees.labelNiveauRecommande)
    ] else [
      #cartoucheBesoinsIdentifies
    ]
  ]

  let svg-gauge = image(bytes(donnees.svgIndiceCyber), format: "svg", width: 65pt)
  let h-svg = measure(svg-gauge).height

  let indice-cyber-contenu = [
    #text(fill: grisTexte, size: 9pt)[Par catégorie :]
    #v(6pt)
    #for cat in donnees.categoriesIndiceCyber {
      grid(
        columns: (1fr, auto),
        align: horizon,
        text(size: 8pt)[#cat.description],
        text(size: 9pt, fill: bleuMSS, weight: "bold")[
          #if cat.note == none [–] else [#cat.note]
        ],
      )
    }
  ]

  let indice-perso-contenu = [
    #grid(
      columns: (auto, 1fr),
      column-gutter: 4pt,
      align: horizon,
      text(size: 9pt, fill: bleuFonce)[
        Indice cyber#linebreak()Personnalisé
      ],
      image(bytes(donnees.svgIndiceCyberPersonnalise), format: "svg", width: 100%),
    )
  ]

  // Décale col3 vers le haut pour aligner la bordure avec col1/col2 (h-pill/2)
  // Le SVG déborde au-dessus de la ligne de bordure, éventuellement au-dessus du contenu précédent
  let col3-contenu = [
    #v(h-pill / 2 - h-svg / 2)
    #boiteAvecMedaillon(svg-gauge, indice-cyber-contenu)
    #boiteSansEtiquette(h-pill, indice-perso-contenu)
  ]

  // Mesure toutes les colonnes à hauteur auto
  let h-resume  = measure(boite("Résumé", resume-contenu), width: w-left).height
  let h-besoins = measure(boiteSansEtiquette(h-pill, besoins-contenu), width: w-mid).height
  let h-col3    = measure(col3-contenu, width: w-right).height

  // inner-h = hauteur du bloc bordé (pill/spacer exclu) pour col1 et col2
  let inner-h = calc.max(h-resume, h-besoins, h-col3) - h-pill / 2

  grid(
    columns: (2fr, 1fr, 1fr),
    column-gutter: gutter,
    align: top,
    boite("Résumé", inner-h: inner-h, resume-contenu),
    boiteSansEtiquette(h-pill, inner-h: inner-h, besoins-contenu),
    col3-contenu,
  )
})