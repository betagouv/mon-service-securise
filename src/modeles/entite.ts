import { ErreurDonneesObligatoiresManquantes } from '../erreurs.js';
import { fabriqueAdaptateurGestionErreur } from '../adaptateurs/fabriqueAdaptateurGestionErreur.js';
import InformationsService from './informationsService.js';
import { ServiceAnnuaire } from '../annuaire/serviceAnnuaire.interface.js';

export type DonneesEntite = {
  siret: string;
  nom?: string;
  departement?: string;
};

class Entite extends InformationsService {
  readonly siret!: string;
  readonly nom?: string;
  readonly departement?: string;

  constructor(donnees: Partial<DonneesEntite> = {}) {
    super({
      proprietesAtomiquesRequises: ['siret'],
      proprietesAtomiquesFacultatives: ['nom', 'departement'],
    });
    this.renseigneProprietes(donnees);
  }

  static valideDonnees(donnees: Partial<DonneesEntite>) {
    if (typeof donnees.siret !== 'string' || donnees.siret === '') {
      throw new ErreurDonneesObligatoiresManquantes(
        'La propriété "entite.siret" est requise'
      );
    }
  }

  static async completeDonnees(
    donnees: DonneesEntite,
    serviceAnnuaire: ServiceAnnuaire
  ) {
    const organisations = await serviceAnnuaire.rechercheOrganisations(
      donnees.siret
    );
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

export default Entite;
