import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../../src/modeles/descriptionServiceV2.ts';
import { uneDescriptionV2Valide } from '../constructeurs/constructeurDescriptionServiceV2.js';

describe('Une description service V2', () => {
  it('connaît ses données à persister', () => {
    const descriptionV2 = new DescriptionServiceV2({
      nomService: 'Mairie',
      organisationResponsable: {
        nom: 'Ville V',
        siret: '1111111111111',
        departement: '33',
      },
      typeService: ['api'],
      statutDeploiement: 'enCours',
      niveauDeSecurite: 'niveau1',
      volumetrieDonneesTraitees: 'faible',
      presentation: 'Le premier de …',
      pointsAcces: [{ description: 'https://url.com' }],
      audienceCible: 'large',
      typeHebergement: 'autre',
      ouvertureSysteme: 'accessibleSurInternet',
      specificitesProjet: ['accesPhysiqueAuxBureaux'],
      activitesExternalisees: ['developpementLogiciel'],
      dureeDysfonctionnementAcceptable: 'moinsDe24h',
      categoriesDonneesTraitees: ['documentsRHSensibles'],
      categoriesDonneesTraiteesSupplementaires: ['numéros de téléphones'],
      localisationsDonneesTraitees: ['horsUE'],
    });

    const aPersister = descriptionV2.donneesSerialisees();

    expect<DonneesDescriptionServiceV2>(aPersister).toEqual({
      nomService: 'Mairie',
      organisationResponsable: {
        departement: '33',
        nom: 'Ville V',
        siret: '1111111111111',
      },
      typeService: ['api'],
      statutDeploiement: 'enCours',
      niveauDeSecurite: 'niveau1',
      volumetrieDonneesTraitees: 'faible',
      presentation: 'Le premier de …',
      pointsAcces: [{ description: 'https://url.com' }],
      activitesExternalisees: ['developpementLogiciel'],
      audienceCible: 'large',
      typeHebergement: 'autre',
      ouvertureSysteme: 'accessibleSurInternet',
      specificitesProjet: ['accesPhysiqueAuxBureaux'],
      dureeDysfonctionnementAcceptable: 'moinsDe24h',
      categoriesDonneesTraitees: ['documentsRHSensibles'],
      categoriesDonneesTraiteesSupplementaires: ['numéros de téléphones'],
      localisationsDonneesTraitees: ['horsUE'],
    });
  });

  it('renvoie toujours un statut de saisie à « COMPLETES » car MSS ne permet pas de créer une Description V2 incomplète', async () => {
    const descriptionV2 = uneDescriptionV2Valide().construis();

    expect(descriptionV2.statutSaisie()).toBe('completes');
  });

  describe("sur demande d'estimation du niveau de sécurité", () => {
    it('évalue le niveau de criticité des données traitées', () => {
      const donnees = uneDescriptionV2Valide()
        .avecVolumetrieDonneesTraitees('eleve')
        .avecCategoriesDonneesTraitees([
          'documentsIdentifiants',
          'secretsDEntreprise',
        ])
        .avecAutresDonneesTraitees(['donneeAjoutee', 'autreDonneeAjoutee'])
        .avecDureeDysfonctionnementAcceptable('moinsDe4h')
        .avecAudienceCible('large')
        .avecOuvertureSysteme('accessibleSurInternet')
        .donneesDescription();

      const niveauSecuriteMinimalRequis =
        DescriptionServiceV2.niveauSecuriteMinimalRequis(donnees);

      expect(niveauSecuriteMinimalRequis).toBe('niveau3');
    });
  });
});
