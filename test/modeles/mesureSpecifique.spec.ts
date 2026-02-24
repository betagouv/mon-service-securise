import {
  ErreurCategorieInconnue,
  ErreurStatutMesureInvalide,
  ErreurPrioriteMesureInvalide,
  ErreurEcheanceMesureInvalide,
  ErreurDetachementModeleMesureSpecifiqueImpossible,
} from '../../src/erreurs.js';
import InformationsService from '../../src/modeles/informationsService.js';
import MesureSpecifique, {
  DonneesMesureSpecifique,
} from '../../src/modeles/mesureSpecifique.js';
import { unUUID } from '../constructeurs/UUID.ts';
import { creeReferentielVide } from '../../src/referentiel.js';

describe('Une mesure spécifique', () => {
  const referentiel = creeReferentielVide();
  referentiel.recharge({
    categoriesMesures: { uneCategorie: 'Une catégorie' },
  });

  it('sait se décrire', () => {
    referentiel.enrichis({ prioritesMesures: { p3: {} } });

    const mesure = new MesureSpecifique(
      {
        description: 'Une mesure spécifique',
        descriptionLongue: 'Une description longue',
        idModele: unUUID('3'),
        categorie: 'uneCategorie',
        statut: 'fait',
        modalites: 'Des modalités de mise en œuvre',
        priorite: 'p3',
        echeance: '01/01/2023',
        responsables: [unUUID('1'), unUUID('2')],
      },
      referentiel
    );

    expect(mesure.description).toEqual('Une mesure spécifique');
    expect(mesure.descriptionLongue).toEqual('Une description longue');
    expect(mesure.idModele).toEqual(unUUID('3'));
    expect(mesure.categorie).toEqual('uneCategorie');
    expect(mesure.statut).toEqual('fait');
    expect(mesure.modalites).toEqual('Des modalités de mise en œuvre');
    expect(mesure.priorite).toEqual('p3');
    expect(mesure.echeance!.getTime()).toEqual(
      new Date('01/01/2023').getTime()
    );
    expect(mesure.responsables).to.eql([unUUID('1'), unUUID('2')]);
  });

  it('connaît ses propriétés obligatoires', () => {
    expect(MesureSpecifique.proprietesObligatoires()).to.eql([
      'id',
      'description',
      'categorie',
      'statut',
    ]);
  });

  it('ne tient pas compte du champ `modalites` ni de la priorite pour déterminer le statut de saisie', () => {
    const mesure = new MesureSpecifique(
      {
        id: unUUID('1'),
        description: 'Une mesure spécifique',
        categorie: 'uneCategorie',
        statut: 'fait',
      },
      referentiel
    );

    expect(mesure.statutSaisie()).toEqual(InformationsService.COMPLETES);
  });

  it('vérifie que le statut est bien valide', () => {
    expect(
      () => new MesureSpecifique({ statut: 'statutInconnu' })
    ).toThrowError(
      new ErreurStatutMesureInvalide('Le statut "statutInconnu" est invalide')
    );
  });

  it('vérifie la valeur de la priorité', () => {
    referentiel.enrichis({ prioritesMesures: {} });

    expect(
      () => new MesureSpecifique({ priorite: 'prioriteInvalide' }, referentiel)
    ).toThrowError(
      new ErreurPrioriteMesureInvalide(
        'La priorité "prioriteInvalide" est invalide'
      )
    );
  });

  it("vérifie la valeur de l'échéance", () => {
    expect(
      () => new MesureSpecifique({ echeance: 'pasUneDate' }, referentiel)
    ).toThrowError(
      new ErreurEcheanceMesureInvalide('L\'échéance "pasUneDate" est invalide')
    );
  });

  it('vérifie que la catégorie est bien répertoriée', () => {
    expect(
      () => new MesureSpecifique({ categorie: 'categorieInconnue' })
    ).toThrowError(
      new ErreurCategorieInconnue(
        'La catégorie "categorieInconnue" n\'est pas répertoriée'
      )
    );
  });

  it("ne tient pas compte de la catégorie si elle n'est pas renseignée", () => {
    expect(() => new MesureSpecifique()).not.toThrowError();
  });

  it("n'est pas indispensable selon l'ANSSI", () => {
    const mesure = new MesureSpecifique();
    expect(mesure.estIndispensable()).toBe(false);
  });

  it("n'est pas recommandée par l'ANSSI", () => {
    const mesure = new MesureSpecifique();
    expect(mesure.estRecommandee()).toBe(false);
  });

  it('sait si son statut est renseigné', () => {
    const mesure = new MesureSpecifique({ statut: 'fait' });
    expect(mesure.statutRenseigne()).toBe(true);
  });

  describe('concernant la persistance', () => {
    let donneesMesureSpecifique: DonneesMesureSpecifique;

    beforeEach(() => {
      referentiel.enrichis({ prioritesMesures: { p3: {} } });
      donneesMesureSpecifique = {
        id: unUUID('1'),
        description: 'Une mesure spécifique',
        descriptionLongue: 'Une description longue',
        categorie: 'uneCategorie',
        statut: 'fait',
        modalites: 'Des modalités de mise en œuvre',
        priorite: 'p3',
        echeance: '01/23/2024 10:00Z',
        responsables: [unUUID('2'), unUUID('3')],
      };
    });

    it("persiste sa date d'échéance au format ISO en UTC", () => {
      const janvierNonIso = '01/23/2024 10:00Z';
      const avecEcheance = new MesureSpecifique(
        { echeance: janvierNonIso },
        referentiel
      );

      const persistance = avecEcheance.donneesSerialisees();

      expect(persistance.echeance).toBe('2024-01-23T10:00:00.000Z');
    });

    it('persiste toutes ses données', () => {
      const mesureSpecifique = new MesureSpecifique(
        donneesMesureSpecifique,
        referentiel
      );

      const persistance = mesureSpecifique.donneesSerialisees();

      expect(persistance).to.eql({
        id: unUUID('1'),
        description: 'Une mesure spécifique',
        descriptionLongue: 'Une description longue',
        categorie: 'uneCategorie',
        statut: 'fait',
        modalites: 'Des modalités de mise en œuvre',
        priorite: 'p3',
        echeance: '2024-01-23T10:00:00.000Z',
        responsables: [unUUID('2'), unUUID('3')],
      });
    });

    it('ne persiste pas les données du modèle si la mesure a un modèle, car elles ne doivent apparaître que dans le modèle', () => {
      const mesureAvecModele = new MesureSpecifique(
        { ...donneesMesureSpecifique, idModele: unUUID('4') },
        referentiel
      );

      const persistance = mesureAvecModele.donneesSerialisees();

      expect(persistance.description).toBe(undefined);
      expect(persistance.descriptionLongue).toBe(undefined);
      expect(persistance.categorie).toBe(undefined);
    });
  });

  describe('concernant le détachement de son modèle', () => {
    it("jette une erreur si la mesure n'est pas reliée à un modèle", () => {
      const id = unUUID('1');
      const mesure = new MesureSpecifique({ id, idModele: undefined });

      expect(() => mesure.detacheDeSonModele()).toThrowError(
        new ErreurDetachementModeleMesureSpecifiqueImpossible(
          `Impossible de détacher la mesure '${id}' : elle n'est pas reliée à un modèle.`
        )
      );
    });

    it("supprime l'identifiant du modèle, la rendant donc autonome", () => {
      const mesure = new MesureSpecifique({
        id: unUUID('1'),
        idModele: unUUID('2'),
        statut: 'fait',
        description: 'Ma mesure spécifique',
      });

      mesure.detacheDeSonModele();

      expect(mesure.donneesSerialisees()).to.eql({
        id: unUUID('1'),
        description: 'Ma mesure spécifique',
        responsables: [],
        statut: 'fait',
      });
    });
  });
});
