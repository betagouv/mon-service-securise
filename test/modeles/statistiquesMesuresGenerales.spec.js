const expect = require('expect.js');

const Referentiel = require('../../src/referentiel');
const { ErreurCategorieInconnue } = require('../../src/erreurs');
const {
  desStatistiques,
} = require('../constructeurs/constructeurStatistiquesMesuresGenerales');

describe('Les statistiques des mesures générales', () => {
  it('vérifient que les catégories sont présentes dans le référentiel', () => {
    const seulementGouvernance = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
    });

    expect(() => {
      const mesureProtection = { categorie: 'protection' };

      desStatistiques(seulementGouvernance)
        .avecMesuresPersonnalisees({ P1: mesureProtection })
        .construis();
    }).to.throwException((e) => {
      expect(e).to.be.a(ErreurCategorieInconnue);
      expect(e.message).to.equal(
        'La catégorie "protection" n\'est pas répertoriée'
      );
    });
  });

  it('calculent le nombre de mesures "Faites" par catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { fait: '' },
    });

    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([
        { id: 'G1', statut: 'fait' },
        { id: 'G2', statut: 'fait' },
        { id: 'R1', statut: 'fait' },
      ])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
      })
      .construis();

    expect(stats.faites('gouvernance')).to.eql(2);
    expect(stats.faites('resilience')).to.eql(1);
    expect(stats.faites('protection')).to.eql(0);
  });

  it('calculent le nombre de mesures "En cours" par catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { enCours: '' },
    });

    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([
        { id: 'G1', statut: 'enCours' },
        { id: 'G2', statut: 'enCours' },
        { id: 'R1', statut: 'enCours' },
      ])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
      })
      .construis();

    expect(stats.enCours('gouvernance')).to.eql(2);
    expect(stats.enCours('resilience')).to.eql(1);
    expect(stats.enCours('protection')).to.eql(0);
  });

  it('calculent le nombre de mesures "Non faites" par catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { nonFait: '' },
    });

    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([
        { id: 'G1', statut: 'nonFait' },
        { id: 'G2', statut: 'nonFait' },
        { id: 'R1', statut: 'nonFait' },
      ])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
      })
      .construis();

    expect(stats.nonFaites('gouvernance')).to.eql(2);
    expect(stats.nonFaites('resilience')).to.eql(1);
    expect(stats.nonFaites('protection')).to.eql(0);
  });

  it('calculent le nombre de mesures "À lancer" par catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { aLancer: '' },
    });

    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([
        { id: 'G1', statut: 'aLancer' },
        { id: 'G2', statut: 'aLancer' },
        { id: 'R1', statut: 'aLancer' },
      ])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
      })
      .construis();

    expect(stats.aLancer('gouvernance')).to.eql(2);
    expect(stats.aLancer('resilience')).to.eql(1);
    expect(stats.aLancer('protection')).to.eql(0);
  });

  it("calculent le nombre de mesures sans statut par catégorie : les mesures personnalisées qui sont absentes des mesures générales ou les générales sans statut (même si ce n'est pas censé arriver)", () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { fait: '' },
    });

    const g2SansStatut = { id: 'G2' };
    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([g2SansStatut])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
      })
      .construis();

    expect(stats.sansStatut('gouvernance')).to.be(2); // G2 sans statut, et G1 absente des générales
    expect(stats.sansStatut('resilience')).to.be(1); // R1 absente des générales
  });

  const casDeTests = [
    { nom: 'indispensables', methode: 'indispensables', indispensable: true },
    { nom: 'recommandées', methode: 'recommandees', indispensable: false },
  ];
  casDeTests.forEach(({ nom, methode, indispensable }) => {
    describe(`quand elles calculent le nombre de mesures ${nom}`, () => {
      it(`donnent le nombre de mesures au statut "En cours" qui sont ${nom}`, () => {
        const referentiel = Referentiel.creeReferentiel({
          categoriesMesures: { gouvernance: 'Gouvernance' },
          mesures: { A: {}, B: {}, C: {} },
          statutsMesures: { fait: '', enCours: '' },
        });

        const enCoursEtTypeCorrect = { id: 'A', statut: 'enCours' };
        const typeCorrectMaisPasEnCours = { id: 'B', statut: 'fait' };
        const enCoursMaisPasTypeCorrect = { id: 'C', statut: 'enCours' };

        const stats = desStatistiques(referentiel)
          .surLesMesuresGenerales([
            enCoursEtTypeCorrect,
            typeCorrectMaisPasEnCours,
            enCoursMaisPasTypeCorrect,
          ])
          .avecMesuresPersonnalisees({
            A: { indispensable, categorie: 'gouvernance' },
            B: { indispensable, categorie: 'gouvernance' },
            C: { indispensable: !indispensable, categorie: 'gouvernance' },
          })
          .construis();

        expect(stats[methode]().enCours).to.be(1);
      });

      it(`donnent le nombre de mesures au statut "Non fait" qui sont ${nom}`, () => {
        const referentiel = Referentiel.creeReferentiel({
          categoriesMesures: { gouvernance: 'Gouvernance' },
          mesures: { A: {}, B: {}, C: {} },
          statutsMesures: { fait: '', nonFait: '' },
        });

        const nonFaitEtTypeCorrect = { id: 'A', statut: 'nonFait' };
        const typeCorrectMaisPasNonFait = { id: 'B', statut: 'fait' };
        const nonFaitMaisPasTypeCorrect = { id: 'C', statut: 'nonFait' };

        const stats = desStatistiques(referentiel)
          .surLesMesuresGenerales([
            nonFaitEtTypeCorrect,
            typeCorrectMaisPasNonFait,
            nonFaitMaisPasTypeCorrect,
          ])
          .avecMesuresPersonnalisees({
            A: { indispensable, categorie: 'gouvernance' },
            B: { indispensable, categorie: 'gouvernance' },
            C: { indispensable: !indispensable, categorie: 'gouvernance' },
          })
          .construis();

        expect(stats[methode]().nonFait).to.be(1);
      });

      it(`donnent le nombre de mesures au statut "Fait" qui sont ${nom}`, () => {
        const referentiel = Referentiel.creeReferentiel({
          categoriesMesures: { gouvernance: 'Gouvernance' },
          mesures: { A: {}, B: {}, C: {} },
          statutsMesures: { fait: '', nonFait: '' },
        });

        const faitEtTypeCorrect = { id: 'A', statut: 'fait' };
        const typeCorrectMaisPasFait = { id: 'B', statut: 'nonFait' };
        const faitMaisPasTypeCorrect = { id: 'C', statut: 'fait' };

        const stats = desStatistiques(referentiel)
          .surLesMesuresGenerales([
            faitEtTypeCorrect,
            typeCorrectMaisPasFait,
            faitMaisPasTypeCorrect,
          ])
          .avecMesuresPersonnalisees({
            A: { indispensable, categorie: 'gouvernance' },
            B: { indispensable, categorie: 'gouvernance' },
            C: { indispensable: !indispensable, categorie: 'gouvernance' },
          })
          .construis();

        expect(stats[methode]().fait).to.be(1);
      });

      it('donnent le nombre de mesures "restantes" : ce sont celles qui ne sont pas au statut "Fait"', () => {
        const referentiel = Referentiel.creeReferentiel({
          categoriesMesures: { gouvernance: 'Gouvernance' },
          mesures: { A: {}, B: {}, C: {} },
          statutsMesures: { fait: '', enCours: '', nonFait: '' },
        });

        const enCours = { id: 'A', statut: 'enCours' };
        const nonFaite = { id: 'B', statut: 'nonFait' };
        const faite = { id: 'C', statut: 'fait' };
        const sansStatutCarSeulementDansPerso = {
          indispensable,
          categorie: 'gouvernance',
        };

        const stats = desStatistiques(referentiel)
          .surLesMesuresGenerales([enCours, nonFaite, faite])
          .avecMesuresPersonnalisees({
            A: { indispensable, categorie: 'gouvernance' },
            B: { indispensable, categorie: 'gouvernance' },
            C: { indispensable, categorie: 'gouvernance' },
            D: sansStatutCarSeulementDansPerso,
          })
          .construis();

        // Une seule mesure faite sur 4 : il y en a 3 "restantes".
        expect(stats[methode]().restant).to.be(3);
      });

      it('donnent le nombre de mesures "à remplir" : celles qui n\'ont pas de statut', () => {
        const referentiel = Referentiel.creeReferentiel({
          categoriesMesures: { gouvernance: 'Gouvernance' },
          mesures: { A: {}, B: {} },
          statutsMesures: { nonFait: '' },
        });

        // Une mesure générale sans statut est impossible à obtenir via l'IHM… mais on se protège quand même
        const sansStatut = { id: 'A' };
        const avecStatutDoncNeComptePas = { id: 'B', statut: 'nonFait' };
        const sansStatutCarSeulementDansPerso = {
          indispensable,
          categorie: 'gouvernance',
        };

        const stats = desStatistiques(referentiel)
          .surLesMesuresGenerales([sansStatut, avecStatutDoncNeComptePas])
          .avecMesuresPersonnalisees({
            A: { indispensable, categorie: 'gouvernance' },
            B: { indispensable, categorie: 'gouvernance' },
            C: sansStatutCarSeulementDansPerso,
          })
          .construis();

        expect(stats[methode]().aRemplir).to.be(2); // On compte A et C
      });

      it(`donnent le nombre total de mesures qui sont ${nom}`, () => {
        const referentiel = Referentiel.creeReferentiel({
          categoriesMesures: { gouvernance: 'Gouvernance' },
          mesures: { A: {}, B: {}, C: {}, D: {}, E: {} },
          statutsMesures: { fait: '', nonFait: '' },
        });

        const typeCorrectFaite = { id: 'A', statut: 'fait' };
        const typeCorrectNonFaite = { id: 'B', statut: 'nonFait' };
        const typeCorrectSansStatut = { id: 'C' };
        const typeIncorrect = { id: 'D', statut: 'fait' };
        const typeCorrectSeulementPersonnalisee = {
          indispensable,
          categorie: 'gouvernance',
        };

        const stats = desStatistiques(referentiel)
          .surLesMesuresGenerales([
            typeCorrectFaite,
            typeCorrectNonFaite,
            typeCorrectSansStatut,
            typeIncorrect,
          ])
          .avecMesuresPersonnalisees({
            A: { indispensable, categorie: 'gouvernance' },
            B: { indispensable, categorie: 'gouvernance' },
            C: { indispensable, categorie: 'gouvernance' },
            D: { indispensable: !indispensable, categorie: 'gouvernance' },
            E: typeCorrectSeulementPersonnalisee,
          })
          .construis();

        expect(stats[methode]().total).to.be(4);
      });
    });
  });

  it("calculent le nombre de mesures 'Sans statut' pour toutes les catégories", () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {}, P1: {} },
      statutsMesures: { fait: 'Fait' },
    });

    const g2AvecStatut = { id: 'G2', statut: 'fait' };
    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([g2AvecStatut])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance' },
        G2: { categorie: 'gouvernance' },
        R1: { categorie: 'resilience' },
        P1: { categorie: 'protection' },
      })
      .construis();

    expect(stats.sansStatutToutesCategories()).to.be(3);
  });

  it('calculent les totaux et le nombre de mesure faites par type et par catégories', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, G3: {}, P1: {}, P2: {} },
      statutsMesures: { fait: 'Fait', enCours: 'En cours' },
    });

    const stats = desStatistiques(referentiel)
      .surLesMesuresGenerales([
        { id: 'G1', statut: 'fait' },
        { id: 'G2', statut: 'fait' },
        { id: 'G3', statut: 'enCours' },
        { id: 'P1', statut: 'fait' },
        { id: 'P2', statut: 'enCours' },
      ])
      .avecMesuresPersonnalisees({
        G1: { categorie: 'gouvernance', indispensable: true },
        G2: { categorie: 'gouvernance', indispensable: true },
        G3: { categorie: 'gouvernance', indispensable: true },
        P1: { categorie: 'protection' },
        P2: { categorie: 'protection' },
      })
      .construis();

    expect(stats.totauxParTypeEtParCategorie()).to.eql({
      indispensables: {
        gouvernance: { sansStatut: 0, enCours: 1, fait: 2, total: 3 },
        protection: { sansStatut: 0, enCours: 0, fait: 0, total: 0 },
      },
      recommandees: {
        protection: { sansStatut: 0, enCours: 1, fait: 1, total: 2 },
        gouvernance: { sansStatut: 0, enCours: 0, fait: 0, total: 0 },
      },
    });
  });
});
