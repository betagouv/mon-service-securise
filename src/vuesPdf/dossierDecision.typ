#import "commun.typ": *
#import "base.typ": mise-en-page

#let donnees = json(bytes(sys.inputs.payload))

#show: mise-en-page.with(nomService: donnees.nomService)

#let discret = rgb("#5e5e5e")
#let bleuAutorite = rgb("#0c5c98")

#let badgeNumero(n) = box(
  fill: grisClair,
  radius: 2pt,
  width: 18pt,
  height: 18pt,
)[#align(center + horizon)[#text(weight: "bold", size: 9pt)[#n]]]

#let caseACocher = box(
  width: 8pt,
  height: 8pt,
  stroke: 0.75pt + discret,
  radius: 2pt,
  baseline: 1.5pt,
)

#enteteMarianneANSSI()
#titreDocumentAvecServiceEtOrganisation("Décision d'homologation de sécurité", donnees.organisationResponsable, donnees.nomService)

#let considerants = (
  "La synthèse de la sécurité du service, élaborée à partir des déclarations de l'équipe.",
  "L'ensemble des documents joints à la synthèse de sécurité, présentés en amont de cette décision.",
  "Le ou les avis émis par l'équipe ayant participé à préparer la présente décision.",
)

#block(
  stroke: 1pt + bordBleu,
  radius: 4pt,
  inset: 0.5cm,
  width: 100%,
)[
  #text(size: 10.5pt, weight: "bold")[Considérant]
  #v(10pt)
  #for (i, considerant) in considerants.enumerate() {
    block(below: 7.5pt)[
      #grid(
        columns: (18pt, 1fr),
        column-gutter: 8pt,
        align: horizon,
        badgeNumero(i + 1),
        text(weight: "medium")[#considerant],
      )
    ]
  }
  #v(24pt - 7.5pt)
  #text(size: 10.5pt, weight: "bold")[
    L'autorité d'homologation, #text(fill: bleuAutorite)[#donnees.nomPrenomAutorite, #donnees.fonctionAutorite,] approuve l'homologation de la sécurité du service :
  ]
  #v(12pt)
  #grid(
    columns: (auto, 7cm),
    column-gutter: 0.5cm,
    align: horizon,
    [#text(weight: "bold")[Pour une durée de]#text(fill: discret)[ (veuillez cocher une case) ]#text(weight: "bold")[:]],
    grid(
      columns: (1fr, 1fr, 1fr, 1fr),
      align: (left, center, center, right),
      [#caseACocher#h(4pt)#text(weight: "bold")[6 mois]],
      [#caseACocher#h(4pt)#text(weight: "bold")[1 an]],
      [#caseACocher#h(4pt)#text(weight: "bold")[2 ans]],
      [#caseACocher#h(4pt)#text(weight: "bold")[3 ans]],
    ),
  )
  #v(16pt)
  #block(
    stroke: 1pt + bordBleu,
    radius: 4pt,
    inset: 2mm,
    width: 100%,
    height: 6cm,
  )[#text(weight: "bold")[Commentaire]#text(fill: discret)[ (veuillez compléter de manière manuscrite) ]#text(weight: "bold")[:]]
  #v(16pt)
  #block(
    stroke: 1pt + bordBleu,
    radius: 4pt,
    inset: 2mm,
    width: 100%,
    height: 2.5cm,
  )[
    #text(weight: "bold")[Date]#text(fill: discret)[ (veuillez compléter de manière manuscrite) ]#text(weight: "bold")[:]
    #v(8pt)
    #text(weight: "bold")[Signature]#text(fill: discret)[ (veuillez signer précédé de la mention "Lu et approuvé") ]#text(weight: "bold")[:]
  ]
  #v(16pt)
  #grid(
    columns: (auto, 1fr),
    column-gutter: 16pt,
    align: horizon,
    grid(
      columns: 2,
      column-gutter: 8pt,
      align: horizon,
      image("assets/tampon_rgs.svg", width: 34.5pt),
      image("assets/tampon_rgpd.svg", width: 34.5pt),
    ),
    text(weight: "bold", size: 6.75pt)[
      L'homologation de sécurité d'un service public numérique est une obligation du référentiel général de sécurité et du décret n°2022-513 du 8 avril 2022 relatif à la sécurité numérique du système d'information et de communication de l'Etat et de ses établissements publics. L'homologation de sécurité participe également à la mise en conformité avec l'article 32 du règlement européen de la protection des données à caractère personnel relatif à la sécurité des données
    ],
  )
  #v(16pt)
  #text(size: 6.75pt, weight: "medium", fill: discret)[
    MonServiceSécurisé et l'ANSSI ne peuvent en aucun cas être tenus responsables d'incidents de sécurité susceptibles d'affecter le service numérique et des conséquences qui pourraient en découler.
  ]
]