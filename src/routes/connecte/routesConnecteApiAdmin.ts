import express from 'express';

const routesConnecteApiAdmin = () => {
  const routes = express.Router();

  routes.get('/entites', async (_requete, reponse) => {
    reponse.json([{ siret: '123', nom: 'Une entite', departement: '33' }]);
  });

  return routes;
};

export { routesConnecteApiAdmin };
