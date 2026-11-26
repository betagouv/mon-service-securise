import {
  lisLignesDeFeuille,
  type LigneExcel,
} from '../../ui/televersement/lecteurExcel';

export type ServiceTeleverse = {
  nom: string;
  siret: string;
  statutDeploiement: string;
  typeService: string[];
  typeHebergement: string;
  ouvertureSysteme: string;
  audienceCible: string;
  dureeDysfonctionnementAcceptable: string;
  volumetrieDonneesTraitees: string;
  localisationDonneesTraitees: string;
  dateHomologation: string;
  dureeHomologation: string;
  nomAutoriteHomologation: string;
  fonctionAutoriteHomologation: string;
};

const ENTETES = {
  nom: 'Nom du service numérique *',
  siret: "Siret de l'organisation *",
  statutDeploiement: 'Statut *',
  typeService1: 'Type #1 *',
  typeService2: 'Type #2',
  typeService3: 'Type #3',
  typeService4: 'Type #4',
  typeService5: 'Type #5',
  typeHebergement: 'Type de cloud / hébergement utilisé*',
  ouvertureSysteme: 'Ouverture du système *',
  audienceCible: 'Audience cible du service *',
  dureeDysfonctionnementAcceptable:
    'Durée maximale acceptable de dysfonctionnement du système*',
  volumetrieDonneesTraitees: 'Volume des données traitées*',
  localisationDonneesTraitees: 'Localisation des données traitées*',
  dateHomologation: "Date d'homologation",
  dureeHomologation: "Durée d'homologation",
  nomAutoriteHomologation: 'Autorité\nNom Prénom',
  fonctionAutoriteHomologation: 'Autorité\nFonction',
};

export const NOMBRE_MAXIMUM_DE_SERVICES = 250;

const enServiceTeleverse = (ligne: LigneExcel): ServiceTeleverse => ({
  nom: ligne[ENTETES.nom],
  siret: ligne[ENTETES.siret],
  statutDeploiement: ligne[ENTETES.statutDeploiement],
  typeService: [
    ligne[ENTETES.typeService1],
    ligne[ENTETES.typeService2],
    ligne[ENTETES.typeService3],
    ligne[ENTETES.typeService4],
    ligne[ENTETES.typeService5],
  ].filter((type) => !!type),
  typeHebergement: ligne[ENTETES.typeHebergement],
  ouvertureSysteme: ligne[ENTETES.ouvertureSysteme],
  audienceCible: ligne[ENTETES.audienceCible],
  dureeDysfonctionnementAcceptable:
    ligne[ENTETES.dureeDysfonctionnementAcceptable],
  volumetrieDonneesTraitees: ligne[ENTETES.volumetrieDonneesTraitees],
  localisationDonneesTraitees: ligne[ENTETES.localisationDonneesTraitees],
  dateHomologation: ligne[ENTETES.dateHomologation],
  dureeHomologation: ligne[ENTETES.dureeHomologation],
  nomAutoriteHomologation: ligne[ENTETES.nomAutoriteHomologation],
  fonctionAutoriteHomologation: ligne[ENTETES.fonctionAutoriteHomologation],
});

export const extraisServicesTeleverses = async (
  contenu: ArrayBuffer
): Promise<ServiceTeleverse[]> => {
  const lignes = await lisLignesDeFeuille(contenu, {
    nomFeuille: 'Template services',
    indexLigneEnTete: 6,
    colonnesAttendues: Object.values(ENTETES),
    nombreMaximumDeLignes: NOMBRE_MAXIMUM_DE_SERVICES,
  });

  return lignes.map(enServiceTeleverse);
};
