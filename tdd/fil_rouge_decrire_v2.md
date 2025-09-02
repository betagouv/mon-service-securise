# Les services ont une description V2

## TODO

- [ ] La route de création de service peut créer un service avec une description v2
- [ ] Une page permet de créer un service avec description v2
- [ ] Un bouton permet d'ouvrir cette page, il est derrière un feature flag

## TODO plus tard

- Metabase : au moment du switch, on imagine un nouvel event `SERVICE_A_ETE_MIGRE` qui dit `versionCible: "v2"`
- Description service et description service v2 doivent implémenter une interface commune
  - technique : pour sérialiser
  - métier : pour dupliquer, pour exploiter les données métier du service (les passe plat `descriptionService.*`)

## DONE

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
