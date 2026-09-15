---
name: revue-impact-renovate
description: >-
  Analyse une pull request Renovate (montée de version npm, Docker ou GitHub Actions) et poste un
  commentaire de synthèse sur les risques : contenu du changelog des dépendances concernées,
  breaking changes, usage réel dans le code de MonServiceSécurisé (src/, svelte/, workflows),
  niveau de risque par dépendance. À utiliser quand on demande de « relire », « analyser »,
  « évaluer l'impact » ou « faire un résumé de risque » d'une PR Renovate, avant de la merger.
  Prend en argument un numéro ou une URL de PR ; sans argument, cible la PR de la branche courante.
---

# Revue d'impact d'une PR Renovate

Analyse le contenu réel d'une pull request Renovate (pas juste le numéro de version) et publie
un commentaire de synthèse sur GitHub pour aider à décider si elle peut être mergée sans risque.

Contexte projet : voir `CLAUDE.md` à la racine (Node.js/TypeScript, Express, PostgreSQL/Knex,
Svelte 5, tests Vitest). Les mises à jour sont groupées par manager et par type
(`.github/renovate.json`) : une PR peut donc contenir **plusieurs dépendances**.

## 1. Identifier la PR

- Argument fourni (numéro ou URL) → l'utiliser directement.
- Sinon, PR associée à la branche courante : `gh pr view --json number,title,headRefName,author,url,body,files`.

Vérifier que c'est bien une PR Renovate (`author.login` contenant `renovate`, ou
`headRefName` commençant par `renovate/`). Si ce n'est pas le cas, le signaler et demander
confirmation avant de continuer.

## 2. Extraire les montées de version

Récupérer le diff des fichiers de manifeste (pas les lockfiles, trop verbeux) :

```bash
gh pr diff <numero> -- package.json Dockerfile 'docker-compose*.yml' '.github/workflows/*.yml' .nvmrc
```

Pour chaque ligne modifiée, en déduire : nom de la dépendance, version avant → après, manager
concerné (npm / docker-compose / dockerfile / github-actions / nvm), et le type de montée
(patch / mineure / majeure, par comparaison semver). S'il y a beaucoup de dépendances (PR de
groupe patch ou mineure), toutes les traiter mais garder la synthèse concise par dépendance.

## 3. Rechercher le changelog de chaque dépendance

Pour chaque dépendance :

- Trouver le dépôt source (`npm view <pkg> repository.url`, ou le nom de l'action/l'image pour
  Docker/GitHub Actions).
- Récupérer les notes de version entre l'ancienne et la nouvelle version : page des releases
  GitHub (`https://github.com/<owner>/<repo>/releases`) ou fichier `CHANGELOG.md`, via
  `WebFetch`. Chercher spécifiquement : breaking changes, dépréciations, correctifs de sécurité
  (CVE).
- Si aucune information n'est trouvable, le mentionner explicitement plutôt que d'inventer un
  contenu.

## 4. Croiser avec l'usage réel dans le projet

Ne pas se contenter du changelog générique : vérifier si le projet utilise les API/comportements
concernés.

```bash
grep -rn "from '<pkg>'" src svelte test test_accessibilite
grep -rn "require('<pkg>')" src
```

Pour une image Docker ou une action GitHub, regarder le fichier concerné (`Dockerfile`,
`docker-compose*.yml`, le workflow) pour comprendre à quoi elle sert dans la CI/le déploiement.

Si le changelog mentionne un breaking change sur une fonction/config qui n'apparaît nulle part
dans le code du projet, le risque réel est plus faible que ce que le changelog seul suggère —
le dire explicitement dans la synthèse.

## 5. Évaluer le niveau de risque par dépendance

Trois niveaux : **faible / moyen / élevé**, en tenant compte de :

- type de montée (patch < mineure < majeure, mais un patch de sécurité critique peut être plus
  important à traiter vite qu'une mineure anodine),
- présence de breaking changes touchant du code effectivement utilisé,
- dépendance critique ou non pour le projet (ex. Express, Knex, Svelte, moteur de règles ANSSI
  vs. une lib de dev annexe).

## 6. Rédiger et poster le commentaire

Format du commentaire (une section par dépendance, concise) :

```markdown
## 🔍 Revue d'impact Renovate

### `<pkg>` : `<ancienne>` → `<nouvelle>` (patch|mineure|majeure)

**Risque : faible|moyen|élevé**

- Changelog : <résumé en 1-3 puces, ou "non trouvé">
- Usage dans le projet : <fichiers concernés ou "aucun usage direct trouvé">
- Recommandation : <mergeable directement | à tester manuellement avant merge | attendre/investiguer>
```

Terminer par une ligne de synthèse globale si plusieurs dépendances (ex. « Aucun risque majeur
identifié, mergeable après CI verte » ou « ⚠️ 1 dépendance à vérifier manuellement : `<pkg>` »).

**Avant de poster**, afficher le brouillon du commentaire à l'utilisateur et attendre sa
confirmation (poster un commentaire sur une PR est une action visible par d'autres). Une fois
confirmé :

```bash
gh pr comment <numero> --body-file <fichier-temporaire-dans-le-scratchpad>
```
