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
          regles: [{
            presence: ['applicationMobile'],
          }],
          mesuresAAjouter: ['uneMesure', 'uneAutreMesure'],
        },
      },
    } });
    const moteur = new MoteurRegles(referentiel);

    const applicationMobile = new DescriptionService({ typeService: ['applicationMobile'] });
    expect(moteur.mesuresAAjouter(applicationMobile)).to.eql(['uneMesure', 'uneAutreMesure']);
  });

  it('sait gérer des règles faisant intervenir des valeurs booléennes', () => {
    const referentiel = Referentiel.creeReferentiel({ reglesPersonnalisation: {
      clefsDescriptionServiceAConsiderer: ['risqueJuridiqueFinancierReputationnel'],
      profils: {
        unProfil: {
          regles: [{ presence: ['risqueJuridiqueFinancierReputationnel'] }],
          mesuresAAjouter: ['uneMesure'],
        },
      },
    } });
    const moteur = new MoteurRegles(referentiel);

    const descriptionServiceAvecRisque = new DescriptionService({
      risqueJuridiqueFinancierReputationnel: true,
    });
    expect(moteur.mesuresAAjouter(descriptionServiceAvecRisque)).to.eql(['uneMesure']);

    const descriptionServiceSansRisque = new DescriptionService({
      risqueJuridiqueFinancierReputationnel: false,
    });
    expect(moteur.mesuresAAjouter(descriptionServiceSansRisque)).to.eql([]);
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
          regles: [{
            presence: ['applicationMobile'],
          }],
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
          regles: [{
            presence: ['applicationMobile'],
          }],
          mesuresAAjouter: ['uneMesure', 'uneAutreMesure'],
        },
        creationComptes: {
          regles: [{
            presence: ['compte'],
          }],
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
            regles: [{
              presence: ['applicationMobile'],
            }],
            mesuresAAjouter: ['mesureSupplementaire'],
          },
        },
      },
    });
    const moteur = new MoteurRegles(referentiel);

    const applicationMobile = new DescriptionService({ typeService: ['applicationMobile'] });
    const mesures = Object.keys(moteur.mesures(applicationMobile));
    expect(mesures).to.eql(['mesureBase', 'mesureSupplementaire']);
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
            regles: [{
              presence: ['achat'],
            }],
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
            regles: [{
              presence: ['achat'],
            }],
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
              regles: [{
                presence: ['achat'],
              }],
              mesuresARetirer: ['mesureASupprimer'],
            },
          },
        },
      });
      const moteur = new MoteurRegles(referentiel);

      const achat = new DescriptionService({ provenanceService: ['achat'] });
      const mesures = Object.keys(moteur.mesures(achat));
      expect(mesures).to.eql(['mesureBase']);
    });
  });

  it('rend indispensable une mesure', () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: {
        supervision: {},
      },
      reglesPersonnalisation: {
        clefsDescriptionServiceAConsiderer: ['delaiAvantImpactCritique'],
        mesuresBase: [],
        profils: {
          mssPlusPlus: {
            regles: [{
              presence: ['moinsUneHeure'],
            }],
            mesuresAAjouter: ['supervision'],
            mesuresARendreIndispensables: ['supervision'],
          },
        },
      },
    });
    const moteur = new MoteurRegles(referentiel);

    const service = new DescriptionService({ delaiAvantImpactCritique: ['moinsUneHeure'] });
    expect(moteur.mesures(service)).to.eql({ supervision: { indispensable: true } });
  });

  it("change l'importance de la mesure lorsque la description du service change", () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: {
        supervision: {},
      },
      reglesPersonnalisation: {
        clefsDescriptionServiceAConsiderer: ['delaiAvantImpactCritique'],
        mesuresBase: ['supervision'],
        profils: {
          mssPlusPlus: {
            regles: [{
              presence: ['moinsUneHeure'],
            }],
            mesuresARendreIndispensables: ['supervision'],
          },
        },
      },
    });
    const moteur = new MoteurRegles(referentiel);

    let service = new DescriptionService({ delaiAvantImpactCritique: ['moinsUneHeure'] });
    moteur.mesures(service); // Accès au référentiel qui ne devrait pas avoir d'effet de bord
    service = new DescriptionService();
    expect(moteur.mesures(service)).to.eql({ supervision: { indispensable: false } });
  });
});
