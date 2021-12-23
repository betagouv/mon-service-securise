const expect = require('expect.js');

const { ErreurStatutDeploiementInvalide, ErreurLocalisationDonneesInvalide } = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const InformationsGenerales = require('../../src/modeles/informationsGenerales');
const InformationsHomologation = require('../../src/modeles/informationsHomologation');

const elles = it;

describe('Les informations générales', () => {
  const referentielAvecStatutValide = (statut) => Referentiel.creeReferentiel({
    statutsDeploiement: { [statut]: {} },
    localisationsDonnees: { france: {} },
  });

  elles('connaissent leurs constituants', () => {
    const infos = new InformationsGenerales({
      delaiAvantImpactCritique: 'unDelai',
      donneesCaracterePersonnel: ['desDonnees'],
      donneesSensiblesSpecifiques: [{ description: 'Des données sensibles' }],
      fonctionnalites: ['uneFonctionnalite'],
      fonctionnalitesSpecifiques: [{ description: 'Une fonctionnalité' }],
      localisationDonnees: 'france',
      typeService: ['unType'],
      nomService: 'Super Service',
      pointsAcces: [{ description: 'Une description' }],
      presenceResponsable: 'non',
      presentation: 'Une présentation du service',
      provenanceService: ['uneProvenance'],
      statutDeploiement: 'unStatut',
    }, referentielAvecStatutValide('unStatut'));

    expect(infos.delaiAvantImpactCritique).to.equal('unDelai');
    expect(infos.donneesCaracterePersonnel).to.eql(['desDonnees']);
    expect(infos.fonctionnalites).to.eql(['uneFonctionnalite']);
    expect(infos.localisationDonnees).to.equal('france');
    expect(infos.typeService).to.eql(['unType']);
    expect(infos.nomService).to.equal('Super Service');
    expect(infos.presenceResponsable).to.be('non');
    expect(infos.presentation).to.equal('Une présentation du service');
    expect(infos.provenanceService).to.eql(['uneProvenance']);
    expect(infos.statutDeploiement).to.eql('unStatut');

    expect(infos.nombreDonneesSensiblesSpecifiques()).to.equal(1);
    expect(infos.nombreFonctionnalitesSpecifiques()).to.equal(1);
    expect(infos.nombrePointsAcces()).to.equal(1);
  });

  elles('décrivent le type service', () => {
    const referentiel = Referentiel.creeReferentiel({
      typesService: {
        unType: { description: 'Un type' },
        unAutre: { description: 'Un autre' },
      },
    });
    const infos = new InformationsGenerales({
      nomService: 'nom', typeService: ['unType', 'unAutre'],
    }, referentiel);

    expect(infos.descriptionTypeService()).to.equal('Un type, Un autre');
  });

  elles('décrivent la localisation des données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: {
        france: { description: 'Quelque part en France' },
      },
    });

    const infos = new InformationsGenerales({
      localisationDonnees: 'france',
    }, referentiel);

    expect(infos.descriptionLocalisationDonnees()).to.equal('Quelque part en France');
  });

  elles("se comportent correctement si le type de service n'est pas présent", () => {
    const infos = new InformationsGenerales();
    expect(infos.descriptionTypeService()).to.equal('Type de service non renseignée');
  });

  elles('valident que le statut de déploiement est bien du référentiel', () => {
    const referentiel = Referentiel.creeReferentiel({ statutsDeploiement: {} });
    const creeInfos = () => new InformationsGenerales({ statutDeploiement: 'pasAccessible' }, referentiel);

    expect(creeInfos).to.throwException((error) => {
      expect(error).to.be.a(ErreurStatutDeploiementInvalide);
      expect(error.message).to.equal('Le statut de déploiement "pasAccessible" est invalide');
    });
  });

  elles('valident la localisation des données si elle est présente', (done) => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: {
        france: { description: 'Quelque part en France' },
      },
    });
    try {
      new InformationsGenerales({ localisationDonnees: 'localisationInvalide' }, referentiel);
      done('La création des informations générales aurait dû lever une ErreurLocalisationDonneesInvalide');
    } catch (e) {
      expect(e).to.be.a(ErreurLocalisationDonneesInvalide);
      expect(e.message).to.equal('La localisation des données "localisationInvalide" est invalide');
      done();
    }
  });

  elles("détectent qu'elles sont encore à saisir", () => {
    const infos = new InformationsGenerales();
    expect(infos.statutSaisie()).to.equal(InformationsHomologation.A_SAISIR);
  });

  elles("détectent qu'elles sont partiellement saisies", () => {
    const infos = new InformationsGenerales({ nomService: 'Super Service' });
    expect(infos.statutSaisie()).to.equal(InformationsHomologation.A_COMPLETER);
  });

  elles("détectent qu'elles sont complètement saisies", () => {
    const infos = new InformationsGenerales({
      nomService: 'Super Service',
      delaiAvantImpactCritique: 'uneJournee',
      localisationDonnees: 'france',
      presenceResponsable: 'oui',
      presentation: 'Une présentation',
      statutDeploiement: 'accessible',
    }, referentielAvecStatutValide('accessible'));

    expect(infos.statutSaisie()).to.equal(InformationsHomologation.COMPLETES);
  });
});
