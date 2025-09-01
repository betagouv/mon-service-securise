import expect from 'expect.js';
import InformationsService from '../../src/modeles/informationsService.js';
import Mesures from '../../src/modeles/mesures.js';
import MesuresSpecifiques from '../../src/modeles/mesuresSpecifiques.js';
import * as Referentiel from '../../src/referentiel.js';

const elles = it;
const { A_COMPLETER, COMPLETES } = InformationsService;

describe('Les mesures liées à un service', () => {
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
    'ont comme statut `COMPLETES` lorsque toutes les mesures personnalisées sont renseignées et sans mesures spécifiques ',
    () => {
      const referentiel = Referentiel.creeReferentielVide();
      referentiel.identifiantsMesures = () => ['mesure1'];
      const mesures = new Mesures(
        {
          mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }],
          mesuresSpecifiques: [],
        },
        referentiel,
        { mesure1: {} }
      );

      expect(mesures.statutSaisie()).to.equal(COMPLETES);
    }
  );

  elles(
    'ont comme statut `COMPLETES` lorsque toutes les mesures personnalisées sont renseignées et avec mesures spécifiques ',
    () => {
      const referentiel = Referentiel.creeReferentielVide();
      referentiel.identifiantsMesures = () => ['mesure1'];
      referentiel.identifiantsCategoriesMesures = () => ['gouvernance'];
      const mesures = new Mesures(
        {
          mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }],
          mesuresSpecifiques: [
            {
              id: '1',
              description: 'Faire une étude',
              categorie: 'gouvernance',
              statut: 'fait',
            },
          ],
        },
        referentiel,
        { mesure1: {} }
      );

      expect(mesures.statutSaisie()).to.equal(COMPLETES);
    }
  );

  elles(
    'ont comme statut `A_COMPLETER` lorsque certaines mesures sont renseignées, mais pas toutes',
    () => {
      const referentiel = Referentiel.creeReferentielVide();
      referentiel.identifiantsMesures = () => ['mesure1', 'mesure2'];
      const sansMesure2 = new Mesures(
        {
          mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }],
          mesuresSpecifiques: [],
        },
        referentiel,
        { mesure1: {}, mesure2: {} }
      );

      expect(sansMesure2.statutSaisie()).to.equal(A_COMPLETER);
    }
  );

  elles(
    'ont comme statut `COMPLETES` même s’il y a des mesures qui ne sont plus d’actualité',
    () => {
      const referentiel = Referentiel.creeReferentielVide();
      referentiel.identifiantsMesures = () => ['mesure1', 'mesure2'];
      const avecMesure2EnTrop = new Mesures(
        {
          mesuresGenerales: [
            { id: 'mesure1', statut: 'fait' },
            { id: 'mesure2', statut: 'fait' },
          ],
          mesuresSpecifiques: [],
        },
        referentiel,
        { mesure1: {} }
      );

      expect(avecMesure2EnTrop.statutSaisie()).to.equal(COMPLETES);
    }
  );

  elles('connaissent le nombre total de mesures générales', () => {
    const referentiel = Referentiel.creeReferentielVide();

    const mesures = new Mesures(
      { mesuresGenerales: [], mesuresSpecifiques: [] },
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
      statutVide = { enCours: {}, nonFait: {}, aLancer: {} };
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
              responsables: [],
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
        mesuresSpecifiques: [
          { statut: 'fait', categorie: 'categorie1', responsables: [] },
        ],
      });
    });
  });

  it('connait le nombre total de mesures "nonFait"', () => {
    const referentiel = Referentiel.creeReferentiel({
      categoriesMesures: { C1: 'C1', C2: 'C2' },
      statutsMesures: {
        fait: 'Faite',
        nonFait: 'Non prise en compte',
      },
      mesures: {
        M1: {},
        M2: {},
        M3: {},
      },
    });

    const mesures = new Mesures(
      {
        mesuresGenerales: [
          { id: 'M1', statut: 'nonFait' },
          { id: 'M2', statut: 'nonFait' },
          { id: 'M3', statut: 'fait' },
        ],
        mesuresSpecifiques: [
          {
            statut: 'nonFait',
            categorie: 'C1',
          },
          {
            statut: 'fait',
            categorie: 'C2',
          },
        ],
      },
      referentiel,
      {
        M1: { categorie: 'C1' },
        M2: { categorie: 'C2' },
        M3: { categorie: 'C2' },
      }
    );

    expect(mesures.nombreTotalNonFait()).to.be(3);
  });
});
