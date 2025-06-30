const Evenement = require('./evenement');

class EvenementMesureModifieeEnMasse extends Evenement {
  constructor(
    {
      idUtilisateur,
      type,
      idMesure,
      statutModifie,
      modalitesModifiees,
      nombreServicesConcernes,
    },
    options = {}
  ) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    super(
      'MESURE_MODIFIEE_EN_MASSE',
      {
        idUtilisateur: adaptateurChiffrement.hacheSha256(idUtilisateur),
        type,
        idMesure,
        statutModifie,
        modalitesModifiees,
        nombreServicesConcernes,
      },
      date
    );
  }
}

module.exports = { EvenementMesureModifieeEnMasse };
