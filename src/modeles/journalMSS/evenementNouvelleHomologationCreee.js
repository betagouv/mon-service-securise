const Evenement = require('./evenement');
const {
  ErreurIdentifiantServiceManquant,
  ErreurDateHomologationManquante,
  ErreurDureeHomologationManquante,
} = require('./erreurs');

class EvenementNouvelleHomologationCreee extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';

      if (manque(donnees.idService))
        throw new ErreurIdentifiantServiceManquant();
      if (manque(donnees.dateHomologation))
        throw new ErreurDateHomologationManquante();
      if (manque(donnees.dureeHomologationMois))
        throw new ErreurDureeHomologationManquante();
    };

    valide();

    super(
      'NOUVELLE_HOMOLOGATION_CREEE',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        dateHomologation: donnees.dateHomologation,
        dureeHomologationMois: donnees.dureeHomologationMois,
      },
      date
    );
  }
}

module.exports = EvenementNouvelleHomologationCreee;
