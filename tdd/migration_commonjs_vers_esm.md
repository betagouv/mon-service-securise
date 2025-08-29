## Pour passer de CJS à ESM

- [ ] Passer de CJS à ESM :
  - J'ai utilisé https://www.npmjs.com/package/cjs2esm
  - [x] Aller voir tous les fichiers dans `/src`
  - [x] Aller voir tous les fichiers dans `/test`
  - [x] Aller voir tous les fichiers dans `/migrations` et `/test_migrations`
  - [x] Aller voir tous les fichiers dans `/public` et `/test_public`
  - [-] Aller voir tous les fichiers dans `/admin`
  - [ ] Aller voir tous les fichiers dans `/scripts`
  - [ ] Faire une recherche globale sur `require()` pour chasser les derniers
- [ ] Faire les tests des éléments "périphériques"
  - [ ] Bien vérifier que `tacheEnvoieMailsNotificationExpiration.sh` (qui est lancé en cron sur clever) arrive bien à faire `node --import tsx`
  - [ ] Bien vérifier que `dev_init_sel.sh` arrive bien à faire `node --import tsx` et fonctionne bien
  - [ ] Bien vérifier les migrations : essayer d'en jouer un et down sur env de PR clever
