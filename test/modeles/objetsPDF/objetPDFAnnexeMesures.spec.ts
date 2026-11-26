import Service from '../../../src/modeles/service.js';
import { creeReferentielVide } from '../../../src/referentiel.js';
import { donneesReferentielDeTest } from '../../constructeurs/referentielDeTest.ts';
import VueAnnexePDFMesures from '../../../src/modeles/objetsPDF/objetPDFAnnexeMesures.js';
import { unService } from '../../constructeurs/constructeurService.js';
import Mesures from '../../../src/modeles/mesures.js';

describe("L'objet PDF de l'annexe des mesures", () => {
  const donneesReferentiel = donneesReferentielDeTest({
    categoriesMesures: { gouvernance: 'Gouvernance', protection: 'Protection' },
    mesures: { mesure1: {} },
    niveauxGravite: { grave: {} },
    statutsMesures: { fait: 'Fait', enCours: 'En cours' },
    articlesDefinisReferentielsMesure: {
      ANSSI: "l'",
      CNIL: 'la ',
    },
  });
  const referentiel = creeReferentielVide();
  referentiel.enrichis(donneesReferentiel);
  const service = new Service(
    {
      id: '123',
      idUtilisateur: '456',
      descriptionService: { nomService: 'Nom Service' },
      mesuresGenerales: [
        { id: 'mesure1', niveauxGravite: 'grave', categorie: 'gouvernance' },
      ],
    },
    referentiel
  );

  it('fournit les statuts provenant du référentiel', () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(service, referentiel);

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).toHaveProperty('statuts');
    expect(donnees.statuts).toEqual(donneesReferentiel.statutsMesures);
  });

  it('fournit les catégories provenant du référentiel', () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(service, referentiel);

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).toHaveProperty('categories');
    expect(donnees.categories).toEqual(donneesReferentiel.categoriesMesures);
  });

  it('fournit le nom du service', () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(service, referentiel);

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).toHaveProperty('nomService');
    expect(donnees.nomService).toEqual('Nom Service');
  });

  it('fournit les mesures par statut et par catégorie du service', () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(service, referentiel);
    service.mesuresParStatutEtCategorie = () =>
      ({
        grave: { gouvernance: [{ id: 'mesure1' }] },
      }) as unknown as ReturnType<Service['mesuresParStatutEtCategorie']>;

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).toHaveProperty('mesuresParStatut');
    expect(donnees.mesuresParStatut).toEqual({
      grave: { gouvernance: [{ id: 'mesure1' }] },
    });
  });

  it('fournit le nombre de mesures à remplir toutes catégories du service', () => {
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(service, referentiel);
    service.nombreTotalMesuresARemplirToutesCategories = () => 6;

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees).toHaveProperty('nbMesuresARemplirToutesCategories');
    expect(donnees.nbMesuresARemplirToutesCategories).toEqual(6);
  });

  it('fournit une chaine de caractères indiquant les référentiels concernés par les mesures non renseignées', () => {
    const serviceAvecMesuresAnssiCnil = unService().construis();
    serviceAvecMesuresAnssiCnil.mesures.enrichiesAvecDonneesPersonnalisees =
      () =>
        ({
          mesuresGenerales: {
            mesureA: { referentiel: 'ANSSI' },
            mesureB: { referentiel: 'CNIL' },
            mesureC: { referentiel: 'CNIL' },
          },
        }) as unknown as ReturnType<
          Mesures['enrichiesAvecDonneesPersonnalisees']
        >;
    const vueAnnexePDFMesures = new VueAnnexePDFMesures(
      serviceAvecMesuresAnssiCnil,
      referentiel
    );

    const donnees = vueAnnexePDFMesures.donnees();

    expect(donnees.referentielsConcernesMesuresNonRenseignees).toEqual(
      "l'ANSSI et la CNIL"
    );
  });
});
