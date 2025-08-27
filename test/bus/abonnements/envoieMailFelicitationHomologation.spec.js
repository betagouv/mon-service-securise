import expect from 'expect.js';
import { envoieMailFelicitationHomologation } from '../../../src/bus/abonnements/envoieMailFelicitationHomologation.js';
import { unePersistanceMemoire } from '../../constructeurs/constructeurAdaptateurPersistanceMemoire.js';
import { unService } from '../../constructeurs/constructeurService.js';
import { unUtilisateur } from '../../constructeurs/constructeurUtilisateur.js';
import { uneAutorisation } from '../../constructeurs/constructeurAutorisation.js';
import { creeDepot } from '../../../src/depotDonnees.js';
import fauxAdaptateurChiffrement from '../../mocks/adaptateurChiffrement.js';

describe("L'abonnement qui envoie un mail de félicitation d'homologation", () => {
  let depotDonnees;
  let adaptateurPersistance;
  let adaptateurMail;

  beforeEach(() => {
    adaptateurMail = {
      envoieMessageFelicitationHomologation: async () => {},
    };
    adaptateurPersistance = unePersistanceMemoire()
      .ajouteUnService(unService().avecId('S1').construis())
      .ajouteUnUtilisateur(
        unUtilisateur()
          .avecId('U1')
          .avecEmail('jean.dujardin@beta.gouv.fr')
          .construis()
      )
      .ajouteUneAutorisation(
        uneAutorisation().deProprietaire('U1', 'S1').construis()
      )
      .construis();
    depotDonnees = creeDepot({
      adaptateurPersistance,
      adaptateurChiffrement: fauxAdaptateurChiffrement(),
    });
  });

  it("lève une exception s'il ne reçoit pas d'identifiant du service", async () => {
    try {
      await envoieMailFelicitationHomologation({
        depotDonnees,
        adaptateurMail,
      })({
        idService: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible d'envoyer le mail de félicitation d'homologation sans avoir l'ID du service en paramètre."
      );
    }
  });

  it('utilise le dépôt de données pour trouver le premier propriétaire du service', async () => {
    const donneesRecues = {};
    depotDonnees = {
      autorisationsDuService: (idService) => {
        donneesRecues.idService = idService;
        return [{ estProprietaire: true, idUtilisateur: 'U1' }];
      },
      utilisateur: (idUtilisateur) => {
        donneesRecues.idUtilisateur = idUtilisateur;
        return { email: 'jean.dujardin@beta.gouv.fr' };
      },
    };

    await envoieMailFelicitationHomologation({ depotDonnees, adaptateurMail })({
      idService: 'S1',
    });

    expect(donneesRecues).to.eql({
      idService: 'S1',
      idUtilisateur: 'U1',
    });
  });

  it("utilise l'adaptateur de mail pour envoyer un mail au propriétaire du service", async () => {
    let donneesRecues;
    adaptateurMail.envoieMessageFelicitationHomologation = (
      destinataire,
      idService
    ) => {
      donneesRecues = { destinataire, idService };
    };

    await envoieMailFelicitationHomologation({ depotDonnees, adaptateurMail })({
      idService: 'S1',
    });

    expect(donneesRecues).to.eql({
      destinataire: 'jean.dujardin@beta.gouv.fr',
      idService: 'S1',
    });
  });
});
