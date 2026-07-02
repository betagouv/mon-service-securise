#import "commun.typ": *

#let donnees = json(bytes(sys.inputs.payload))
#let donneesRisques = donnees.donneesRisques

#let jointsAvecEllipse(liste) = if liste == none {
  ""
} else if liste.len() > 7 {
  liste.slice(0, 6).join(", ") + "…"
} else {
  liste.join(", ")
}

#let couleurCellule(classe) = if classe == none {
  grisClair
} else {
  couleursNiveauRisque.at(classe, default: grisClair)
}

#let celluleMatrice(x, y) = {
  let classe = donneesRisques.matriceNiveauxRisque.at(x + 1).at(4 - y)
  let contenu = jointsAvecEllipse(donneesRisques.grilleRisques.at(y).at(x))
  box(
    width: 100%,
    height: 100%,
    fill: couleurCellule(classe),
    align(center + horizon)[#text(size: 8pt, weight: "bold", fill: white)[#contenu]],
  )
}

#let largeurCellule = 75pt
#let largeurColLabel = 18pt
#let ecartLabelCellules = 6pt
#let espaceAxeCellules = 8pt
#let espaceDepassementAxe = 12pt
#let largeurZoneCellules = espaceAxeCellules + largeurCellule * 4 + 3pt * 3 + espaceDepassementAxe

#let ligneChiffresGravite = range(4).map(y => align(right + horizon)[#text(size: 8pt, fill: grisTexte)[#(4 - y)]])
#let ligneChiffresVraisemblance = range(4).map(x => align(center + horizon)[#text(size: 8pt, fill: grisTexte)[#(x + 1)]])

#let chevronHaut = box(width: 6pt, height: 3.5pt)[
  #place(top + left, dx: -8pt, dy: 3pt-espaceDepassementAxe)[#line(start: (0pt, 3.5pt), end: (3pt, 0pt), stroke: 0.75pt + grisAxe)]
  #place(top + left, dx: -5pt, dy: 3pt-espaceDepassementAxe)[#line(start: (0pt, 0pt), end: (3pt, 3.5pt), stroke: 0.75pt + grisAxe)]
]
#let chevronDroite = box(width: 3.5pt, height: 6pt)[
  #place(top + left, dx: 1pt+espaceDepassementAxe, dy: 8pt)[#line(start: (0pt, 0pt), end: (3.5pt, 3pt), stroke: 0.75pt + grisAxe)]
  #place(top + left, dx: 1pt+espaceDepassementAxe, dy: 11pt)[#line(start: (3.5pt, 0pt), end: (0pt, 3pt), stroke: 0.75pt + grisAxe)]
]

#let hauteurZoneCellules = espaceAxeCellules + 32pt * 4 + 3pt * 3 + espaceDepassementAxe

#let zoneCellules = block(
  width: largeurZoneCellules,
  height: hauteurZoneCellules,
  stroke: (left: 0.75pt + grisAxe, bottom: 0.75pt + grisAxe),
  inset: (
    left: espaceAxeCellules,
    bottom: espaceAxeCellules,
    top: espaceDepassementAxe,
    right: espaceDepassementAxe,
  ),
)[
  #place(top + left, dx: -3pt, dy: -3.5pt)[#chevronHaut]
  #place(bottom + right, dx: 0pt, dy: 3pt)[#chevronDroite]
  #grid(
    columns: (largeurCellule,) * 4,
    rows: (32pt,) * 4,
    column-gutter: 3pt,
    row-gutter: 3pt,
    ..range(4).map(y => range(4).map(x => celluleMatrice(x, y))).flatten(),
  )
]

#let matrice = stack(
  dir: ttb,
  grid(
    columns: (largeurColLabel, largeurZoneCellules),
    column-gutter: ecartLabelCellules,
    align(right)[#text(size: 7pt, fill: grisTexte)[Gravité]],
    [],
  ),
  v(-10pt),
  grid(
    columns: (largeurColLabel, largeurZoneCellules),
    column-gutter: ecartLabelCellules,
    align: top,
    pad(top: espaceDepassementAxe)[
      #grid(
        columns: (1fr,),
        rows: (32pt,) * 4,
        row-gutter: 3pt,
        ..ligneChiffresGravite,
      )
    ],
    zoneCellules,
  ),
  v(7pt),
  grid(
    columns: (largeurColLabel, largeurZoneCellules),
    column-gutter: ecartLabelCellules,
    [],
    pad(left: espaceAxeCellules)[
      #grid(
        columns: (largeurCellule,) * 4 + (auto,),
        column-gutter: (3pt, 3pt, 3pt, -2pt),
        align: horizon,
        ..ligneChiffresVraisemblance,
        align(left + horizon)[#text(size: 8pt, fill: grisTexte)[Vraisemblance]],
      )
    ],
  ),
)

#let legende = stack(
  dir: ltr,
  spacing: 16pt,
  ..donneesRisques.legendeNiveauxRisque.map(niveau => grid(
    columns: (12pt, auto),
    column-gutter: 4pt,
    align: horizon,
    box(width: 12pt, height: 12pt, fill: couleurCellule(niveau.id), radius: 2pt),
    [#text(weight: "bold")[#niveau.libelle :] #niveau.description],
  )),
)



#let pastilleIdentifiant(id, niveau) = {
  let couleur = couleursPastilleRisque.at(niveau, default: rgb("#667892"))
  box(
    stroke: 1.5pt + couleur,
    radius: 20pt,
    inset: (x: 8pt, y: 5pt),
    fill: white,
  )[#text(size: 10pt, weight: "bold", fill: couleur)[#id]]
}

#let blocRisque(risque) = grid(
  columns: (56pt, 1fr),
  column-gutter: 10pt,
  align: top,
  pastilleIdentifiant(risque.identifiantNumerique, risque.niveauRisque),
  [
    #text(weight: "bold")[#risque.intitule]
    #v(8pt)
    #risque.definition
    #let commentaire = risque.at("commentaire", default: none)
    #if commentaire != none and commentaire != "" [
      #v(12pt)
      #text(fill: rgb("#64748b"))[#text(weight: "bold")[Commentaire :] #commentaire]
    ]
  ],
    v(12pt),
)

#boite("Cartographie des risques")[
  #text(size: 9pt, fill: gris)[Évalué au départ]
  #v(11pt)
  #pad(left: 8pt)[#matrice]
  #v(15pt)
  #legende
]

#v(16pt)

#boite("Risques")[
  #for (i, risque) in donneesRisques.risques.enumerate() {
    blocRisque(risque)
  }
]
