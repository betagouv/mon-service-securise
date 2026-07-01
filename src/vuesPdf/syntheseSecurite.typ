#let donnees = json(bytes(sys.inputs.payload))

#let bleu       = rgb("#000091")
#let bleuFonce  = rgb("#08416a")
#let encre      = rgb("#161616")
#let gris       = rgb("#666666")
#let grisBord   = rgb("#dddddd")
#let grisTexte  = rgb("#8a8a8a")
#let grisClair  = rgb("#efefef")
#let bordBleu   = rgb("#b5c1d2")

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
#let boite(label, contenu) = context {
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
      inset: (left: 16pt, right: 16pt, top: h / 2 + 6pt, bottom: 10pt),
    )[

  #v(7pt)
    #contenu
    ],
    -(h / 2),
    pad(left: 16pt)[#pill],
  )
}

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

#boite("Résumé")[
  #dl("Type :", donnees.typeService)
  #dl("Données stockées :", donnees.localisationDonnees)
  #dl("Statut :", donnees.statutDeploiement)
  #dl("Présentation :", donnees.at("presentation", default: ""))
]