const Base = require('../base');
const Referentiel = require('../../referentiel');
const { dateInvalide } = require('../../utilitaires/date');

const ERREURS_VALIDATION = {
  NOM_INVALIDE: 'NOM_INVALIDE',
  NOM_EXISTANT: 'NOM_EXISTANT',
  SIRET_INVALIDE: 'SIRET_INVALIDE',
  TYPE_INVALIDE: 'TYPE_INVALIDE',
  PROVENANCE_INVALIDE: 'PROVENANCE_INVALIDE',
  STATUT_INVALIDE: 'STATUT_INVALIDE',
  LOCALISATION_INVALIDE: 'LOCALISATION_INVALIDE',
  DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE: 'DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE',
  DOSSIER_HOMOLOGATION_INCOMPLET: 'DOSSIER_HOMOLOGATION_INCOMPLET',
  DATE_HOMOLOGATION_INVALIDE: 'DATE_HOMOLOGATION_INVALIDE',
  DUREE_HOMOLOGATION_INVALIDE: 'DUREE_HOMOLOGATION_INVALIDE',
};

const proprieteNEstPasAdmise = (propriete, referentiel) =>
  !referentiel.includes(propriete);

class ServiceTeleverse extends Base {
  constructor(donnees = {}, referentiel = Referentiel.creeReferentielVide()) {
    super({
      proprietesAtomiquesRequises: [
        'nom',
        'siret',
        'type',
        'provenance',
        'statut',
        'localisation',
        'delaiAvantImpactCritique',
      ],
      proprietesAtomiquesFacultatives: [
        'dateHomologation',
        'dureeHomologation',
        'nomAutoriteHomologation',
        'fonctionAutoriteHomologation',
      ],
    });
    this.renseigneProprietes(donnees);
    this.referentiel = referentiel;
  }

  siretFormatte() {
    return this.siret.replaceAll(' ', '');
  }

  valide(nomServicesExistants = []) {
    const erreurs = [];

    if (!this.nom) erreurs.push(ERREURS_VALIDATION.NOM_INVALIDE);
    if (nomServicesExistants.includes(this.nom))
      erreurs.push(ERREURS_VALIDATION.NOM_EXISTANT);

    if (!/^\d{14}$/.test(this.siretFormatte()))
      erreurs.push(ERREURS_VALIDATION.SIRET_INVALIDE);

    [
      [
        this.type,
        this.referentiel.descriptionsTypeService(),
        ERREURS_VALIDATION.TYPE_INVALIDE,
      ],
      [
        this.provenance,
        this.referentiel.descriptionsProvenanceService(),
        ERREURS_VALIDATION.PROVENANCE_INVALIDE,
      ],
      [
        this.statut,
        this.referentiel.descriptionsStatutDeploiement(),
        ERREURS_VALIDATION.STATUT_INVALIDE,
      ],
      [
        this.localisation,
        this.referentiel.descriptionLocalisationDonnees(),
        ERREURS_VALIDATION.LOCALISATION_INVALIDE,
      ],
      [
        this.delaiAvantImpactCritique,
        this.referentiel.descriptionsDelaiAvantImpactCritique(),
        ERREURS_VALIDATION.DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE,
      ],
    ].forEach(([propriete, referentiel, typeErreur]) => {
      if (proprieteNEstPasAdmise(propriete, referentiel))
        erreurs.push(typeErreur);
    });

    const nbProprieteDossierHomologationVide = [
      this.dateHomologation,
      this.dureeHomologation,
      this.nomAutoriteHomologation,
      this.fonctionAutoriteHomologation,
    ].filter((p) => p === '' || p === undefined).length;
    if (
      nbProprieteDossierHomologationVide > 0 &&
      nbProprieteDossierHomologationVide < 4
    )
      erreurs.push(ERREURS_VALIDATION.DOSSIER_HOMOLOGATION_INCOMPLET);

    const dossierHomologationComplet = nbProprieteDossierHomologationVide === 0;
    if (dossierHomologationComplet) {
      if (dateInvalide(this.dateHomologation))
        erreurs.push(ERREURS_VALIDATION.DATE_HOMOLOGATION_INVALIDE);

      if (
        proprieteNEstPasAdmise(
          this.dureeHomologation,
          this.referentiel.descriptionsEcheanceRenouvellement()
        )
      )
        erreurs.push(ERREURS_VALIDATION.DUREE_HOMOLOGATION_INVALIDE);
    }

    return erreurs;
  }
}

module.exports = ServiceTeleverse;
