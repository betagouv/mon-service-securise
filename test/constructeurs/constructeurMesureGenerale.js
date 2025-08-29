import * as Referentiel from '../../src/referentiel.js';
import MesureGenerale from '../../src/modeles/mesureGenerale.js';

class ConstructeurMesureGenerale {
  constructor(referentiel) {
    this.donnees = {
      id: 'audit',
      statut: 'fait',
      responsables: [],
    };
    this.referentiel = referentiel;
  }

  construis() {
    return new MesureGenerale(this.donnees, this.referentiel);
  }

  avecId(id) {
    this.donnees.id = id;
    this.referentiel.enrichis({
      mesures: { [id]: { categorie: 'gouvernance' } },
    });
    return this;
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

  sansResponsable() {
    this.donnees.responsables = [];
    return this;
  }

  avecResponsable(idUtilisateur) {
    this.donnees.responsables.push(idUtilisateur);
    return this;
  }
}

const uneMesureGenerale = (
  referentiel = Referentiel.creeReferentiel({
    mesures: { audit: { categorie: 'gouvernance' } },
    prioritesMesures: { p1: {}, p2: {}, p3: {} },
  })
) => new ConstructeurMesureGenerale(referentiel);

export { uneMesureGenerale };
