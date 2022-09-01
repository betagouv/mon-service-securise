# MonServiceSécurisé

MonServiceSécurisé est un service numérique développé par le laboratoire
d'innovation de l'[ANSSI](https://www.ssi.gouv.fr/), en lien avec l'incubateur
[BetaGouv](https://beta.gouv.fr/) de la direction interministérielle du
numérique. Il vise à aider les collectivités territoriales et les autres
entités publiques à sécuriser et à homologuer leurs services publics numériques
(sites web, applications mobiles, API).

## Configuration de l'environnement de développement

Il est nécessaire en prérequis d'avoir installé [Git](https://git-scm.com/),
[Docker](https://www.docker.com/) et [Node.js v16](https://nodejs.org/en/).

Commencer par récupérer les sources du projet et aller dans le répertoire créé.

```sh
$ git clone https://github.com/betagouv/mon-service-securise.git && cd mon-service-securise
```

Créer un fichier `.env` à partir du fichier `.env.template` et renseigner les diverses variables d'environnement.

Lancer le script `scripts/start.sh`

Se connecter au conteneur de la base de données et créer une nouvelle base `mss` pour un utilisateur postgres.

```sh
$ docker exec -t mon-service-securise_db_1 createdb -U postgres mss
```

Exécuter les migrations depuis le conteneur du serveur web.

```sh
$ docker exec -t mon-service-securise_web_1 npx knex migrate:latest
```

Le serveur est configuré et prêt à être redémarré.

## Lancement du serveur

```sh
$ docker-compose restart web
```

(Ou arret et ré-exécution de `./script/start.sh`)

Le serveur devrait être accessible depuis un navigateur à l'URL
`http://localhost:[PORT_MSS]` (avec comme valeur pour `PORT_MSS` celle indiquée
dans le fichier `.env`).

Il est alors possible de créer un compte utilisateur à l'url `http://localhost:[PORT_MSS]/inscription`.


## Exécution de la suite de tests automatisés

Les tests peuvent être lancés depuis un conteneur Docker en exécutant le script
`scripts/tests.sh`. Les tests sont alors rejoués à chaque modification de
fichier du projet sur la machine hôte.
