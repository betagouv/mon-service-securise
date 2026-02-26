import expect from 'expect.js';
import InformationsService from '../../src/modeles/informationsService.js';
import Mesures from '../../src/modeles/mesures.js';
import MesuresSpecifiques from '../../src/modeles/mesuresSpecifiques.js';
import { creeReferentielV2 } from '../../src/referentielV2.js';
import { creeReferentiel, creeReferentielVide } from '../../src/referentiel.js';

const { A_COMPLETER, COMPLETES } = InformationsService;

describe('Les mesures liées à un service', () => {
  it('comptent les mesures personnalisees', () => {
    const mesuresPersonnalisees = { uneMesure: {} };
    const mesures = new Mesures(
      {},
      creeReferentielVide(),
      mesuresPersonnalisees
    );

    expect(mesures.nombreMesuresPersonnalisees()).to.equal(1);
  });

  it('agrègent des mesures spécifiques', () => {
    const mesures = new Mesures({
      mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
    });

    expect(mesures.mesuresSpecifiques).to.be.a(MesuresSpecifiques);
  });

  it('ont comme statut `A_COMPLETER` si les mesures spécifiques ont ce statut', () => {
    const mesures = new Mesures({
      mesuresGenerales: [],
      mesuresSpecifiques: [{ description: 'Une mesure spécifique' }],
    });

    expect(mesures.statutSaisie()).to.equal(A_COMPLETER);
  });

  it('ont comme statut `COMPLETES` lorsque toutes les mesures personnalisées sont renseignées et sans mesures spécifiques', () => {
    const referentiel = creeReferentiel({
      mesures: { mesure1: {} },
    });
    const mesures = new Mesures(
      {
        mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }],
        mesuresSpecifiques: [],
      },
      referentiel,
      { mesure1: {} }
    );

    expect(mesures.statutSaisie()).to.equal(COMPLETES);
  });

  it('ont comme statut `COMPLETES` lorsque toutes les mesures personnalisées sont renseignées et avec mesures spécifiques', () => {
    const referentiel = creeReferentiel({
      mesures: { mesure1: {} },
      categoriesMesures: { gouvernance: {} },
    });
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
  });

  it('ont comme statut `A_COMPLETER` lorsque certaines mesures sont renseignées, mais pas toutes', () => {
    const referentiel = creeReferentiel({
      mesures: { mesure1: {}, mesure2: {} },
    });
    const sansMesure2 = new Mesures(
      {
        mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }],
        mesuresSpecifiques: [],
      },
      referentiel,
      { mesure1: {}, mesure2: {} }
    );

    expect(sansMesure2.statutSaisie()).to.equal(A_COMPLETER);
  });

  it('ont comme statut `COMPLETES` même s’il y a des mesures qui ne sont plus d’actualité', () => {
    const referentiel = creeReferentiel({
      mesures: { mesure1: {}, mesure2: {} },
    });
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
  });

  it('connaissent le nombre total de mesures générales', () => {
    const referentiel = creeReferentielVide();

    const mesures = new Mesures(
      { mesuresGenerales: [], mesuresSpecifiques: [] },
      referentiel,
      { m1: {}, m2: {} }
    );

    expect(mesures.nombreTotalMesuresGenerales()).to.equal(2);
  });

  it('connaissent le nombre de mesures spécifiques', () => {
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
      referentiel = creeReferentiel({
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

    it('récupère les mesures générales groupées', () => {
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

    it('filtrent les mesures générales en fonction du moteur de règle', () => {
      const mesures = new Mesures(
        { mesuresGenerales: [{ id: 'mesure1', statut: 'fait' }] },
        referentiel,
        {}
      );

      expect(mesures.parStatutEtCategorie()).to.eql({
        ...statutVide,
        fait: {},
      });
    });

    it('ajoutent les mesures spécifiques', () => {
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

    it('fusionnent les mesures générales et spécifiques', () => {
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
      referentiel = creeReferentiel({
        mesures: { mesure1: {} },
        categoriesMesures: { categorie1: 'Catégorie 1' },
      });
    });

    it('savent fournir les mesures générales enrichies avec les données des mesures personnalisées (catégorie, description, …)', () => {
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
    });

    it("ne suppriment pas l'ID des mesures générales dans les objets `MesureGenerale`", () => {
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
    });

    it('incluent les mesures spécifiques', () => {
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

    describe('concernant les porteurs singuliers', () => {
      it('ajoutent les porteurs singuliers des mesures v2', () => {
        const referentielV2 = creeReferentielV2({
          mesures: { mesure1: {} },
          donneesComplementairesMesures: {
            mesure1: { porteursSinguliers: ['RSSI'] },
          },
        });

        const mesures = new Mesures(
          { mesuresGenerales: [{ id: 'mesure1' }], mesuresSpecifiques: [] },
          referentielV2,
          { mesure1: {} }
        );

        const enrichies = mesures.enrichiesAvecDonneesPersonnalisees();

        const { mesure1 } = enrichies.mesuresGenerales;
        expect(mesure1.porteursSinguliers).to.eql(['RSSI']);
      });

      it("n'ajoutent aucun porteur sur les mesures v1 (car la notion n'existe pas)", () => {
        const mesures = new Mesures(
          { mesuresGenerales: [{ id: 'mesure1' }], mesuresSpecifiques: [] },
          referentiel,
          { mesure1: {} }
        );

        const enrichies = mesures.enrichiesAvecDonneesPersonnalisees();

        const { mesure1 } = enrichies.mesuresGenerales;
        expect(mesure1.porteursSinguliers).to.be(undefined);
      });
    });

    describe('concernant les thématiques', () => {
      it('ajoutent les thématiques des mesures v2', () => {
        const referentielV2 = creeReferentielV2({
          mesures: { mesure1: {} },
          donneesComplementairesMesures: {
            mesure1: { thematique: "Gestion de l'écosystème" },
          },
        });

        const mesures = new Mesures(
          { mesuresGenerales: [{ id: 'mesure1' }], mesuresSpecifiques: [] },
          referentielV2,
          { mesure1: {} }
        );

        const enrichies = mesures.enrichiesAvecDonneesPersonnalisees();

        const { mesure1 } = enrichies.mesuresGenerales;
        expect(mesure1.thematique).to.eql("Gestion de l'écosystème");
      });

      it("n'ajoutent aucune thématique sur les mesures v1 (car la notion n'existe pas)", () => {
        const mesures = new Mesures(
          { mesuresGenerales: [{ id: 'mesure1' }], mesuresSpecifiques: [] },
          referentiel,
          { mesure1: {} }
        );

        const enrichies = mesures.enrichiesAvecDonneesPersonnalisees();

        const { mesure1 } = enrichies.mesuresGenerales;
        expect(mesure1.thematique).to.be(undefined);
      });
    });
  });

  it('connait le nombre total de mesures "nonFait"', () => {
    const referentiel = creeReferentiel({
      categoriesMesures: { C1: 'C1', C2: 'C2' },
      statutsMesures: { fait: 'Faite', nonFait: 'Non prise en compte' },
      mesures: { M1: {}, M2: {}, M3: {} },
    });

    const mesures = new Mesures(
      {
        mesuresGenerales: [
          { id: 'M1', statut: 'nonFait' },
          { id: 'M2', statut: 'nonFait' },
          { id: 'M3', statut: 'fait' },
        ],
        mesuresSpecifiques: [
          { statut: 'nonFait', categorie: 'C1' },
          { statut: 'fait', categorie: 'C2' },
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
