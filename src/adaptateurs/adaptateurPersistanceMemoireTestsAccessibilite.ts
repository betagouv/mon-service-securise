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
import { UUID } from '../typesBasiques.js';

export const nouvelAdaptateur = () => {
  const chiffrement = adaptateurChiffrement({
    adaptateurEnvironnement:
      adaptateurEnvironnement as AdaptateurEnvironnementPourChiffrement,
  });

  const siret = process.env.ACCESSIBILITE_SIRET!;
  const emailUtilisateur = process.env.ACCESSIBILITE_EMAIL_CONNEXION!;
  const idService = process.env.ACCESSIBILITE_ID_SERVICE!;
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

  const idAdmin = process.env.ACCESSIBILITE_ID_ADMIN! as UUID;
  const emailAdmin = process.env.ACCESSIBILITE_EMAIL_ADMIN!;
  persistance.ajouteUtilisateur(
    idAdmin,
    unUtilisateur()
      .avecEmail(emailAdmin)
      .quiAccepteCGU(donnees.versionActuelleCgu)
      .quiTravaillePourUneEntiteAvecSiret(siret)
      .quiSAppelle(`Administrateur ${emailAdmin}`).donnees,
    chiffrement.hacheSha256(emailAdmin)
  );

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
  persistance.sauvegardeAutorisation(
    unUUIDRandom(),
    uneAutorisation().dAdmin(idAdmin, idService).donnees
  );

  return persistance;
};
