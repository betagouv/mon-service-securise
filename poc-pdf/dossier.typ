// ============================================================
//  DOSSIER DE DÉCISION D'HOMOLOGATION — MonServiceSécurisé
//  Template Typst data-driven (DSFR / Marianne)
// ============================================================
#let data = json(bytes(sys.inputs.payload))

// ---------- Couleurs DSFR ----------
#let bleu     = rgb("#000091")
#let rouge    = rgb("#E1000F")
#let encre    = rgb("#161616")
#let gris     = rgb("#666666")
#let grisBord = rgb("#dddddd")

// ---------- Réglages page + pied de page ----------
#set text(font: "Marianne", size: 9pt, fill: encre, lang: "fr")
#set par(spacing: 0.65em, leading: 0.6em)
#set page(
  paper: "a4",
  margin: (x: 1.5cm, top: 1.2cm, bottom: 1.4cm),
  footer: context {
    set text(size: 7pt, fill: gris)
    line(length: 100%, stroke: 0.5pt + grisBord)
    v(1pt)
    grid(columns: (1fr, auto),
      [#text(fill: bleu, weight: "bold")[MonServiceSécurisé] - #data.service],
      align(right)[Page #counter(page).get().first() / #counter(page).final().first()],
    )
  },
)

// ============================================================
//  COMPOSANTS RÉUTILISABLES
// ============================================================

// ---- Drapeau tricolore ----
#let drapeau(h: 0.9cm) = {
  let w = h * 0.62
  stack(dir: ltr,
    rect(width: w/3, height: h, fill: bleu,  stroke: none),
    rect(width: w/3, height: h, fill: white, stroke: none),
    rect(width: w/3, height: h, fill: rouge, stroke: none),
  )
}

// ---- Bloc-marque RÉPUBLIQUE FRANÇAISE (reconstruit, sans asset) ----
#let blocMarque = grid(
  columns: (auto, auto), column-gutter: 7pt, align: horizon,
  drapeau(),
  {
    set text(size: 8.5pt)
    text(weight: "bold")[RÉPUBLIQUE]; linebreak()
    text(weight: "bold")[FRANÇAISE]
    v(2pt)
    set text(size: 6pt, style: "italic", fill: gris)
    [Liberté]; linebreak(); [Égalité]; linebreak(); [Fraternité]
  },
)

// ---- Logo MSS + badge ANSSI  (EMPLACEMENT : remplacer par image("assets/logo-mss.svg")) ----
#let badgeAnssi = box(circle(radius: 14pt, stroke: 0.8pt + bleu, fill: bleu.lighten(90%),
  align(center + horizon, text(size: 5.5pt, weight: "bold", fill: bleu)[ANSSI])))
#let logoMss = grid(
  columns: (auto, auto), column-gutter: 8pt, align: horizon,
  align(right)[
    #text(size: 11pt, fill: bleu, weight: "bold")[MonService] \
    #text(size: 11pt, fill: rouge, weight: "bold")[Sécurisé] \
    #text(size: 5.5pt, fill: gris)[Innovation ANSSI]
  ],
  badgeAnssi,
)

// ---- Boîte simple à bordure arrondie ----
#let boite(body) = block(width: 100%, stroke: 0.75pt + grisBord, radius: 5pt, inset: 13pt, body)

// ---- Fieldset : légende posée SUR la bordure supérieure ----
#let fieldset(titre, body) = block(width: 100%, {
  block(width: 100%, stroke: 0.75pt + grisBord, radius: 5pt,
        inset: (top: 17pt, bottom: 13pt, x: 13pt), body)
  place(top + left, dx: 12pt, dy: -6.5pt,
    box(fill: white, inset: (x: 5pt),
        text(weight: "bold", size: 9pt, fill: encre, titre)))
})

// ---- Badge numéroté (Considérant) ----
#let badgeNum(n) = box(baseline: 25%, fill: rgb("#eeeeee"), radius: 3pt,
  inset: (x: 5pt, y: 2.5pt), text(weight: "bold", size: 8.5pt, fill: rgb("#3a3a3a"), str(n)))

#let considItem(n, txt) = grid(columns: (auto, 1fr), column-gutter: 9pt, align: (left, top),
  badgeNum(n), txt)

// ---- Case à cocher ----
#let caseCocher(label) = box(baseline: 18%)[#box(width: 11pt, height: 11pt,
  stroke: 0.8pt + rgb("#7b7b7b"), radius: 2pt)#h(4pt)#label]

// ---- Sceau RGS / RGPD (reconstruit) ----
#let sceau(label) = box(circle(radius: 15pt, stroke: 1pt + rgb("#9b9b9b"), fill: white,
  align(center + horizon, text(size: 6.5pt, weight: "bold", fill: rgb("#5a5a5a"), label))))

