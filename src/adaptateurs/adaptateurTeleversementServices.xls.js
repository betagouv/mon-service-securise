import { ErreurFichierXlsInvalide } from '../erreurs.js';
import { chaineDateFrEnChaineDateISO } from '../utilitaires/date.js';
import { LecteurExcel } from './excel/LecteurExcel.js';

const ENTETE_NOM = 'Nom du service numérique *';
const ENTETE_SIRET = "Siret de l'organisation *";
const ENTETE_NB_ORGANISATIONS_UTILISATRICES =
  "Nombre d'organisations utilisatrices *";
const ENTETE_TYPE = 'Type(s) *';
const ENTETE_PROVENANCE = 'Provenance *';
const ENTETE_STATUT = 'Statut *';
const ENTETE_LOCALISATION = 'Localisation des données *';
const ENTETE_DELAI_AVANT_IMPACT_CRITIQUE =
  'Estimation de la durée maximale acceptable de dysfonctionnement grave du service *';
const ENTETE_DATE_HOMOLOGATION = "Date d'homologation";
const ENTETE_DUREE_HOMOLOGATION = "Durée d'homologation";
const ENTETE_NOM_AUTORITE = 'Autorité\nNom Prénom';
const ENTETE_FONCTION_AUTORITE = 'Autorité\nFonction';

const toutesLesEntetesNecessaires = [
  ENTETE_NOM,
  ENTETE_SIRET,
  ENTETE_NB_ORGANISATIONS_UTILISATRICES,
  ENTETE_TYPE,
  ENTETE_PROVENANCE,
  ENTETE_STATUT,
  ENTETE_LOCALISATION,
  ENTETE_DELAI_AVANT_IMPACT_CRITIQUE,
  ENTETE_DATE_HOMOLOGATION,
  ENTETE_DUREE_HOMOLOGATION,
  ENTETE_NOM_AUTORITE,
  ENTETE_FONCTION_AUTORITE,
];

const ENTETE_V2_NOM = 'Nom du service numérique *';
const ENTETE_V2_SIRET = "Siret de l'organisation *";
const ENTETE_V2_STATUT = 'Statut *';
const ENTETE_V2_TYPE_SERVICE_1 = 'Type #1 *';
const ENTETE_V2_TYPE_SERVICE_2 = 'Type #2';
const ENTETE_V2_TYPE_SERVICE_3 = 'Type #3';
const ENTETE_V2_TYPE_SERVICE_4 = 'Type #4';
const ENTETE_V2_TYPE_SERVICE_5 = 'Type #5';
const ENTETE_V2_TYPE_HEBERGEMENT = 'Type de cloud / hébergement utilisé*';
const ENTETE_V2_OUVERTURE = 'Ouverture du système *';
const ENTETE_V2_AUDIENCE = 'Audience cible du service *';
const ENTETE_V2_DYSFONCTIONNEMENT =
  'Durée maximale acceptable de dysfonctionnement du système*';
const ENTETE_V2_VOLUME = 'Volume des données traitées*';
const ENTETE_V2_LOCALISATION = 'Localisation des données traitées*';
const ENTETE_V2_DATE_HOMOLOGATION = "Date d'homologation";
const ENTETE_V2_DUREE_HOMOLOGATION = "Durée d'homologation";
const ENTETE_V2_NOM_AUTORITE = 'Autorité\nNom Prénom';
const ENTETE_V2_FONCTION_AUTORITE = 'Autorité\nFonction';

const toutesLesEntetesV2Necessaires = [
  ENTETE_V2_NOM,
  ENTETE_V2_SIRET,
  ENTETE_V2_STATUT,
  ENTETE_V2_TYPE_SERVICE_1,
  ENTETE_V2_TYPE_SERVICE_2,
  ENTETE_V2_TYPE_SERVICE_3,
  ENTETE_V2_TYPE_SERVICE_4,
  ENTETE_V2_TYPE_SERVICE_5,
  ENTETE_V2_TYPE_HEBERGEMENT,
  ENTETE_V2_OUVERTURE,
  ENTETE_V2_AUDIENCE,
  ENTETE_V2_DYSFONCTIONNEMENT,
  ENTETE_V2_VOLUME,
  ENTETE_V2_LOCALISATION,
  ENTETE_V2_DATE_HOMOLOGATION,
  ENTETE_V2_DUREE_HOMOLOGATION,
  ENTETE_V2_NOM_AUTORITE,
  ENTETE_V2_FONCTION_AUTORITE,
];

