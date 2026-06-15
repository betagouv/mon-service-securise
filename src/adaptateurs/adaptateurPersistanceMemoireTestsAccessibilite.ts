import { unUUIDRandom } from '../../test/constructeurs/UUID.js';
import * as AdaptateurPersistanceMemoire from './adaptateurPersistanceMemoire.js';
import { unUtilisateur } from '../../test/constructeurs/constructeurUtilisateur.js';
import donnees from '../../donneesReferentiel.js';
import { unServiceV2 } from '../../test/constructeurs/constructeurService.js';
import { VersionService } from '../modeles/versionService.js';
import { uneAutorisation } from '../../test/constructeurs/constructeurAutorisation.js';
import { adaptateurChiffrement } from './adaptateurChiffrement.js';
import * as adaptateurEnvironnement from './adaptateurEnvironnement.js';
import { AdaptateurEnvironnementPourChiffrement } from './adaptateurChiffrement.interface.js';

export const nouvelAdaptateur = () => {
  const chiffrement = adaptateurChiffrement({
    adaptateurEnvironnement:
      adaptateurEnvironnement as AdaptateurEnvironnementPourChiffrement,
  });

  const siret = process.env.SIRET!;
  const emailUtilisateur = process.env.EMAIL_CONNEXION!;
  const idUtilisateur = unUUIDRandom();

  const persistance = AdaptateurPersistanceMemoire.nouvelAdaptateur();
  persistance.ajouteUtilisateur(
    idUtilisateur,
    unUtilisateur()
      .avecEmail(emailUtilisateur)
      .quiAccepteCGU(donnees.versionActuelleCgu)
      .quiTravaillePourUneEntiteAvecSiret(siret)
      .quiSAppelle('Utilisateur Lambda').donnees,
    chiffrement.hacheSha256(emailUtilisateur)
  );

  const idService = process.env.ID_SERVICE!;
  const nomService = `Mon service test ${new Date().getTime()}`;
  persistance.sauvegardeService(
    idService,
    unServiceV2()
      .avecId(idService)
      .avecNomService(nomService)
      .avecOrganisationResponsable({ siret }).donnees,
    chiffrement.hacheSha256(nomService),
    chiffrement.hacheSha256(siret),
    VersionService.v2
  );
  persistance.sauvegardeAutorisation(
    unUUIDRandom(),
    uneAutorisation().deProprietaire(idUtilisateur, idService).donnees
  );

  return persistance;
};
