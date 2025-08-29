import expect from 'expect.js';
import MesureSpecifique from '../../src/modeles/mesureSpecifique.js';
import MesuresSpecifiques from '../../src/modeles/mesuresSpecifiques.js';
import * as Referentiel from '../../src/referentiel.js';

import {
  ErreurMesureInconnue,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurSuppressionImpossible,
} from '../../src/erreurs.js';

describe('La liste des mesures spécifiques', () => {
  let referentiel;
  beforeEach(() => {
    referentiel = Referentiel.creeReferentielVide();
    referentiel.identifiantsCategoriesMesures = () => ['categorie1'];
  });

  it('sait se dénombrer', () => {
    const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [] });
    expect(mesures.nombre()).to.equal(0);
  });

  it('est composée de mesures spécifiques', () => {
    const mesures = new MesuresSpecifiques({
      mesuresSpecifiques: [
        { description: 'Une mesure spécifique', modalites: 'Des modalités' },
      ],
    });

    expect(mesures.item(0)).to.be.a(MesureSpecifique);
  });

  it('peut être triée par statut', () => {
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

  it('prend le modalités lors du tri par statut', () => {
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

  it("ordonne les status comme précisé par l'accumulateur", () => {
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
      'aLancer',
      'fait',
    ]);
  });

  it('exclut les mesures sans statut', () => {
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

  it('exclut les mesures sans categorie', () => {
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

  it('peut être triée par statut en utilisant un accumulateur personnalisé', () => {
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
  });

  it('peut supprimer une mesure spécifique', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          {
            id: 'M1',
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
          },
        ],
      },
      referentiel
    );

    mesures.supprimeMesure('M1');

    expect(mesures.items.length).to.be(0);
  });

  it("jette une erreur lors de la suppression d'une mesure spécifique associée à un modèle", () => {
    try {
      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            {
              id: 'M1',
              idModele: 'MOD-1',
            },
          ],
        },
        referentiel,
        { 'MOD-1': {} }
      );

      mesures.supprimeMesure('M1');

      expect().fail("L'appel aurait dû jeter une erreur");
    } catch (e) {
      expect(e).to.be.an(ErreurSuppressionImpossible);
      expect(e.message).to.be(
        'Impossible de supprimer directement une mesure spécifique associée à un modèle.'
      );
    }
  });

  describe('concernant les mesures spécifiques liées à un modèle', () => {
    it('complète les mesures rattachées à un modèle avec les données extraites du modèle… pour que les consommateurs ne fassent pas la différence avec des mesures "classiques"', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        'MOD-1': {
          description: 'Description du modèle',
          descriptionLongue: 'Longue du modèle',
          categorie: 'categorie1',
        },
      };

      const avecUnModele = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            { id: 'M-1', idModele: 'MOD-1', statut: 'fait' },
          ],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      const mesureCompletee = avecUnModele.toutes()[0];
      expect(mesureCompletee.description).to.be('Description du modèle');
      expect(mesureCompletee.descriptionLongue).to.be('Longue du modèle');
      expect(mesureCompletee.categorie).to.be('categorie1');
    });

    it('jette une erreur lorsque le modèle de la mesure est introuvable', () => {
      const modelesVide = {};

      expect(() => {
        new MesuresSpecifiques(
          {
            mesuresSpecifiques: [
              { id: 'M-1', idModele: 'MODELE-INTROUVABLE-1', statut: 'fait' },
            ],
          },
          referentiel,
          modelesVide
        );
      }).to.throwError((e) => {
        expect(e.message).to.be(
          "Le modèle de mesure spécifique 'MODELE-INTROUVABLE-1' est introuvable."
        );
      });
    });
  });

  describe('sur demande de mise à jour', () => {
    it('peut mettre à jour une mesure spécifique', () => {
      const donneesMesure = {
        id: 'M1',
        description: 'Mesure Spécifique 1',
        statut: 'fait',
        categorie: 'categorie1',
      };
      const mesures = new MesuresSpecifiques(
        { mesuresSpecifiques: [donneesMesure] },
        referentiel
      );
      const mesureAJour = new MesureSpecifique(
        {
          ...donneesMesure,
          description: 'Nouvelle description',
        },
        referentiel
      );

      mesures.metsAJourMesure(mesureAJour);

      expect(mesures.items[0].description).to.be('Nouvelle description');
    });

    it('jette une erreur si la mesure est introuvable', () => {
      const mesures = new MesuresSpecifiques(
        { mesuresSpecifiques: [] },
        referentiel
      );

      const mesureAJour = new MesureSpecifique(
        {
          id: 'INTROUVABLE',
          description: 'une description',
          statut: 'fait',
          categorie: 'categorie1',
        },
        referentiel
      );

      expect(() => mesures.metsAJourMesure(mesureAJour)).to.throwError((e) => {
        expect(e).to.be.an(ErreurMesureInconnue);
      });
    });
  });

  describe("sur demande d'association à un modèle", () => {
    it('ajoute une mesure spécifique qui reprend les données du modèle, avec un statut « À lancer » et un identifiant', () => {
      const modelesAvecM1 = {
        'M-1': { description: 'Mesure M1', categorie: 'categorie1' },
      };
      const connaitM1 = new MesuresSpecifiques(
        { mesuresSpecifiques: [] },
        referentiel,
        modelesAvecM1
      );

      connaitM1.associeAuModele('M-1', 'ID-MESURE-1');

      expect(connaitM1.toutes()[0].toJSON()).to.eql({
        idModele: 'M-1',
        id: 'ID-MESURE-1',
        categorie: 'categorie1',
        description: 'Mesure M1',
        statut: 'aLancer',
        responsables: [],
      });
    });

    it('jette une erreur si le modèle est introuvable', () => {
      const modelesAvecM1 = { 'M-1': {} };

      const connaitM1 = new MesuresSpecifiques(
        { mesuresSpecifiques: [] },
        referentiel,
        modelesAvecM1
      );

      expect(() => connaitM1.associeAuModele('M-2')).to.throwError((e) => {
        expect(e).to.be.an(ErreurModeleDeMesureSpecifiqueIntrouvable);
      });
    });

    it('jette une erreur si une mesure spécifique est déjà associée au modèle', () => {
      const modelesAvecM1 = {
        'M-1': { description: 'Mesure M1', categorie: 'categorie1' },
      };

      const connaitraM1 = new MesuresSpecifiques(
        { mesuresSpecifiques: [] },
        referentiel,
        modelesAvecM1
      );
      connaitraM1.associeAuModele('M-1', 'ID-MESURE-1');

      expect(() => {
        connaitraM1.associeAuModele('M-1', 'ID-MESURE-1');
      }).to.throwError((e) => {
        expect(e).to.be.an(ErreurModeleDeMesureSpecifiqueDejaAssociee);
        expect(e.message).to.be(
          'Le modèle de mesure spécifique M-1 est déjà associé à la mesure ID-MESURE-1'
        );
      });
    });
  });

  describe("sur demande de détachement d'un modèle", () => {
    it('détache la mesure spécifique liée à ce modèle', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        'MOD-1': {
          description: 'Description du modèle 1',
          descriptionLongue: 'Longue du modèle 1',
          categorie: 'categorie1',
        },
        'MOD-2': {
          description: 'Description du modèle 2',
          descriptionLongue: 'Longue du modèle 2',
          categorie: 'categorie1',
        },
      };

      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            { id: 'M1', idModele: 'MOD-1', statut: 'fait' },
            { id: 'M2', idModele: 'MOD-2', statut: 'fait' },
          ],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      mesures.detacheMesureDuModele('MOD-1');

      expect(mesures.donneesSerialisees()).to.eql([
        {
          id: 'M1',
          categorie: 'categorie1',
          description: 'Description du modèle 1',
          descriptionLongue: 'Longue du modèle 1',
          responsables: [],
          statut: 'fait',
        },
        { id: 'M2', idModele: 'MOD-2', responsables: [], statut: 'fait' },
      ]);
    });
  });

  describe("sur demande de suppression d'une mesure associée à un modèle", () => {
    it('supprime la mesure', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        'MOD-1': { categorie: 'categorie1' },
      };

      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [{ id: 'M1', idModele: 'MOD-1', statut: 'fait' }],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      mesures.supprimeMesureAssocieeAuModele('MOD-1');

      expect(mesures.donneesSerialisees()).to.eql([]);
    });
  });

  describe('sur demande de liste des modèles associés', () => {
    it('retourne une liste des id de modèles', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        'MOD-1': { categorie: 'categorie1' },
      };

      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            { id: 'M1', idModele: 'MOD-1', statut: 'fait' },
            { id: 'M2', statut: 'fait' },
          ],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      const listeModeles = mesures.listeIdentifiantsModelesAssocies();

      expect(listeModeles).to.eql(['MOD-1']);
    });
  });

  describe("sur demande de détachement de toutes les mesures associées à un modèle qui n'appartient pas à un utilisateur", () => {
    it('détache ces mesures uniquement', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        'MOD-1': { categorie: 'categorie1', idUtilisateur: 'U1' },
        'MOD-2': { categorie: 'categorie1', idUtilisateur: 'U2' },
      };

      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            { id: 'M1', idModele: 'MOD-1', statut: 'fait' },
            { id: 'M2', idModele: 'MOD-2', statut: 'fait' },
          ],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      mesures.detacheMesuresNonAssocieesA('U1');

      const toutesMesures = mesures.toutes();
      expect(toutesMesures.length).to.be(2);
      expect(toutesMesures[0].idModele).to.be('MOD-1');
      expect(toutesMesures[1].idModele).to.be(undefined);
    });
  });
});
