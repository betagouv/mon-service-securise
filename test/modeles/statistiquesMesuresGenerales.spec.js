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

  it('calcule le nombre de mesures "Faites" par catégorie', () => {
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

  it('calcule le nombre de mesures "En cours" par catégorie', () => {
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

  it('calcule le nombre de mesures "Non faites" par catégorie', () => {
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

  it("calcule le nombre de mesures sans statut par catégorie : les mesures personnalisées qui sont absentes des mesures générales ou les générales sans statut (même si ce n'est pas censé arriver)", () => {
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
});
