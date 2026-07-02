#let bleu        = rgb("#000091")
#let bleuFonce   = rgb("#08416a")
#let bleuMSS     = rgb("#0079d0")
#let bleuVif     = rgb("#0f7ac7")

#let couleurFaites   = rgb("#173B62")
#let couleurEnCours  = rgb("#0A498C")
#let couleurNonFait  = rgb("#75A1E8")
#let couleurALancer  = rgb("#D0E0F6")

#let encre        = rgb("#161616")
#let gris         = rgb("#666666")
#let grisNeutre   = rgb("#5e5e5e")
#let grisBord     = rgb("#dddddd")
#let grisBordLeger= rgb("#bbbbbb")
#let grisTexte    = rgb("#8a8a8a")
#let grisClair    = rgb("#efefef")
#let grisFond     = rgb("#f0f0f0")
#let bordBleu     = rgb("#b5c1d2")
#let orange       = rgb("#faa72c")
#let orangeClair  = rgb("#fff2de")

#let dl(libelle, valeur) = block(above: 0pt, below: 8pt)[
  #set text(size: 8pt)
  #text(fill: grisTexte, weight: "bold")[#libelle]#h(0.25em)#text(weight: "medium")[#valeur]
]

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

// Boite avec un médaillon (contenu arbitraire) centré sur la bordure supérieure.
// Le médaillon doit avoir son propre fond pour couvrir la bordure derrière lui.
#let boiteAvecMedaillon(medaillon, inner-h: auto, contenu) = context {
  let h = measure(medaillon).height
  stack(
    dir: btt,
    block(
      stroke: 1pt + bordBleu,
      radius: 7pt,
      width: 100%,
      height: inner-h,
      inset: (x: 10pt, top: h / 2 + 6pt, bottom: 10pt),
    )[#v(7pt) #contenu],
    -(h / 2),
    align(center)[#medaillon],
  )
}
