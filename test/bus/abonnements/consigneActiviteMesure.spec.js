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
  let activitesAjoutees;
  let ajouteActiviteMesureAppelee;
  let gestionnaire;
  const referentiel = Referentiel.creeReferentiel({
    mesures: { audit: { categorie: 'gouvernance' } },
  });

  beforeEach(() => {
    ajouteActiviteMesureAppelee = false;
    activiteAjoutee = undefined;
    activitesAjoutees = [];
    const depotDonnees = {
      ajouteActiviteMesure: (activite) => {
        ajouteActiviteMesureAppelee = true;
        activiteAjoutee = activite;
        activitesAjoutees.push(activite);
      },
    };
    gestionnaire = consigneActiviteMesure({ depotDonnees });
  });

  it('renvoie une fonction', () => {
    expect(typeof gestionnaire).to.be('function');
  });

  it("ne consigne pas si la mesure n'a pas changé", async () => {
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

  it("ajoute une activité d'ajout de priorité et délègue au dépôt de données l'ajout", async () => {
    referentiel.enrichis({ prioritesMesures: { p2: {} } });
    const service = unService().construis();
    const utilisateur = unUtilisateur().construis();
    const evenement = {
      service,
      utilisateur,
      ancienneMesure: new MesureGenerale(
        { id: 'audit', priorite: undefined },
        referentiel
      ),
      nouvelleMesure: new MesureGenerale(
        { id: 'audit', priorite: 'p2' },
        referentiel
      ),
    };

    await gestionnaire(evenement);

    expect(activiteAjoutee).to.be.an(ActiviteMesure);
    expect(activiteAjoutee.service).to.be(service);
    expect(activiteAjoutee.acteur).to.be(utilisateur);
    expect(activiteAjoutee.type).to.be('ajoutPriorite');
    expect(activiteAjoutee.details).to.eql({
      nouvellePriorite: 'p2',
    });
  });

  it('peut consigner une mise à jour du statut et de la priorité en même temps', async () => {
    referentiel.enrichis({ prioritesMesures: { p2: {} } });
    const service = unService().construis();
    const utilisateur = unUtilisateur().construis();
    const evenement = {
      service,
      utilisateur,
      ancienneMesure: undefined,
      nouvelleMesure: new MesureGenerale(
        { id: 'audit', statut: 'nonFait', priorite: 'p2' },
        referentiel
      ),
    };

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(2);
    expect(activitesAjoutees[0].type).to.be('miseAJourStatut');
    expect(activitesAjoutees[1].type).to.be('ajoutPriorite');
  });

  it('ajoute une activité de mise à jour de priorité si celle-ci a changé', async () => {
    referentiel.enrichis({ prioritesMesures: { p2: {}, p3: {} } });
    const service = unService().construis();
    const utilisateur = unUtilisateur().construis();
    const evenement = {
      service,
      utilisateur,
      ancienneMesure: new MesureGenerale(
        { id: 'audit', priorite: 'p3' },
        referentiel
      ),
      nouvelleMesure: new MesureGenerale(
        { id: 'audit', priorite: 'p2' },
        referentiel
      ),
    };

    await gestionnaire(evenement);

    expect(activiteAjoutee).to.be.an(ActiviteMesure);
    expect(activiteAjoutee.type).to.be('miseAJourPriorite');
    expect(activiteAjoutee.details).to.eql({
      anciennePriorite: 'p3',
      nouvellePriorite: 'p2',
    });
  });

  it("ne crée pas d'activité de mise à jour de priorité lorsque le statut est défini mais pas la priorité", async () => {
    referentiel.enrichis({ prioritesMesures: { p2: {}, p3: {} } });
    const service = unService().construis();
    const utilisateur = unUtilisateur().construis();
    const evenement = {
      service,
      utilisateur,
      ancienneMesure: undefined,
      nouvelleMesure: new MesureGenerale(
        { id: 'audit', statut: 'fait', priorite: '' },
        referentiel
      ),
    };

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activitesAjoutees[0].type).to.be('miseAJourStatut');
  });
});
