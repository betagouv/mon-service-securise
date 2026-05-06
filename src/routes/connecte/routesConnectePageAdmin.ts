import express from 'express';

const routesConnectePageAdmin = () => {
  const routes = express.Router();

  routes.get('/entites', async (requete, reponse) => {
    reponse.render('admin/entites');
  });

  return routes;
};

export { routesConnectePageAdmin };
