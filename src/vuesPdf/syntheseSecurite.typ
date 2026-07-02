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

#v(20pt)

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

  v(gutter)

  // ── Mesures de sécurité ──────────────────────────────────────────────────
  let rCell = 8pt
  let gapCells = 2pt

  let mesuresRestantesBox(stats) = box(
    fill: white,
    radius: 4pt,
    inset: (x: 8pt, y: 7pt),
  )[
    #set text(fill: grisNeutre, size: 8pt, weight: "bold")
    #set par(leading: 0.45em)
    #align(left)[
      Il reste
      #linebreak()
      #text(fill: bleuVif)[#stats.restant #if stats.restant <= 1 [mesure] else [mesures]]
      #linebreak()à mettre en œuvre
    ]
  ]

  let celluleMesures(titre, avecEtoile, svg-str, stats, rad, inner-h: auto) = block(
    fill: grisFond,
    radius: rad,
    width: 100%,
    height: inner-h,
    inset: (x: 10pt, top: 8pt, bottom: 12pt),
  )[
    #align(center)[
      #grid(
        columns: if avecEtoile { (auto, auto) } else { (auto,) },
        column-gutter: 3pt,
        align: horizon,
        text(fill: bleuFonce, weight: "bold", size: 9pt)[#titre],
        if avecEtoile { image("assets/etoile_orange.svg", height: 9pt) },
      )
    ]
    #v(6pt)
    #align(center)[
      #grid(
        columns: (auto, auto, auto),
        column-gutter: 18pt,
        align: horizon,
        image(bytes(svg-str), format: "svg", width: 90pt),
        image("assets/fleche_bleue.svg", height: 11pt),
        mesuresRestantesBox(stats),
      )
    ]
  ]

  let legendeItem(couleur, label, avecBord: false) = grid(
    columns: (9pt, auto),
    column-gutter: 4pt,
    align: horizon,
    box(
      width: 9pt,
      height: 9pt,
      fill: couleur,
      stroke: if avecBord { 0.5pt + grisBordLeger } else { none },
      radius: 1.5pt,
    ),
    text(size: 7pt)[#label],
  )

  let totalCell = block(
    fill: grisFond,
    radius: (bottom-left: rCell, bottom-right: rCell),
    width: 100%,
    inset: (x: 10pt, y: 7pt),
  )[
    #grid(
      columns: (1fr, auto),
      column-gutter: 20pt,
      align: horizon,
      [
        #set text(size: 7.5pt, fill: grisNeutre)
        *Total :* #donnees.nombreTotalMesuresGenerales
        #if donnees.nombreTotalMesuresGenerales <= 1 [mesure proposée] else [mesures proposées]
        par #donnees.referentielConcernes.
      ],
      grid(
        columns: (auto, auto, auto, auto, auto),
        column-gutter: 8pt,
        align: horizon,
        legendeItem(couleurFaites,  "Faites"),
        legendeItem(couleurEnCours, "Partielles"),
        legendeItem(couleurNonFait, "Non prises en compte"),
        legendeItem(couleurALancer, "À lancer"),
        legendeItem(white, "À remplir", avecBord: true),
      ),
    )
  ]

  // Mesure les deux cellules pour égaliser leur hauteur
  let w-cell = (size.width - gapCells) / 2
  let h-indisp = measure(
    celluleMesures("Indispensables", true, donnees.svgCamembertIndispensables, donnees.mesuresIndispensables, (top-left: rCell)),
    width: w-cell,
  ).height
  let h-reco = measure(
    celluleMesures("Recommandées", false, donnees.svgCamembertRecommandees, donnees.mesuresRecommandees, (top-right: rCell)),
    width: w-cell,
  ).height
  let h-cells = calc.max(h-indisp, h-reco)

  // Barre horizontale : table + fill par index pour éviter le spread de blocks
  let barreCategorie(cat) = {
    let segs = (
      (nb: cat.fait,    c: couleurFaites,  tc: white),
      (nb: cat.enCours, c: couleurEnCours, tc: white),
      (nb: cat.nonFait, c: couleurNonFait, tc: white),
      (nb: cat.aLancer, c: couleurALancer, tc: couleurEnCours),
      (nb: cat.aRemplir, c: white,          tc: bleuFonce),
    ).filter(s => s.nb > 0)
    if segs.len() == 0 { return none }
    box(radius: 3pt, clip: true, width: 100%)[
      #table(
        columns: segs.map(s => s.nb * 1fr),
        rows: (28pt,),
        stroke: none,
        inset: 0pt,
        fill: (col, _) => segs.at(col).c,
        ..segs.map(s => align(center + horizon)[
          #set text(size: 9pt, weight: "bold", fill: s.tc)
          #s.nb
        ])
      )
    ]
  }

  // Contenu d'une case catégorie (titre centré + barre)
  let contenuCategorie(cat) = [
    #align(center)[#text(fill: bleuFonce, weight: "bold", size: 9pt)[#cat.description]]
    #v(6pt)
    #barreCategorie(cat)
    #v(4pt)
  ]

  let totalCellCategorie = block(
    fill: grisFond,
    radius: (bottom-left: rCell, bottom-right: rCell),
    width: 100%,
    inset: (x: 10pt, y: 7pt),
  )[
    #grid(
      columns: (1fr, auto),
        column-gutter: 20pt,
      align: horizon,
      [
        #set text(size: 7.5pt, fill: grisNeutre)
        *Total :* #donnees.nombreTotalMesuresGenerales
        #if donnees.nombreTotalMesuresGenerales <= 1 [mesure proposée] else [mesures proposées]
        par #donnees.referentielConcernes
        #if donnees.nombreMesuresSpecifiques > 0 [
          \+ #donnees.nombreMesuresSpecifiques
          #if donnees.nombreMesuresSpecifiques <= 1 [ajoutée] else [ajoutées] par l'équipe.
        ] else [.]
      ],
      grid(
        columns: (auto, auto, auto, auto, auto),
        column-gutter: 8pt,
        align: horizon,
        legendeItem(couleurFaites,  "Faites"),
        legendeItem(couleurEnCours, "Partielles"),
        legendeItem(couleurNonFait, "Non prises en compte"),
        legendeItem(couleurALancer, "À lancer"),
        legendeItem(white, "À remplir", avecBord: true),
      ),
    )
  ]

  boite("Mesures de sécurité", [
    #text(size: 9pt)[Par niveau de criticité]
    #v(8pt)
    #grid(
      columns: (1fr, 1fr),
      rows: (auto, auto),
      column-gutter: gapCells,
      row-gutter: gapCells,
      celluleMesures(
        "Indispensables", true,
        donnees.svgCamembertIndispensables,
        donnees.mesuresIndispensables,
        (top-left: rCell),
        inner-h: h-cells,
      ),
      celluleMesures(
        "Recommandées", false,
        donnees.svgCamembertRecommandees,
        donnees.mesuresRecommandees,
        (top-right: rCell),
        inner-h: h-cells,
      ),
      grid.cell(colspan: 2)[#totalCell],
    )
    #v(14pt)
    #text(size: 9pt)[Par catégorie]
    #v(8pt)
    // Un seul bloc gris — toutes les catégories sur une ligne
    #grid(
      columns: (1fr,),
      row-gutter: gapCells,
      block(fill: grisFond, width: 100%, radius: (top-left: rCell, top-right: rCell), inset: (x: 10pt, top: 10pt, bottom: 10pt))[
        #grid(
          columns: donnees.categoriesMesures.map(_ => 1fr),
          column-gutter: 10pt,
          ..donnees.categoriesMesures.map(cat => [
            #contenuCategorie(cat)
          ])
        )
      ],
      totalCellCategorie,
    )
  ])

  v(gutter)

  set text(size: 7.5pt, fill: grisNeutre)
  [L'indice cyber est calculé sur la base des informations renseignées par l'équipe concernant les mesures de sécurité proposées par #donnees.referentielConcernes, et à l'exclusion des mesures spécifiques ajoutées. Il fournit une évaluation indicative du niveau de sécurisation du service.]
})