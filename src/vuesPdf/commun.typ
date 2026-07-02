#let bleu        = rgb("#000091")
#let bleuFonce   = rgb("#08416a")
#let bleuMSS     = rgb("#0079d0")
#let encre       = rgb("#161616")
#let gris        = rgb("#666666")
#let grisBord    = rgb("#dddddd")
#let grisTexte   = rgb("#8a8a8a")
#let grisClair   = rgb("#efefef")
#let bordBleu    = rgb("#b5c1d2")
#let orange      = rgb("#faa72c")
#let orangeClair = rgb("#fff2de")
#let vert        = rgb("#4cb963")
#let rouge       = rgb("#e32630")
#let vertFonce   = rgb("#0c8626")
#let rougeClair  = rgb("#ff6584")
#let grisAxe     = rgb("#cbd5e1")

#let couleursNiveauRisque = (
  faible: vert,
  moyen: orange,
  eleve: rouge,
)

#let couleursPastilleRisque = (
  faible: vertFonce,
  moyen: orange,
  eleve: rougeClair,
)

#let vertV2  = rgb("#77b645")
#let orangeV2 = rgb("#fa7a35")
#let rougeV2 = rgb("#e1000f")
#let grisAxeV2 = rgb("#929292")

#let couleursNiveauRisqueV2 = (
  faible: vertV2,
  moyen: orangeV2,
  eleve: rougeV2,
)

#let niveauRisqueV2(gravite, vraisemblance) = {
  let niveau = gravite * vraisemblance
  if niveau <= 4 and vraisemblance < 3 and gravite < 4 {
    "faible"
  } else if niveau >= 8 and vraisemblance > 2 and gravite >= 2 {
    "eleve"
  } else {
    "moyen"
  }
}

#let entete(icone, titre, sousTitre, badge: none) = grid(
  columns: (auto, 1fr),
  column-gutter: 2mm,
  align: horizon,
  image(icone, width: 30pt, height: 30pt),
  stack(
    spacing: if badge == none { 5pt } else { 1pt },
    if badge == none {
      text(size: 9pt, weight: "bold", fill: encre)[#upper(titre)]
    } else {
      grid(
        columns: (auto, auto),
        column-gutter: 5pt,
        align: horizon,
        text(size: 9pt, weight: "bold", fill: encre)[#upper(titre)],
        badge,
      )
    },
    text(size: 6.75pt, weight: "medium", fill: rgb("#5e5e5e"))[#sousTitre],
  ),
)

#let listeAPuces(contenus) = grid(
  columns: (auto, 1fr),
  column-gutter: 8pt,
  row-gutter: 12pt,
  align: top,
  ..contenus
    .map(c => (
      box(inset: (top: 2.5pt), circle(radius: 2pt, fill: rgb("#0F7AC7"))),
      c,
    ))
    .flatten(),
)

#let listePuces(items) = listeAPuces(
  items.map(it => {
    let valeur = if type(it.valeur) == array { it.valeur.join(", ") } else { it.valeur }
    [#text(weight: "bold")[#it.label :] #valeur]
  }),
)

#let listeSimple(items) = listeAPuces(items.map(it => [#it]))

#let dl(libelle, valeur) = block(above: 0pt, below: 8pt)[
  #set text(size: 8pt)
  #text(fill: grisTexte, weight: "bold")[#libelle]#h(0.25em)#text(weight: "medium")[#valeur]
]

#let boite(label, inner-h: auto, fill: none, contenu) = context {
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
      fill: fill,
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

#let enteteMarianneANSSI() = [
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
]

#let titreDocumentAvecServiceEtOrganisation(titre, nomEntite, nomService) = [
  #text(size: 11pt, weight: "bold")[#upper[#titre]]
  #v(3pt)
  #line(length: 8mm, stroke: 0.5pt + black)
  #v(8pt)
  #text(size: 9pt, weight: "medium", fill: gris)[#upper[#nomEntite]]
  #v(2pt)
  #text(size: 10pt, weight: "medium", fill: bleuFonce)[#nomService]
  #v(20pt)
]