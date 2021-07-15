const { ErreurAvisInvalide, ErreurDateRenouvellementInvalide } = require('../erreurs');
const Referentiel = require('../referentiel');

const AVIS_FAVORABLE = 'favorable';
const AVIS_DEFAVORABLE = 'defavorable';

const valide = (donnees, referentiel) => {
  const { avis, dateRenouvellement, commentaire } = donnees;

  if (avis && ![AVIS_FAVORABLE, AVIS_DEFAVORABLE].includes(avis)) {
    throw new ErreurAvisInvalide(`L'avis "${avis}" est invalide`);
  }

  if (dateRenouvellement
    && !referentiel.identifiantsEcheancesRenouvellement().includes(dateRenouvellement)) {
    throw new ErreurDateRenouvellementInvalide(
      `Le délai avant renouvellement "${dateRenouvellement}" est invalide`
    );
  }

  return { avis, dateRenouvellement, commentaire };
};

class AvisExpertCyber {
  constructor(donnees, referentiel = Referentiel.creeReferentielVide()) {
    const { avis, dateRenouvellement, commentaire } = valide(donnees, referentiel);

    this.avis = avis;
    this.dateRenouvellement = dateRenouvellement;
    this.commentaire = commentaire;

    this.referentiel = referentiel;
  }

  descriptionExpiration() {
    return this.referentiel.descriptionExpiration(this.dateRenouvellement);
  }

  favorable() { return this.avis === AVIS_FAVORABLE; }

  toJSON() {
    return {
      avis: this.avis,
      dateRenouvellement: this.dateRenouvellement,
      commentaire: this.commentaire,
    };
  }
}

AvisExpertCyber.FAVORABLE = AVIS_FAVORABLE;
AvisExpertCyber.DEFAVORABLE = AVIS_DEFAVORABLE;

module.exports = AvisExpertCyber;
