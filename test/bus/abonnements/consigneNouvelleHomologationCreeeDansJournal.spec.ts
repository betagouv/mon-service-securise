import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneNouvelleHomologationCreeeDansJournal } from '../../../src/bus/abonnements/consigneNouvelleHomologationCreeeDansJournal.ts';
import { unDossier } from '../../constructeurs/constructeurDossier.js';
import * as Referentiel from '../../../src/referentiel.js';
import { unUUID } from '../../constructeurs/UUID.ts';

describe("L'abonnement qui consigne (dans le journal MSS) la finalisation d'un dossier d'homologation", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });
  const referentiel = Referentiel.creeReferentiel({
    // @ts-expect-error on recharge partiellement le référentiel
    echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
    // @ts-expect-error on recharge partiellement le référentiel
    statutsAvisDossierHomologation: { favorable: {} },
  });

  it('consigne un événement de "nouvelle homologation créée"', async () => {
    await consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    })({
      idService: unUUID('1'),
      dossier: unDossier(referentiel).quiEstComplet().quiEstActif().construis(),
    });

    const { type, donnees } = adaptateurJournal.dernierEvenementConsigne();
    expect(type).toBe('NOUVELLE_HOMOLOGATION_CREEE');
    expect(donnees.dureeHomologationMois).toBe(12);
  });

  it('peut consigner un événement de "nouvelle homologation `importee`"', async () => {
    await consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    })({
      idService: unUUID('1'),
      dossier: unDossier(referentiel).quiEstComplet().quiEstActif().construis(),
      importe: true,
    });

    expect(adaptateurJournal.dernierEvenementConsigne().donnees.importe).toBe(
      true
    );
  });

  it('peut consigner un événement de "nouvelle homologation `refusee`"', async () => {
    await consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    })({
      idService: unUUID('1'),
      dossier: unDossier(referentiel).quiEstRefuse('2026-04-29').construis(),
    });

    const { donnees } = adaptateurJournal.dernierEvenementConsigne();
    expect(donnees.dateHomologation).toBe('2026-04-29');
    expect(donnees.refusee).toBe(true);
  });
});
