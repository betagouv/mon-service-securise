const expect = require('expect.js');

const {
  ErreurStatutDeploiementInvalide,
  ErreurLocalisationDonneesInvalide,
} = require('../../src/erreurs');
const Referentiel = require('../../src/referentiel');
const DescriptionService = require('../../src/modeles/descriptionService');
const InformationsHomologation = require('../../src/modeles/informationsService');

const elle = it;

describe('La description du service', () => {
  const referentielAvecStatutValide = (statut) =>
    Referentiel.creeReferentiel({
      statutsDeploiement: { [statut]: {} },
      localisationsDonnees: { france: {} },
    });

  elle('connaît ses constituants', () => {
    const descriptionService = new DescriptionService(
      {
        delaiAvantImpactCritique: 'unDelai',
        donneesCaracterePersonnel: ['desDonnees'],
        donneesSensiblesSpecifiques: [{ description: 'Des données sensibles' }],
        fonctionnalites: ['uneFonctionnalite'],
        fonctionnalitesSpecifiques: [{ description: 'Une fonctionnalité' }],
        localisationDonnees: 'france',
        typeService: ['unType'],
        nomService: 'Super Service',
        organisationResponsable: { nom: 'Une organisation' },
        pointsAcces: [{ description: 'Une description' }],
        presentation: 'Une présentation du service',
        provenanceService: 'uneProvenance',
        statutDeploiement: 'unStatut',
        nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
        niveauSecurite: 'niveau1',
      },
      referentielAvecStatutValide('unStatut')
    );

    expect(descriptionService.delaiAvantImpactCritique).to.equal('unDelai');
    expect(descriptionService.donneesCaracterePersonnel).to.eql(['desDonnees']);
    expect(descriptionService.fonctionnalites).to.eql(['uneFonctionnalite']);
    expect(descriptionService.localisationDonnees).to.equal('france');
    expect(descriptionService.typeService).to.eql(['unType']);
    expect(descriptionService.nomService).to.equal('Super Service');
    expect(descriptionService.organisationResponsable.nom).to.eql(
      'Une organisation'
    );
    expect(descriptionService.presentation).to.equal(
      'Une présentation du service'
    );
    expect(descriptionService.provenanceService).to.eql('uneProvenance');
    expect(descriptionService.statutDeploiement).to.equal('unStatut');
    expect(descriptionService.nombreOrganisationsUtilisatrices).to.eql({
      borneBasse: 1,
      borneHaute: 5,
    });

    expect(descriptionService.nombreDonneesSensiblesSpecifiques()).to.equal(1);
    expect(descriptionService.nombreFonctionnalitesSpecifiques()).to.equal(1);
    expect(descriptionService.nombrePointsAcces()).to.equal(1);
    expect(descriptionService.niveauSecurite).to.equal('niveau1');
  });

  elle('connaît ses propriétés obligatoires', () => {
    expect(DescriptionService.proprietesObligatoires()).to.eql([
      'delaiAvantImpactCritique',
      'localisationDonnees',
      'nomService',
      'provenanceService',
      'statutDeploiement',
      'typeService',
      'nombreOrganisationsUtilisatrices',
      'niveauSecurite',
    ]);
  });

  elle('décrit le type service', () => {
    const referentiel = Referentiel.creeReferentiel({
      typesService: {
        unType: { description: 'Un type' },
        unAutre: { description: 'Un autre' },
      },
    });
    const descriptionService = new DescriptionService(
      {
        nomService: 'nom',
        typeService: ['unType', 'unAutre'],
      },
      referentiel
    );

    expect(descriptionService.descriptionTypeService()).to.equal(
      'Un type, Un autre'
    );
  });

  elle('décrit la localisation des données', () => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: {
        france: { description: 'Quelque part en France' },
      },
    });

    const descriptionService = new DescriptionService(
      {
        localisationDonnees: 'france',
      },
      referentiel
    );

    expect(descriptionService.descriptionLocalisationDonnees()).to.equal(
      'Quelque part en France'
    );
  });

  elle('décrit le statut de déploiement', () => {
    const referentiel = Referentiel.creeReferentiel({
      statutsDeploiement: {
        enLigne: {
          description: 'En ligne',
        },
      },
    });

    const descriptionService = new DescriptionService(
      {
        statutDeploiement: 'enLigne',
      },
      referentiel
    );

    expect(descriptionService.descriptionStatutDeploiement()).to.equal(
      'En ligne'
    );
  });

  elle(
    "se comporte correctement si le type de service n'est pas présent",
    () => {
      const descriptionService = new DescriptionService();
      expect(descriptionService.descriptionTypeService()).to.equal(
        'Type de service non renseignée'
      );
    }
  );

  elle('valide que le statut de déploiement est bien du référentiel', () => {
    const referentiel = Referentiel.creeReferentiel({ statutsDeploiement: {} });
    const creeDescriptionService = () =>
      new DescriptionService(
        { statutDeploiement: 'pasAccessible' },
        referentiel
      );

    expect(creeDescriptionService).to.throwException((error) => {
      expect(error).to.be.a(ErreurStatutDeploiementInvalide);
      expect(error.message).to.equal(
        'Le statut de déploiement "pasAccessible" est invalide'
      );
    });
  });

  elle('valide la localisation des données si elle est présente', (done) => {
    const referentiel = Referentiel.creeReferentiel({
      localisationsDonnees: {
        france: { description: 'Quelque part en France' },
      },
    });
    try {
      new DescriptionService(
        { localisationDonnees: 'localisationInvalide' },
        referentiel
      );
      done(
        'La création de la description du service aurait dû lever une ErreurLocalisationDonneesInvalide'
      );
    } catch (e) {
      expect(e).to.be.a(ErreurLocalisationDonneesInvalide);
      expect(e.message).to.equal(
        'La localisation des données "localisationInvalide" est invalide'
      );
      done();
    }
  });

  elle("détecte qu'elle est encore à saisir", () => {
    const descriptionService = new DescriptionService();
    expect(descriptionService.statutSaisie()).to.equal(
      InformationsHomologation.A_SAISIR
    );
  });

  elle("détecte qu'elle est partiellement saisie", () => {
    const descriptionService = new DescriptionService({
      nomService: 'Super Service',
    });
    expect(descriptionService.statutSaisie()).to.equal(
      InformationsHomologation.A_COMPLETER
    );
  });

  elle(
    "détecte qu'elle est partiellement saisie si tout est rempli sauf le siret",
    () => {
      const descriptionService = new DescriptionService(
        {
          nomService: 'Super Service',
          delaiAvantImpactCritique: 'uneJournee',
          localisationDonnees: 'france',
          presentation: 'Une présentation',
          provenanceService: 'uneProvenance',
          statutDeploiement: 'accessible',
          nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
          organisationResponsable: { nom: 'MonOrga' },
        },
        referentielAvecStatutValide('accessible')
      );
      expect(descriptionService.statutSaisie()).to.equal(
        InformationsHomologation.A_COMPLETER
      );
    }
  );

  elle("détecte qu'elle est complètement saisie", () => {
    const descriptionService = new DescriptionService(
      {
        nomService: 'Super Service',
        delaiAvantImpactCritique: 'uneJournee',
        localisationDonnees: 'france',
        presentation: 'Une présentation',
        provenanceService: 'uneProvenance',
        statutDeploiement: 'accessible',
        nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
        organisationResponsable: { siret: '12345' },
        niveauSecurite: 'niveau1',
      },
      referentielAvecStatutValide('accessible')
    );

    expect(descriptionService.statutSaisie()).to.equal(
      InformationsHomologation.COMPLETES
    );
  });

  describe("sur demande d'estimation du niveau de sécurité", () => {
    [
      ['fonctionnalites', ['signatureElectronique']],
      ['delaiAvantImpactCritique', 'moinsUneHeure'],
      ['donneesCaracterePersonnel', ['sensibiliteParticuliere']],
    ].forEach(([cle, propriete]) => {
      it(`retourne 'niveau3' si la propriété '${propriete}' est présente dans '${cle}'`, () => {
        const descriptionDeNiveau3 = new DescriptionService({
          nomService: 'Super Service',
          [cle]: propriete,
        });

        const estimation =
          DescriptionService.estimeNiveauDeSecurite(descriptionDeNiveau3);

        expect(estimation).to.be('niveau3');
      });
    });

    [
      ['fonctionnalites', ['reseauSocial']],
      ['fonctionnalites', ['visionconference']],
      ['fonctionnalites', ['messagerie']],
      ['fonctionnalites', ['edition']],
      ['fonctionnalites', ['paiement']],
      ['donneesCaracterePersonnel', ['identite']],
      ['donneesCaracterePersonnel', ['situation']],
      ['donneesCaracterePersonnel', ['mineurs']],
    ].forEach(([cle, propriete]) => {
      it(`retourne 'niveau2' si la propriété '${propriete}' est présente dans '${cle}'`, () => {
        const descriptionDeNiveau2 = new DescriptionService({
          nomService: 'Super Service',
          [cle]: propriete,
        });

        const estimation =
          DescriptionService.estimeNiveauDeSecurite(descriptionDeNiveau2);

        expect(estimation).to.be('niveau2');
      });
    });

    it('retourne "niveau1" par défaut', () => {
      const descriptionDeNiveau1 = new DescriptionService({
        nomService: 'Super Service',
        fonctionnalites: ['uneAutreFonctionnalite'],
        donneesCaracterePersonnel: ['uneAutreDonnees'],
        delaiAvantImpactCritique: 'autreDelai',
      });

      const estimation =
        DescriptionService.estimeNiveauDeSecurite(descriptionDeNiveau1);

      expect(estimation).to.be('niveau1');
    });

    ['fonctionnalites', 'donneesCaracterePersonnel'].forEach((cle) => {
      it(`reste robuste lorsque la description de service n’a pas de ${cle}`, () => {
        const descriptionDeNiveauIncomplete = new DescriptionService({
          nomService: 'Super Service',
          fonctionnalites: ['uneAutreFonctionnalite'],
          donneesCaracterePersonnel: ['uneAutreDonnees'],
          delaiAvantImpactCritique: 'autreDelai',
        });
        descriptionDeNiveauIncomplete[cle] = null;

        const estimation = DescriptionService.estimeNiveauDeSecurite(
          descriptionDeNiveauIncomplete
        );

        expect(estimation).to.be('niveau1');
      });
    });
  });
});
