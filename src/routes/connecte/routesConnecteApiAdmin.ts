import express from 'express';
import z from 'zod';
import { RequestRouteConnecte } from './routesConnecte.types.js';
import { ServiceAdministrationOrganisations } from '../../supervision/serviceAdministrationOrganisations.js';
import { valideBody } from '../../http/validePayloads.js';
import { schemaPostAdminNomme } from './routesConnecteApiAdmin.schema.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';

type Configuration = {
  depotDonnees: DepotDonnees;
  serviceAdministrationOrganisations: ServiceAdministrationOrganisations;
};

const routesConnecteApiAdmin = ({
  depotDonnees,
  serviceAdministrationOrganisations,
}: Configuration) => {
  const routes = express.Router();

  routes.get('/entites', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const entites =
      await serviceAdministrationOrganisations.entitesDe(idUtilisateurCourant);

    reponse.json(entites);
  });

  routes.get('/utilisateurs', async (requete, reponse) => {
    const { idUtilisateurCourant } = requete as RequestRouteConnecte;

    const utilisateurs =
      await serviceAdministrationOrganisations.utilisateursDansLePerimetreDe(
        idUtilisateurCourant
      );

    reponse.json(
      utilisateurs.map((u) => ({
        id: u.id,
        prenomNom: u.prenomNom(),
        email: u.email(),
        postes: u.posteDetaille(),
        estAdmin: u.estAdmin,
        nombreEntites: u.nombreEntites,
        nombreServices: u.nombreServices,
      }))
    );
  });

  routes.post(
    '/verifieEmail',
    valideBody(z.strictObject({ email: z.email() })),
    async (requete, reponse) => {
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;
      const superviseur =
        await depotDonnees.lisSuperviseur(idUtilisateurCourant);
      if (!superviseur) {
        reponse.sendStatus(403);
        return;
      }

      const cible = await depotDonnees.utilisateurAvecEmail(requete.body.email);

      reponse.json({ existe: !!cible });
    }
  );

  routes.post(
    '/nomme',
    valideBody(schemaPostAdminNomme),
    async (requete, reponse) => {
      const { emails, siret } = requete.body;
      const { idUtilisateurCourant } = requete as RequestRouteConnecte;

      const superviseur =
        await depotDonnees.lisSuperviseur(idUtilisateurCourant);
      if (!superviseur || !superviseur.estSuperviseurDe(siret)) {
        reponse.sendStatus(403);
        return;
      }

      const nommeAdmin = async (email: string) => {
        const utilisateur = await depotDonnees.utilisateurAvecEmail(email);
        if (!utilisateur) return;
        await serviceAdministrationOrganisations.nommeAdmin(
          siret,
          utilisateur!.id,
          utilisateur!.email
        );
      };

      await Promise.all([...new Set(emails)].map(nommeAdmin));
      reponse.sendStatus(200);
    }
  );

  return routes;
};

export { routesConnecteApiAdmin };
