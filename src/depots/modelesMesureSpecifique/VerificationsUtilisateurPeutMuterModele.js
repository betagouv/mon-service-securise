import {
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurServiceInexistant,
  ErreurAutorisationInexistante,
  ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique,
} from '../../erreurs.js';

import {
  Permissions,
  Rubriques,
} from '../../modeles/autorisations/gestionDroits.js';

const { ECRITURE } = Permissions;
const { SECURISER } = Rubriques;

class VerificationsUtilisateurPeutMuterModele {
  constructor({ adaptateurPersistance, depotAutorisations }) {
    this.persistance = adaptateurPersistance;
    this.depotAutorisations = depotAutorisations;
  }

  async toutes(idModele, idsServices, idUtilisateur) {
    await this.queModeleExiste(idModele);
    await this.queUtilisateurPossedeLeModele(idUtilisateur, idModele);
    if (idsServices.length > 0) {
      await this.queTousLesServicesExistent(idsServices);
      await this.aLesDroitsSuffisantsPourModifierUneMesureSurDesServices(
        idUtilisateur,
        idsServices
      );
    }
  }

  async queModeleExiste(idModele) {
    const modeleExiste =
      await this.persistance.verifieModeleMesureSpecifiqueExiste(idModele);
    if (!modeleExiste)
      throw new ErreurModeleDeMesureSpecifiqueIntrouvable(idModele);
  }

  async queTousLesServicesExistent(idsServices) {
    const tousServicesExistent =
      await this.persistance.verifieTousLesServicesExistent(idsServices);

    if (!tousServicesExistent) throw new ErreurServiceInexistant();
  }

  async queUtilisateurPossedeLeModele(idUtilisateur, idModele) {
    const possedeLeModele =
      await this.persistance.modeleMesureSpecifiqueAppartientA(
        idUtilisateur,
        idModele
      );

    if (!possedeLeModele)
      throw new ErreurAutorisationInexistante(
        `L'utilisateur ${idUtilisateur} n'est pas propriétaire du modèle ${idModele} qu'il veut modifier.`
      );
  }

  async aLesDroitsSuffisantsPourModifierUneMesureSurDesServices(
    idUtilisateur,
    idsServices
  ) {
    const droitsRequis = { [SECURISER]: ECRITURE };
    const droitsSontSuffisants =
      await this.depotAutorisations.accesAutoriseAUneListeDeService(
        idUtilisateur,
        idsServices,
        droitsRequis
      );

    if (!droitsSontSuffisants)
      throw new ErreurDroitsInsuffisantsPourModelesDeMesureSpecifique(
        idUtilisateur,
        idsServices,
        droitsRequis
      );
  }
}

export { VerificationsUtilisateurPeutMuterModele };
