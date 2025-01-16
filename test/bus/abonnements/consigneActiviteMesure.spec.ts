const expect = require('expect.js');
const {
  consigneActiviteMesure,
} = require('../../../src/bus/abonnements/consigneActiviteMesure');
const ActiviteMesure = require('../../../src/modeles/activiteMesure');
const { unService } = require('../../constructeurs/constructeurService');
const {
  unUtilisateur,
} = require('../../constructeurs/constructeurUtilisateur');
const {
  uneMesureGenerale,
} = require('../../constructeurs/constructeurMesureGenerale');

describe("L'abonnement qui consigne l'activité pour une mesure", () => {
  let activiteAjoutee;
  let activitesAjoutees;
  let ajouteActiviteMesureAppelee;
  let gestionnaire;
  const le12septembre = new Date(2024, 8, 12);
  const le28aout = new Date(2024, 7, 28);

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

  const creeEvenement = ({ ancienneMesure, nouvelleMesure, typeMesure }) => ({
    service: unService().construis(),
    utilisateur: unUtilisateur().construis(),
    ancienneMesure,
    nouvelleMesure,
    typeMesure,
  });

  it("ne consigne pas si la mesure n'a pas changé", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale().construis(),
      nouvelleMesure: uneMesureGenerale().construis(),
    });

    await gestionnaire(evenement);

    expect(ajouteActiviteMesureAppelee).to.be(false);
  });

  it("crée une activité de mise à jour de statut et délègue au dépôt de données l'ajout", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale().avecStatut('nonFait').construis(),
      nouvelleMesure: uneMesureGenerale().avecStatut('fait').construis(),
      typeMesure: 'generale',
    });

    await gestionnaire(evenement);

    expect(activiteAjoutee).to.be.an(ActiviteMesure);
    expect(activiteAjoutee.idService).to.be(evenement.service.id);
    expect(activiteAjoutee.idActeur).to.be(evenement.utilisateur.id);
    expect(activiteAjoutee.type).to.be('miseAJourStatut');
    expect(activiteAjoutee.typeMesure).to.be('generale');
    expect(activiteAjoutee.details).to.eql({
      ancienneValeur: 'nonFait',
      nouvelleValeur: 'fait',
    });
  });

  it("crée une activité d'ajout de statut si l'ancienne mesure est indéfinie", async () => {
    const evenement = creeEvenement({
      ancienneMesure: undefined,
      nouvelleMesure: uneMesureGenerale().avecStatut('fait').construis(),
    });

    await gestionnaire(evenement);

    expect(activiteAjoutee.type).to.be('ajoutStatut');
    expect(activiteAjoutee.details).to.eql({
      nouvelleValeur: 'fait',
    });
  });

  it("ajoute une activité d'ajout de priorité et délègue au dépôt de données l'ajout", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale().sansPriorite().construis(),
      nouvelleMesure: uneMesureGenerale().avecPriorite('p2').construis(),
    });

    await gestionnaire(evenement);

    expect(activiteAjoutee).to.be.an(ActiviteMesure);
    expect(activiteAjoutee.idService).to.be(evenement.service.id);
    expect(activiteAjoutee.idActeur).to.be(evenement.utilisateur.id);
    expect(activiteAjoutee.type).to.be('ajoutPriorite');
    expect(activiteAjoutee.details).to.eql({
      nouvelleValeur: 'p2',
    });
  });

  it('peut consigner un ajout de statut et de la priorité en même temps', async () => {
    const evenement = creeEvenement({
      ancienneMesure: undefined,
      nouvelleMesure: uneMesureGenerale().avecPriorite('p2').construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(2);
    expect(activitesAjoutees[0].type).to.be('ajoutStatut');
    expect(activitesAjoutees[1].type).to.be('ajoutPriorite');
  });

  it('ajoute une activité de mise à jour de priorité si celle-ci a changé', async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale().avecPriorite('p3').construis(),
      nouvelleMesure: uneMesureGenerale().avecPriorite('p2').construis(),
    });

    await gestionnaire(evenement);

    expect(activiteAjoutee).to.be.an(ActiviteMesure);
    expect(activiteAjoutee.type).to.be('miseAJourPriorite');
    expect(activiteAjoutee.details).to.eql({
      ancienneValeur: 'p3',
      nouvelleValeur: 'p2',
    });
  });

  it("ne crée pas d'activité de mise à jour de priorité lorsque le statut est défini mais pas la priorité", async () => {
    const evenement = creeEvenement({
      ancienneMesure: undefined,
      nouvelleMesure: uneMesureGenerale().avecPriorite('').construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activitesAjoutees[0].type).to.be('ajoutStatut');
  });

  it("ajoute la mesure dans l'activité", async () => {
    const mesure = uneMesureGenerale().construis();
    const evenement = creeEvenement({
      ancienneMesure: undefined,
      nouvelleMesure: mesure,
    });

    await gestionnaire(evenement);

    expect(activiteAjoutee.idMesure).to.be(mesure.id);
  });

  it("crée une activité lorsque la date d'échéance est ajoutée", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale().avecEcheance('').construis(),
      nouvelleMesure: uneMesureGenerale().avecEcheance(le28aout).construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activiteAjoutee.type).to.be('ajoutEcheance');
    expect(activiteAjoutee.details).to.eql({ nouvelleValeur: le28aout });
  });

  it("ne crée pas d'activité concernant l'échéance lorsque l'ancienne mesure est vide et que l'échéance est vide", async () => {
    const evenement = creeEvenement({
      ancienneMesure: undefined,
      nouvelleMesure: uneMesureGenerale().avecEcheance('').construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activiteAjoutee.type).to.be('ajoutStatut');
  });

  it("crée une activité lorsque l'échéance est modifiée", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale()
        .avecEcheance(le12septembre)
        .construis(),
      nouvelleMesure: uneMesureGenerale().avecEcheance(le28aout).construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activiteAjoutee.type).to.be('miseAJourEcheance');
    expect(activiteAjoutee.details).to.eql({
      ancienneValeur: le12septembre,
      nouvelleValeur: le28aout,
    });
  });

  it("crée une activité lorsque l'échéance est supprimée", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale()
        .avecEcheance(le12septembre)
        .construis(),
      nouvelleMesure: uneMesureGenerale().avecEcheance('').construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activiteAjoutee.type).to.be('suppressionEcheance');
    expect(activiteAjoutee.details).to.eql({
      ancienneValeur: le12septembre,
    });
  });

  it("ne crée pas d'activité si les deux dates des échéances sont égales", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale()
        .avecEcheance(new Date(le12septembre))
        .construis(),
      nouvelleMesure: uneMesureGenerale()
        .avecEcheance(new Date(le12septembre))
        .construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(0);
  });

  it("crée une activité lorsqu'un responsable est ajouté", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale().sansResponsable().construis(),
      nouvelleMesure: uneMesureGenerale()
        .avecResponsable('idUtilisateur')
        .construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activiteAjoutee.type).to.be('ajoutResponsable');
    expect(activiteAjoutee.details).to.eql({ valeur: 'idUtilisateur' });
  });

  it("crée une activité lorsqu'un second responsable est ajouté", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale()
        .avecResponsable('idUtilisateur')
        .construis(),
      nouvelleMesure: uneMesureGenerale()
        .avecResponsable('idUtilisateur')
        .avecResponsable('secondIdUtilisateur')
        .construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activiteAjoutee.type).to.be('ajoutResponsable');
    expect(activiteAjoutee.details).to.eql({ valeur: 'secondIdUtilisateur' });
  });

  it("crée une activité lorsqu'un second responsable est ajouté en première position", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale()
        .avecResponsable('idUtilisateur')
        .construis(),
      nouvelleMesure: uneMesureGenerale()
        .avecResponsable('secondIdUtilisateur')
        .avecResponsable('idUtilisateur')
        .construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activiteAjoutee.type).to.be('ajoutResponsable');
    expect(activiteAjoutee.details).to.eql({ valeur: 'secondIdUtilisateur' });
  });

  it('crée une activité lorsque plusieurs responsables sont ajoutés', async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale().sansResponsable().construis(),
      nouvelleMesure: uneMesureGenerale()
        .avecResponsable('secondIdUtilisateur')
        .avecResponsable('idUtilisateur')
        .construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(2);
    expect(activitesAjoutees[0].type).to.be('ajoutResponsable');
    expect(activitesAjoutees[0].details).to.eql({
      valeur: 'secondIdUtilisateur',
    });
    expect(activitesAjoutees[1].type).to.be('ajoutResponsable');
    expect(activitesAjoutees[1].details).to.eql({ valeur: 'idUtilisateur' });
  });

  it("crée une activité lorsqu'un responsable est supprimé", async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale()
        .avecResponsable('idUtilisateur')
        .construis(),
      nouvelleMesure: uneMesureGenerale().sansResponsable().construis(),
    });

    await gestionnaire(evenement);

    expect(activitesAjoutees.length).to.be(1);
    expect(activiteAjoutee.type).to.be('suppressionResponsable');
    expect(activiteAjoutee.details).to.eql({ valeur: 'idUtilisateur' });
  });

  it('crée une activité lorsque les responsables changent', async () => {
    const evenement = creeEvenement({
      ancienneMesure: uneMesureGenerale()
        .avecResponsable('U1')
        .avecResponsable('U2')
        .construis(),
      nouvelleMesure: uneMesureGenerale()
        .avecResponsable('U3')
        .avecResponsable('U4')
        .construis(),
    });

    await gestionnaire(evenement);

    const activiteAEteAjoutee = (type, valeur) =>
      activitesAjoutees.some(
        (a) => a.type === type && a.details.valeur === valeur
      );

    expect(activitesAjoutees.length).to.be(4);
    expect(activiteAEteAjoutee('suppressionResponsable', 'U1')).to.be(true);
    expect(activiteAEteAjoutee('suppressionResponsable', 'U2')).to.be(true);
    expect(activiteAEteAjoutee('ajoutResponsable', 'U3')).to.be(true);
    expect(activiteAEteAjoutee('ajoutResponsable', 'U4')).to.be(true);
  });
});
