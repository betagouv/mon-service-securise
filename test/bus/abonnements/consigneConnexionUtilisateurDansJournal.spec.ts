import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { consigneConnexionUtilisateurDansJournal } from '../../../src/bus/abonnements/consigneConnexionUtilisateurDansJournal.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { SourceAuthentification } from '../../../src/modeles/sourceAuthentification.ts';

describe("L'abonnement qui consigne (dans le journal MSS) la connexion d'un utilisateur", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "connexion utilisateur"', async () => {
    await consigneConnexionUtilisateurDansJournal({ adaptateurJournal })({
      idUtilisateur: unUUID('1'),
      dateDerniereConnexion: '2022-09-02',
      source: SourceAuthentification.AGENT_CONNECT,
      connexionAvecMFA: false,
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).toBe(
      'CONNEXION_UTILISATEUR'
    );
  });
});
