const { ErreurDonneesObligatoiresManquantes } = require('../erreurs');
const {
  fabriqueAdaptateurGestionErreur,
} = require('../adaptateurs/fabriqueAdaptateurGestionErreur');
const InformationsHomologation = require('./informationsHomologation');

class Entite extends InformationsHomologation {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: ['siret'],
      proprietesAtomiquesFacultatives: ['nom', 'departement'],
    });
    this.renseigneProprietes(donnees);
  }

  static valideDonnees(donnees = {}) {
    if (typeof donnees.siret !== 'string' || donnees.siret === '') {
      throw new ErreurDonneesObligatoiresManquantes(
        'La propriété "entite.siret" est requise'
      );
    }
  }

  static async completeDonnees(donnees, adaptateurServiceAnnuaire) {
    const organisations =
      await adaptateurServiceAnnuaire.rechercheOrganisations(donnees.siret);
    if (organisations.length !== 1) {
      fabriqueAdaptateurGestionErreur().logueErreur(
        new Error(
          `Une seule organisation était attendue dans la recherche par SIRET`
        ),
        {
          siret: donnees.siret,
          reponseApiEntreprise: organisations,
        }
      );
      return donnees;
    }
    return organisations[0];
  }
}

module.exports = Entite;
