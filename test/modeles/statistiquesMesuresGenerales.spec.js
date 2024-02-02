const expect = require('expect.js');

const MesuresGenerales = require('../../src/modeles/mesuresGenerales');
const Referentiel = require('../../src/referentiel');
const { ErreurCategorieInconnue } = require('../../src/erreurs');
const {
  StatistiquesMesuresGenerales,
} = require('../../src/modeles/statistiquesMesuresGenerales');

describe('Les statistiques des mesures générales', () => {
  it('vérifient que les catégories sont présentes dans le référentiel', () => {
    const seulementGouvernance = Referentiel.creeReferentiel({
      categoriesMesures: { gouvernance: 'Gouvernance' },
    });

    expect(() => {
      const mesureResilience = { categorie: 'resilience' };

      new StatistiquesMesuresGenerales(
        {
          mesuresGenerales: new MesuresGenerales({ mesuresGenerales: [] }),
          mesuresPersonnalisees: { mesureA: mesureResilience },
        },
        seulementGouvernance
      );
    }).to.throwException((e) => {
      expect(e).to.be.a(ErreurCategorieInconnue);
      expect(e.message).to.equal(
        'La catégorie "resilience" n\'est pas répertoriée'
      );
    });
  });

  it('calcule le nombre de mesures mises en œuvre (Faites) par catégorie', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: {
        gouvernance: 'Gouvernance',
        resilience: 'Résilience',
        protection: 'Protection',
      },
      mesures: { G1: {}, G2: {}, R1: {} },
      statutsMesures: { fait: '' },
    });

    const stats = new StatistiquesMesuresGenerales(
      {
        mesuresGenerales: new MesuresGenerales(
          {
            mesuresGenerales: [
              { id: 'G1', statut: 'fait' },
              { id: 'G2', statut: 'fait' },
              { id: 'R1', statut: 'fait' },
            ],
          },
          referentiel
        ),
        mesuresPersonnalisees: {
          G1: { categorie: 'gouvernance' },
          G2: { categorie: 'gouvernance' },
          R1: { categorie: 'resilience' },
        },
      },
      referentiel
    );

    expect(stats.misesEnOeuvre('gouvernance')).to.eql(2);
    expect(stats.misesEnOeuvre('resilience')).to.eql(1);
    expect(stats.misesEnOeuvre('protection')).to.eql(0);
  });
});
