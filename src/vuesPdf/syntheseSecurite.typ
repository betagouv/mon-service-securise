#let donnees = json(bytes(sys.inputs.payload))

#let bleu       = rgb("#000091")
#let bleuFonce  = rgb("#08416a")
#let bleuMSS    = rgb("#0079d0")
#let encre      = rgb("#161616")
#let gris       = rgb("#666666")
#let grisBord   = rgb("#dddddd")
#let grisTexte  = rgb("#8a8a8a")
#let grisClair  = rgb("#efefef")
#let bordBleu   = rgb("#b5c1d2")
#let orange     = rgb("#faa72c")
#let orangeClair = rgb("#fff2de")

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

// Fieldset avec étiquette en pill centrée sur la bordure supérieure
// inner-h : hauteur explicite du bloc bordé (auto = déterminée par le contenu)
#let boite(label, inner-h: auto, contenu) = context {
  let pill = box(
    fill: grisClair,
    stroke: 1pt + bordBleu,
    radius: 20pt,
    inset: (x: 9pt, y: 6pt),
  )[#text(fill: bleuFonce, weight: "bold", size: 8pt)[#label]]
  let h = measure(pill).height
  stack(
    dir: btt,
    block(
      stroke: 1pt + bordBleu,
      radius: 7pt,
      width: 100%,
      height: inner-h,
      inset: (left: 16pt, right: 16pt, top: h / 2 + 6pt, bottom: 10pt),
    )[#v(7pt) #contenu],
    -(h / 2),
    pad(left: 16pt)[#pill],
  )
}

// Fieldset sans étiquette, aligné avec boite (décalage h-pill/2 en haut)
// h-pill : hauteur de la pill de boite(), passée explicitement pour éviter un context imbriqué
#let boiteSansEtiquette(h-pill, inner-h: auto, contenu) = [
  #v(h-pill / 2)
  #block(
    stroke: 1pt + bordBleu,
    radius: 7pt,
    width: 100%,
    height: inner-h,
    inset: (x: 10pt, top: 10pt, bottom: 14pt),
  )[#contenu]
]

// Ligne dt + dd inline (label gris bold, valeur medium)
#let dl(libelle, valeur) = block(above: 0pt, below: 8pt)[
  #set text(size: 8pt)
  #text(fill: grisTexte, weight: "bold")[#libelle]#h(0.25em)#text(weight: "medium")[#valeur]
]

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

  let w-left  = (size.width - gutter) * 3 / 4
  let w-right = (size.width - gutter) * 1 / 4

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
    #v(8pt)
    #image("assets/" + donnees.niveauSecurite + ".svg", width: 65pt)
    #v(8pt)
    #if donnees.niveauSuperieurAuxRecommandations [
      #cartoucheBesoinsSuperieurs(donnees.labelNiveauRecommande)
    ] else [
      #cartoucheBesoinsIdentifies
    ]
  ]

  // Mesure les deux boîtes à hauteur auto pour trouver la plus grande
  let h-resume  = measure(boite("Résumé", resume-contenu), width: w-left).height
  let h-besoins = measure(boiteSansEtiquette(h-pill, besoins-contenu), width: w-right).height

  // inner-h = hauteur du bloc bordé sans l'excroissance pill/spacer (h-pill/2)
  let inner-h = calc.max(h-resume, h-besoins) - h-pill / 2

  grid(
    columns: (3fr, 1fr),
    column-gutter: gutter,
    align: top,
    boite("Résumé", inner-h: inner-h, resume-contenu),
    boiteSansEtiquette(h-pill, inner-h: inner-h, besoins-contenu),
  )
})