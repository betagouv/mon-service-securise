import expect from 'expect.js';
import { fabriqueJournalPourLesTests } from '../aides/journalPourLesTests.js';
import { consigneNouvelleHomologationCreeeDansJournal } from '../../../src/bus/abonnements/consigneNouvelleHomologationCreeeDansJournal.js';
import { unDossier } from '../../constructeurs/constructeurDossier.js';
import * as Referentiel from '../../../src/referentiel.js';

describe("L'abonnement qui consigne (dans le journal MSS) la finalisation d'un dossier d'homologation", () => {
  let adaptateurJournal;
  let referentiel;

  beforeEach(() => {
    adaptateurJournal = fabriqueJournalPourLesTests();
    referentiel = Referentiel.creeReferentiel({
      echeancesRenouvellement: { unAn: { nbMoisDecalage: 12 } },
      statutsAvisDossierHomologation: { favorable: {} },
    });
  });

  it('consigne un événement de "nouvelle homologation créée"', async () => {
    await consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    })({
      idService: '123',
      dossier: unDossier(referentiel).quiEstComplet().quiEstActif().construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.be(
      'NOUVELLE_HOMOLOGATION_CREEE'
    );
  });

  it('peut consigner un événement de "nouvelle homologation `importee`"', async () => {
    await consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    })({
      idService: '123',
      dossier: unDossier(referentiel).quiEstComplet().quiEstActif().construis(),
      importe: true,
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.be(
      'NOUVELLE_HOMOLOGATION_CREEE'
    );
    expect(adaptateurJournal.dernierEvenementConsigne().donnees.importe).to.be(
      true
    );
  });

  it('peut consigner un événement de "nouvelle homologation `refusee`"', async () => {
    await consigneNouvelleHomologationCreeeDansJournal({
      adaptateurJournal,
      referentiel,
    })({
      idService: '123',
      dossier: unDossier(referentiel).quiEstRefuse('2026-04-29').construis(),
    });

    expect(adaptateurJournal.dernierEvenementConsigne().type).to.be(
      'NOUVELLE_HOMOLOGATION_CREEE'
    );
    expect(
      adaptateurJournal.dernierEvenementConsigne().donnees.dateHomologation
    ).to.be('2026-04-29');
    expect(adaptateurJournal.dernierEvenementConsigne().donnees.refusee).to.be(
      true
    );
  });

  [
    { propriete: 'idService', nom: "l'ID du service" },
    { propriete: 'dossier', nom: 'le dossier' },
  ].forEach(({ propriete, nom }) => {
    const donnees = {
      idService: '123',
      dossier: {},
    };
    it(`lève une exception s'il ne reçoit pas ${nom}`, async () => {
      try {
        delete donnees[propriete];
        await consigneNouvelleHomologationCreeeDansJournal({
          adaptateurJournal,
          referentiel,
        })(donnees);
        expect().fail("L'instanciation aurait dû lever une exception.");
      } catch (e) {
        expect(e.message).to.be(
          `Impossible de consigner la finalisation d'un dossier d'homologation sans avoir ${nom} en paramètre.`
        );
      }
    });
  });
});
