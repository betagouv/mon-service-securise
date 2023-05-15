const expect = require('expect.js');

const MesureSpecifique = require('../../src/modeles/mesureSpecifique');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');
const Referentiel = require('../../src/referentiel');

const elle = it;

describe('La liste des mesures spécifiques', () => {
  let referentiel;
  beforeEach(() => {
    referentiel = Referentiel.creeReferentielVide();
    referentiel.identifiantsCategoriesMesures = () => ['categorie1'];
  });

  elle('sait se dénombrer', () => {
    const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [] });
    expect(mesures.nombre()).to.equal(0);
  });

  elle('est composée de mesures spécifiques', () => {
    const mesures = new MesuresSpecifiques({
      mesuresSpecifiques: [
        { description: 'Une mesure spécifique', modalites: 'Des modalités' },
      ],
    });

    expect(mesures.item(0)).to.be.a(MesureSpecifique);
  });

  elle('peut être triée par statut', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          {
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
          },
          {
            description: 'Mesure Spécifique 2',
            statut: 'nonFait',
            categorie: 'categorie1',
          },
        ],
      },
      referentiel
    );

    expect(
      mesures.parStatutEtCategorie().fait.categorie1[0].description
    ).to.equal('Mesure Spécifique 1');
    expect(
      mesures.parStatutEtCategorie().nonFait.categorie1[0].description
    ).to.equal('Mesure Spécifique 2');
  });

  elle('prend le modalités lors du tri par statut', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          {
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
            modalites: 'Modalités',
          },
        ],
      },
      referentiel
    );

    expect(mesures.parStatutEtCategorie().fait.categorie1.length).to.equal(1);
    expect(
      mesures.parStatutEtCategorie().fait.categorie1[0].modalites
    ).to.equal('Modalités');
  });

  elle("ordonne les status comme précisé par l'accumulateur", () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          {
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
          },
          {
            description: 'Mesure Spécifique 2',
            statut: 'nonFait',
            categorie: 'categorie1',
          },
          {
            description: 'Mesure Spécifique 3',
            statut: 'enCours',
            categorie: 'categorie1',
          },
        ],
      },
      referentiel
    );

    expect(Object.keys(mesures.parStatutEtCategorie())).to.eql([
      'enCours',
      'nonFait',
      'fait',
    ]);
  });

  elle('exclut les mesures sans statut', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          {
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
            modalites: 'Modalités',
          },
          {
            description: 'Mesure Spécifique 2',
            categorie: 'categorie1',
            modalites: 'Modalités',
          },
        ],
      },
      referentiel
    );

    expect(mesures.parStatutEtCategorie().fait.categorie1.length).to.equal(1);
    expect(
      mesures.parStatutEtCategorie().fait.categorie1[0].modalites
    ).to.equal('Modalités');
  });

  elle('exclut les mesures sans categorie', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          {
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
            modalites: 'Modalités',
          },
          {
            description: 'Mesure Spécifique 2',
            statut: 'fait',
            categorie: undefined,
            modalites: 'Modalités',
          },
        ],
      },
      referentiel
    );

    expect(Object.keys(mesures.parStatutEtCategorie().fait).length).to.equal(1);
    expect(
      mesures.parStatutEtCategorie().fait.categorie1[0].description
    ).to.equal('Mesure Spécifique 1');
  });

  elle(
    'peut être triée par statut en utilisant un accumulateur personnalisé',
    () => {
      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            {
              description: 'Mesure Spécifique 1',
              statut: 'fait',
              categorie: 'categorie1',
            },
          ],
        },
        referentiel
      );

      const mesuresParStatut = mesures.parStatutEtCategorie({
        fait: {
          categorie1: [{ description: 'Mesure une', indispensable: true }],
        },
        enCours: {},
        nonFait: {},
      });
      expect(mesuresParStatut.fait.categorie1.length).to.equal(2);
      expect(mesuresParStatut.fait.categorie1[0].description).to.equal(
        'Mesure une'
      );
      expect(mesuresParStatut.fait.categorie1[1].description).to.equal(
        'Mesure Spécifique 1'
      );
    }
  );
});
