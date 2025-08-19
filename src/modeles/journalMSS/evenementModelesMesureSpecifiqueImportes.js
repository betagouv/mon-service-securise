const Evenement = require('./evenement');

class EvenementModelesMesureSpecifiqueImportes extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.valide(donnees, [
      'idUtilisateur',
      'nbModelesMesureSpecifiqueImportes',
    ]);

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
