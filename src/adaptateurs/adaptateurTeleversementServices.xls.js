const { encode } = require('html-entities');
const { ErreurFichierXlsInvalide } = require('../erreurs');
const { chaineDateFrEnChaineDateISO } = require('../utilitaires/date');
const { LecteurExcel } = require('./excel/LecteurExcel');

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
    nom: encode(service[ENTETE_NOM]),
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
    nomAutoriteHomologation: encode(service[ENTETE_NOM_AUTORITE]),
    fonctionAutoriteHomologation: encode(service[ENTETE_FONCTION_AUTORITE]),
  }));
};

module.exports = { extraisTeleversementServices };
