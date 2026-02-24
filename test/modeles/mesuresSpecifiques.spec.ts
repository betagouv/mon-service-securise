import MesureSpecifique, {
  DonneesMesureSpecifique,
} from '../../src/modeles/mesureSpecifique.js';
import MesuresSpecifiques from '../../src/modeles/mesuresSpecifiques.js';

import {
  ErreurMesureInconnue,
  ErreurModeleDeMesureSpecifiqueIntrouvable,
  ErreurModeleDeMesureSpecifiqueDejaAssociee,
  ErreurSuppressionImpossible,
} from '../../src/erreurs.js';
import { Referentiel } from '../../src/referentiel.interface.ts';
import { creeReferentielVide } from '../../src/referentiel.js';
import { unUUID } from '../constructeurs/UUID.ts';

describe('La liste des mesures spécifiques', () => {
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentielVide();
    referentiel.identifiantsCategoriesMesures = () => ['categorie1'];
  });

  const uneMesureSpecifique = (
    surcharge?: Partial<DonneesMesureSpecifique>
  ): DonneesMesureSpecifique => ({
    id: unUUID('1'),
    description: 'Une mesure spécifique',
    modalites: 'Des modalités',
    categorie: 'categorie1',
    statut: 'fait',
    ...surcharge,
  });

  it('sait se dénombrer', () => {
    const mesures = new MesuresSpecifiques({ mesuresSpecifiques: [] });
    expect(mesures.nombre()).toEqual(0);
  });

  it('est composée de mesures spécifiques', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          uneMesureSpecifique({
            description: 'Une mesure spécifique',
            modalites: 'Des modalités',
          }),
        ],
      },
      referentiel
    );

    expect(mesures.item(0)).toBeInstanceOf(MesureSpecifique);
  });

  it('peut être triée par statut', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          uneMesureSpecifique({
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
          }),
          uneMesureSpecifique({
            description: 'Mesure Spécifique 2',
            statut: 'nonFait',
            categorie: 'categorie1',
          }),
        ],
      },
      referentiel
    );

    expect(
      mesures.parStatutEtCategorie().fait.categorie1[0].description
    ).toEqual('Mesure Spécifique 1');
    expect(
      mesures.parStatutEtCategorie().nonFait.categorie1[0].description
    ).toEqual('Mesure Spécifique 2');
  });

  it('prend le modalités lors du tri par statut', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          uneMesureSpecifique({
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
            modalites: 'Modalités',
          }),
        ],
      },
      referentiel
    );

    expect(mesures.parStatutEtCategorie().fait.categorie1.length).toEqual(1);
    expect(mesures.parStatutEtCategorie().fait.categorie1[0].modalites).toEqual(
      'Modalités'
    );
  });

  it("ordonne les status comme précisé par l'accumulateur", () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          uneMesureSpecifique({
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
          }),
          uneMesureSpecifique({
            description: 'Mesure Spécifique 2',
            statut: 'nonFait',
            categorie: 'categorie1',
          }),
          uneMesureSpecifique({
            description: 'Mesure Spécifique 3',
            statut: 'enCours',
            categorie: 'categorie1',
          }),
        ],
      },
      referentiel
    );

    expect(Object.keys(mesures.parStatutEtCategorie())).toEqual([
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
          uneMesureSpecifique({
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
            modalites: 'Modalités',
          }),
          uneMesureSpecifique({
            description: 'Mesure Spécifique 2',
            categorie: 'categorie1',
            modalites: 'Modalités',
            statut: '',
          }),
        ],
      },
      referentiel
    );

    expect(mesures.parStatutEtCategorie().fait.categorie1.length).toEqual(1);
    expect(mesures.parStatutEtCategorie().fait.categorie1[0].modalites).toEqual(
      'Modalités'
    );
  });

  it('exclut les mesures sans categorie', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          uneMesureSpecifique({
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
            modalites: 'Modalités',
          }),
          uneMesureSpecifique({
            description: 'Mesure Spécifique 2',
            statut: 'fait',
            categorie: undefined,
            modalites: 'Modalités',
          }),
        ],
      },
      referentiel
    );

    expect(Object.keys(mesures.parStatutEtCategorie().fait).length).toEqual(1);
    expect(
      mesures.parStatutEtCategorie().fait.categorie1[0].description
    ).toEqual('Mesure Spécifique 1');
  });

  it('peut être triée par statut en utilisant un accumulateur personnalisé', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          uneMesureSpecifique({
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
          }),
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
      aLancer: {},
    });
    expect(mesuresParStatut.fait.categorie1.length).toEqual(2);
    expect(mesuresParStatut.fait.categorie1[0].description).toEqual(
      'Mesure une'
    );
    expect(mesuresParStatut.fait.categorie1[1].description).toEqual(
      'Mesure Spécifique 1'
    );
  });

  it('peut supprimer une mesure spécifique', () => {
    const mesures = new MesuresSpecifiques(
      {
        mesuresSpecifiques: [
          {
            id: unUUID('1'),
            description: 'Mesure Spécifique 1',
            statut: 'fait',
            categorie: 'categorie1',
          },
        ],
      },
      referentiel
    );

    mesures.supprimeMesure(unUUID('1'));

    expect(mesures.items.length).toBe(0);
  });

  it("jette une erreur lors de la suppression d'une mesure spécifique associée à un modèle", () => {
    expect(() => {
      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            uneMesureSpecifique({
              id: unUUID('1'),
              idModele: unUUID('2'),
            }),
          ],
        },
        referentiel,
        {
          [unUUID('2')]: {
            idUtilisateur: unUUID('U'),
            description: '',
            descriptionLongue: '',
            categorie: '',
          },
        }
      );

      mesures.supprimeMesure(unUUID('1'));
    }).toThrowError(
      new ErreurSuppressionImpossible(
        'Impossible de supprimer directement une mesure spécifique associée à un modèle.'
      )
    );
  });

  describe('concernant les mesures spécifiques liées à un modèle', () => {
    it('complète les mesures rattachées à un modèle avec les données extraites du modèle… pour que les consommateurs ne fassent pas la différence avec des mesures "classiques"', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        [unUUID('2')]: {
          description: 'Description du modèle',
          descriptionLongue: 'Longue du modèle',
          categorie: 'categorie1',
          idUtilisateur: unUUID('U'),
        },
      };

      const avecUnModele = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            uneMesureSpecifique({
              id: unUUID('1'),
              idModele: unUUID('2'),
              statut: 'fait',
            }),
          ],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      const mesureCompletee = avecUnModele.toutes()[0];
      expect(mesureCompletee.description).toBe('Description du modèle');
      expect(mesureCompletee.descriptionLongue).toBe('Longue du modèle');
      expect(mesureCompletee.categorie).toBe('categorie1');
    });

    it('jette une erreur lorsque le modèle de la mesure est introuvable', () => {
      const modelesVide = {};

      expect(
        () =>
          new MesuresSpecifiques(
            {
              mesuresSpecifiques: [
                uneMesureSpecifique({
                  id: unUUID('1'),
                  idModele: unUUID('X'),
                  statut: 'fait',
                }),
              ],
            },
            referentiel,
            modelesVide
          )
      ).toThrowError(
        `Le modèle de mesure spécifique '${unUUID('X')}' est introuvable.`
      );
    });
  });

  describe('sur demande de mise à jour', () => {
    it('peut mettre à jour une mesure spécifique', () => {
      const donneesMesure = uneMesureSpecifique({
        id: unUUID('1'),
        description: 'Mesure Spécifique 1',
        statut: 'fait',
        categorie: 'categorie1',
      });
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

      expect(mesures.items[0].description).toBe('Nouvelle description');
    });

    it('jette une erreur si la mesure est introuvable', () => {
      const mesures = new MesuresSpecifiques(
        { mesuresSpecifiques: [] },
        referentiel
      );

      const mesureAJour = new MesureSpecifique(
        uneMesureSpecifique({
          id: unUUID('X'),
          description: 'une description',
          statut: 'fait',
          categorie: 'categorie1',
        }),
        referentiel
      );

      expect(() => mesures.metsAJourMesure(mesureAJour)).toThrowError(
        ErreurMesureInconnue
      );
    });
  });

  describe("sur demande d'association à un modèle", () => {
    it('ajoute une mesure spécifique qui reprend les données du modèle, avec un statut « À lancer » et un identifiant', () => {
      const modelesAvecM1 = {
        [unUUID('1')]: {
          description: 'Mesure M1',
          categorie: 'categorie1',
          idUtilisateur: unUUID('U'),
          descriptionLongue: '',
        },
      };
      const connaitM1 = new MesuresSpecifiques(
        { mesuresSpecifiques: [] },
        referentiel,
        modelesAvecM1
      );

      connaitM1.associeAuModele(unUUID('1'), unUUID('2'));

      expect(connaitM1.toutes()[0].toJSON()).toEqual({
        id: '22222222-2222-2222-2222-222222222222',
        idModele: '11111111-1111-1111-1111-111111111111',
        categorie: 'categorie1',
        description: 'Mesure M1',
        statut: 'aLancer',
        descriptionLongue: '',
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

      expect(() =>
        connaitM1.associeAuModele(unUUID('2'), unUUID('X'))
      ).toThrowError(ErreurModeleDeMesureSpecifiqueIntrouvable);
    });

    it('jette une erreur si une mesure spécifique est déjà associée au modèle', () => {
      const modelesAvecM1 = {
        [unUUID('1')]: {
          description: 'Mesure M1',
          categorie: 'categorie1',
          idUtilisateur: unUUID('U'),
          descriptionLongue: '',
        },
      };

      const connaitraM1 = new MesuresSpecifiques(
        { mesuresSpecifiques: [] },
        referentiel,
        modelesAvecM1
      );
      connaitraM1.associeAuModele(unUUID('1'), unUUID('2'));

      expect(() => {
        connaitraM1.associeAuModele(unUUID('1'), unUUID('2'));
      }).toThrowError(
        new ErreurModeleDeMesureSpecifiqueDejaAssociee(unUUID('1'), unUUID('2'))
      );
    });
  });

  describe("sur demande de détachement d'un modèle", () => {
    it('détache la mesure spécifique liée à ce modèle', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        [unUUID('3')]: {
          description: 'Description du modèle 1',
          descriptionLongue: 'Longue du modèle 1',
          categorie: 'categorie1',
          idUtilisateur: unUUID('U'),
        },
        [unUUID('4')]: {
          description: 'Description du modèle 2',
          descriptionLongue: 'Longue du modèle 2',
          categorie: 'categorie1',
          idUtilisateur: unUUID('U'),
        },
      };

      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            uneMesureSpecifique({
              id: unUUID('1'),
              idModele: unUUID('3'),
              statut: 'fait',
            }),
            uneMesureSpecifique({
              id: unUUID('2'),
              idModele: unUUID('4'),
              statut: 'fait',
            }),
          ],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      mesures.detacheMesureDuModele(unUUID('3'));

      expect(mesures.donneesSerialisees()).toEqual([
        {
          id: unUUID('1'),
          categorie: 'categorie1',
          description: 'Description du modèle 1',
          descriptionLongue: 'Longue du modèle 1',
          responsables: [],
          modalites: 'Des modalités',
          statut: 'fait',
        },
        {
          id: unUUID('2'),
          idModele: unUUID('4'),
          responsables: [],
          modalites: 'Des modalités',
          statut: 'fait',
        },
      ]);
    });
  });

  describe("sur demande de suppression d'une mesure associée à un modèle", () => {
    it('supprime la mesure', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        [unUUID('2')]: {
          categorie: 'categorie1',
          idUtilisateur: unUUID('U'),
          description: '',
          descriptionLongue: '',
        },
      };

      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            uneMesureSpecifique({
              id: unUUID('1'),
              idModele: unUUID('2'),
              statut: 'fait',
            }),
          ],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      mesures.supprimeMesureAssocieeAuModele(unUUID('2'));

      expect(mesures.donneesSerialisees()).toEqual([]);
    });
  });

  describe('sur demande de liste des modèles associés', () => {
    it('retourne une liste des id de modèles', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        [unUUID('3')]: {
          categorie: 'categorie1',
          idUtilisateur: unUUID('U'),
          description: '',
          descriptionLongue: '',
        },
      };

      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            uneMesureSpecifique({
              id: unUUID('1'),
              idModele: unUUID('3'),
              statut: 'fait',
            }),
            uneMesureSpecifique({ id: unUUID('2'), statut: 'fait' }),
          ],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      const listeModeles = mesures.listeIdentifiantsModelesAssocies();

      expect(listeModeles).toEqual([unUUID('3')]);
    });
  });

  describe("sur demande de détachement de toutes les mesures associées à un modèle qui n'appartient pas à un utilisateur", () => {
    it('détache ces mesures uniquement', () => {
      const modelesDisponiblesDeMesureSpecifique = {
        [unUUID('3')]: {
          categorie: 'categorie1',
          idUtilisateur: unUUID('U'),
          description: '',
          descriptionLongue: '',
        },
        [unUUID('4')]: {
          categorie: 'categorie1',
          idUtilisateur: unUUID('V'),
          description: '',
          descriptionLongue: '',
        },
      };

      const mesures = new MesuresSpecifiques(
        {
          mesuresSpecifiques: [
            uneMesureSpecifique({
              id: unUUID('1'),
              idModele: unUUID('3'),
              statut: 'fait',
            }),
            uneMesureSpecifique({
              id: unUUID('2'),
              idModele: unUUID('4'),
              statut: 'fait',
            }),
          ],
        },
        referentiel,
        modelesDisponiblesDeMesureSpecifique
      );

      mesures.detacheMesuresNonAssocieesA(unUUID('U'));

      const toutesMesures = mesures.toutes();
      expect(toutesMesures.length).toBe(2);
      expect(toutesMesures[0].idModele).toBe(unUUID('3'));
      expect(toutesMesures[1].idModele).toBe(undefined);
    });
  });
});
