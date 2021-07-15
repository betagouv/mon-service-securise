const Base = require('./base');
const { ErreurAvisInvalide, ErreurDateRenouvellementInvalide } = require('../erreurs');
const Referentiel = require('../referentiel');

const AVIS_FAVORABLE = 'favorable';
const AVIS_DEFAVORABLE = 'defavorable';

const valide = (donnees, referentiel) => {
  const { avis, dateRenouvellement } = donnees;

  if (avis && ![AVIS_FAVORABLE, AVIS_DEFAVORABLE].includes(avis)) {
    throw new ErreurAvisInvalide(`L'avis "${avis}" est invalide`);
  }

  if (dateRenouvellement
    && !referentiel.identifiantsEcheancesRenouvellement().includes(dateRenouvellement)) {
    throw new ErreurDateRenouvellementInvalide(
      `Le délai avant renouvellement "${dateRenouvellement}" est invalide`
    );
  }
};

class AvisExpertCyber extends Base {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super(['avis', 'dateRenouvellement', 'commentaire']);
    valide(donnees, referentiel);
    this.renseigneProprietes(donnees);

    this.referentiel = referentiel;
  }

  descriptionExpiration() {
    return this.referentiel.descriptionExpiration(this.dateRenouvellement);
  }

  favorable() { return this.avis === AVIS_FAVORABLE; }

  inconnu() { return typeof this.avis === 'undefined'; }
}

AvisExpertCyber.FAVORABLE = AVIS_FAVORABLE;
AvisExpertCyber.DEFAVORABLE = AVIS_DEFAVORABLE;

module.exports = AvisExpertCyber;
