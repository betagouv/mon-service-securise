import express from 'express';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { Referentiel, ReferentielV2 } from '../../referentiel.interface.js';

type Configuration = {
  depotDonnees: DepotDonnees;
  adaptateurEnvironnement: AdaptateurEnvironnement;
  referentiel: Referentiel;
  referentielV2: ReferentielV2;
};

const routesConnectePageAdmin = ({
  depotDonnees,
  adaptateurEnvironnement,
  referentiel,
  referentielV2,
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

  routes.get('/utilisateurs', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;
    const adminCourant =
      await depotDonnees.lisAdminOrganisations(idUtilisateurCourant);

    if (!adminCourant) {
      reponse.status(404).render('404');
      return;
    }

    reponse.render('admin/utilisateurs');
  });

  routes.get('/administrateurs', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;
    const superviseurCourant =
      await depotDonnees.lisSuperviseur(idUtilisateurCourant);

    if (!superviseurCourant) {
      reponse.status(404).render('404');
      return;
    }

    reponse.render('admin/administrateurs');
  });

  routes.get('/statistiques', async (_requete, reponse) => {
    reponse.render('admin/statistiques', {
      referentiel,
      referentielV2,
    });
  });

  return routes;
};

export { routesConnectePageAdmin };
