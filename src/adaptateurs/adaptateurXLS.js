const xlsx = require('xlsx');
const { encode } = require('html-entities');
const { ErreurFichierXlsInvalide } = require('../erreurs');

const ENTETE_NOM = 'Nom du service numérique *';
const ENTETE_SIRET = "Siret de l'organisation *";
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
  const fichierXLS = xlsx.read(buffer, { type: 'buffer' });

  if (
    Object.keys(fichierXLS.Sheets).length > 1 ||
    !fichierXLS.Sheets['Template services']
  ) {
    throw new ErreurFichierXlsInvalide();
  }

  const feuille = fichierXLS.Sheets['Template services'];
  const donneesBrutes = xlsx.utils.sheet_to_json(feuille, {
    range: 5,
    header: 5,
    defval: '',
    raw: false,
  });

  const toutesLignesValides = donneesBrutes.every((ligneDonnee) => {
    const headersDeLaLigne = new Set(Object.keys(ligneDonnee));
    return toutesLesEntetesNecessaires.every((header) =>
      headersDeLaLigne.has(header)
    );
  });

  if (!toutesLignesValides) {
    throw new ErreurFichierXlsInvalide();
  }

  return donneesBrutes.map((service) => ({
    nom: encode(service[ENTETE_NOM]),
    siret: service[ENTETE_SIRET],
    type: service[ENTETE_TYPE],
    provenance: service[ENTETE_PROVENANCE],
    statut: service[ENTETE_STATUT],
    localisation: service[ENTETE_LOCALISATION],
    delaiAvantImpactCritique: service[ENTETE_DELAI_AVANT_IMPACT_CRITIQUE],
    dateHomologation: service[ENTETE_DATE_HOMOLOGATION],
    dureeHomologation: service[ENTETE_DUREE_HOMOLOGATION],
    nomAutoriteHomologation: encode(service[ENTETE_NOM_AUTORITE]),
    fonctionAutoriteHomologation: encode(service[ENTETE_FONCTION_AUTORITE]),
  }));
};

module.exports = { extraisTeleversementServices };
