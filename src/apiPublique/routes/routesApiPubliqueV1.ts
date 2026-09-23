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
import { serialiseRisquesPourAPIPublique } from '../mappers/risques.mapper.js';
import { AdaptateurEnvironnement } from '../../adaptateurs/adaptateurEnvironnement.interface.js';
import { VersionService } from '../../modeles/versionService.js';

const {
  DROITS_VOIR_INDICE_CYBER,
  DROITS_VOIR_MESURES,
  DROITS_VOIR_STATUT_HOMOLOGATION,
  DROITS_VOIR_RISQUES,
} = Autorisation;

export const routesApiPubliqueV1 = ({
  depotDonnees,
  adaptateurEnvironnement,
}: {
  depotDonnees: DepotDonnees;
  adaptateurEnvironnement: AdaptateurEnvironnement;
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

  routes.get(
    '/services/:id/risques',
    serviceAccessible(DROITS_VOIR_RISQUES),
    (requete: RequeteServiceApiPublique, reponse: Response) => {
      const service = requete.service!;
      const avecRisquesV2 =
        adaptateurEnvironnement.featureFlag().avecRisquesV2() &&
        service.version() === VersionService.v2;

      reponse.json(serialiseRisquesPourAPIPublique(service, { avecRisquesV2 }));
    }
  );

  return routes;
};
