# La TODO list du téléversement des mesures spécifiques

## TODO

- [x] Une erreur est affichée en cas de « trop de mesures » : les mesures déjà existantes + celles du fichier = dépasse la limite autorisée
- [ ] Le bouton « ajouter une/des mesures » est grisé si l'utilisateur a déjà atteint le nombre limites
- [ ] Sur le rapport, un bouton « Importer » permet de déclencher la création des modèles
- [ ] Le tiroir de téléversement montre, dans les limitations, combien de mesures sont encore ajoutables (idéalement on veut soustraire la varenv et le nombre actuel)
- [ ] Il faut envoyer des data vers Metabase
- [ ] Il faut que l'endpoint de création unitaire de modèle empêche de dépasser la limite du nombre max (qui serait une var env ?)

## DONE

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
