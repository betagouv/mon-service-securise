const Evenement = require('./evenement');
const { ErreurDonneeManquante } = require('./erreurs');

class EvenementModelesMesureSpecifiqueImportes extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    const valide = () => {
      const manque = (donnee) => typeof donnee === 'undefined';

      if (manque(donnees.idUtilisateur))
        throw new ErreurDonneeManquante('idUtilisateur');
      if (manque(donnees.nbModelesMesureSpecifiqueImportes))
        throw new ErreurDonneeManquante('nbModelesMesureSpecifiqueImportes');
    };

    valide();

    super(
      'MODELES_MESURE_SPECIFIQUE_IMPORTES',
      {
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
        nbModelesMesureSpecifiqueImportes:
          donnees.nbModelesMesureSpecifiqueImportes,
      },
      date
    );
  }
}

module.exports = EvenementModelesMesureSpecifiqueImportes;
