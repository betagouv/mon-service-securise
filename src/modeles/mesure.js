const Base = require('./base');
const { ErreurMesureInconnue, ErreurStatutMesureInvalide } = require('../erreurs');

const STATUTS = {
  STATUT_FAIT: 'fait',
  STATUT_PLANIFIE: 'planifie',
  STATUT_NON_RETENU: 'nonRetenu',
};

const valide = (donnees, referentiel) => {
  const { id, statut } = donnees;

  const identifiantsMesuresRepertoriees = referentiel.identifiantsMesures();
  if (!identifiantsMesuresRepertoriees.includes(id)) {
    throw new ErreurMesureInconnue(`La mesure "${id}" n'est pas répertoriée`);
  }

  if (!Object.values(STATUTS).includes(statut)) {
    throw new ErreurStatutMesureInvalide(`Le statut "${statut}" est invalide`);
  }
};

class Mesure extends Base {
  constructor(donneesMesure, referentiel) {
    super(['id', 'statut', 'modalites']);

    valide(donneesMesure, referentiel);
    this.renseigneProprietes(donneesMesure);

    this.referentiel = referentiel;
  }

  donneesReferentiel() {
    return this.referentiel.mesures()[this.id];
  }

  description() {
    return this.donneesReferentiel().description;
  }

  estIndispensable() {
    return !!this.donneesReferentiel().indispensable;
  }

  estRecommandee() {
    return !this.estIndispensable();
  }

  miseEnOeuvre() {
    return this.statut === STATUTS.STATUT_FAIT;
  }

  nonRetenue() {
    return this.statut === STATUTS.STATUT_NON_RETENU;
  }
}

Object.assign(Mesure, STATUTS);

module.exports = Mesure;
