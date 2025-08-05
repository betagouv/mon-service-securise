# La TODO list du téléversement des mesures spécifiques

- [x] Dans le tableau des mesures, le bouton « ajouter une/des mesures » est à tiroir et permet d'ouvrir le tiroir de téléversement
- [x] Le tiroir de téléversement propose un template de mesures à DL
- [x] Le tiroir de téléversement propose de choisir OU de drap/drop le fichier des mesures
- [x] Le tiroir permet de « Valider » l'envoi du fichier
- [ ] Une erreur est affichée en cas de « trop de mesures » : les mesures déjà existantes + celles du fichier = dépasse la limite autorisée
- [ ] Les mesures du fichier sont persistées, pour servir de base à l'import ensuite
- [ ] Le backend fait des contrôles de surface du fichier uploadé : voir comment ça se traduit sur le front
- [ ] Le bouton « ajouter une/des mesures » est grisé si l'utilisateur a déjà atteint le nombre limites
- [ ] Un rapport de téléversement est affiché, basé sur les mesures persistées ci-dessus
- [ ] Sur le rapport, un bouton « Importer » permet de déclencher la création des modèles
- [ ] Le tiroir de téléversement montre, dans les limitations, combien de mesures sont encore ajoutables (idéalement on veut soustraire la varenv et le nombre actuel)

- [ ] Il faut que l'endpoint de création unitaire de modèle empêche de dépasser la limite du nombre max (qui serait une var env ?)
