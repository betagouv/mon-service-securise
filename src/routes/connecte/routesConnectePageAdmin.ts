import express from 'express';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';

type Configuration = {
  adaptateurEnvironnement: AdaptateurEnvironnement;
};

const routesConnectePageAdmin = ({
  adaptateurEnvironnement,
}: Configuration) => {
  const routes = express.Router();

  routes.use((_requete, reponse, suite) => {
    if (!adaptateurEnvironnement.featureFlag().avecGestionDesOrganisations()) {
      reponse.status(404).render('404');
      return;
    }
    suite();
  });

  routes.get('/entites', async (_requete, reponse) => {
    reponse.render('admin/entites');
  });

  return routes;
};

export { routesConnectePageAdmin };
