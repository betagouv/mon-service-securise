# La TODO list de l'import des mesures spécifiques

## Vocabulaire

On dit [Modèles de mesure spécifique] pour parler de la partie « référentiel de mesures lié à l'utilisateur ».

## Du point de vue de la Mesure Spécifique

- [x] Une mesure spé peut avoir une description longue : nouvel attribut à rajouter
- [x] Une mesure spé peut avoir un identifiant de modèle
  - Conséquence : la description, la description longue et la catégorie ne sont pas persistées

## Du point de vue du Service

- [ ] Le service va chercher le détail d'une mesure spécifique liée à un [modèle de mesure spécifique] lors de sa construction
- [ ] Le service peut détacher une mesure spécifique de son modèle de mesure
  - [x] Conséquence : tout le détail du modèle (label, description, catégorie) est recopiée **dans** les mesures spés du service
  - [ ] et le lien entre modèle et service disparaît
- [ ] Un service peut être relié à un modèle de mesure, à condition que le modèle appartienne à un utilisateur avec les droits [ECRITURE sur SÉCURISER]
  - Conséquence :
    - [ ] le service se retrouve avec une mesure spécifique au statut « À lancer ».
    - [ ] Cette mesure est reliée au modèle
    - [x] **et** elle apparaît dans la table d'association.

## Du point de vue des Modèles de mesure

- [ ] On peut supprimer un modèle du référentiel, mais **sans** supprimer les mesures : elles seront détachées sur chaque service où elles
      sont liées.
- [ ] On peut supprimer un modèle du référentiel **et** supprimer les mesures associées : les mesures disparaisssent totalement
      de tous les services où elles apparaissaient.
- [ ] On peut dissocier une mesure de certains services tout en **conservant** le modèle : les mesures spécifiques disparaissent du service
      et le lien entre modèle et service disparaît aussi.
- [ ] On peut créer un modèle de mesure (description, description longue, catégorie) lié à son identifiant utilisateur de manière unitaire
- [ ] On peut créer des modèles de mesure (description, description longue, catégorie) lié à son identifiant utilisateur via un import de CSV
  - Cet import aura une limite en nombre total de modèles détenu par l'utilisateur
