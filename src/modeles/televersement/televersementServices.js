import ElementsConstructibles from '../elementsConstructibles.js';
import ServiceTeleverse from './serviceTeleverse.js';
import * as Referentiel from '../../referentiel.js';
import EvenementServicesImportes from '../../bus/evenementServicesImportes.js';
import EvenementDossierHomologationImporte from '../../bus/evenementDossierHomologationImporte.js';

const STATUT = {
  INVALIDE: 'INVALIDE',
  VALIDE: 'VALIDE',
};

class TeleversementServices extends ElementsConstructibles {
  constructor(donnees, referentiel = Referentiel.creeReferentielVide()) {
    const { services } = donnees;
    super(ServiceTeleverse, { items: services }, referentiel);
  }

  valide(nomServicesExistants = []) {
    const nomsAggreges = [...nomServicesExistants];
    return this.tous().map((serviceTeleverse) => {
      const resultat = serviceTeleverse.valide(nomsAggreges);
      nomsAggreges.push(serviceTeleverse.nom);
      return resultat;
    });
  }

  rapportDetaille(nomServicesExistants = []) {
    const erreurs = this.valide(nomServicesExistants);
    const statut =
      erreurs.some((e) => e.length) || this.tous().length === 0
        ? STATUT.INVALIDE
        : STATUT.VALIDE;
    return {
      statut,
      services: this.tous().map((serviceTeleverse, index) => ({
        service: serviceTeleverse.toJSON(),
        erreurs: erreurs[index],
        numeroLigne: index + 1,
      })),
    };
  }

  async creeLesServices(idUtilisateur, depotDonnees, busEvenements) {
    const creeUnService = async (serviceTeleverse) => {
      const { descriptionService, dossier } =
        serviceTeleverse.enDonneesService();
      const idService = await depotDonnees.nouveauService(idUtilisateur, {
        descriptionService,
      });

      if (dossier) {
        const { autorite, decision } = dossier;
        const dossierMetier =
          await depotDonnees.ajouteDossierCourantSiNecessaire(idService);
        dossierMetier.enregistreAutoriteHomologation(
          autorite.nom,
          autorite.fonction
        );
        dossierMetier.declareSansAvis();
        dossierMetier.declareSansDocument();
        dossierMetier.enregistreDateTelechargement(decision.dateHomologation);
        dossierMetier.enregistreDecision(
          decision.dateHomologation,
          decision.dureeValidite
        );
        dossierMetier.declareImporte();
        await busEvenements.publie(
          new EvenementDossierHomologationImporte({
            idService,
            dossier: dossierMetier,
          })
        );
        dossierMetier.enregistreFinalisation();
        await depotDonnees.enregistreDossier(idService, dossierMetier);
      }

      await depotDonnees.ajouteSuggestionAction(
        idService,
        'finalisationDescriptionServiceImporte'
      );
    };

    const tousLesServices = this.tous();
    let index = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const serviceTeleverse of tousLesServices) {
      // eslint-disable-next-line no-await-in-loop
      await creeUnService(serviceTeleverse);
      // eslint-disable-next-line no-await-in-loop
      await depotDonnees.metsAJourProgressionTeleversement(
        idUtilisateur,
        index
      );
      index += 1;
    }

    await busEvenements.publie(
      new EvenementServicesImportes({
        idUtilisateur,
        nbServicesImportes: tousLesServices.length,
      })
    );
  }
}

export default TeleversementServices;
