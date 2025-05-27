const ElementsConstructibles = require('../elementsConstructibles');
const ServiceTeleverse = require('./serviceTeleverse');
const Referentiel = require('../../referentiel');
const EvenementServicesImportes = require('../../bus/evenementServicesImportes');
const EvenementDossierHomologationImporte = require('../../bus/evenementDossierHomologationImporte');

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

    const promessesCreationService = this.tous().map((serviceTeleverse) =>
      creeUnService(serviceTeleverse)
    );
    await Promise.all(promessesCreationService);

    await busEvenements.publie(
      new EvenementServicesImportes({
        idUtilisateur,
        nbServicesImportes: this.tous().length,
      })
    );
  }
}

module.exports = TeleversementServices;
