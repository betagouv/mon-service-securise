# Les services ont une description V2

## TODO

- [ ] Un brouillon existant peut être complété (reprendre la création)
- [ ] chaque étape de décrire permet de mettre à jour une propriété du brouillon
- [-] Le calcul du niveau de sécurité en V2 est disponible
  - [ ] Tous ceux qui appellent `DescriptionService.estimeNiveauSecurite` alors qu'ils ont un `service` sous la main doivent appeler une méthode d'instance
  - [ ] Ceux qui appellent `DescriptionService.estimeNiveauSecurite` AVANT d'avoir un service… normalement c'est bon car on codera des cousins hard-codés sur `DescriptionServiceV2.estimeNiveauSecurite`
  - [ ] Déplacer `estNiveauDeSecuriteValide` dans une fonction du `referentiel`
- [ ] un service v2 utilise un moteur de règles v2 (ou des reglesPersonnalisation v2 ?)
  - ce moteur de règles génère une liste de mesures v2

## TODO plus tard

- On va devoir décommissioner le code qui permet de créer des services v1
  - supprimer le téléversement v1
- [ ] On peut sélectionner un brouillon pour le supprimer
- Penser à afficher l'erreur si le nom de service est déjà utilisé (erreur dans le POST /finalise)
- Le dépot de Brouillon est une classe TS ?
- Metabase : au moment du switch, on imagine un nouvel event `SERVICE_A_ETE_MIGRE` qui dit `versionCible: "v2"`
- Description service et description service v2 doivent implémenter une interface commune
  - technique : pour sérialiser
  - métier : pour dupliquer, pour exploiter les données métier du service (les passe plat `descriptionService.*`)
- Regarder toutes les routes connectées de page Service et vérifier s'il faut du v2

## DONE

- [x] Une page permet de créer un brouillon de service v2
  - [x] Un bouton permet d'ouvrir cette page, il est derrière un feature flag
    - /service/v2/creation
  - [x] Le composant Svelte utilise un fichier `.api` et non un `axios.post()` dans `CreationV2.svelte`
- [x] le brouillon se transforme en une descriptionV2 à la création du service
  - [x] la validation de description dans `nouveauService` est faite par une méthode statique de `Service.valideDonneesCreation`
    - [x] c'est cette méthode statique qui fait le switch entre v1 et v2
- [x] le service v2 créé d'après un brouillon est affichable sur le tableau de bord
- [x] une route qui finalise un brouillon complet, et crée un nouveau service
- [x] le dépôt de données sait finaliser un brouillon de service
  - le brouillon est transformé en description v2
  - la description v2 est persistée dans le service (actuellement descriptionServiceV2.donneesSerialisees() n'existe pas)
  - le brouillon est supprimé
- [x] Lister les brouillons avec les services sur le TDB
- [x] La route de création de brouillon peut créer un brouillon de service
  - [x] Persister le brouillon
  - [x] Retourner l'ID réel du brouillon
  - [x] La validation de la payload sur le POST se fait avec ZOD
  - [x] Le brouillon peut être affiché dans le tableau de bord
    - [x] Il est affiché au dessus des services
    - [x] On peut rechercher sur le nom du brouillon
    - [x] On s'assure que l'affichage "tableau vide" fonctionne correctement
- [x] Un service v2 instancie une description V2
  - [x] avec le nom du service
- [x] Côté Metabase : un LÉGO des versions de service.
  - Ce légo n'existe pas encore
  - L'absence de version veut dire `v1`
  - [x] On imagine que dans `NOUVEAU_SERVICE_CREE` on aura un champ `versionService: "v2"` sur lequel il pourra se baser
- [x] C'est MSS qui met explicitement v1, pas Postgres
- [x] L'attribut s'appelle `versionService` et pas `version`
- [x] Un nouveau service est persité en `v1`
- [x] La version d'un service est lue depuis la persistance
- [x] Un service connaît sa version
- [x] Une colonne dédiée `version_service` dans la table `services`
  - Avec valeur par défaut à `v1`, comme ça pas de migration.
