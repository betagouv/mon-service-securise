const express = require('express');

const creeServeur = (depotDonnees) => {
  let serveur;

  const app = express();

  app.set('view engine', 'pug');
  app.set('views', './src/vues');

  app.get('/', (requete, reponse) => {
    reponse.render('index');
  });

  app.get('/connexion', (requete, reponse) => {
    reponse.render('connexion');
  });

  app.get('/homologations', (requete, reponse) => {
    reponse.render('homologations');
  });

  app.get('/api/homologations', (requete, reponse) => {
    const idUtilisateur = requete.headers['x-id-utilisateur'];
    const homologations = depotDonnees.homologations(idUtilisateur).map((h) => h.toJSON());
    reponse.json({ homologations });
  });

  app.post('/api/token', (requete, reponse) => {
    reponse.end();
  });

  app.use(express.static('public'));

  const ecoute = (port, succes) => {
    serveur = app.listen(port, succes);
  };

  const arreteEcoute = () => {
    serveur.close();
  };

  return { ecoute, arreteEcoute };
};

module.exports = { creeServeur };
