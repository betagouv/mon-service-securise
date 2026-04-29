import Evenement from './evenement.js';

class EvenementNouvelleHomologationCreee extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const proprietesRequises = donnees.refusee
      ? ['idService', 'dateHomologation']
      : ['idService', 'dateHomologation', 'dureeHomologationMois'];

    Evenement.verifieProprietesRenseignees(donnees, proprietesRequises);

    super(
      'NOUVELLE_HOMOLOGATION_CREEE',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        dateHomologation: donnees.dateHomologation,
        dureeHomologationMois: donnees.dureeHomologationMois,
        ...(donnees.refusee && { refusee: true }),
        ...(donnees.importe && { importe: true }),
      },
      date
    );
  }
}

export default EvenementNouvelleHomologationCreee;
