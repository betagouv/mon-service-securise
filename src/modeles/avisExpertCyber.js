const { ErreurAvisInvalide, ErreurDateRenouvellementInvalide } = require('../erreurs');

const AVIS_FAVORABLE = 'favorable';
const AVIS_DEFAVORABLE = 'defavorable';

const DATES_RENOUVELLEMENT = {
  RENOUVELLEMENT_DANS_SIX_MOIS: 'renouvellementDansSixMois',
  RENOUVELLEMENT_DANS_UN_AN: 'renouvellementDansUnAn',
  RENOUVELLEMENT_DANS_DEUX_ANS: 'renouvellementDansDeuxAns',
};

const valide = (donnees) => {
  const { avis, dateRenouvellement, commentaire } = donnees;

  if (avis && ![AVIS_FAVORABLE, AVIS_DEFAVORABLE].includes(avis)) {
    throw new ErreurAvisInvalide(`L'avis "${avis}" est invalide`);
  }

  if (dateRenouvellement && !Object.values(DATES_RENOUVELLEMENT).includes(dateRenouvellement)) {
    throw new ErreurDateRenouvellementInvalide(
      `Le délai avant renouvellement "${dateRenouvellement}" est invalide`
    );
  }

  return { avis, dateRenouvellement, commentaire };
};

class AvisExpertCyber {
  constructor(donnees) {
    const { avis, dateRenouvellement, commentaire } = valide(donnees);

    this.avis = avis;
    this.dateRenouvellement = dateRenouvellement;
    this.commentaire = commentaire;
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

Object.keys(DATES_RENOUVELLEMENT).forEach((k) => (AvisExpertCyber[k] = DATES_RENOUVELLEMENT[k]));

module.exports = AvisExpertCyber;
