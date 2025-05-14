const Base = require('../base');

const ERREURS_VALIDATION = {
  NOM_INVALIDE: 'NOM_INVALIDE',
  NOM_EXISTANT: 'NOM_EXISTANT',
  SIRET_INVALIDE: 'SIRET_INVALIDE',
  TYPE_INVALIDE: 'TYPE_INVALIDE',
  PROVENANCE_INVALIDE: 'PROVENANCE_INVALIDE',
  STATUT_INVALIDE: 'STATUT_INVALIDE',
  LOCALISATION_INVALIDE: 'LOCALISATION_INVALIDE',
  DUREE_DYSFONCTIONNEMENT_INVALIDE: 'DUREE_DYSFONCTIONNEMENT_INVALIDE',
  DOSSIER_HOMOLOGATION_INCOMPLET: 'DOSSIER_HOMOLOGATION_INCOMPLET',
  DATE_HOMOLOGATION_INVALIDE: 'DATE_HOMOLOGATION_INVALIDE',
  DUREE_HOMOLOGATION_INVALIDE: 'DUREE_HOMOLOGATION_INVALIDE',
};

const PROPRIETES_ADMISES = {
  TYPE: [
    'Site Internet',
    'Application Mobile',
    "API mise à disposition par l'organisation",
  ],
  PROVENANCE: [
    "Développé pour les besoins de l'organisation",
    "Déployé à partir d'un outil existant",
    'Proposé en ligne par un fournisseur',
  ],
  STATUT: [
    'En projet',
    'En cours de développement ou de déploiement',
    'En ligne et accessible aux usagers et/ou agents',
  ],
  LOCALISATION: ['France', 'Union européenne', 'Hors Union européenne'],
  DUREE_DYSFONCTIONNEMENT: [
    "Moins d'une heure",
    'Une journée',
    "Plus d'une journée",
  ],
  DUREE_HOMOLOGATION: ['6 mois', '1 an', '2 ans', '3 ans'],
};

const proprieteNEstPasAdmise = (propriete, referentiel) =>
  !referentiel.includes(propriete);

class ServiceTeleverse extends Base {
  constructor(donnees = {}) {
    super({
      proprietesAtomiquesRequises: [
        'nom',
        'siret',
        'type',
        'provenance',
        'statut',
        'localisation',
        'dureeDysfonctionnement',
      ],
      proprietesAtomiquesFacultatives: [
        'dateHomologation',
        'dureeHomologation',
        'nomAutoriteHomologation',
        'fonctionAutoriteHomologation',
      ],
    });
    this.renseigneProprietes(donnees);
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
      [this.type, PROPRIETES_ADMISES.TYPE, ERREURS_VALIDATION.TYPE_INVALIDE],
      [
        this.provenance,
        PROPRIETES_ADMISES.PROVENANCE,
        ERREURS_VALIDATION.PROVENANCE_INVALIDE,
      ],
      [
        this.statut,
        PROPRIETES_ADMISES.STATUT,
        ERREURS_VALIDATION.STATUT_INVALIDE,
      ],
      [
        this.localisation,
        PROPRIETES_ADMISES.LOCALISATION,
        ERREURS_VALIDATION.LOCALISATION_INVALIDE,
      ],
      [
        this.dureeDysfonctionnement,
        PROPRIETES_ADMISES.DUREE_DYSFONCTIONNEMENT,
        ERREURS_VALIDATION.DUREE_DYSFONCTIONNEMENT_INVALIDE,
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

    if (nbProprieteDossierHomologationVide === 0) {
      if (Number.isNaN(new Date(this.dateHomologation).valueOf()))
        erreurs.push(ERREURS_VALIDATION.DATE_HOMOLOGATION_INVALIDE);

      if (
        proprieteNEstPasAdmise(
          this.dureeHomologation,
          PROPRIETES_ADMISES.DUREE_HOMOLOGATION
        )
      )
        erreurs.push(ERREURS_VALIDATION.DUREE_HOMOLOGATION_INVALIDE);
    }

    return erreurs;
  }
}

module.exports = ServiceTeleverse;
