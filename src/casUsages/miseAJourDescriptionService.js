const DescriptionService = require('../modeles/descriptionService');
const {
  ErreurDonneesObligatoiresManquantes,
  ErreurNomServiceDejaExistant,
} = require('../erreurs');
const EvenementCompletudeServiceModifiee = require('../modeles/journalMSS/evenementCompletudeServiceModifiee');

class MiseAJourDescriptionService {
  constructor(depotDonnees, adaptateurJournalMSS) {
    this.depotDonnees = depotDonnees;
    this.adaptateurJournalMSS = adaptateurJournalMSS;
  }

  async execute(homologation, nouvelleDescription, idUtilisateur) {
    if (
      !DescriptionService.proprietesObligatoiresRenseignees(nouvelleDescription)
    )
      throw new ErreurDonneesObligatoiresManquantes(
        'Certaines données obligatoires ne sont pas renseignées'
      );

    const nouveauNom = nouvelleDescription.nomService;
    const nomEnDoublon = await this.depotDonnees.homologationExiste(
      idUtilisateur,
      nouveauNom,
      homologation.id
    );

    if (nomEnDoublon)
      throw new ErreurNomServiceDejaExistant(
        `Le nom du service "${nouveauNom}" existe déjà pour une autre homologation`
      );

    homologation.metsAJourDescription(nouvelleDescription);
    await this.depotDonnees.sauvegardeHomologation(homologation);
    await this.consigneEvenement(homologation);
  }

  async consigneEvenement(homologation) {
    const evenement = new EvenementCompletudeServiceModifiee({
      idService: homologation.id,
      ...homologation.completudeMesures(),
    });
    await this.adaptateurJournalMSS.consigneEvenement(evenement.toJSON());
  }
}

module.exports = { MiseAJourDescriptionService };