// ---- Bandeau de section (pages 2 & 3) ----
#let sectionBand(titre, sous) = grid(
  columns: (auto, 1fr), column-gutter: 9pt, align: (top, top),
  box(image("assets/folder.svg", width: 19pt)),
  {
    text(weight: "bold", size: 10.5pt)[#titre]
    v(2pt)
    text(size: 8pt, fill: gris)[#sous]
  },
)

// ============================================================
//  PAGE 1 — DÉCISION D'HOMOLOGATION
// ============================================================
#grid(columns: (1fr, auto), align: (left + horizon, right + horizon), blocMarque, logoMss)
#v(12pt)

#text(size: 12.5pt, weight: "bold")[DÉCISION D'HOMOLOGATION DE SÉCURITÉ]
#v(2pt)
#line(length: 24pt, stroke: 2pt + encre)
#v(7pt)
#text[#data.organisation]
#v(1pt)
#text(fill: bleu, weight: "medium", size: 11pt)[#data.service]
#v(13pt)

#boite[
  #text(weight: "bold", size: 11pt)[Considérant]
  #v(8pt)
  #considItem(1)[La synthèse de la sécurité du service, élaborée à partir des déclarations de l'équipe.]
  #v(6pt)
  #considItem(2)[L'ensemble des documents joints à la synthèse de sécurité, présentés en amont de cette décision.]
  #v(6pt)
  #considItem(3)[Le ou les avis émis par l'équipe ayant participé à préparer la présente décision.]
  #v(13pt)

  #text(weight: "bold")[L'autorité d'homologation, ]#text(fill: bleu, weight: "bold")[#data.autorite.nom, #data.autorite.fonction,]#text(weight: "bold")[ approuve l'homologation de la sécurité du service :]
  #v(10pt)

  #text(weight: "bold")[Pour une durée de ]#text(fill: gris)[(veuillez cocher une case) :]#h(12pt)#caseCocher[6 mois]#h(14pt)#caseCocher[1 an]#h(14pt)#caseCocher[2 ans]#h(14pt)#caseCocher[3 ans]
  #v(12pt)

  #block(width: 100%, stroke: 0.75pt + grisBord, radius: 5pt, inset: 11pt, height: 3.8cm)[
    #text(weight: "bold")[Commentaire ]#text(fill: gris)[(veuillez compléter de manière manuscrite) :]
  ]
  #v(12pt)

  #text(weight: "bold")[Date ]#text(fill: gris)[(veuillez compléter de manière manuscrite) :]
  #v(7pt)
  #text(weight: "bold")[Signature ]#text(fill: gris)[(veuillez signer précédé de la mention "Lu et approuvé") :]
  #v(1.3cm)

  #line(length: 100%, stroke: 0.5pt + grisBord)
  #v(9pt)
  #grid(columns: (auto, 1fr), column-gutter: 12pt, align: (left + horizon, left + horizon),
    stack(dir: ltr, spacing: 7pt, sceau("RGS"), sceau("RGPD")),
    text(size: 7.5pt, weight: "bold")[L'homologation de sécurité d'un service public numérique est une obligation du référentiel général de sécurité et du décret n°2022-513 du 8 avril 2022 relatif à la sécurité numérique du système d'information et de communication de l'État et de ses établissements publics. L'homologation de sécurité participe également à la mise en conformité avec l'article 32 du règlement européen de la protection des données à caractère personnel relatif à la sécurité des données],
  )
]
#v(8pt)
#text(size: 7.5pt, fill: gris)[MonServiceSécurisé et l'ANSSI ne peuvent en aucun cas être tenus responsables d'incidents de sécurité susceptibles d'affecter le service numérique et des conséquences qui pourraient en découler.]

// ============================================================
//  PAGE 2 — AVIS SUR LA SÉCURITÉ
// ============================================================
#pagebreak()
#sectionBand("AVIS SUR LA SÉCURITÉ DU SERVICE", "Le ou les avis de l'équipe participant à la sécurité du service pour aider à la décision d'homologation de sécurité.")
#v(14pt)

#fieldset("Recommandation ANSSI")[
  #let lignes = data.recommandationAnssi.titre.split("\n")
  #for (j, l) in lignes.enumerate() {
    text(weight: "bold", fill: bleu)[#l]
    if j < lignes.len() - 1 { linebreak() }
  }
  #v(8pt)
  #text(fill: bleu)[#data.recommandationAnssi.corps]
]
#v(12pt)

#for (i, a) in data.avis.enumerate() {
  fieldset("Avis " + str(i + 1))[
    #grid(columns: (auto, 1fr), column-gutter: 8pt, align: (left + horizon, left + horizon),
      box(image("assets/account.svg", width: 15pt)),
      text(weight: "bold")[#a.avis])
    #v(7pt)
    #text(weight: "bold", fill: bleu)[#a.statut]
    #v(3pt)
    #text(fill: gris)[Commentaire : ]#text(fill: encre)[#a.commentaire]
  ]
  v(12pt)
}

// ============================================================
//  PAGE 3 — DOCUMENTS JOINTS
// ============================================================
#pagebreak()
#sectionBand("DOCUMENTS JOINTS", "La liste des documents joints pour aider à la décision d'homologation de sécurité.")
#v(14pt)

#boite[
  #for (k, d) in data.documents.enumerate() {
    grid(columns: (auto, 1fr), column-gutter: 9pt, align: (left + horizon, left + horizon),
      text(fill: encre)[•], text[#d])
    if k < data.documents.len() - 1 { v(4pt) }
  }
]
