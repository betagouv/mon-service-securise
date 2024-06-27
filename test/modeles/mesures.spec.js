const expect = require('expect.js');

const { A_COMPLETER } = require('../../src/modeles/informationsHomologation');
const Mesures = require('../../src/modeles/mesures');
const MesuresSpecifiques = require('../../src/modeles/mesuresSpecifiques');
const Referentiel = require('../../src/referentiel');

const elles = it;

describe('Les mesures liées à une homologation', () => {
  elles('comptent les mesures personnalisees', () => {
    const mesuresPersonnalisees = { uneMesure: {} };
    const mesures = new Mesures(
      {},
      Referentiel.creeReferentielVide(),
      mesuresPersonnalisees
    );

    expect(mesures.nombreMesuresPersonnalisees()).to.equal(1);
  });

  elles('agrègent des mesures spécifiques', () => {
    const mesures = new Mesures({
      mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
    });

    expect(mesures.mesuresSpecifiques).to.be.a(MesuresSpecifiques);
  });

  elles(
    'ont comme statut `A_COMPLETER` si les mesures spécifiques ont ce statut',
    () => {
      const mesures = new Mesures({
        mesuresGenerales: [],
        mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
      });

      expect(mesures.statutSaisie()).to.equal(A_COMPLETER);
    }
  );

  elles(
    'sont à completer si toutes les mesures nécessaires ne sont pas complétées',
    () => {
      const referentiel = Referentiel.creeReferentielVide();
      referentiel.identifiantsMesures = () => ['mesure 1', 'mesure 2'];

      const mesures = new Mesures(
        {
          mesuresGenerales: [{ id: 'mesure 1', statut: 'fait' }],
          mesuresSpecifiques: [],
        },
        referentiel
      );

      expect(mesures.statutSaisie()).to.equal(A_COMPLETER);
    }
  );

  elles('délèguent le calcul statistique aux mesures générales', () => {
    let calculStatistiqueAppele = false;

    const mesuresRecommandees = {};
    const mesures = new Mesures(
      {},
      Referentiel.creeReferentielVide(),
      mesuresRecommandees
    );
    mesures.mesuresGenerales.statistiques = (
      identifiantsMesuresPersonnalisees
    ) => {
      expect(identifiantsMesuresPersonnalisees).to.equal(mesuresRecommandees);
      calculStatistiqueAppele = true;
      return 'résultat';
    };

    const stats = mesures.statistiques();

    expect(calculStatistiqueAppele).to.be(true);
    expect(stats).to.equal('résultat');
  });

  elles('connaissent le nombre total de mesures générales', () => {
    const referentiel = Referentiel.creeReferentielVide();

    const mesures = new Mesures(
      {
        mesuresGenerales: [],
        mesuresSpecifiques: [],
      },
      referentiel,
      { m1: {}, m2: {} }
    );

    expect(mesures.nombreTotalMesuresGenerales()).to.equal(2);
  });

  elles('connaissent le nombre de mesures spécifiques', () => {
    const mesures = new Mesures({
      mesuresSpecifiques: [
        { description: 'Une mesure spécifique', modalites: 'Des modalités' },
      ],
    });

    expect(mesures.nombreMesuresSpecifiques()).to.equal(1);
  });

  describe('sur une demande des mesures par statut', () => {
    let referentiel;
    let statutVide;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        mesures: {
          mesure1: {
            description: 'Mesure une',
            categorie: 'categorie1',
            indispensable: true,
          },
        },
      });
      referentiel.identifiantsCategoriesMesures = () => ['categorie1'];
      statutVide = {
        enCours: {},
        nonFait: {},
        aLancer: {},
      };
    });

    elles('récupère les mesures générales groupées', () => {
      const mesures = new Mesures(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel,
        { mesure1: {} }
      );

      expect(mesures.parStatutEtCategorie()).to.eql({
        ...statutVide,
        fait: {
          categorie1: [
            {
              description: 'Mesure une',
              modalites: undefined,
              indispensable: true,
            },
          ],
        },
      });
    });

    elles(
      'filtrent les mesures générales en fonction du moteur de règle',
      () => {
        const mesures = new Mesures(
          { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
          referentiel,
          {}
        );

        expect(mesures.parStatutEtCategorie()).to.eql({
          ...statutVide,
          fait: {},
        });
      }
    );

    elles('ajoutent les mesures spécifiques', () => {
      const mesures = new Mesures(
        {
          mesuresSpecifiques: [
            {
              description: 'Mesure Spécifique 1',
              statut: 'fait',
              categorie: 'categorie1',
            },
          ],
        },
        referentiel,
        { mesure1: {} }
      );
      mesures.mesuresSpecifiques.parStatutEtCategorie = () => ({
        fait: { categorie1: [{ description: 'Mesure Spécifique 1' }] },
      });

      expect(mesures.parStatutEtCategorie()).to.eql({
        fait: { categorie1: [{ description: 'Mesure Spécifique 1' }] },
      });
    });

    elles('fusionnent les mesures générales et spécifiques', () => {
      const mesures = new Mesures(
        {
          mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }],
          mesuresSpecifiques: [
            {
              description: 'Mesure Spécifique 1',
              statut: 'fait',
              categorie: 'categorie1',
            },
          ],
        },
        referentiel,
        { mesure1: {} }
      );

      mesures.mesuresSpecifiques.parStatutEtCategorie = (mesuresParStatut) => {
        expect(mesuresParStatut).to.eql({
          ...statutVide,
          fait: {
            categorie1: [
              {
                description: 'Mesure une',
                modalites: undefined,
                indispensable: true,
              },
            ],
          },
        });
        return {
          fait: {
            categorie1: [
              { description: 'mesure1', indispensable: true },
              { description: 'Mesure Spécifique 1' },
            ],
          },
        };
      };

      expect(mesures.parStatutEtCategorie().fait.categorie1.length).to.equal(2);
      expect(mesures.parStatutEtCategorie().fait.categorie1).to.eql([
        { description: 'mesure1', indispensable: true },
        { description: 'Mesure Spécifique 1' },
      ]);
    });
  });

  describe('sur demande des statuts des mesures personnalisées', () => {
    let referentiel;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        mesures: { mesure1: {}, mesure2: {} },
      });
    });

    elles('donnent les statuts des mesures personnalisées', () => {
      const mesures = new Mesures(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel,
        { mesure1: {} }
      );

      expect(mesures.statutsMesuresPersonnalisees()).to.eql([
        { idMesure: 'mesure1', statut: 'fait' },
      ]);
    });

    elles(
      'ignorent les mesures générales qui ne sont pas des mesures personnalisées',
      () => {
        const seulementMesure1 = { mesure1: {} };
        const mesures = new Mesures(
          {
            mesuresGenerales: [
              { id: 'mesure1', statut: 'fait' },
              { id: 'mesure2', statut: 'fait' },
            ],
          },
          referentiel,
          seulementMesure1
        );

        expect(mesures.statutsMesuresPersonnalisees()).to.eql([
          { idMesure: 'mesure1', statut: 'fait' },
        ]);
      }
    );

    elles("ignorent les mesures dont le statut n'est pas renseigné", () => {
      const mesures = new Mesures(
        {
          mesuresGenerales: [
            {
              id: 'mesure1',
              statut: '',
              modalites: 'Un commentaire laissé sans valoriser le statut',
            },
          ],
        },
        referentiel,
        { mesure1: {} }
      );

      expect(mesures.statutsMesuresPersonnalisees()).to.be.empty();
    });
  });

  describe('sur demande des mesures enrichies', () => {
    let referentiel;

    beforeEach(() => {
      referentiel = Referentiel.creeReferentiel({
        mesures: { mesure1: {} },
        categoriesMesures: { categorie1: 'Catégorie 1' },
      });
    });

    elles(
      'savent fournir les mesures générales enrichies avec les données des mesures personnalisées (catégorie, description, …)',
      () => {
        const mesure1Personnalisee = {
          description: 'Mesure une',
          categorie: 'categorie1',
          indispensable: true,
        };

        const mesures = new Mesures(
          {
            mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }],
            mesuresSpecifiques: [],
          },
          referentiel,
          { mesure1: mesure1Personnalisee }
        );

        expect(mesures.enrichiesAvecDonneesPersonnalisees()).to.eql({
          mesuresGenerales: {
            mesure1: {
              statut: 'fait',
              description: 'Mesure une',
              categorie: 'categorie1',
              indispensable: true,
            },
          },
          mesuresSpecifiques: [],
        });
      }
    );

    elles(
      "ne suppriment pas l'ID des mesures générales dans les objets `MesureGenerale`",
      () => {
        const mesures = new Mesures(
          {
            mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }],
            mesuresSpecifiques: [],
          },
          referentiel,
          { mesure1: { description: 'Mesure une' } }
        );

        mesures.enrichiesAvecDonneesPersonnalisees(); // Appel pour déclencher le code
        expect(mesures.mesuresGenerales.toutes()[0].id).to.be('mesure1'); // Vérifie l'absence d'effet de bord
      }
    );

    elles('incluent les mesures spécifiques', () => {
      const mesures = new Mesures(
        {
          mesuresGenerales: [],
          mesuresSpecifiques: [{ statut: 'fait', categorie: 'categorie1' }],
        },
        referentiel,
        {}
      );

      expect(mesures.enrichiesAvecDonneesPersonnalisees()).to.eql({
        mesuresGenerales: {},
        mesuresSpecifiques: [{ statut: 'fait', categorie: 'categorie1' }],
      });
    });
  });
});
