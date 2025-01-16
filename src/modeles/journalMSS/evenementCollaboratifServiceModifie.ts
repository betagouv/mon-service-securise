const Evenement = require('./evenement');
const {
  ErreurIdentifiantServiceManquant,
  ErreurAutorisationsServiceManquantes,
} = require('./erreurs');

class EvenementCollaboratifServiceModifie extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';

      if (manque(donnees.idService))
        throw new ErreurIdentifiantServiceManquant();
      if (manque(donnees.autorisations) || donnees.autorisations.length === 0)
        throw new ErreurAutorisationsServiceManquantes();
    };

    valide();

    super(
      'COLLABORATIF_SERVICE_MODIFIE',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        autorisations: donnees.autorisations.map((a) => ({
          idUtilisateur: adaptateurChiffrement.hacheSha256(a.idUtilisateur),
          droit: a.droit,
        })),
      },
      date
    );
  }
}

module.exports = { EvenementCollaboratifServiceModifie };
