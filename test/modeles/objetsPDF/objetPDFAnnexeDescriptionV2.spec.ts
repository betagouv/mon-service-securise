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
        .avecSpecificitesProjet(['annuaire', 'postesDeTravail'])
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
});
