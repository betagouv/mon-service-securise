const Evenement = require('./evenement');

class EvenementCollaboratifServiceModifie extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = Evenement.optionsParDefaut(options);

    Evenement.verifieProprietesRenseignees(donnees, [
      'idService',
      'autorisations',
    ]);

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
