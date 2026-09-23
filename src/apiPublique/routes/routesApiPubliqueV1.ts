import express, { Response } from 'express';
import { RequeteApiPublique } from '../middlewares/authentificationParCleApi.js';
import {
  chargeServiceAccessible,
  RequeteServiceApiPublique,
} from '../middlewares/chargeServiceAccessible.js';
import { Autorisation } from '../../modeles/autorisations/autorisation.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import Service from '../../modeles/service.js';
import { serialiseServicePourAPIPublique } from '../mappers/services.mapper.js';
import { serialiseIndiceCyberPourAPIPublique } from '../mappers/indiceCyber.mapper.js';
import { serialiseMesuresPourAPIPublique } from '../mappers/mesures.mapper.js';
import { serialiseHomologationPourAPIPublique } from '../mappers/homologation.mapper.js';

const {
  DROITS_VOIR_INDICE_CYBER,
  DROITS_VOIR_MESURES,
  DROITS_VOIR_STATUT_HOMOLOGATION,
} = Autorisation;

export const routesApiPubliqueV1 = ({
  depotDonnees,
}: {
  depotDonnees: DepotDonnees;
}) => {
  const routes = express.Router();
  const serviceAccessible = chargeServiceAccessible({ depotDonnees });

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

  routes.get(
    '/services/:id/indice-cyber',
    serviceAccessible(DROITS_VOIR_INDICE_CYBER),
    (requete: RequeteServiceApiPublique, reponse: Response) => {
      const service = requete.service!;

      reponse.json(
        serialiseIndiceCyberPourAPIPublique(
          service.indiceCyber(),
          service.referentiel.indiceCyberNoteMax()
        )
      );
    }
  );

  routes.get(
    '/services/:id/mesures',
    serviceAccessible(DROITS_VOIR_MESURES),
    (requete: RequeteServiceApiPublique, reponse: Response) => {
      reponse.json(serialiseMesuresPourAPIPublique(requete.service!));
    }
  );

  routes.get(
    '/services/:id/homologation',
    serviceAccessible(DROITS_VOIR_STATUT_HOMOLOGATION),
    (requete: RequeteServiceApiPublique, reponse: Response) => {
      reponse.json(serialiseHomologationPourAPIPublique(requete.service!));
    }
  );

  return routes;
};
