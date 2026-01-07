import * as AdaptateurJournalMSSMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import { consigneConnexionUtilisateurDansJournal } from '../../../src/bus/abonnements/consigneConnexionUtilisateurDansJournal.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { SourceAuthentification } from '../../../src/modeles/sourceAuthentification.ts';

describe("L'abonnement qui consigne (dans le journal MSS) la connexion d'un utilisateur", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "connexion utilisateur"', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneConnexionUtilisateurDansJournal({ adaptateurJournal })({
      idUtilisateur: unUUID('1'),
      dateDerniereConnexion: '2022-09-02',
      source: SourceAuthentification.MSS,
      connexionAvecMFA: false,
    });

    expect(evenementRecu!.type).toBe('CONNEXION_UTILISATEUR');
  });
});
