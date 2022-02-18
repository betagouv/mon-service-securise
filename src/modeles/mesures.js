const InformationsHomologation = require('./informationsHomologation');
const MesuresGenerales = require('./mesuresGenerales');
const MesuresSpecifiques = require('./mesuresSpecifiques');
const Referentiel = require('../referentiel');
const ajouteInformationsModales = () => {
    $('.information').click((eInformation) => {
      $('body').css('overflow', 'hidden');
      $('.rideau', $(eInformation.target)).css('display', 'flex');

      $('.fermeture-modale', $(eInformation.target)).click((eFermeture) => {
        eFermeture.stopPropagation();
        $('.rideau', $(eInformation.target)).css('display', '');
        $('body').css('overflow', '');
      });
    });
  };

class Mesures extends InformationsHomologation {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      listesAgregats: {
        mesuresGenerales: MesuresGenerales,
        mesuresSpecifiques: MesuresSpecifiques,
      },
    });
    this.renseigneProprietes(donnees, referentiel);
    this.referentiel = referentiel;
  }

  nonSaisies() {
    return this.mesuresGenerales.nonSaisies();
  }

  proportion(...params) {
    return this.mesuresGenerales.proportion(...params);
  }

  statistiques() {
    return this.mesuresGenerales.statistiques();
  }
}

module.exports = Mesures;
