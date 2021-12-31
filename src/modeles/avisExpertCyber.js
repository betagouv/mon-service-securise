const InformationsHomologation = require('./informationsHomologation');
const { ErreurAvisInvalide, ErreurDateRenouvellementInvalide } = require('../erreurs');
const Referentiel = require('../referentiel');

const AVIS = {
  FAVORABLE: 'favorable',
  DEFAVORABLE: 'defavorable',
};

const valide = (donnees, referentiel) => {
  const { avis, dateRenouvellement } = donnees;

  if (avis && !Object.values(AVIS).includes(avis)) {
    throw new ErreurAvisInvalide(`L'avis "${avis}" est invalide`);
  }

  if (dateRenouvellement
    && !referentiel.identifiantsEcheancesRenouvellement().includes(dateRenouvellement)) {
    throw new ErreurDateRenouvellementInvalide(
      `Le délai avant renouvellement "${dateRenouvellement}" est invalide`
    );
  }
};

class AvisExpertCyber extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({ proprietesAtomiquesRequises: ['avis', 'dateRenouvellement', 'commentaire'] });
    valide(donnees, referentiel);
    this.renseigneProprietes(donnees);

    this.referentiel = referentiel;
  }

  descriptionExpiration() {
    return this.referentiel.descriptionExpiration(this.dateRenouvellement);
  }

  favorable() { return this.avis === AVIS.FAVORABLE; }

  defavorable() { return this.avis === AVIS.DEFAVORABLE; }

  inconnu() { return typeof this.avis === 'undefined'; }
}

Object.assign(AvisExpertCyber, AVIS);

module.exports = AvisExpertCyber;
