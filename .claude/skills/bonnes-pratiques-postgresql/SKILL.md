---
name: bonnes-pratiques-postgresql
description: >-
  Bonnes pratiques PostgreSQL de MonServiceSécurisé, tirées du chantier de performance de
  novembre 2026. À utiliser dès qu'on écrit ou modifie une requête SQL dans
  `src/adaptateurs/adaptateurPostgres*.{js,ts}`, qu'on ajoute une migration ou un index,
  qu'on filtre ou joint sur `autorisations.donnees`, ou qu'on enquête sur une lenteur, une
  saturation du pool de connexions ou un trop grand nombre de requêtes (N+1).
---

# Bonnes pratiques PostgreSQL

Ces règles viennent de lenteurs réelles : un tableau de bord à 30 s sous la charge et une nomination d'admin à 20 s. Dans les deux cas, la cause était une requête qui parcourait toute une table, exécutée beaucoup trop souvent.

## 1. Comparer les identifiants en `uuid`, pas en texte

La table `autorisations` range `idUtilisateur` et `idService` dans sa colonne JSON `donnees`. Deux index d'expression existent (migration `20261116120000`) :

- `autorisations_id_utilisateur_index` sur `((donnees ->> 'idUtilisateur')::uuid)`
- `autorisations_id_service_index` sur `((donnees ->> 'idService')::uuid)`

Postgres n'utilise un index d'expression que si la requête contient **la même expression**. Une comparaison en texte parcourt donc toute la table.

```sql
-- ❌ parcours complet de la table
WHERE donnees->>'idUtilisateur' = ?
JOIN utilisateurs u ON u.id::TEXT = a.donnees->>'idUtilisateur'

-- ✅ utilise l'index
WHERE (donnees->>'idUtilisateur')::uuid = ?
JOIN utilisateurs u ON u.id = (a.donnees->>'idUtilisateur')::uuid
```

- Caster la **colonne JSON**, jamais la colonne `uuid` d'en face vers du texte.
- Appliquer la règle aux `WHERE`, aux `JOIN`, aux `IN (...)` et aux CTE qui produisent des identifiants.
- Conséquence à connaître : avec un paramètre qui n'est pas un UUID, la requête lève une erreur au lieu de ne rien trouver.
- Avant de filtrer sur une autre clé de `donnees` ou sur une autre colonne JSON, vérifier qu'un index existe sur cette expression. Sinon, en créer un par migration.

## 2. Agréger seulement les lignes retenues : `LEFT JOIN LATERAL`

Une sous-requête agrégée dans un `JOIN` classique est calculée pour **toute la table**, puis filtrée. Avec `LATERAL`, la sous-requête référence la ligne courante et n'est exécutée que pour les lignes retenues.

```sql
-- ❌ agrège toutes les autorisations de la base
LEFT JOIN (SELECT (a.donnees->>'idService')::uuid AS id_service, json_agg(...) AS utilisateurs
           FROM autorisations a GROUP BY id_service) u ON u.id_service = s.id

-- ✅ agrège les autorisations du service courant
LEFT JOIN LATERAL (SELECT json_agg(...) AS utilisateurs
                   FROM autorisations a
                   WHERE (a.donnees->>'idService')::uuid = s.id) u ON TRUE
```

- Le filtre est dans le `WHERE` de la sous-requête ; `ON TRUE` n'est là que pour la syntaxe.
- `LATERAL` s'appuie sur les index : sans index sur la colonne filtrée, chaque exécution redevient un parcours complet.
- Le coût est proportionnel au nombre de lignes retenues. Sur toute la table, c'est équivalent à l'agrégation globale, pas meilleur.
- Exemple de référence : `servicesComplets` dans `adaptateurPostgres.js`.

## 3. Réduire le nombre de requêtes avant d'optimiser chacune

Une requête à 1 ms exécutée 10 000 fois sature le pool (10 connexions par défaut) : les suivantes attendent.

- **Charger une fois, passer en paramètre.** Ce qui est identique pour tous les éléments d'une boucle (les admins d'un SIRET pour chacun de ses services, par exemple) se lit avant la boucle.
- **Ne pas réécrire ce qui ne change pas.** `sauvegardeAutorisation` publie un événement, et ses abonnés (Brevo, CRM, journal) relancent des lectures pour chaque contributeur. Filtrer les écritures inutiles supprime toute cette cascade.
- **Le bus partage le pool.** Les abonnés sont lancés sans attente ni limite (`busEvenements.js`) : leur travail d'arrière-plan fait la queue avec la requête HTTP en cours.
- **Se méfier des `Promise.all` sur une liste de taille libre** quand chaque élément fait plusieurs requêtes.

## 4. Mesurer avant et après

- **`EXPLAIN (ANALYZE, BUFFERS)`** sur une base à volumétrie réaliste (des dizaines de milliers d'autorisations). Signaux d'alerte : `Seq Scan` sur une grosse table, `HashAggregate` sur une table entière, mention `Disk`.
- **`pg_stat_statements`** pour savoir quelles requêtes pèsent : nombre d'appels et temps total, pas seulement la durée unitaire.
- **Mesurer le temps côté Postgres.** La durée vue depuis Node inclut l'attente dans l'event loop et dans le pool, et grossit quand Node sature.
- **Compter les requêtes par action utilisateur.** Un nombre qui grandit avec les données (services, admins, contributeurs) signale un N+1.
- Les tests pglite valident le comportement, pas la performance : une requête lente y passe sans problème.

## 5. Migrations d'index

- Une migration par index ou groupe d'index, avec son `down`.
- Index d'expression : doubles parenthèses, `ON table (((donnees ->> 'cle')::uuid))`.
- `CREATE INDEX` verrouille la table en écriture pendant la création. Sur une grosse table en production, envisager `CONCURRENTLY` (hors transaction).

## 6. Tests

- Une réécriture de requête se protège par des tests de caractérisation dans `test/adaptateurs/adaptateurPostgres.spec.js` (vrai Postgres via pglite), écrits et verts **avant** la réécriture.
- Couvrir : les lignes attendues, l'absence des lignes des autres utilisateurs ou services, le cas vide.
- Lancer le spec seul (`pnpm exec vitest run test/adaptateurs/adaptateurPostgres.spec.js`) : en suite complète, les specs pglite peuvent dépasser leur délai.

## Check-list avant de proposer une requête

1. Les filtres et jointures sur `donnees` sont-ils castés en `uuid`, à l'identique des index ?
2. Chaque sous-requête agrégée est-elle limitée aux lignes retenues ?
3. Combien de fois cette requête s'exécute-t-elle pour une action utilisateur, et ce nombre dépend-il du volume de données ?
4. L'écriture est-elle nécessaire, et que déclenche-t-elle sur le bus ?
5. Le plan a-t-il été vérifié par `EXPLAIN ANALYZE` sur un volume réaliste ?
