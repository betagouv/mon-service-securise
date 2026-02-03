import {
  ErreurCategorieInconnue,
  ErreurStatutMesureInvalide,
  ErreurPrioriteMesureInvalide,
  ErreurEcheanceMesureInvalide,
  ErreurDetachementModeleMesureSpecifiqueImpossible,
} from '../../src/erreurs.js';

import { creeReferentiel } from '../../src/referentiel.js';
import InformationsService from '../../src/modeles/informationsService.js';
import MesureSpecifique, {
  DonneesMesureSpecifique,
} from '../../src/modeles/mesureSpecifique.js';
import { unUUIDRandom } from '../constructeurs/UUID.ts';
import { CategorieMesure, StatutMesure } from '../../referentiel.types.ts';

describe('Une mesure spécifique', () => {
  const referentiel = creeReferentiel();
  referentiel.enrichis({
    categoriesMesures: { gouvernance: 'Gouvernance' },
  });

  const donneesDeBase = () => ({
    id: unUUIDRandom(),
    description: 'Une description',
    categorie: 'gouvernance' as CategorieMesure,
    statut: 'fait' as StatutMesure,
  });

  it('sait se décrire', () => {
    referentiel.enrichis({ prioritesMesures: { p3: {} } });

    const idModele = unUUIDRandom();
    const unIdUtilisateur = unUUIDRandom();
    const unAutreIdUtilisateur = unUUIDRandom();
    const mesure = new MesureSpecifique(
      {
        id: unUUIDRandom(),
        description: 'Une mesure spécifique',
        descriptionLongue: 'Une description longue',
        idModele,
        categorie: 'gouvernance',
        statut: 'fait',
        modalites: 'Des modalités de mise en œuvre',
        priorite: 'p3',
        echeance: '01/01/2023',
        responsables: [unIdUtilisateur, unAutreIdUtilisateur],
      },
      referentiel
    );

    expect(mesure.description).toEqual('Une mesure spécifique');
    expect(mesure.descriptionLongue).toEqual('Une description longue');
    expect(mesure.idModele).toEqual(idModele);
    expect(mesure.categorie).toEqual('gouvernance');
    expect(mesure.statut).toEqual('fait');
    expect(mesure.modalites).toEqual('Des modalités de mise en œuvre');
    expect(mesure.priorite).toEqual('p3');
    // @ts-expect-error On sait qu'il s'agit d'une date
    expect(mesure.echeance!.getTime()).toEqual(
      new Date('01/01/2023').getTime()
    );
    expect(mesure.responsables).toEqual([
      unIdUtilisateur,
      unAutreIdUtilisateur,
    ]);
  });

  it('connaît ses propriétés obligatoires', () => {
    expect(MesureSpecifique.proprietesObligatoires()).toEqual([
      'id',
      'description',
      'categorie',
      'statut',
    ]);
  });

  it('ne tient pas compte du champ `modalites` ni de la priorite pour déterminer le statut de saisie', () => {
    const mesure = new MesureSpecifique(
      {
        id: unUUIDRandom(),
        description: 'Une mesure spécifique',
        categorie: 'gouvernance',
        statut: 'fait',
      },
      referentiel
    );

    expect(mesure.statutSaisie()).toEqual(InformationsService.COMPLETES);
  });

  it('vérifie que le statut est bien valide', () => {
    expect(
      // @ts-expect-error On force une valeur incorrecte
      () => new MesureSpecifique({ statut: 'statutInconnu' }, referentiel)
    ).toThrowError(
      new ErreurStatutMesureInvalide('Le statut "statutInconnu" est invalide')
    );
  });

  it('vérifie la valeur de la priorité', () => {
    referentiel.enrichis({ prioritesMesures: {} });
    expect(
      // @ts-expect-error On force une valeur incorrecte
      () => new MesureSpecifique({ priorite: 'prioriteInvalide' }, referentiel)
    ).toThrowError(
      new ErreurPrioriteMesureInvalide(
        'La priorité "prioriteInvalide" est invalide'
      )
    );
  });

  it("vérifie la valeur de l'échéance", () => {
    expect(
      // @ts-expect-error On force une valeur incorrecte
      () => new MesureSpecifique({ echeance: 'pasUneDate' }, referentiel)
    ).toThrowError(
      new ErreurEcheanceMesureInvalide('L\'échéance "pasUneDate" est invalide')
    );
  });

  it('vérifie que la catégorie est bien répertoriée', () => {
    expect(
      () =>
        // @ts-expect-error On force une valeur incorrecte
        new MesureSpecifique({ categorie: 'categorieInconnue' }, referentiel)
    ).toThrowError(
      new ErreurCategorieInconnue(
        'La catégorie "categorieInconnue" n\'est pas répertoriée'
      )
    );
  });

  it("ne tient pas compte de la catégorie si elle n'est pas renseignée", () => {
    expect(
      () =>
        new MesureSpecifique(
          // @ts-expect-error On force une valeur incorrecte
          { ...donneesDeBase(), categorie: undefined },
          referentiel
        )
    ).not.toThrowError();
  });

  it("n'est pas indispensable selon l'ANSSI", () => {
    const mesure = new MesureSpecifique(donneesDeBase(), referentiel);
    expect(mesure.estIndispensable()).toBe(false);
  });

  it("n'est pas recommandée par l'ANSSI", () => {
    const mesure = new MesureSpecifique(donneesDeBase(), referentiel);
    expect(mesure.estRecommandee()).toBe(false);
  });

  it('sait si son statut est renseigné', () => {
    const mesure = new MesureSpecifique(
      { ...donneesDeBase(), statut: 'fait' },
      referentiel
    );
    expect(mesure.statutRenseigne()).toBe(true);
  });

  describe('concernant la persistance', () => {
    let donneesMesureSpecifique: DonneesMesureSpecifique;

    beforeEach(() => {
      referentiel.enrichis({ prioritesMesures: { p3: {} } });
      donneesMesureSpecifique = {
        id: unUUIDRandom(),
        description: 'Une mesure spécifique',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
        statut: 'fait',
        modalites: 'Des modalités de mise en œuvre',
        priorite: 'p3',
        echeance: '01/23/2024 10:00Z',
        responsables: [unUUIDRandom(), unUUIDRandom()],
      };
    });

    it("persiste sa date d'échéance au format ISO en UTC", () => {
      const janvierNonIso = '01/23/2024 10:00Z';
      const avecEcheance = new MesureSpecifique(
        { ...donneesDeBase(), echeance: janvierNonIso },
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

      expect(persistance).toEqual({
        id: donneesMesureSpecifique.id,
        description: 'Une mesure spécifique',
        descriptionLongue: 'Une description longue',
        categorie: 'gouvernance',
        statut: 'fait',
        modalites: 'Des modalités de mise en œuvre',
        priorite: 'p3',
        echeance: '2024-01-23T10:00:00.000Z',
        responsables: donneesMesureSpecifique.responsables,
      });
    });

    it('ne persiste pas les données du modèle si la mesure a un modèle, car elles ne doivent apparaître que dans le modèle', () => {
      const mesureAvecModele = new MesureSpecifique(
        { ...donneesMesureSpecifique, idModele: unUUIDRandom() },
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
      const donnees = donneesDeBase();
      const mesure = new MesureSpecifique(
        { ...donnees, idModele: undefined },
        referentiel
      );

      expect(() => mesure.detacheDeSonModele()).toThrowError(
        new ErreurDetachementModeleMesureSpecifiqueImpossible(
          `Impossible de détacher la mesure '${donnees.id}' : elle n'est pas reliée à un modèle.`
        )
      );
    });

    it("supprime l'identifiant du modèle, la rendant donc autonome", () => {
      const id = unUUIDRandom();
      const mesure = new MesureSpecifique(
        {
          id,
          idModele: unUUIDRandom(),
          statut: 'fait',
          description: 'Ma mesure spécifique',
          categorie: 'gouvernance',
        },
        referentiel
      );

      mesure.detacheDeSonModele();

      expect(mesure.donneesSerialisees()).toEqual({
        id,
        categorie: 'gouvernance',
        description: 'Ma mesure spécifique',
        responsables: [],
        statut: 'fait',
        echeance: '',
      });
    });
  });
});
