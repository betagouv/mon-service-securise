import type Service from '../service.js';
import { creeReferentielVide } from '../../referentiel.js';
import { Referentiel } from '../../referentiel.interface.js';
import Mesure from '../mesure.js';

class ObjetPDFAnnexeMesures {
  private readonly service: Service;
  private readonly referentiel: Referentiel;

  constructor(
    service: Service,
    referentiel: Referentiel = creeReferentielVide()
  ) {
    this.referentiel = referentiel;
    this.service = service;
  }

  donnees() {
    const { mesuresGenerales } =
      this.service.mesures.enrichiesAvecDonneesPersonnalisees();
    const referentielsConcernes = Object.values(mesuresGenerales)
      .filter((mesure) => !mesure.statut)
      .map((mesure) => mesure.referentiel);
    const referentielsConcernesMesuresNonRenseignees =
      this.referentiel.formatteListeDeReferentiels(referentielsConcernes);

    return {
      statuts: this.referentiel.statutsMesures(),
      statutsAvecFaitALaFin: Mesure.statutsPossibles(true),
      categories: this.referentiel.categoriesMesures(),
      nomService: this.service.nomService(),
      mesuresParStatut: this.service.mesuresParStatutEtCategorie(),
      nbMesuresARemplirToutesCategories:
        this.service.nombreTotalMesuresARemplirToutesCategories(),
      referentielsConcernesMesuresNonRenseignees,
    };
  }
}

export default ObjetPDFAnnexeMesures;
