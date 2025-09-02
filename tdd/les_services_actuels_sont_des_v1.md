# Les services actuels sont des V1

## TODO

- [ ] Un nouveau service est persité en `v1`
- [ ] Côté Metabase : un LÉGO des versions de service.
  - Ce légo n'existe pas encore
  - L'absence de version veut dire `v1`
  - On imagine que dans `NOUVEAU_SERVICE_CREE` on aura un champ `versionService: "v2"` sur lequel il pourra se baser
  - Au moment du switch, on imagine un nouvel event `SERVICE_A_ETE_MIGRE` qui dit `versionCible: "v2"`

## DONE

- [x] Un service connaît sa version
- [x] Une colonne dédiée `version_service` dans la table `services`
  - Avec valeur par défaut à `v1`, comme ça pas de migration.
