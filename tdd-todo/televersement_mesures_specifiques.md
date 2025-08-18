# La TODO list du téléversement des mesures spécifiques

## TODO

- [x] Le bouton « ajouter une/des mesures » est grisé si l'utilisateur a déjà atteint le nombre limites
- [ ] Le tiroir de téléversement montre, dans les limitations, combien de mesures sont encore ajoutables (idéalement on veut soustraire la varenv et le nombre actuel)
- [ ] Il faut envoyer des data vers Metabase
- [ ] Il faut que l'endpoint de création unitaire de modèle empêche de dépasser la limite du nombre max (qui serait une var env ?)
- [ ] Une notification de nouveauté dans le centre de notifs
- [ ] Pinger Hana pour recettage
- [ ] Activer le feature flag en PROD + supprimer le FF
- [x] Le header de la liste des mesures a un texte à jour (cf Figma)

## DONE

- [x] Une erreur est affichée en cas de « trop de mesures » : les mesures déjà existantes + celles du fichier = dépasse la limite autorisée
  - [x] c'est le dépôt qui passe le nombre limite (déjà calculé) au téléversement
- [x] Sur le rapport, un bouton « Importer » permet de déclencher la création des modèles
- [x] Dans le tableau des mesures, le bouton « ajouter une/des mesures » est à tiroir et permet d'ouvrir le tiroir de téléversement
- [x] Le tiroir de téléversement propose un template de mesures à DL
- [x] Le tiroir de téléversement propose de choisir OU de drap/drop le fichier des mesures
- [x] Le tiroir permet de « Valider » l'envoi du fichier
- [x] Le contenu du fichier est persisté, pour servir de base à l'import ensuite
- [x] Le backend fait des contrôles de surface du fichier uploadé : voir comment ça se traduit sur le front
- [x] On a une 404 si le rapport est démandé mais que rien n'a été téléversé
- [x] Le rapport a un statut global (utilisé par le front)
- [x] Le rapport a un statut global (utilisé par le front)
- [x] Un rapport de téléversement est affiché, basé sur les mesures persistées ci-dessus
  - [x] Le rapport de téléversement des services est réutilisable
  - [x] Le rapport contient les erreurs d'intitulé manquant
  - [x] Le rapport contient les erreurs de catégorie manquante
  - [x] Le rapport contient les erreurs de catégorie inconnue
  - [x] Le rapport contient les erreurs de mesures en double
- [x] Le téléversement est supprimé quand l'utilisateur clique sur "retente"
- [x] Le téléversement est supprimé quand l'utilisateur ferme la modale de rapport
- [x] Une erreur est affichée en cas de « trop de mesures » : les mesures déjà existantes + celles du fichier = dépasse la limite autorisée
