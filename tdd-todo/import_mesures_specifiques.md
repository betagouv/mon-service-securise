# La TODO list de l'import des mesures spécifiques

## Vocabulaire

On dit [Modèles de mesure spécifique] pour parler de la partie « référentiel de mesures lié à l'utilisateur ».

## Du point de vue des Modèles de mesure

### CSV

- Voir [la todo dédiée](televersement_mesures_specifiques.md)

## Du point de vue du Front

- [ ] Les badges des onglets sont mis à jour en fonction de la recherche
- [x] Le "Téléchargement de la liste de mesure" inclue les modèles de mesure spécifique
  - [x] Ils n'ont pas d'identifiant numérique
  - [x] Le référentiel est "Ajoutée"

## Du point de vue de la page "SÉCURISER"

- [ ] Un bouton derrière le feature flag, permettant d'associer une liste de modèle à un service
  - [ ] Un tiroir d'association dédié
  - [x] Une route d'association à des modèles multiple dédiés
- [ ] Le tiroir de configuration d'une mesure spécifique est modifié, via un feature flag
  - [ ] Un affichage particulier pour un propriétaire du modèle de mesure
    - [ ] Un affichage similaire pour un utilisateur avec les droits d'écriture, seul l'infobulle change
    - [ ] Une mesure spécifique associée, supprimée depuis l'interface, doit supprimer l'association entre le service et le modèle
  - [ ] Un affichage en lecture seule si l'utilisateur n'a pas les droits de modification
  - [ ] Une mesure spécifique qui ne provient pas d'un modèle a maintenant une entrée "Description" (descriptionLognue)
- Bonus : pouvoir ouvrir la page Sécuriser avec une mesure mise en valeur (tiroir ouvert et onglet correspondant ouvert)
