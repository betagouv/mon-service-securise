import { NextFunction, Response } from 'express';
import { z } from 'zod';
import { RequeteApiPublique } from './authentificationParCleApi.js';
import { DepotDonnees } from '../../depotDonnees.interface.js';
import { Droits } from '../../modeles/autorisations/gestionDroits.js';
import Service from '../../modeles/service.js';

export type RequeteServiceApiPublique = RequeteApiPublique & {
  service?: Service;
};

export const chargeServiceAccessible =
  ({ depotDonnees }: { depotDonnees: DepotDonnees }) =>
  (droitsRequis: Partial<Droits>) =>
  async (
    requete: RequeteServiceApiPublique,
    reponse: Response,
    suite: NextFunction
  ): Promise<void> => {
    const idService = requete.params.id;
    if (!z.uuid().safeParse(idService).success) {
      reponse.status(400).json({ erreur: 'PARAMETRE_INVALIDE' });
      return;
    }

    const autorisation = await depotDonnees.autorisationPour(
      requete.idUtilisateurCourant!,
      idService
    );
    const service = autorisation && (await depotDonnees.service(idService));
    if (!service) {
      reponse.status(404).json({ erreur: 'RESSOURCE_INEXISTANTE' });
      return;
    }

    if (!autorisation.aLesPermissions(droitsRequis)) {
      reponse.status(403).json({ erreur: 'DROITS_INSUFFISANTS' });
      return;
    }

    requete.service = service;
    suite();
  };
