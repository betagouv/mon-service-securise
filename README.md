# MonServiceSécurisé

MonServiceSécurisé est un service numérique développé par le laboratoire
d'innovation de l'[ANSSI](https://www.ssi.gouv.fr/), en lien avec l'incubateur
[BetaGouv](https://beta.gouv.fr/) de la direction interministérielle du
numérique. Il vise à aider les collectivités territoriales et les autres
entités publiques à sécuriser et à homologuer leurs services publics numériques
(sites web, applications mobiles, API).

## Configuration de l'environnement de développement

Il est nécessaire en prérequis d'avoir installé [Git](https://git-scm.com/),
[Docker-Compose](https://docs.docker.com/compose/install/) et [Node.js
v16](https://nodejs.org/en/).

Commencer par récupérer les sources du projet et aller dans le répertoire créé.

```sh
$ git clone https://github.com/betagouv/mon-service-securise.git && cd mon-service-securise
```

Créer un fichier `.env` à partir du fichier `.env.template` et renseigner les diverses variables d'environnement.

Se connecter au conteneur de la base de données et créer une nouvelle base `mss` pour un utilisateur postgres.

```sh
$ docker-compose run --rm db createdb -U postgres mss
```

Exécuter les migrations depuis le conteneur du serveur web.

```sh
$ docker-compose run --rm web npx knex migrate:latest
```

Le serveur est configuré et prêt à être démarré.

## Lancement du serveur

```sh
$ script/start.sh
```

Le serveur devrait être accessible depuis un navigateur à l'URL
`http://localhost:[PORT_MSS]` (avec comme valeur pour `PORT_MSS` celle indiquée
dans le fichier `.env`).

Il est alors possible de créer un compte utilisateur à l'url `http://localhost:[PORT_MSS]/inscription`.


## Exécution de la suite de tests automatisés

Les tests peuvent être lancés depuis un conteneur Docker en exécutant le script
`scripts/tests.sh`. Les tests sont alors rejoués à chaque modification de
fichier du projet sur la machine hôte.

## Note concernant les variables des binaires installés par buildpack

L'installation de Node.js dans l'image se fait selon [le processus standard de
Scalingo basé sur le mécanisme de
buildpacks](https://doc.scalingo.com/platform/deployment/buildpacks/intro). Par ce mécanisme, les variables d'environnement liées à l'exécution des binaires installés sont consignées dans des fichiers du répertoire `.profile.d`. _Ces variables doivent être chargées avant de pouvoir utiliser les binaires._ Ainsi, si on lance une commande _via_ `docker-compose exec`, il conviendra d'exécuter soit le fichier `scripts/entrypoint.sh` suivi de la commande, soit de lancer la commande dans un bash avec login :
```bash
$ docker-compose exec web scripts/entrypoint.sh which npm
$ docker-compose exec web bash -lc "which npm"
```

L'exécution de `scripts/entrypoint.sh` étant déclarée dans le `Dockerfile`, il n'y a pas besoin de recharger les variables quand on passe par la commande `docker-compose run` :
```bash
$ docker-compose run --rm web which npm
```
