## Pour utiliser pleinement TypeScript

- [ ] Enlever de la CI les exécutions qui ne sont **pas** des `npm run <script>` : on veut tout rassembler dans `package.json`.
- [ ] Exécution quasi-transparente, en terme de vitesse, des tests en TS (par rapport à la version JS)
- [ ] Réparer le conteneur Docker de test déclaré dans le `docker-compose.yml` : on a un `nodemon …` et a priori ça ne va pas fonctionner

## Pour passer de CJS à ESM

- [x] Enlever eslint et mocha
- [ ] Passer de CJS à ESM :
  - J'ai utilisé https://www.npmjs.com/package/cjs2esm
  - [x] En local, passer à `tsx` au lieu de `ts-node`, car plus simple
  - [x] Aller voir tous les fichiers dans `/src`
  - [x] Aller voir tous les fichiers dans `/admin`
  - [x] Aller voir tous les fichiers dans `/scripts`
  - [x] Aller voir tous les fichiers dans `/public`
  - [x] Faire une recherche globale sur `require()` pour chasser les derniers
    - Il en reste seulement dans les tests, mais la migration n'a pas encore eu lieu
- [ ] Remettre les tests avec vitest
  - [ ] Avant il y avait `test`, `test:mocha` et `test:watch`
  - [ ] Bien penser à continuer à produire le `test-report` sur la CI, pour afficher correctement les rapports
- [ ] Faire les tests des éléments "périphériques"
  - [ ] Bien vérifier que `tacheEnvoieMailsNotificationExpiration.sh` (qui est lancé en cron sur clever) arrive bien à faire `node --import tsx`
  - [ ] Bien vérifier que `dev_init_sel.sh` arrive bien à faire `node --import tsx` et fonctionne bien
  - [ ] Enlever les `require()` des migrations et tester que les migrations fonctionnent encore
- [ ] Remettre eslint
