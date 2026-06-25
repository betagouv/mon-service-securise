import { unService } from '../../constructeurs/constructeurService.js';
import EvenementRisquesServiceModifies from '../../../src/modeles/journalMSS/evenementRisquesServiceModifies.js';
import { ErreurServiceManquant } from '../../../src/modeles/journalMSS/erreurs.js';
import Risques from '../../../src/modeles/risques.js';
import { Referentiel } from '../../../src/referentiel.interface.ts';
import { creeReferentiel } from '../../../src/referentiel.ts';
import { DonneesRisqueSpecifique } from '../../../src/modeles/risqueSpecifique.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { DonneesRisqueGeneral } from '../../../src/modeles/risqueGeneral.ts';

describe('Un événement de risques modifiés', () => {
  const hacheEnMajuscules = {
    hacheSha256: (valeur: string) => valeur?.toUpperCase(),
  };
  let referentiel: Referentiel;

  beforeEach(() => {
    referentiel = creeReferentiel({
      // @ts-expect-error on recharge partiellement le référentiel
      risques: { R1: {} },
      // @ts-expect-error on recharge partiellement le référentiel
      niveauxGravite: { moyen: {}, minime: {} },
      // @ts-expect-error on recharge partiellement le référentiel
      vraisemblancesRisques: { invraisemblable: {}, quasiCertain: {} },
    });
  });

  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = new EvenementRisquesServiceModifies(
      { service: unService().avecId('abc').construis() },
      { adaptateurChiffrement: hacheEnMajuscules }
    );

    const json = evenement.toJSON();

    expect(json.donnees.idService).toBe('ABC');
  });

  it('sait se convertir en JSON', () => {
    const risquesGeneraux: DonneesRisqueGeneral[] = [
      { id: 'R1', niveauGravite: 'moyen', niveauVraisemblance: 'quasiCertain' },
    ];
    const risquesSpecifiques: DonneesRisqueSpecifique[] = [
      {
        id: unUUID('R'),
        intitule: '',
        identifiantNumerique: '1',
        niveauGravite: 'minime',
        niveauVraisemblance: 'invraisemblable',
        categories: ['confidentialite'],
      },
    ];
    const service = unService(referentiel)
      .avecId('ABC')
      .avecRisques(
        new Risques({ risquesGeneraux, risquesSpecifiques }, referentiel)
      )
      .construis();

    const evenement = new EvenementRisquesServiceModifies(
      { service },
      { date: '30/10/2024', adaptateurChiffrement: hacheEnMajuscules }
    );

    expect(evenement.toJSON()).toEqual({
      type: 'RISQUES_SERVICE_MODIFIES',
      donnees: {
        idService: 'ABC',
        risquesGeneraux: [
          {
            id: 'R1',
            niveauGravite: 'moyen',
            niveauVraisemblance: 'quasiCertain',
          },
        ],
        risquesSpecifiques: [
          {
            id: unUUID('R'),
            niveauGravite: 'minime',
            niveauVraisemblance: 'invraisemblable',
            categories: ['confidentialite'],
          },
        ],
      },
      date: '30/10/2024',
    });
  });

  it('exige que le service soit renseigné', () => {
    expect(
      () =>
        new EvenementRisquesServiceModifies({
          // @ts-expect-error on veut justement tester ça
          service: undefined,
        })
    ).toThrow(ErreurServiceManquant);
  });

  it("n'envoie que les données pertinentes du risque général", () => {
    const risquesGeneraux: DonneesRisqueGeneral[] = [
      // @ts-expect-error on omet volontairement la gravité et la vraisemblance
      { id: 'R1', commentaire: 'des données hyper sensibles' },
    ];
    const service = unService(referentiel)
      .avecRisques(new Risques({ risquesGeneraux }, referentiel))
      .construis();

    const evenement = new EvenementRisquesServiceModifies({ service });

    expect(evenement.toJSON().donnees.risquesGeneraux).toEqual([
      {
        id: 'R1',
        niveauGravite: undefined,
        niveauVraisemblance: undefined,
      },
    ]);
  });

  it("n'envoie que les données pertinentes du risque spécifique", () => {
    const risquesSpecifiques: DonneesRisqueSpecifique[] = [
      // @ts-expect-error on omet volontairement la gravité et la vraisemblance
      {
        id: unUUID('R'),
        intitule: 'mon titre',
        description: 'des données sensibles',
        commentaire: 'des données hyper sensibles',
      },
    ];
    const service = unService(referentiel)
      .avecRisques(new Risques({ risquesSpecifiques }, referentiel))
      .construis();

    const evenement = new EvenementRisquesServiceModifies({ service });

    expect(evenement.toJSON().donnees.risquesSpecifiques).toEqual([
      {
        id: unUUID('R'),
        niveauGravite: undefined,
        niveauVraisemblance: undefined,
        categories: [],
      },
    ]);
  });
});
