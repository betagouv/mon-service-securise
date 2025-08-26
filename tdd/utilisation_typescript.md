## Pour utiliser pleinement TypeScript

- [ ] Enlever de la CI les exécutions qui ne sont **pas** des `npm run <script>` : on veut tout rassembler dans `package.json`.
- [ ] Exécution quasi-transparente, en terme de vitesse, des tests en TS (par rapport à la version JS)
- [ ] Réparer le conteneur Docker de test déclaré dans le `docker-compose.yml` : on a un `nodemon …` et a priori ça ne va pas fonctionner

## Pour passer de CJS à ESM

- [x] Enlever eslint et mocha
- [ ] Passer de CJS à ESM
  - [ ] Passer à `tsx` au lieu de `ts-node`, car plus simple
  - [ ] Bien faire attention aux migrations Knex. Prendre idée sur MSC qui a 2 façons de faire en local et Clever.
- [ ] Remettre les tests avec vitest
  - [ ] Avant il y avait `test`, `test:mocha` et `test:watch`
  - [ ] Bien penser à continuer à produire le `test-report` sur la CI, pour afficher correctement les rapports
- [ ] Remettre eslint
