# MonServiceSécurisé

![Version Node](https://img.shields.io/badge/dynamic/yaml?url=https://raw.githubusercontent.com/betagouv/mon-service-securise/refs/heads/master/.nvmrc&query=%24.&label=Node&logo=nodedotjs&color=%23689f63)
![Version Typescript](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbetagouv%2Fmon-service-securise%2Frefs%2Fheads%2Fmaster%2Fpackage.json&query=%24.devDependencies.typescript&logo=typescript&label=Typescript&color=%232d79c7)
![Version Svelte](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fbetagouv%2Fmon-service-securise%2Frefs%2Fheads%2Fmaster%2Fpackage.json&query=%24.dependencies.svelte&logo=svelte&label=Svelte&color=%23ff3e00)

![État Build](https://img.shields.io/github/actions/workflow/status/betagouv/mon-service-securise/node.js.yml?label=Int%C3%A9gration%20%20continue&logo=github)
![État CodeQL](https://img.shields.io/github/actions/workflow/status/betagouv/mon-service-securise/codeql-analysis.yml?label=CodeQL&logo=github)
![État Déploiement](https://img.shields.io/github/actions/workflow/status/betagouv/mon-service-securise/deploiement.yml?label=D%C3%A9ploiement&logo=github)

---

<div style="display: flex; align-items: center; justify-content: center;">
    <img src="https://raw.githubusercontent.com/betagouv/mon-service-securise/refs/heads/master/public/assets/images/logo_mss.svg" width="400"/>
</div>

MonServiceSécurisé est un service numérique développé par le laboratoire
d'innovation de l'[ANSSI](https://www.cyber.gouv.fr/), en lien avec l'incubateur
[BetaGouv](https://beta.gouv.fr/) de la direction interministérielle du
numérique. Il vise à aider les collectivités territoriales et les autres
entités publiques à sécuriser et à homologuer leurs services publics numériques
(sites web, applications mobiles, API).

## ⚙️ Configuration de l'environnement de développement

Il est nécessaire en prérequis d'avoir installé

- [Git](https://git-scm.com/),
- [Docker](https://www.docker.com/)
- Une version récente (>= 18) de [Node.js](https://nodejs.org/en/) :\
  Nous vous conseillons d'utiliser [`nvm use`](https://github.com/nvm-sh/nvm), pour utiliser la même version que dans les environnements d'intégration continue et de production, car nous spécifions la version de Node.js à utiliser dans le fichier `.nvmrc`.

Commencer par récupérer les sources du projet et aller dans le répertoire créé.

```sh
$ git clone https://github.com/betagouv/mon-service-securise.git && cd mon-service-securise
```

Créer un `network` Docker pour accueillir MonServiceSécurisé en local.

```sh
$ docker network create mss-network
```

Créer un `network` Docker pour accueillir les services du Lab en local, s'il n'existe pas déjà.

```sh
$ docker network create lab-network
```

Créer un fichier `.env` à partir du fichier `.env.template` et renseigner les diverses variables d'environnement.

⚠ La première fois: ne renseignez pas `CHIFFREMENT_SEL_DE_HASHAGE_1`

Démarrer la base de données

```sh
$ docker compose up mss-db --build -d
```

Se connecter au conteneur de la base de données et créer une nouvelle base `mss` pour un utilisateur postgres.

```sh
$ docker compose exec mss-db createdb -U postgres mss
```

Le serveur est configuré et prêt à être redémarré.

## 🌐 Lancement du serveur

```sh
$ ./scripts/start.sh
```

⚠ La première fois: l'erreur suivante sur le sels doit s'afficher :

```
[SERVEUR] 💥 Erreur de vérification des sels: Aucun sel de hachage dans la config.
```

Exécutez le script suivant pour configurer le sel des hashs (en développement uniquement) :

```sh
$ ./scripts/dev_init_sel.sh
```

Redémarrez le serveur :

```sh
$ ./scripts/start.sh
```

Le serveur devrait être accessible depuis un navigateur à l'URL
`http://localhost:[PORT_MSS]` (avec comme valeur pour `PORT_MSS` celle indiquée
dans le fichier `.env`).

Il est alors possible de créer un compte utilisateur à l'url `http://localhost:[PORT_MSS]/inscription`.

### 🛠️ Outils en local

- `Postgres` est relayé sur le port `5432` de l'hôte. Donc le requêtage via un outil graphique est possible.

## 🧪 Exécution de la suite de tests automatisés

Les tests peuvent être lancés depuis un conteneur Docker en exécutant le script
`scripts/tests.sh`. Les tests sont alors rejoués à chaque modification de
fichier du projet sur la machine hôte.

## 🎯 Migration de la base de données

Les scripts de migration de la base de données sont exécutés automatiquement au démarrage du service.
Si vous avez besoin d'exécuter manuellement ces migrations, vous pouvez le faire en exécutant la commande suivante :

```sh
$ docker compose exec web pnpm run migration-bdd
```

## 🏗️ Conception

### 🧩 Composants Svelte

Certaines parties du frontend sont suffisament compliquées pour ne pas être codées en jQuery.
Pour celles-ci, on utilise `Svelte`. Le code est rangé dans `/svelte`.

En local, les composants sont `build` à la volée grâce à l'option `vite build --watch`.

En production, ils sont `build` via le `build` du `package.json`.

Dans les deux cas, le code généré se retrouve dans `/public/composants-svelte` pour être référencé depuis les `.pug`.
