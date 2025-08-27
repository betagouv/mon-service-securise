import expect from 'expect.js';
import * as AdaptateurJournalMSSMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import { consigneTeleversementServicesRealiseDansJournal } from '../../../src/bus/abonnements/consigneTeleversementServicesRealiseDansJournal.js';

describe("L'abonnement qui consigne (dans le journal MSS) la réalisation d'un téléversement de services", () => {
  let adaptateurJournal;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
  });

  it('consigne un événement de "services importés"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneTeleversementServicesRealiseDansJournal({
      adaptateurJournal,
    })({
      idUtilisateur: 'abc',
      nbServicesImportes: 42,
    });

    expect(evenementRecu.type).to.be('SERVICES_IMPORTES');
  });

  [
    { propriete: 'idUtilisateur', nom: "l'identifiant de l'utilisateur" },
    { propriete: 'nbServicesImportes', nom: 'le nombre de services importés' },
  ].forEach(({ propriete, nom }) => {
    const donnees = {
      idUtilisateur: '123',
      nbServicesImportes: 42,
    };
    it(`lève une exception s'il ne reçoit pas ${nom}`, async () => {
      try {
        delete donnees[propriete];
        await consigneTeleversementServicesRealiseDansJournal({
          adaptateurJournal,
        })(donnees);
        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          `Impossible de consigner la réalisation d'un téléversement de services sans avoir ${nom} en paramètre.`
        );
      }
    });
  });
});
