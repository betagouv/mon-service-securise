import DescriptionService from '../../../src/modeles/descriptionService.js';
import MoteurRegles from '../../../src/moteurRegles/v1/moteurRegles.js';
import { creeReferentiel } from '../../../src/referentiel.js';
import { donneesReferentielDeTest } from '../../constructeurs/referentielDeTest.ts';

describe('Le moteur de règles', () => {
  it('détermine quelles mesures ajouter en fonction de la description du service', () => {
    const referentiel = creeReferentiel(
      donneesReferentielDeTest({
        reglesPersonnalisation: {
          clefsDescriptionServiceAConsiderer: ['typeService'],
          profils: {
            applicationMobile: {
              regles: [
                {
                  presence: ['applicationMobile'],
                },
              ],
              mesuresAAjouter: ['uneMesure', 'uneAutreMesure'],
            },
          },
        },
      })
    );
    const moteur = new MoteurRegles(referentiel);

    const applicationMobile = new DescriptionService({
      typeService: ['applicationMobile'],
    });
    expect(moteur.mesuresAAjouter(applicationMobile)).toEqual([
      'uneMesure',
      'uneAutreMesure',
    ]);
  });

  it("n'ajoute pas de mesure si le moteur ne contient aucune règle", () => {
    const moteur = new MoteurRegles();

    const applicationMobile = new DescriptionService({
      typeService: ['applicationMobile'],
    });
    expect(moteur.mesuresAAjouter(applicationMobile)).toEqual([]);
  });

  it("n'ajoute pas de mesure si aucune règle ne correspond à la description du service", () => {
    const referentiel = creeReferentiel(
      donneesReferentielDeTest({
        reglesPersonnalisation: {
          clefsDescriptionServiceAConsiderer: ['typeService'],
          profils: {
            applicationMobile: {
              regles: [
                {
                  presence: ['applicationMobile'],
                },
              ],
              mesuresAAjouter: ['uneMesure', 'uneAutreMesure'],
            },
          },
        },
      })
    );
    const moteur = new MoteurRegles(referentiel);

    const siteInternet = new DescriptionService({
      typeService: ['siteInternet'],
    });
    expect(moteur.mesuresAAjouter(siteInternet)).toEqual([]);
  });

  it('ne propose pas de mesures en plusieurs exemplaires', () => {
    const referentiel = creeReferentiel(
      donneesReferentielDeTest({
        reglesPersonnalisation: {
          clefsDescriptionServiceAConsiderer: [
            'typeService',
            'fonctionnalites',
          ],
          profils: {
            applicationMobile: {
              regles: [
                {
                  presence: ['applicationMobile'],
                },
              ],
              mesuresAAjouter: ['uneMesure', 'uneAutreMesure'],
            },
            creationComptes: {
              regles: [
                {
                  presence: ['compte'],
                },
              ],
              mesuresAAjouter: ['uneMesure', 'uneTroisiemeMesure'],
            },
          },
        },
      })
    );
    const moteur = new MoteurRegles(referentiel);

    const siteInternet = new DescriptionService({
      typeService: ['applicationMobile'],
      fonctionnalites: ['compte'],
    });
    expect(moteur.mesuresAAjouter(siteInternet)).toEqual([
      'uneMesure',
      'uneAutreMesure',
      'uneTroisiemeMesure',
    ]);
  });

  it('ajoute les mesures à ajouter aux mesures de base', () => {
    const referentiel = creeReferentiel(
      donneesReferentielDeTest({
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
              regles: [
                {
                  presence: ['applicationMobile'],
                },
              ],
              mesuresAAjouter: ['mesureSupplementaire'],
            },
          },
        },
      })
    );
    const moteur = new MoteurRegles(referentiel);

    const applicationMobile = new DescriptionService({
      typeService: ['applicationMobile'],
    });
    const mesures = Object.keys(moteur.mesures(applicationMobile));
    expect(mesures).toEqual(['mesureBase', 'mesureSupplementaire']);
  });

  it("reste robuste quand aucune mesure de base n'est spécifiée", () => {
    const moteur = new MoteurRegles();
    const description = new DescriptionService();
    expect(moteur.mesures(description)).toEqual({});
  });

  describe('quand il est faut retirer des mesures', () => {
    it('détermine quelles mesures sont à retirer en fonction de la description du service', () => {
      const referentiel = creeReferentiel(
        donneesReferentielDeTest({
          reglesPersonnalisation: {
            clefsDescriptionServiceAConsiderer: ['provenanceService'],
            profils: {
              applicationAchettee: {
                regles: [
                  {
                    presence: ['achat'],
                  },
                ],
                mesuresARetirer: ['uneMesure', 'uneAutreMesure'],
              },
            },
          },
        })
      );
      const moteur = new MoteurRegles(referentiel);

      const achat = new DescriptionService({ provenanceService: 'achat' });
      expect(moteur.mesuresARetirer(achat)).toEqual([
        'uneMesure',
        'uneAutreMesure',
      ]);
    });

    it('ne retire aucune mesure si aucune règle ne correspond à la description du service', () => {
      const referentiel = creeReferentiel(
        donneesReferentielDeTest({
          reglesPersonnalisation: {
            clefsDescriptionServiceAConsiderer: ['provenanceService'],
            profils: {
              applicationAchettee: {
                regles: [
                  {
                    presence: ['achat'],
                  },
                ],
                mesuresARetirer: ['uneMesure', 'uneAutreMesure'],
              },
            },
          },
        })
      );
      const moteur = new MoteurRegles(referentiel);

      const developpement = new DescriptionService({
        provenanceService: 'developpement',
      });
      expect(moteur.mesuresARetirer(developpement)).toEqual([]);
    });

    it('retire les mesures à retirer aux mesures de base', () => {
      const referentiel = creeReferentiel(
        donneesReferentielDeTest({
          mesures: {
            mesureBase: {},
            mesureASupprimer: {},
          },
          reglesPersonnalisation: {
            clefsDescriptionServiceAConsiderer: ['provenanceService'],
            mesuresBase: ['mesureBase', 'mesureASupprimer'],
            profils: {
              applicationAchettee: {
                regles: [
                  {
                    presence: ['achat'],
                  },
                ],
                mesuresARetirer: ['mesureASupprimer'],
              },
            },
          },
        })
      );
      const moteur = new MoteurRegles(referentiel);

      const achat = new DescriptionService({ provenanceService: 'achat' });
      const mesures = Object.keys(moteur.mesures(achat));
      expect(mesures).toEqual(['mesureBase']);
    });
  });

  it('rend indispensable une mesure', () => {
    const referentiel = creeReferentiel(
      donneesReferentielDeTest({
        mesures: {
          supervision: {},
          dejaIndispensable: { indispensable: true },
        },
        reglesPersonnalisation: {
          clefsDescriptionServiceAConsiderer: ['delaiAvantImpactCritique'],
          mesuresBase: ['dejaIndispensable'],
          profils: {
            mssPlusPlus: {
              regles: [
                {
                  presence: ['moinsUneHeure'],
                },
              ],
              mesuresAAjouter: ['supervision'],
              mesuresARendreIndispensables: ['supervision'],
            },
          },
        },
      })
    );
    const moteur = new MoteurRegles(referentiel);

    const service = new DescriptionService({
      delaiAvantImpactCritique: 'moinsUneHeure',
    });
    const mesures = moteur.mesures(service);
    expect(mesures).toEqual({
      supervision: { indispensable: true },
      dejaIndispensable: { indispensable: true },
    });
  });

  it("change l'importance de la mesure lorsque la description du service change", () => {
    const referentiel = creeReferentiel(
      donneesReferentielDeTest({
        mesures: {
          supervision: {},
        },
        reglesPersonnalisation: {
          clefsDescriptionServiceAConsiderer: ['delaiAvantImpactCritique'],
          mesuresBase: ['supervision'],
          profils: {
            mssPlusPlus: {
              regles: [
                {
                  presence: ['moinsUneHeure'],
                },
              ],
              mesuresARendreIndispensables: ['supervision'],
            },
          },
        },
      })
    );
    const moteur = new MoteurRegles(referentiel);

    let service = new DescriptionService({
      delaiAvantImpactCritique: 'moinsUneHeure',
    });
    moteur.mesures(service); // Accès au référentiel qui ne devrait pas avoir d'effet de bord
    service = new DescriptionService();
    expect(moteur.mesures(service)).toEqual({
      supervision: { indispensable: false },
    });
  });
});
