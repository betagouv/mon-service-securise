const expect = require('expect.js');

const DescriptionService = require('../src/modeles/descriptionService');
const MoteurRegles = require('../src/moteurRegles');
const Referentiel = require('../src/referentiel');

describe('Le moteur de règles', () => {
  it('détermine quelles mesures ajouter en fonction de la description du service', () => {
    const referentiel = Referentiel.creeReferentiel({ reglesPersonnalisation: {
      clefsDescriptionServiceAConsiderer: ['typeService'],
      mesuresAAjouter: { applicationMobile: ['uneMesure', 'uneAutreMesure'] },
    } });
    const moteur = new MoteurRegles(referentiel);

    const applicationMobile = new DescriptionService({ typeService: ['applicationMobile'] });
    expect(moteur.mesuresAAjouter(applicationMobile)).to.eql(['uneMesure', 'uneAutreMesure']);
  });

  it("n'ajoute pas de mesure si le moteur ne contient aucune règle", () => {
    const moteur = new MoteurRegles();

    const applicationMobile = new DescriptionService({ typeService: ['applicationMobile'] });
    expect(moteur.mesuresAAjouter(applicationMobile)).to.eql([]);
  });

  it("n'ajoute pas de mesure si aucune règle ne correspond à la description du service", () => {
    const referentiel = Referentiel.creeReferentiel({ reglesPersonnalisation: {
      clefsDescriptionServiceAConsiderer: ['typeService'],
      mesuresAAjouter: { applicationMobile: ['uneMesure', 'uneAutreMesure'] },
    } });
    const moteur = new MoteurRegles(referentiel);

    const siteInternet = new DescriptionService({ typeService: ['siteInternet'] });
    expect(moteur.mesuresAAjouter(siteInternet)).to.eql([]);
  });

  it('ajoute les mesures à ajouter aux mesures de base', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: {
        mesureBase: {},
        mesureSupplementaire: {},
        mesureIgnoree: {},
      },
      reglesPersonnalisation: {
        clefsDescriptionServiceAConsiderer: ['typeService'],
        mesuresBase: ['mesureBase'],
        mesuresAAjouter: { applicationMobile: ['mesureSupplementaire'] },
      },
    });
    const moteur = new MoteurRegles(referentiel);

    const applicationMobile = new DescriptionService({ typeService: ['applicationMobile'] });
    expect(moteur.mesures(applicationMobile)).to.eql({
      mesureBase: {},
      mesureSupplementaire: {},
    });
  });

  it("reste robuste quand aucune mesure de base n'est spécifiée", () => {
    const moteur = new MoteurRegles();
    const description = new DescriptionService();
    expect(moteur.mesures(description)).to.eql({});
  });
});
