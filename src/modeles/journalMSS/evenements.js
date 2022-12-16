const AdaptateurChiffrement = require('../../adaptateurs/adaptateurChiffrement');

const {
  ErreurIdentifiantServiceManquant,
  ErreurIdentifiantUtilisateurManquant,
  ErreurNombreMesuresCompletesManquant,
  ErreurNombreTotalMesuresManquant,
} = require('./erreurs');

class Evenement {
  constructor(type, donnees, date) {
    this.type = type;
    this.donnees = donnees;
    this.date = date;
  }

  toJSON() {
    return {
      type: this.type,
      donnees: this.donnees,
      date: this.date,
    };
  }
}

const optionsParDefaut = (options) => ({
  date: options.date ?? Date.now(),
  adaptateurChiffrement: options.adaptateurChiffrement ?? AdaptateurChiffrement,
});

class EvenementNouveauServiceCree extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = optionsParDefaut(options);

    const valide = () => {
      if (!donnees.idService) throw new ErreurIdentifiantServiceManquant();
      if (!donnees.idUtilisateur) throw new ErreurIdentifiantUtilisateurManquant();
    };

    valide();

    super(
      'NOUVEAU_SERVICE_CREE',
      {
        idService: adaptateurChiffrement.hacheSha256(donnees.idService),
        idUtilisateur: adaptateurChiffrement.hacheSha256(donnees.idUtilisateur),
      },
      date
    );
  }
}

class EvenementCompletudeServiceModifiee extends Evenement {
  constructor(donnees, options = {}) {
    const { date, adaptateurChiffrement } = optionsParDefaut(options);

    const valide = () => {
      if (!donnees.idService) throw new ErreurIdentifiantServiceManquant();
      if (!donnees.nombreTotalMesures) throw new ErreurNombreTotalMesuresManquant();
      if (!donnees.nombreMesuresCompletes) throw new ErreurNombreMesuresCompletesManquant();
    };

    valide();

    super(
      'COMPLETUDE_SERVICE_MODIFIEE',
      { ...donnees, idService: adaptateurChiffrement.hacheSha256(donnees.idService) },
      date
    );
  }
}

module.exports = {
  EvenementNouveauServiceCree,
  EvenementCompletudeServiceModifiee,
};
