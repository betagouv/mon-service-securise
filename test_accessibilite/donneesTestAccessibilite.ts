import { unUtilisateur } from '../test/constructeurs/constructeurUtilisateur.js';
import donnees from '../donneesReferentiel.js';
import { UUID } from '../src/typesBasiques.js';
import { DonneesUtilisateur } from '../src/modeles/utilisateur.js';
import { unUUIDRandom } from '../test/constructeurs/UUID.js';
import Entite from '../src/modeles/entite.js';

const siret = '13000766900018';
const entite = new Entite({ siret, nom: 'ANSSI', departement: '75' });

const idAdmin: UUID = 'b34d658a-6805-4225-93f0-91c94054ec09';
const emailAdmin = 'admin@mss.fr';
const utilisateurAdmin = unUtilisateur()
  .avecId(idAdmin)
  .avecEmail(emailAdmin)
  .quiAccepteCGU(donnees.versionActuelleCgu)
  .quiTravaillePourUneEntiteAvecSiret(siret)
  .quiSAppelle(`Administrateur ${emailAdmin}`)
  .donnees as unknown as DonneesUtilisateur;

const emailSuperviseur = 'superviseur@mss.fr';
const idSuperviseur = '5463b7c3-5b33-41e5-be2b-6d05bb09e93d';
const utilisateurSuperviseur = unUtilisateur()
  .avecId(idSuperviseur)
  .avecEmail(emailSuperviseur)
  .quiAccepteCGU(donnees.versionActuelleCgu)
  .quiTravaillePourUneEntiteAvecSiret(siret)
  .quiSAppelle(`Superviseur ${emailSuperviseur}`)
  .donnees as unknown as DonneesUtilisateur;

const emailUtilisateur = 'utilisateur@mss.fr';
const idUtilisateur = unUUIDRandom();
const utilisateurLambda = unUtilisateur()
  .avecId(idUtilisateur)
  .avecEmail(emailUtilisateur)
  .quiAccepteCGU(donnees.versionActuelleCgu)
  .quiTravaillePourUneEntiteAvecSiret(siret)
  .quiSAppelle('Utilisateur Lambda').donnees as unknown as DonneesUtilisateur;

const utilisateurFuturAdmin = unUtilisateur()
  .avecId(unUUIDRandom())
  .avecEmail('futur-admin@mss.fr')
  .quiAccepteCGU(donnees.versionActuelleCgu)
  .quiTravaillePourUneEntiteAvecSiret(siret)
  .quiSAppelle('Utilisateur FuturAdmin')
  .donnees as unknown as DonneesUtilisateur;

const idServiceV2 = '85b26710-0d8b-404b-bfe4-0d30b7a878c1';
const idServiceV1 = '1832e76a-8591-4f3d-880e-0319356d1d54';

export const donneesTestsAccessibilite = {
  idServiceV1,
  idServiceV2,
  entite,
  utilisateurAdmin,
  utilisateurLambda,
  utilisateurSuperviseur,
  utilisateurFuturAdmin,
};
