import { extraisServicesTeleverses } from '../../../lib/tableauDeBord/televersementServices/extraisServicesTeleverses';
import { ErreurFichierInvalide } from '../../../lib/ui/televersement/lecteurExcel';
import {
  leTemplateComplete,
  unClasseur,
} from '../../ui/televersement/classeurDeTest';

const ENTETES = [
  'Nom du service numérique *',
  "Siret de l'organisation *",
  'Statut *',
  'Type #1 *',
  'Type #2',
  'Type #3',
  'Type #4',
  'Type #5',
  'Type de cloud / hébergement utilisé*',
  'Ouverture du système *',
  'Audience cible du service *',
  'Durée maximale acceptable de dysfonctionnement du système*',
  'Volume des données traitées*',
  'Localisation des données traitées*',
  "Date d'homologation",
  "Durée d'homologation",
  'Autorité\nNom Prénom',
  'Autorité\nFonction',
];

const UNE_LIGNE = [
  'Mon service',
  '130 000 000 00000',
  'En projet',
  'Portail',
  '',
  'API',
  '',
  '',
  'SaaS',
  'Interne',
  'Limitée',
  'Moins de 4h',
  'Faible',
  'France',
  '01/10/2025',
  '6 mois',
  'Jeanne Dupont',
  'RSSI',
];

const unClasseurDeServices = (lignes: string[][], entetes = ENTETES) =>
  unClasseur({
    'Template services': [[], [], [], [], [], entetes, ...lignes],
  });

describe("L'extraction des services téléversés", () => {
  it('transforme chaque ligne du classeur en service', async () => {
    const contenu = unClasseurDeServices([UNE_LIGNE]);

    const services = await extraisServicesTeleverses(contenu);

    expect(services).toEqual([
      {
        nom: 'Mon service',
        siret: '130 000 000 00000',
        statutDeploiement: 'En projet',
        typeService: ['Portail', 'API'],
        typeHebergement: 'SaaS',
        ouvertureSysteme: 'Interne',
        audienceCible: 'Limitée',
        dureeDysfonctionnementAcceptable: 'Moins de 4h',
        volumetrieDonneesTraitees: 'Faible',
        localisationDonneesTraitees: 'France',
        dateHomologation: '01/10/2025',
        dureeHomologation: '6 mois',
        nomAutoriteHomologation: 'Jeanne Dupont',
        fonctionAutoriteHomologation: 'RSSI',
      },
    ]);
  });

  it('sait lire le template proposé au téléchargement', async () => {
    const contenu = leTemplateComplete(
      'Template services v2 - MSS.xlsx',
      'Template services',
      UNE_LIGNE
    );

    const services = await extraisServicesTeleverses(contenu);

    expect(services).toHaveLength(1);
    expect(services[0].nom).toBe('Mon service');
    expect(services[0].fonctionAutoriteHomologation).toBe('RSSI');
  });

  it('rejette un classeur auquel il manque une colonne', async () => {
    const sansLaDerniereColonne = ENTETES.slice(0, -1);
    const contenu = unClasseurDeServices([UNE_LIGNE], sansLaDerniereColonne);

    await expect(extraisServicesTeleverses(contenu)).rejects.toThrow(
      ErreurFichierInvalide
    );
  });

  it('accepte 250 services', async () => {
    const contenu = unClasseurDeServices(Array(250).fill(UNE_LIGNE));

    const services = await extraisServicesTeleverses(contenu);

    expect(services).toHaveLength(250);
  });

  it('rejette un classeur de plus de 250 services', async () => {
    const contenu = unClasseurDeServices(Array(251).fill(UNE_LIGNE));

    await expect(extraisServicesTeleverses(contenu)).rejects.toThrow(
      ErreurFichierInvalide
    );
  });
});
