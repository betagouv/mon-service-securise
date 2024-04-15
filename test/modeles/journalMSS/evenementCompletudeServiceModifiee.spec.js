const expect = require('expect.js');
const ConstructeurEvenementCompletudeServiceModifiee = require('./constructeurEvenementCompletudeServiceModifiee');
const {
  ErreurServiceManquant,
} = require('../../../src/modeles/journalMSS/erreurs');
const { unService } = require('../../constructeurs/constructeurService');
const Mesures = require('../../../src/modeles/mesures');
const Referentiel = require('../../../src/referentiel');

describe('Un événement de complétude modifiée', () => {
  const unEvenement = () =>
    new ConstructeurEvenementCompletudeServiceModifiee();

  const hacheEnMajuscules = { hacheSha256: (valeur) => valeur?.toUpperCase() };

  it("chiffre l'identifiant du service qui lui est donné", () => {
    const evenement = unEvenement()
      .avecIdService('abc')
      .quiChiffreAvec(hacheEnMajuscules)
      .construis()
      .toJSON();

    expect(evenement.donnees.idService).to.be('ABC');
  });

  it("sait se convertir en JSON sans dévoiler le SIRET de l'organisation responsable", () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { mesureA: {} },
      categoriesMesures: { gouvernance: 'Gouvernance' },
      statutsMesures: { fait: 'Faite' },
      indiceCyber: { noteMax: 5 },
    });
    const mesuresPersonnalises = {
      mesureA: { categorie: 'gouvernance' },
    };
    const mesures = new Mesures(
      { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
      referentiel,
      mesuresPersonnalises
    );
    const service = unService(referentiel)
      .avecId('ABC')
      .avecMesures(mesures)
      .avecDescription({
        delaiAvantImpactCritique: 'uneHeure',
        localisationDonnees: 'uneLocalisation',
        donneesCaracterePersonnel: ['donnee A', 'donnee B'],
        donneesSensiblesSpecifiques: ['donneeSensible A'],
        fonctionnalites: ['reseauSocial'],
        fonctionnalitesSpecifiques: ['feature A', 'feature B'],
        provenanceService: 'developpement',
        risqueJuridiqueFinancierReputationnel: true,
        statutDeploiement: 'unStatutDeploiement',
        typeService: ['applicationMobile'],
        nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
        pointsAcces: ['point A', 'point B'],
        organisationResponsable: {
          siret: '12345',
        },
      })
      .construis();
    const detailsOrganisationResponsable = {
      estServicePublic: false,
      estFiness: false,
      estEss: true,
      estEntrepreneurIndividuel: false,
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

    const evenement = unEvenement()
      .avecService(service)
      .deLOrganisation(detailsOrganisationResponsable)
      .quiChiffreAvec(hacheEnMajuscules)
      .quiAEuLieuLe('08/03/2024')
      .construis();

    expect(evenement.toJSON()).to.eql({
      type: 'COMPLETUDE_SERVICE_MODIFIEE',
      donnees: {
        idService: 'ABC',
        nombreTotalMesures: 1,
        nombreMesuresCompletes: 1,
        detailMesures: [{ idMesure: 'mesureA', statut: 'fait' }],
        detailIndiceCyber: [
          { categorie: 'total', indice: 5 },
          { categorie: 'gouvernance', indice: 5 },
        ],
        nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
        typeService: ['applicationMobile'],
        provenanceService: 'developpement',
        statutDeploiement: 'unStatutDeploiement',
        pointsAcces: 2,
        fonctionnalites: ['reseauSocial'],
        fonctionnalitesSpecifiques: 2,
        donneesCaracterePersonnel: ['donnee A', 'donnee B'],
        donneesSensiblesSpecifiques: 1,
        localisationDonnees: 'uneLocalisation',
        delaiAvantImpactCritique: 'uneHeure',
        risqueJuridiqueFinancierReputationnel: true,
        organisationResponsable: {
          estServicePublic: false,
          estFiness: false,
          estEss: true,
          estEntrepreneurIndividuel: false,
          estAssociation: false,
          categorieEntreprise: null,
          activitePrincipale: '68.20B',
          trancheEffectifSalarie: null,
          natureJuridique: '6540',
          sectionActivitePrincipale: 'L',
          anneeTrancheEffectifSalarie: null,
          commune: '33376',
          departement: '33',
        },
      },
      date: '08/03/2024',
    });
  });

  it("range les données de l'indice cyber par catégorie", () => {
    const referentiel = Referentiel.creeReferentiel({
      mesures: { mesureA: {} },
      categoriesMesures: { gouvernance: 'Gouvernance' },
      statutsMesures: { fait: 'Faite' },
      indiceCyber: { noteMax: 5 },
    });
    const mesuresPersonnalises = { mesureA: { categorie: 'gouvernance' } };
    const mesures = new Mesures(
      { mesuresGenerales: [{ id: 'mesureA', statut: 'fait' }] },
      referentiel,
      mesuresPersonnalises
    );
    const service = unService(referentiel).avecMesures(mesures).construis();
    const evenement = unEvenement().avecService(service).construis().toJSON();

    expect(evenement.donnees.detailIndiceCyber).to.eql([
      { categorie: 'total', indice: 5 },
      { categorie: 'gouvernance', indice: 5 },
    ]);
  });

  it("utilise des bornes à « 1 » pour les services dont le nombre d'organisations utilisatrices est à « 0 »", () => {
    const evenement = unEvenement()
      .avecNombreOrganisationsUtilisatricesInconnu()
      .construis()
      .toJSON();

    expect(evenement.donnees.nombreOrganisationsUtilisatrices).to.eql({
      borneBasse: 1,
      borneHaute: 1,
    });
  });

  it('exige que le service soit renseigné', (done) => {
    try {
      unEvenement().sans('service').construis();

      done(
        Error("L'instanciation de l'événement aurait dû lever une exception")
      );
    } catch (e) {
      expect(e).to.be.an(ErreurServiceManquant);
      done();
    }
  });
});
