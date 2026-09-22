import express, { Response } from 'express';
import { RequeteApiPublique } from './middlewares/authentificationParCleApi.js';
import { Autorisation } from '../modeles/autorisations/autorisation.js';
import { DepotDonnees } from '../depotDonnees.interface.js';
import Service from '../modeles/service.js';
import { serialiseServicePourAPIPublique } from './schemas/services.schema.js';

export const routesApiPubliqueV1 = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonnees;
}) => {
  const routes = express.Router();

  routes.get(
    '/services',
    async (requete: RequeteApiPublique, reponse: Response) => {
      const idUtilisateur = requete.idUtilisateurCourant!;
      const [services, autorisations] = await Promise.all([
        depotDonnees.services(idUtilisateur),
        depotDonnees.autorisations(idUtilisateur),
      ]);

      const autorisationDe = (service: Service) =>
        autorisations.find((a: Autorisation) => a.idService === service.id);

      reponse.json({
        donnees: services.map((service: Service) =>
          serialiseServicePourAPIPublique(service, autorisationDe(service))
        ),
      });
    }
  );

  return routes;
};
