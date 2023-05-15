const EvenementCompletudeServiceModifiee = require('../../../src/modeles/journalMSS/evenementCompletudeServiceModifiee');

class ConstructeurEvenementCompletudeServiceModifiee {
  constructor() {
    this.donnees = {
      idService: 'abc',
      nombreTotalMesures: 54,
      nombreMesuresCompletes: 38,
      detailMesures: [{ idMesure: 'analyseRisques', statut: 'fait' }],
      indiceCyber: { total: 4.1 },
    };
    this.date = '14/02/2023';
    this.adaptateurChiffrement = { hacheSha256: (valeur) => valeur };
  }

  avecIdService(idService) {
    this.donnees.idService = idService;
    return this;
  }

  avecIndiceCyber(indiceCyber) {
    this.donnees.indiceCyber = indiceCyber;
    return this;
  }

  quiChiffreAvec(adaptateurChiffrement) {
    this.adaptateurChiffrement = adaptateurChiffrement;
    return this;
  }

  sans(propriete) {
    delete this.donnees[propriete];
    return this;
  }

  construis() {
    return new EvenementCompletudeServiceModifiee(this.donnees, {
      date: this.date,
      adaptateurChiffrement: this.adaptateurChiffrement,
    });
  }
}

module.exports = ConstructeurEvenementCompletudeServiceModifiee;
