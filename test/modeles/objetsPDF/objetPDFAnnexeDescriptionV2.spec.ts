import Service from '../../../src/modeles/service.js';
import {
  ObjetPDFAnnexeDescriptionV2,
  ServiceV2,
} from '../../../src/modeles/objetsPDF/objetPDFAnnexeDescriptionV2.js';
import { creeReferentielV2 } from '../../../src/referentielV2.js';
import { uneDescriptionV2Valide } from '../../constructeurs/constructeurDescriptionServiceV2.js';

describe("L'objet PDF de l'annexe de description V2", () => {
  const referentiel = creeReferentielV2();
  const service = new Service(
    {
      id: '123',
      versionService: 'v2',
      idUtilisateur: '456',
      descriptionService: uneDescriptionV2Valide()
        .avecNomService('Nom Service')
        .avecOrganisationResponsable({
          siret: 'un SIRET',
          nom: 'Mon organisation',
        })
        .avecPresentation('Ma présentation')
        .avecPointsAcces(['https://monprojet.fr', 'https://monautreprojet.fr'])
        .avecStatutDeploiement('enProjet')
        .avecTypesService(['portailInformation', 'api'])
        .avecSpecificitesProjet(['annuaire', 'postesDeTravail'])
        .avecTypeHebergement('saas')
        .avecDonneesTraitees(
          ['documentsIdentifiants', 'donneesSensibles'],
          ['Mes données ajoutées']
        )
        .avecDureeDysfonctionnementAcceptable('moinsDe4h')
        .donneesDescription(),
    },
    referentiel
  ) as ServiceV2;

  it('fournit le nom du service', () => {
    const vueAnnexePDFDescription = new ObjetPDFAnnexeDescriptionV2(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees.nomService).toBe('Nom Service');
  });

  it('fournit la version du service', () => {
    const vueAnnexePDFDescription = new ObjetPDFAnnexeDescriptionV2(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees.versionService).toBe('v2');
  });

  it('fournit la liste des spécificités du projet', () => {
    const vueAnnexePDFDescription = new ObjetPDFAnnexeDescriptionV2(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees.specificitesProjet).toEqual([
      'Un annuaire',
      'Des postes de travail',
    ]);
  });

  it('fournit la liste des données traitées', () => {
    const vueAnnexePDFDescription = new ObjetPDFAnnexeDescriptionV2(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees.donneesStockees).toEqual([
      'Documents identifiants',
      'Données sensibles',
      'Mes données ajoutées',
    ]);
  });

  it('fournit la durée de dysfonctionnement maximum acceptable', () => {
    const vueAnnexePDFDescription = new ObjetPDFAnnexeDescriptionV2(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees.dureeDysfonctionnementMaximumAcceptable).toEqual(
      'Moins de 4h'
    );
  });

  it('fournit les informations génériques du service', () => {
    const vueAnnexePDFDescription = new ObjetPDFAnnexeDescriptionV2(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees.informationsGeneriques).toEqual([
      { label: 'Nom du projet', valeur: 'Nom Service' },
      { label: "Nom de l'organisation", valeur: 'Mon organisation (un SIRET)' },
      { label: 'Statut', valeur: 'En conception' },
      { label: 'Présentation', valeur: 'Ma présentation' },
      {
        label: 'URL(s) du projet',
        valeur: ['https://monprojet.fr', 'https://monautreprojet.fr'],
      },
    ]);
  });

  it('fournit les caractéristiques du service', () => {
    const vueAnnexePDFDescription = new ObjetPDFAnnexeDescriptionV2(service);

    const donnees = vueAnnexePDFDescription.donnees();

    expect(donnees.caracteristiques).toEqual([
      {
        label: 'Type de projet à sécuriser',
        valeur: ["Portail d'information", 'API'],
      },
      {
        label: 'Sécurisation prévues',
        valeur: ['Un annuaire', 'Des postes de travail'],
      },
      {
        label: 'Hébergement du système',
        valeur:
          "Le système est entièrement fourni et vous l'utilisez directement via une interface (SaaS)",
      },
    ]);
  });
});
