import {
  ErreurMesureInconnue,
  ErreurStatutMesureInvalide,
  ErreurPrioriteMesureInvalide,
  ErreurEcheanceMesureInvalide,
} from '../../src/erreurs.js';

import { creeReferentiel } from '../../src/referentiel.js';
import MesureGenerale from '../../src/modeles/mesureGenerale.js';
import InformationsService from '../../src/modeles/informationsService.js';
import { Referentiel } from '../../src/referentiel.interface.ts';
import { unUUIDRandom } from '../constructeurs/UUID.ts';

describe('Une mesure de sécurité', () => {
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentiel();
    referentiel.enrichis({
      mesures: {
        audit: { description: 'Une description' },
        consignesSecurite: {
          description: 'Cette mesure est indispensable',
          indispensable: true,
        },
      },
    });
  });

  it('sait se décrire', () => {
    referentiel.enrichis({ prioritesMesures: { p3: {} } });
    const unIdUtilisateur = unUUIDRandom();
    const unAutreIdUtilisateur = unUUIDRandom();
    const mesure = new MesureGenerale(
      {
        id: 'audit',
        statut: MesureGenerale.STATUT_FAIT,
        modalites: "Des modalités d'application",
        priorite: 'p3',
        echeance: '01/01/2023',
        responsables: [unIdUtilisateur, unAutreIdUtilisateur],
      },
      referentiel
    );

    expect(mesure.id).toEqual('audit');
    expect(mesure.statut).toEqual(MesureGenerale.STATUT_FAIT);
    expect(mesure.modalites).toEqual("Des modalités d'application");
    expect(mesure.priorite).toEqual('p3');
    expect(mesure.echeance).toEqual(new Date('01/01/2023'));
    expect(mesure.responsables).toEqual([
      unIdUtilisateur,
      unAutreIdUtilisateur,
    ]);
    expect(mesure.toJSON()).toEqual({
      id: 'audit',
      statut: MesureGenerale.STATUT_FAIT,
      modalites: "Des modalités d'application",
      priorite: 'p3',
      echeance: new Date('01/01/2023'),
      responsables: [unIdUtilisateur, unAutreIdUtilisateur],
    });
  });

  it('vérifie que la mesure est bien répertoriée', () => {
    expect(
      () =>
        new MesureGenerale(
          // @ts-expect-error On force une valeur incorrecte
          { id: 'identifiantInconnu', statut: MesureGenerale.STATUT_FAIT },
          referentiel
        )
    ).toThrowError(
      new ErreurMesureInconnue(
        'La mesure "identifiantInconnu" n\'est pas répertoriée'
      )
    );
  });

  it('vérifie la nature du statut', () => {
    expect(
      () =>
        new MesureGenerale(
          // @ts-expect-error On force une valeur incorrecte
          { id: 'audit', statut: 'statutInvalide' },
          referentiel
        )
    ).toThrowError(
      new ErreurStatutMesureInvalide('Le statut "statutInvalide" est invalide')
    );
  });

  it('vérifie la valeur de la priorité', () => {
    referentiel.enrichis({ prioritesMesures: {} });
    expect(
      () =>
        new MesureGenerale(
          // @ts-expect-error On force une valeur incorrecte
          { id: 'audit', priorite: 'prioriteInvalide' },
          referentiel
        )
    ).toThrowError(
      new ErreurPrioriteMesureInvalide(
        'La priorité "prioriteInvalide" est invalide'
      )
    );
  });

  it("vérifie la valeur de l'échéance", () => {
    expect(
      () =>
        // @ts-expect-error On force une valeur incorrecte
        new MesureGenerale({ id: 'audit', echeance: 'pasUneDate' }, referentiel)
    ).toThrowError(
      new ErreurEcheanceMesureInvalide('L\'échéance "pasUneDate" est invalide')
    );
  });

  it('connaît sa description', () => {
    expect(referentiel.mesures().audit.description).toEqual('Une description');

    const mesure = new MesureGenerale(
      { id: 'audit', statut: 'fait' },
      referentiel
    );
    expect(mesure.descriptionMesure()).toEqual('Une description');
  });

  it("sait si elle est indispensable selon l'ANSSI", () => {
    expect(referentiel.mesures().consignesSecurite.indispensable).toBe(true);

    const mesureIndispensable = new MesureGenerale(
      { id: 'consignesSecurite', statut: 'fait' },
      referentiel
    );
    expect(mesureIndispensable.estIndispensable()).toBe(true);
  });

  it('sait si elle est seulement recommandée', () => {
    // @ts-expect-error On sait que cette mesure n'est pas indispensable
    expect(referentiel.mesures().audit.indispensable).not.toBeTruthy();

    const mesure = new MesureGenerale(
      { id: 'audit', statut: 'fait' },
      referentiel
    );
    expect(mesure.estRecommandee()).toBe(true);
  });

  it('peut être rendue indispensable, même si le référentiel dit le contraire', () => {
    expect(referentiel.mesureIndispensable('audit')).toBe(false);

    const mesure = new MesureGenerale(
      { id: 'audit', statut: 'fait', rendueIndispensable: true },
      referentiel
    );
    expect(mesure.estIndispensable()).toBe(true);
  });

  it('sait si son statut est renseigné', () => {
    const mesure = new MesureGenerale(
      { id: 'audit', statut: 'fait' },
      referentiel
    );
    expect(mesure.statutRenseigne()).toBe(true);
  });

  it('connait sa priorité', () => {
    referentiel.enrichis({ prioritesMesures: { p2: {} } });
    const mesure = new MesureGenerale(
      { id: 'audit', priorite: 'p2', statut: 'fait' },
      referentiel
    );

    expect(mesure.priorite).toEqual('p2');
  });

  it('ne tient pas compte du champ priorite pour déterminer le statut de saisie', () => {
    const mesure = new MesureGenerale(
      {
        id: 'audit',
        statut: MesureGenerale.STATUT_FAIT,
        modalites: "Des modalités d'application",
      },
      referentiel
    );

    expect(mesure.statutSaisie()).toEqual(InformationsService.COMPLETES);
  });

  it("persiste sa date d'échéance au format ISO en UTC", () => {
    const janvierNonIso = '01/23/2024 10:00Z';
    const avecEcheance = new MesureGenerale(
      { id: 'audit', echeance: janvierNonIso, statut: 'fait' },
      referentiel
    );

    const persistance = avecEcheance.donneesSerialisees();

    expect(persistance.echeance).toBe('2024-01-23T10:00:00.000Z');
  });

  it('conserve une echeance vide', () => {
    const mesure = new MesureGenerale(
      {
        id: 'audit',
        statut: MesureGenerale.STATUT_FAIT,
        echeance: '',
      },
      referentiel
    );

    expect(mesure.echeance).toBe('');
  });
});
