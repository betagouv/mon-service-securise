#import "commun.typ": *

#let donnees = json(bytes(sys.inputs.payload))
#let donneesMesures = donnees.donneesMesures

#let badgeAncienReferentiel = image("assets/badge_ancien_referentiel.svg", height: 12pt)

#let enteteMesures() = entete(
  "assets/icone_dossier.png",
  "Mesures de sécurité détaillées",
  [Toutes les mesures indispensables #box(baseline: 20%, image("assets/icone_etoile.png", height: 7pt)), recommandées
  et créées sont classées selon leur statut de mise en œuvre et par catégorie.],
  badge: if donnees.donneesDescription.versionService == "v1" { badgeAncienReferentiel },
)

#let cartouche(label) = box(
  fill: rgb("#e9f1ff"),
  radius: 4pt,
  inset: (x: 9pt, y: 5pt),
)[#text(fill: rgb("#2b4d75"), weight: "bold", size: 8pt, tracking: .5pt)[#upper(label)]]

#let puceEtoile = box(inset: (top: -2pt, left: -1.8pt), image("assets/icone_etoile.png", height: 10pt))
#let puceRonde = box(inset: (top: 1pt), circle(radius: 2pt, fill: rgb("#0F7AC7")))

#let contenuMesure(mesure) = {
  let corps = [#mesure.description]
  let modalites = mesure.at("modalites", default: none)
  if modalites != none and modalites != "" {
    corps += [#linebreak() #text(size: 7.5pt, fill: rgb("#858fa4"))[#modalites]]
  }
  corps
}

#let listeMesures(mesures) = grid(
  columns: (auto, 1fr),
  column-gutter: 8pt,
  row-gutter: 11pt,
  align: top,
  ..mesures
    .map(m => (
      if m.at("indispensable", default: false) { puceEtoile } else { puceRonde },
      contenuMesure(m),
    ))
    .flatten(),
)

#let boitePourUnStatut(statut) = boite(donneesMesures.statuts.at(statut))[
  #let parCategorie = donneesMesures.mesuresParStatut.at(statut)
  #for (i, categorie) in parCategorie.keys().enumerate() {
    if i > 0 { v(14pt) }
    cartouche(donneesMesures.categories.at(categorie))
    v(8pt)
    listeMesures(parCategorie.at(categorie))
  }
]

#let boiteNonRenseignees() = boite("Non renseignées")[
  #let nb = donneesMesures.nbMesuresARemplirToutesCategories
  Il reste #nb mesure#(if nb > 1 { "s" }) proposées
  par #donneesMesures.referentielsConcernesMesuresNonRenseignees à compléter.
]

#let unePageDeMesures(contenuBoite) = [
  #enteteMesures()
  #v(18pt)
  #contenuBoite
]

// Une page par statut, puis les non renseignées
#let pagesMesures = ()
#for statut in donneesMesures.statutsAvecFaitALaFin {
  if donneesMesures.mesuresParStatut.at(statut).keys().len() > 0 {
    pagesMesures.push(unePageDeMesures(boitePourUnStatut(statut)))
  }
}
#if donneesMesures.nbMesuresARemplirToutesCategories > 0 {
  pagesMesures.push(unePageDeMesures(boiteNonRenseignees()))
}

#for (index, page) in pagesMesures.enumerate() {
  if index > 0 { pagebreak() }
  page
}
