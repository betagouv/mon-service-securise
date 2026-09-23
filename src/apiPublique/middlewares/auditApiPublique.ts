import { NextFunction, Response } from 'express';
import { RequeteApiPublique } from './authentificationParCleApi.js';
import { AdaptateurAuditApiPublique } from '../../adaptateurs/adaptateurAuditApiPublique.interface.js';
import { AdaptateurGestionErreur } from '../../adaptateurs/adaptateurGestionErreur.interface.js';

export const auditApiPublique =
  ({
    adaptateurAuditApiPublique,
    adaptateurGestionErreur,
  }: {
    adaptateurAuditApiPublique: AdaptateurAuditApiPublique;
    adaptateurGestionErreur: AdaptateurGestionErreur;
  }) =>
  (requete: RequeteApiPublique, _reponse: Response, suite: NextFunction) => {
    adaptateurAuditApiPublique
      .trace({
        idCleApi: requete.idCleApiCourante!,
        idUtilisateur: requete.idUtilisateurCourant!,
        route: `${requete.baseUrl}${requete.path}`,
        adresseIp: requete.ip!,
      })
      .catch((erreur: Error) => adaptateurGestionErreur.logueErreur(erreur));

    suite();
  };
