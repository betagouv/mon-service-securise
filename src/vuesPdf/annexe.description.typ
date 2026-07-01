#import "commun.typ": *

#let donnees = json(bytes(sys.inputs.payload))

#entete(
  "assets/icone_dossier.png",
  "Description détaillée",
  "Toutes les caractéristiques du service numérique et ses besoins de sécurité.",
)

#let versionService = donnees.donneesDescription.versionService

#let boitesDescriptionDetaillee = if versionService == "v1" {
  (
    (titre: "Fonctionnalités offertes", liste: donnees.donneesDescription.fonctionnalites, rendu: listeSimple),
    (titre: "Données stockées", liste: donnees.donneesDescription.donneesStockees, rendu: listeSimple),
    (
      titre: "Durée maximale acceptable de dysfonctionnement grave du service",
      liste: (donnees.donneesDescription.dureeDysfonctionnementMaximumAcceptable,),
      rendu: listeSimple,
    ),
  )
} else {
  (
    (
      titre: "Informations génériques sur le projet",
      liste: donnees.donneesDescription.informationsGeneriques,
      rendu: listePuces,
    ),
    (
      titre: "Caractéristique du projet",
      liste: donnees.donneesDescription.caracteristiques,
      rendu: listePuces,
    ),
    (
      titre: "Évaluation de la criticité et de l'exposition du projet",
      liste: donnees.donneesDescription.criticiteExposition,
      rendu: listePuces,
    ),
  )
}

#v(18pt)
#{
  boitesDescriptionDetaillee
    .filter(b => b.liste.len() > 0)
    .map(b => boite(b.titre, (b.rendu)(b.liste)))
    .join(v(16pt))
}
