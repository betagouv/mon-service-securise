import {
  ErreurLocalisationDonneesInvalide,
  ErreurStatutDeploiementInvalide,
} from '../../src/erreurs.js';
import DescriptionService from '../../src/modeles/descriptionService.js';
import InformationsService from '../../src/modeles/informationsService.js';
import { creeReferentielVide } from '../../src/referentiel.js';

describe('La description du service', () => {
  const referentielAvecStatutValide = (statut: string) => {
    const referentiel = creeReferentielVide();
    referentiel.recharge({
      statutsDeploiement: { [statut]: {} },
      localisationsDonnees: { france: {} },
    });
    return referentiel;
  };

  it('connaît ses constituants', () => {
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
        organisationResponsable: { nom: 'Une organisation', siret: 'unSiret' },
        pointsAcces: [{ description: 'Une description' }],
        presentation: 'Une présentation du service',
        provenanceService: 'uneProvenance',
        statutDeploiement: 'unStatut',
        nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
        niveauSecurite: 'niveau1',
      },
      referentielAvecStatutValide('unStatut')
    );

    expect(descriptionService.delaiAvantImpactCritique).toEqual('unDelai');
    expect(descriptionService.donneesCaracterePersonnel).toEqual([
      'desDonnees',
    ]);
    expect(descriptionService.fonctionnalites).toEqual(['uneFonctionnalite']);
    expect(descriptionService.localisationDonnees).toEqual('france');
    expect(descriptionService.typeService).toEqual(['unType']);
    expect(descriptionService.nomService).toEqual('Super Service');
    expect(descriptionService.organisationResponsable.nom).toEqual(
      'Une organisation'
    );
    expect(descriptionService.presentation).toEqual(
      'Une présentation du service'
    );
    expect(descriptionService.provenanceService).toEqual('uneProvenance');
    expect(descriptionService.statutDeploiement).toEqual('unStatut');
    expect(descriptionService.nombreOrganisationsUtilisatrices).toEqual({
      borneBasse: 1,
      borneHaute: 5,
    });

    expect(descriptionService.niveauSecurite).toEqual('niveau1');
  });

  it('connaît ses propriétés obligatoires', () => {
    expect(DescriptionService.proprietesObligatoires()).toEqual([
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

  it('décrit le type service', () => {
    const referentiel = creeReferentielVide();
    referentiel.recharge({
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

    expect(descriptionService.descriptionTypeService()).toEqual(
      'Un type, Un autre'
    );
  });

  it('décrit la localisation des données', () => {
    const referentiel = creeReferentielVide();
    referentiel.recharge({
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

    expect(descriptionService.descriptionLocalisationDonnees()).toEqual(
      'Quelque part en France'
    );
  });

  it('décrit le statut de déploiement', () => {
    const referentiel = creeReferentielVide();
    referentiel.recharge({
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

    expect(descriptionService.descriptionStatutDeploiement()).toEqual(
      'En ligne'
    );
  });

  it("se comporte correctement si le type de service n'est pas présent", () => {
    const descriptionService = new DescriptionService();
    expect(descriptionService.descriptionTypeService()).toEqual(
      'Type de service non renseignée'
    );
  });

  it('valide que le statut de déploiement est bien du référentiel', () => {
    const referentiel = creeReferentielVide();
    referentiel.recharge({ statutsDeploiement: {} });
    const creeDescriptionService = () =>
      new DescriptionService(
        { statutDeploiement: 'pasAccessible' },
        referentiel
      );

    expect(() => creeDescriptionService()).toThrowError(
      new ErreurStatutDeploiementInvalide(
        'Le statut de déploiement "pasAccessible" est invalide'
      )
    );
  });

  it('valide la localisation des données si elle est présente', () => {
    const referentiel = creeReferentielVide();
    referentiel.recharge({
      localisationsDonnees: {
        france: { description: 'Quelque part en France' },
      },
    });
    expect(
      () =>
        new DescriptionService(
          { localisationDonnees: 'localisationInvalide' },
          referentiel
        )
    ).toThrowError(
      new ErreurLocalisationDonneesInvalide(
        'La localisation des données "localisationInvalide" est invalide'
      )
    );
  });

  it("détecte qu'elle est encore à saisir", () => {
    const descriptionService = new DescriptionService();
    expect(descriptionService.statutSaisie()).toEqual(
      InformationsService.A_SAISIR
    );
  });

  it("détecte qu'elle est partiellement saisie", () => {
    const descriptionService = new DescriptionService({
      nomService: 'Super Service',
    });
    expect(descriptionService.statutSaisie()).toEqual(
      InformationsService.A_COMPLETER
    );
  });

  it("détecte qu'elle est partiellement saisie si tout est rempli sauf le siret", () => {
    const descriptionService = new DescriptionService(
      {
        nomService: 'Super Service',
        delaiAvantImpactCritique: 'uneJournee',
        localisationDonnees: 'france',
        presentation: 'Une présentation',
        provenanceService: 'uneProvenance',
        statutDeploiement: 'accessible',
        nombreOrganisationsUtilisatrices: { borneBasse: 1, borneHaute: 5 },
        organisationResponsable: { nom: 'MonOrga', siret: 'unSiret' },
      },
      referentielAvecStatutValide('accessible')
    );
    expect(descriptionService.statutSaisie()).toEqual(
      InformationsService.A_COMPLETER
    );
  });

  it("détecte qu'elle est complètement saisie", () => {
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

    expect(descriptionService.statutSaisie()).toEqual(
      InformationsService.COMPLETES
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
          [cle as string]: propriete,
        });

        const estimation =
          DescriptionService.estimeNiveauDeSecurite(descriptionDeNiveau3);

        expect(estimation).toBe('niveau3');
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
          [cle as string]: propriete,
        });

        const estimation =
          DescriptionService.estimeNiveauDeSecurite(descriptionDeNiveau2);

        expect(estimation).toBe('niveau2');
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

      expect(estimation).toBe('niveau1');
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

        expect(estimation).toBe('niveau1');
      });
    });
  });
});
