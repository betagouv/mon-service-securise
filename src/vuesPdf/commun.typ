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