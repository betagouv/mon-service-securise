const expect = require('expect.js');
const AdaptateurJournalMSSMemoire = require('../../../src/adaptateurs/adaptateurJournalMSSMemoire');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const {
  consigneProfilUtilisateurModifieDansJournal,
} = require('../../../src/bus/abonnements/consigneProfilUtilisateurModifieDansJournal');
const fauxAdaptateurRechercheEntreprise = require('../../mocks/adaptateurRechercheEntreprise');

describe("L'abonnement qui consigne (dans le journal MSS) la mise à jour du profil d'un utilisateur", () => {
  let adaptateurJournal;
  let adaptateurRechercheEntreprise;

  beforeEach(() => {
    adaptateurJournal = AdaptateurJournalMSSMemoire.nouvelAdaptateur();
    adaptateurRechercheEntreprise = fauxAdaptateurRechercheEntreprise();
  });

  it('consigne un événement de "profil utilisateur modifié"', async () => {
    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneProfilUtilisateurModifieDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    })({
      utilisateur: unUtilisateur().construis(),
    });

    expect(evenementRecu.type).to.be('PROFIL_UTILISATEUR_MODIFIE');
  });

  it("complète l'évènement avec les détails de l'entité de l'utilisateur", async () => {
    const entite = {
      estServicePublic: false,
      estFiness: false,
      estEss: true,
      estEntrepreneurIndividuel: false,
      collectiviteTerritoriale: null,
      estAssociation: false,
      categorieEntreprise: null,
      activitePrincipale: '68.20B',
      trancheEffectifSalarie: null,
      natureJuridique: '6540',
      sectionActivitePrincipale: 'L',
      anneeTrancheEffectifSalarie: null,
      commune: '33376',
      departement: '33',
    };

    let evenementRecu = {};
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };
    adaptateurRechercheEntreprise.recupereDetailsOrganisation = async () =>
      entite;

    await consigneProfilUtilisateurModifieDansJournal({
      adaptateurJournal,
      adaptateurRechercheEntreprise,
    })({
      utilisateur: unUtilisateur()
        .avecId('123')
        .avecPostes(['AB', 'CD'])
        .construis(),
    });

    expect(evenementRecu.donnees.entite).to.eql(entite);
    expect(evenementRecu.donnees.idUtilisateur).to.not.be(null);
    expect(evenementRecu.donnees.roles).to.eql(['AB', 'CD']);
  });

  it("lève une exception s'il ne reçoit pas d'utilisateur", async () => {
    try {
      await consigneProfilUtilisateurModifieDansJournal({
        adaptateurJournal,
        adaptateurRechercheEntreprise,
      })({
        utilisateur: null,
      });
      expect().fail("L'instanciation aurait dû lever une exception.");
    } catch (e) {
      expect(e.message).to.be(
        "Impossible de consigner les mises à jour de profil utilisateur sans avoir l'utilisateur en paramètre."
      );
    }
  });
});
