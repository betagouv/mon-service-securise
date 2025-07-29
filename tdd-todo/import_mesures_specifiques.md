# La TODO list de l'import des mesures spécifiques

## Vocabulaire

On dit [Modèles de mesure spécifique] pour parler de la partie « référentiel de mesures lié à l'utilisateur ».

## Du point de vue de la Mesure Spécifique

- [x] Une mesure spé peut avoir une description longue : nouvel attribut à rajouter
- [x] Une mesure spé peut avoir un identifiant de modèle
  - Conséquence : la description, la description longue et la catégorie ne sont pas persistées

## Du point de vue du Service

- [x] Le service va chercher le détail d'une mesure spécifique liée à un [modèle de mesure spécifique] lors de sa construction
- [x] Le service est hydraté avec TOUS les modèles disponibles (pas seulement les modèles déjà associés)
- [x] Le service peut détacher une mesure spécifique de son modèle de mesure
  - [x] à condition que le modèle appartienne à un utilisateur avec les droits [ECRITURE sur SÉCURISER]
  - [x] à condition que tous les services soient associés au modèle
  - [x] à condition que l'utilisateur soit propriétaire du modèle
  - Conséquence
    - [x] tout le détail du modèle (label, description, catégorie) est recopiée **dans** les mesures spés du service
    - [x] et le lien entre modèle et service disparaît
    - [x] le service relu ne connait plus l'association
- [x] Un service peut être relié à un modèle de mesure
  - [x] à condition que le modèle appartienne à un utilisateur avec les droits [ECRITURE sur SÉCURISER]
    - [x] une erreur qui montre les détails utilisateur et id service
  - [x] à condition que l'utilisateur soit propriétaire du modèle
  - Conséquence :
    - [x] le service se retrouve avec une mesure spécifique au statut « À lancer ».
    - [x] Cette mesure est reliée au modèle
    - [x] **et** elle apparaît dans la table d'association.
    - [x] **et** elle a un identifiant de mesure (en plus de l'identifiant du modèle)
    - [x] le service relu depuis le dépôt connaitrait l'association
- [x] `depotDonneesService.metAjour` devrait utiliser une fonction "SELECT 1" pour vérifier l'existence du service
- [x] On appelle `modelesDisponiblesDeMesureSpecifique` la liste de tous les modèles associables.
- [x] On ne peut pas associer 2 fois un service à un même modèle
  - On peut séparer la boucle sur le domaine de la boucle sur le `depotServices.metsAJourService(s);` comme ça le domaine peut `throw` avant même qu'on déclenche les MAJ en BDD
- [x] On aimerait mutualiser le code qui vérifie les permissions de associer/détacher

## Du point de vue des Modèles de mesure

- [ ] On peut supprimer un modèle du référentiel, mais **sans** supprimer les mesures : elles seront détachées sur chaque service où elles
      sont liées.
- [ ] On peut supprimer un modèle du référentiel **et** supprimer les mesures associées : les mesures disparaisssent totalement
      de tous les services où elles apparaissaient.
- [ ] On peut dissocier une mesure de certains services tout en **conservant** le modèle : les mesures spécifiques disparaissent du service
      et le lien entre modèle et service disparaît aussi.
- [x] On peut créer un modèle de mesure (description, description longue, catégorie) lié à son identifiant utilisateur de manière unitaire
- [ ] On peut créer des modèles de mesure (description, description longue, catégorie) lié à son identifiant utilisateur via un import de CSV
  - Cet import aura une limite en nombre total de modèles détenu par l'utilisateur
- [x] On peut lire tous les modèles d’un utilisateur
  - [x] Les données du modèle doivent être déchiffrées
  - [x] On veut aggréger les identifiants de services associés à cette mesure

## Du point de vue du Front

- [ ] On veut pouvoir afficher la liste des modèles de mesure dans un onglet à coté de la liste des mesures générales
  - [x] Les modèles de mesure sont affichés correctement, avec leur référentiel, leur catégorie et le nombre de services associés
  - [ ] La recherche fonctionne encore
  - [ ] Les filtres fonctionnent encore
  - [ ] Les badges des onglets sont mis à jour en fonction de la recherche
- [x] On peut afficher les services associés à un modèle, avec le statut et la précision actuelle
- [ ] On veut voir un écran dédié quand la liste de modèle de mesure est vide
- [x] On veut pouvoir ajouter un modèle de mesure
  - [x] Via un bouton à côté du téléchargement de la liste
  - [x] En passant par un tiroir de création
- [x] On peut modifier les informations d'un modèle, quand on clique sur « Configurer la mesure »
- [ ] On veut pouvoir associer un modèle à des services
  - [ ] Après avoir ajouté un modèle
  - [ ] Depuis la modale de détail d'un modèle de mesure
  - [ ] Depuis l'action du tableau
- [x] [SOIN] Renommage des modèles
  - [x] Renommer `MesureReferentiel` en `ModeleMesureGenerale`
  - [x] Renommer le store `mesuresReferentiel.store`
  - [x] Renommer le type `ReferentielMesures`
  - [x] Renommer `TiroirConfigurationMesure` en `TiroirConfigurationModeleMesureGenerale`
