import {
  fabriqueJournalPourLesTests,
  JournalPourLesTests,
} from '../aides/journalPourLesTests.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { consigneProfilUtilisateurModifieDansJournal } from '../../../src/bus/abonnements/consigneProfilUtilisateurModifieDansJournal.ts';

describe("L'abonnement qui consigne (dans le journal MSS) la mise à jour du profil d'un utilisateur", () => {
  let adaptateurJournal: JournalPourLesTests;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
  });

  it('consigne un événement de "profil utilisateur modifié" avec les détails de l\'utilisateur', async () => {
    await consigneProfilUtilisateurModifieDansJournal({ adaptateurJournal })({
      utilisateur: unUtilisateur()
        .avecId('123')
        .avecPostes(['AB', 'CD'])
        .quiTravaillePourUneEntiteAvecSiret('12345')
        .construis(),
    });

    const { type, donnees } = adaptateurJournal.dernierEvenementConsigne();
    expect(type).toBe('PROFIL_UTILISATEUR_MODIFIE');
    expect(donnees.idUtilisateur).toBeDefined();
    expect(donnees.roles).toEqual(['AB', 'CD']);
  });
});
