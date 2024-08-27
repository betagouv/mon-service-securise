const expect = require('expect.js');
const {
  consigneActiviteMesure,
} = require('../../../src/bus/abonnements/consigneActiviteMesure');
const ActiviteMesure = require('../../../src/modeles/activiteMesure');
const MesureGenerale = require('../../../src/modeles/mesureGenerale');
const { unService } = require('../../constructeurs/constructeurService');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const Referentiel = require('../../../src/referentiel');

describe("L'abonnement qui consigne l'activité pour une mesure", () => {
  let activiteAjoutee;
  let ajouteActiviteMesureAppelee;
  let gestionnaire;
  const referentiel = Referentiel.creeReferentiel({
    mesures: { audit: { categorie: 'gouvernance' } },
  });

  beforeEach(() => {
    ajouteActiviteMesureAppelee = false;
    const depotDonnees = {
      ajouteActiviteMesure: (activite) => {
        ajouteActiviteMesureAppelee = true;
        activiteAjoutee = activite;
      },
    };
    gestionnaire = consigneActiviteMesure({ depotDonnees });
  });

  it('renvoie une fonction', () => {
    expect(typeof gestionnaire).to.be('function');
  });

  it("crée une activité de mise à jour de statut et délègue au dépôt de données l'ajout", async () => {
    const service = unService().construis();
    const utilisateur = unUtilisateur().construis();
    const evenement = {
      service,
      utilisateur,
      ancienneMesure: new MesureGenerale(
        { id: 'audit', statut: 'nonFait' },
        referentiel
      ),
      nouvelleMesure: new MesureGenerale(
        { id: 'audit', statut: 'fait' },
        referentiel
      ),
    };

    await gestionnaire(evenement);

    expect(activiteAjoutee).to.be.an(ActiviteMesure);
    expect(activiteAjoutee.service).to.be(service);
    expect(activiteAjoutee.acteur).to.be(utilisateur);
    expect(activiteAjoutee.type).to.be('miseAJourStatut');
    expect(activiteAjoutee.details).to.eql({
      ancienStatut: 'nonFait',
      nouveauStatut: 'fait',
    });
  });

  it("considère l'ancien statut comme non défini si l'ancienne mesure est indéfinie", async () => {
    const evenement = {
      ancienneMesure: undefined,
      nouvelleMesure: new MesureGenerale(
        { id: 'audit', statut: 'fait' },
        referentiel
      ),
    };

    await gestionnaire(evenement);

    expect(activiteAjoutee.details).to.eql({
      ancienStatut: undefined,
      nouveauStatut: 'fait',
    });
  });

  it("ne consigne pas si le statut n'a pas changé", async () => {
    const mesureGenerale = new MesureGenerale(
      { id: 'audit', statut: 'fait' },
      referentiel
    );
    const evenement = {
      ancienneMesure: mesureGenerale,
      nouvelleMesure: mesureGenerale,
    };

    await gestionnaire(evenement);

    expect(ajouteActiviteMesureAppelee).to.be(false);
  });
});