const extraisTeleversementServices = async (buffer) => {
  const lecteur = new LecteurExcel(buffer);
  const donneesBrutes = lecteur.donneesDeFeuille('Template services', 6);

  const toutesLignesValides = lecteur.lesLignesSontCompletes(
    donneesBrutes,
    toutesLesEntetesNecessaires
  );

  if (donneesBrutes.length > 250 || !toutesLignesValides) {
    throw new ErreurFichierXlsInvalide();
  }

  return donneesBrutes.map((service) => ({
    nom: service[ENTETE_NOM],
    siret: service[ENTETE_SIRET],
    nombreOrganisationsUtilisatrices:
      service[ENTETE_NB_ORGANISATIONS_UTILISATRICES],
    type: service[ENTETE_TYPE],
    provenance: service[ENTETE_PROVENANCE],
    statut: service[ENTETE_STATUT],
    localisation: service[ENTETE_LOCALISATION],
    delaiAvantImpactCritique: service[ENTETE_DELAI_AVANT_IMPACT_CRITIQUE],
    dateHomologation: service[ENTETE_DATE_HOMOLOGATION]
      ? chaineDateFrEnChaineDateISO(service[ENTETE_DATE_HOMOLOGATION])
      : undefined,
    dureeHomologation: service[ENTETE_DUREE_HOMOLOGATION],
    nomAutoriteHomologation: service[ENTETE_NOM_AUTORITE],
    fonctionAutoriteHomologation: service[ENTETE_FONCTION_AUTORITE],
  }));
};

const extraisTeleversementServicesV2 = async (buffer) => {
  const lecteur = new LecteurExcel(buffer);
  const donneesBrutes = lecteur.donneesDeFeuille('Template services', 6);

  const toutesLignesValides = lecteur.lesLignesSontCompletes(
    donneesBrutes,
    toutesLesEntetesV2Necessaires
  );

  if (donneesBrutes.length > 250 || !toutesLignesValides) {
    throw new ErreurFichierXlsInvalide();
  }

  return donneesBrutes.map((service) => ({
    nom: service[ENTETE_V2_NOM],
    siret: service[ENTETE_V2_SIRET],
    statutDeploiement: service[ENTETE_V2_STATUT],
    typeService: [
      service[ENTETE_V2_TYPE_SERVICE_1],
      service[ENTETE_V2_TYPE_SERVICE_2],
      service[ENTETE_V2_TYPE_SERVICE_3],
      service[ENTETE_V2_TYPE_SERVICE_4],
      service[ENTETE_V2_TYPE_SERVICE_5],
    ].filter((t) => !!t),
    typeHebergement: service[ENTETE_V2_TYPE_HEBERGEMENT],
    ouvertureSysteme: service[ENTETE_V2_OUVERTURE],
    audienceCible: service[ENTETE_V2_AUDIENCE],
    dureeDysfonctionnementAcceptable: service[ENTETE_V2_DYSFONCTIONNEMENT],
    volumetrieDonneesTraitees: service[ENTETE_V2_VOLUME],
    localisationDonneesTraitees: service[ENTETE_V2_LOCALISATION],
    dateHomologation: service[ENTETE_V2_DATE_HOMOLOGATION]
      ? new Date(
          chaineDateFrEnChaineDateISO(service[ENTETE_V2_DATE_HOMOLOGATION])
        )
      : undefined,
    dureeHomologation: service[ENTETE_V2_DUREE_HOMOLOGATION],
    nomAutoriteHomologation: service[ENTETE_V2_NOM_AUTORITE],
    fonctionAutoriteHomologation: service[ENTETE_V2_FONCTION_AUTORITE],
  }));
};

export { extraisTeleversementServices, extraisTeleversementServicesV2 };
