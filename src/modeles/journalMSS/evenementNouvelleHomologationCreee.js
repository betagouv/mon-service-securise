const Evenement = require('./evenement');

class EvenementNouvelleHomologationCreee extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.valide(donnees, [
      'idService',
      'dateHomologation',
      'dureeHomologationMois',
    ]);

    super(
      'NOUVELLE_HOMOLOGATION_CREEE',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        dateHomologation: donnees.dateHomologation,
        dureeHomologationMois: donnees.dureeHomologationMois,
        ...(donnees.importe && { importe: true }),
      },
      date
    );
  }
}

module.exports = EvenementNouvelleHomologationCreee;
