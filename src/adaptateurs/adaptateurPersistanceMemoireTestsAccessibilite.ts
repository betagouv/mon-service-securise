import { unUUIDRandom } from '../../test/constructeurs/UUID.js';
import * as AdaptateurPersistanceMemoire from './adaptateurPersistanceMemoire.js';
import { VersionService } from '../modeles/versionService.js';
import { uneAutorisation } from '../../test/constructeurs/constructeurAutorisation.js';
import { adaptateurChiffrement } from './adaptateurChiffrement.js';
import * as adaptateurEnvironnement from './adaptateurEnvironnement.js';
import { AdaptateurEnvironnementPourChiffrement } from './adaptateurChiffrement.interface.js';
import { donneesTestsAccessibilite } from '../../test_accessibilite/donneesTestAccessibilite.js';
import { unServiceV2 } from '../../test/constructeurs/constructeurService.js';

export const nouvelAdaptateur = () => {
  const chiffrement = adaptateurChiffrement({
    adaptateurEnvironnement:
      adaptateurEnvironnement as AdaptateurEnvironnementPourChiffrement,
  });

  const persistance = AdaptateurPersistanceMemoire.nouvelAdaptateur();
  const { utilisateurLambda, siret, utilisateurAdmin, idService } =
    donneesTestsAccessibilite;

  persistance.ajouteUtilisateur(
    utilisateurLambda.id,
    utilisateurLambda,
    chiffrement.hacheSha256(utilisateurLambda.email)
  );

  persistance.ajouteUtilisateur(
    utilisateurAdmin.id,
    utilisateurAdmin,
    chiffrement.hacheSha256(utilisateurAdmin.email)
  );

  const service = unServiceV2()
    .avecId(idService)
    .avecNomService(`Mon service test ${new Date().getTime()}`)
    .avecOrganisationResponsable({
      siret,
    }).donnees;
  persistance.sauvegardeService(
    service.id,
    service,
    chiffrement.hacheSha256(service.descriptionService.nomService),
    chiffrement.hacheSha256(siret),
    VersionService.v2
  );
  persistance.sauvegardeAutorisation(
    unUUIDRandom(),
    uneAutorisation().deProprietaire(utilisateurLambda.id, service.id).donnees
  );
  persistance.sauvegardeAutorisation(
    unUUIDRandom(),
    uneAutorisation().dAdmin(utilisateurAdmin.id, service.id).donnees
  );

  return persistance;
};
