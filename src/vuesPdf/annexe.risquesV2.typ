#import "commun.typ": *

#let donnees = json(bytes(sys.inputs.payload))
#let donneesRisques = donnees.donneesRisques

#let largeurCelluleV2 = 61pt
#let hauteurCelluleV2 = 35pt
#let largeurColLabelV2 = 22pt
#let margeVerticaleCelluleV2 = 4pt
#let margeGaucheColonneV2 = 4pt

#let celluleV2(risques, gravite, vraisemblance, avecMargeGauche: false) = {
  let risquesCellule = risques.filter(r => r.gravite == gravite and r.vraisemblance == vraisemblance)
  let idRisques = risquesCellule.map(r => r.id).join(", ")
  let niveau = niveauRisqueV2(gravite, vraisemblance)
  let largeur = if avecMargeGauche { largeurCelluleV2 - margeGaucheColonneV2 } else { largeurCelluleV2 }
  let contenu = box(
    width: largeur,
    height: hauteurCelluleV2 - margeVerticaleCelluleV2,
    fill: couleursNiveauRisqueV2.at(niveau),
    align(center + horizon)[#text(size: 7pt, weight: "bold", fill: white)[#idRisques]],
  )
  if avecMargeGauche { align(right, contenu) } else { contenu }
}

#let traitPointille = (paint: grisAxeV2, thickness: 0.5pt, dash: "dashed")
#let traitPlein = 1pt + grisAxeV2
#let largeurZoneCellulesV2 = largeurCelluleV2 * 4 + 3pt * 3

#let matriceV2(risques) = {
  let ligneGravite = grid(
    columns: (largeurColLabelV2, largeurZoneCellulesV2),
    align(right)[#pad(right: 4pt)[#text(size: 9pt, fill: grisTexte)[Gravité]]],
    [],
  )
  let grilleEtAxes = grid(
    columns: (largeurColLabelV2,) + (largeurCelluleV2,) * 4 + (2pt, auto),
    column-gutter: (3pt, 3pt, 3pt, 3pt, 0pt, 4pt),
    rows: (hauteurCelluleV2,) * 4,
    row-gutter: 0pt,
    align: horizon,
    grid.vline(x: 1, start: 0, end: 4, stroke: traitPlein),
    grid.hline(y: 0, start: 1, end: 6, stroke: traitPointille),
    grid.hline(y: 1, start: 1, end: 6, stroke: traitPointille),
    grid.hline(y: 2, start: 1, end: 6, stroke: traitPointille),
    grid.hline(y: 3, start: 1, end: 6, stroke: traitPointille),
    grid.hline(y: 4, start: 1, end: 6, stroke: traitPlein),
    ..range(4)
      .map(indexLigne => {
        let gravite = 4 - indexLigne
        (
          align(right + horizon)[#pad(right: 4pt)[#text(size: 9pt, fill: grisTexte)[#gravite]]],
          ..range(4).map(indexColonne => celluleV2(
            risques,
            gravite,
            indexColonne + 1,
            avecMargeGauche: indexColonne == 0,
          )),
          [],
          [],
        )
      })
      .flatten(),
    [],
    ..range(4).map(indexColonne => align(center)[#pad(top: -12pt)[#text(size: 9pt, fill: grisTexte)[#(indexColonne + 1)]]]),
    [],
    align(left + horizon)[#pad(top: -12pt, left: -26pt)[#text(size: 9pt, fill: grisTexte)[Vraisemblance]]],
  )
  stack(dir: ttb, spacing: -2pt, ligneGravite, grilleEtAxes)
}

#let sectionMatriceV2(titre, risques) = stack(
  spacing: 6pt,
  text(size: 10pt, weight: "medium", fill: encre)[#titre],
  v(12pt),
  pad(left: 14pt, top: 5pt)[#matriceV2(risques)],
)

#let legendeComptesRisquesV2 = {
  let nbRisques = donneesRisques.risques.risques.len()
  let nbSpecifiques = donneesRisques.risques.risquesSpecifiques.len()
  [
    #text(size: 8pt, fill: gris)[#nbRisques risques proposés par l'ANSSI]
    #if nbSpecifiques > 0 [
      #v(2pt)
      #text(size: 8pt, fill: gris)[+#nbSpecifiques ajouté#(if nbSpecifiques > 1 { "s" }) par l'équipe.]
    ]
  ]
}

#let legendeCouleursV2 = stack(
  spacing: 8pt,
  ..(
    (id: "faible", libelle: "Faible", description: "Acceptable en l'état"),
    (id: "moyen", libelle: "Moyen", description: "Tolérable sous contrôle"),
    (id: "eleve", libelle: "Élevé", description: "Inacceptable"),
  ).map(niveau => grid(
    columns: (11pt, auto),
    column-gutter: 6pt,
    align: horizon,
    box(width: 11pt, height: 11pt, fill: couleursNiveauRisqueV2.at(niveau.id)),
    [#text(size: 8pt)[#text(weight: "bold")[#niveau.libelle :] #niveau.description]],
  )),
)

#let pastilleIdentifiantV2(id, niveau) = {
  let couleur = couleursPastilleRisque.at(niveau, default: rgb("#667892"))
  box(
    stroke: 1.5pt + couleur,
    radius: 20pt,
    inset: (x: 8pt, y: 5pt),
    fill: white,
  )[#text(size: 10pt, weight: "bold", fill: couleur)[#id]]
}

#let blocRisqueV2(risque, idAffiche) = {
  let niveau = niveauRisqueV2(risque.gravite, risque.vraisemblance)
  grid(
    columns: (56pt, 1fr),
    column-gutter: 10pt,
    align: top,
    pastilleIdentifiantV2(idAffiche, niveau),
    [
      #text(weight: "bold")[#risque.intitule]
      #v(8pt)
      #let description = risque.at("description", default: "")
      #if description != "" [
        #risque.description
        #v(12pt)
      ]
      #let commentaire = risque.at("commentaire", default: "")
      #if commentaire != "" [
        #text(fill: rgb("#64748b"))[#text(weight: "bold")[Commentaire :] #commentaire]
      ]
    ],
    v(12pt),
  )
}

#boite("Cartographie des risques")[
  #grid(
    columns: (auto, 11pt, 1fr),
    align: top,
    stroke: (x, y) => if x == 1 { (left: 1pt + bordBleu) } else { none },
    inset: (right: 10pt),
    stack(
      spacing: 12pt,
      sectionMatriceV2("Risques bruts", donneesRisques.risques.risquesBruts),
      sectionMatriceV2("Risques actuels", donneesRisques.risques.risques),
      sectionMatriceV2("Risques résiduels cibles", donneesRisques.risques.risquesCibles),
    ),
    [],
    stack(
      spacing: 16pt,
      legendeComptesRisquesV2,
      legendeCouleursV2,
    ),
  )
]

#pagebreak()

#boite("Risques")[
  #for risque in donneesRisques.risques.risques {
    blocRisqueV2(risque, risque.id)
  }
  #for risque in donneesRisques.risques.risquesSpecifiques {
    blocRisqueV2(risque, risque.at("identifiantNumerique", default: "RS"))
  }
]
