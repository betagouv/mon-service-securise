const { ErreurMesureInconnue, ErreurStatutMesureInvalide } = require('../erreurs');

const STATUTS = {
  STATUT_FAIT: 'fait',
  STATUT_PLANIFIE: 'planifie',
  STATUT_NON_RETENU: 'nonRetenu',
};

const valide = (donnees, referentiel) => {
  const { id, statut, modalites } = donnees;

  const identifiantsMesuresRepertoriees = referentiel.identifiantsMesures();
  if (!identifiantsMesuresRepertoriees.includes(id)) {
    throw new ErreurMesureInconnue(`La mesure "${id}" n'est pas répertoriée`);
  }

  if (!Object.values(STATUTS).includes(statut)) {
    throw new ErreurStatutMesureInvalide(`Le statut "${statut}" est invalide`);
  }

  return { id, statut, modalites };
};

class Mesure {
  constructor(donneesMesure, referentiel) {
    const { id, statut, modalites } = valide(donneesMesure, referentiel);
    this.id = id;
    this.statut = statut;
    this.modalites = modalites;

    this.referentiel = referentiel;
  }

  toJSON() {
    return { id: this.id, statut: this.statut, modalites: this.modalites };
  }

  description() {
    return this.referentiel.mesures()[this.id].description;
  }
}

Object.keys(STATUTS).forEach((s) => (Mesure[s] = STATUTS[s]));

module.exports = Mesure;
