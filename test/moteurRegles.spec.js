const expect = require('expect.js');

const DescriptionService = require('../src/modeles/descriptionService');
const MoteurRegles = require('../src/moteurRegles');
const Referentiel = require('../src/referentiel');

describe('Le moteur de règles', () => {
  it('détermine quelles mesures ajouter en fonction de la description du service', () => {
    const referentiel = Referentiel.creeReferentiel({ reglesPersonnalisation: {
      clefsDescriptionServiceAConsiderer: ['typeService'],
      profils: {
        applicationMobile: {
          regles: {
            presence: ['applicationMobile'],
          },
          mesuresAAjouter: ['uneMesure', 'uneAutreMesure'],
        },
      },
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
      profils: {
        applicationMobile: {
          regles: {
            presence: ['applicationMobile'],
          },
          mesuresAAjouter: ['uneMesure', 'uneAutreMesure'],
        },
      },
    } });
    const moteur = new MoteurRegles(referentiel);

    const siteInternet = new DescriptionService({ typeService: ['siteInternet'] });
    expect(moteur.mesuresAAjouter(siteInternet)).to.eql([]);
  });

  it('ne propose pas de mesures en plusieurs exemplaires', () => {
    const referentiel = Referentiel.creeReferentiel({ reglesPersonnalisation: {
      clefsDescriptionServiceAConsiderer: ['typeService', 'fonctionnalites'],
      profils: {
        applicationMobile: {
          regles: {
            presence: ['applicationMobile'],
          },
          mesuresAAjouter: ['uneMesure', 'uneAutreMesure'],
        },
        creationComptes: {
          regles: {
            presence: ['compte'],
          },
          mesuresAAjouter: ['uneMesure', 'uneTroisiemeMesure'],
        },
      },
    } });
    const moteur = new MoteurRegles(referentiel);

    const siteInternet = new DescriptionService({ typeService: ['applicationMobile'], fonctionnalites: ['compte'] });
    expect(moteur.mesuresAAjouter(siteInternet)).to.eql(['uneMesure', 'uneAutreMesure', 'uneTroisiemeMesure']);
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
        profils: {
          applicationMobile: {
            regles: {
              presence: ['applicationMobile'],
            },
            mesuresAAjouter: ['mesureSupplementaire'],
          },
        },
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

  describe('quand il est faut retirer des mesures', () => {
    it('détermine quelles mesures sont à retirer en fonction de la description du service', () => {
      const referentiel = Referentiel.creeReferentiel({ reglesPersonnalisation: {
        clefsDescriptionServiceAConsiderer: ['provenanceService'],
        profils: {
          applicationAchettee: {
            regles: {
              presence: ['achat'],
            },
            mesuresARetirer: ['uneMesure', 'uneAutreMesure'],
          },
        },
      } });
      const moteur = new MoteurRegles(referentiel);

      const achat = new DescriptionService({ provenanceService: ['achat'] });
      expect(moteur.mesuresARetirer(achat)).to.eql(['uneMesure', 'uneAutreMesure']);
    });

    it('ne retire aucune mesure si aucune règle ne correspond à la description du service', () => {
      const referentiel = Referentiel.creeReferentiel({ reglesPersonnalisation: {
        clefsDescriptionServiceAConsiderer: ['provenanceService'],
        profils: {
          applicationAchettee: {
            regles: {
              presence: ['achat'],
            },
            mesuresARetirer: ['uneMesure', 'uneAutreMesure'],
          },
        },
      } });
      const moteur = new MoteurRegles(referentiel);

      const developpement = new DescriptionService({ provenanceService: ['developpement'] });
      expect(moteur.mesuresARetirer(developpement)).to.eql([]);
    });

    it('retire les mesures à retirer aux mesures de base', () => {
      const referentiel = Referentiel.creeReferentiel({
        mesures: {
          mesureBase: {},
          mesureASupprimer: {},
        },
        reglesPersonnalisation: {
          clefsDescriptionServiceAConsiderer: ['provenanceService'],
          mesuresBase: ['mesureBase', 'mesureASupprimer'],
          profils: {
            applicationAchettee: {
              regles: {
                presence: ['achat'],
              },
              mesuresARetirer: ['mesureASupprimer'],
            },
          },
        },
      });
      const moteur = new MoteurRegles(referentiel);

      const achat = new DescriptionService({ provenanceService: ['achat'] });
      expect(moteur.mesures(achat)).to.eql({
        mesureBase: {},
      });
    });
  });
});
