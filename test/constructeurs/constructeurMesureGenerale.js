const Referentiel = require('../../src/referentiel');
const MesureGenerale = require('../../src/modeles/mesureGenerale');

class ConstructeurMesureGenerale {
  constructor(referentiel) {
    this.donnees = {
      id: 'audit',
      statut: 'fait',
    };
    this.referentiel = referentiel;
  }

  construis() {
    return new MesureGenerale(this.donnees, this.referentiel);
  }

  avecStatut(statut) {
    this.donnees.statut = statut;
    return this;
  }

  sansPriorite() {
    return this.avecPriorite(undefined);
  }

  avecPriorite(priorite) {
    this.donnees.priorite = priorite;
    return this;
  }

  avecEcheance(echeance) {
    this.donnees.echeance = echeance;
    return this;
  }
}

const uneMesureGenerale = (
  referentiel = Referentiel.creeReferentiel({
    mesures: { audit: { categorie: 'gouvernance' } },
    prioritesMesures: { p1: {}, p2: {}, p3: {} },
  })
) => new ConstructeurMesureGenerale(referentiel);

module.exports = { uneMesureGenerale };
