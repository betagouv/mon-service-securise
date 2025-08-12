const Base = require('../base');
const Referentiel = require('../../referentiel');
const { dateInvalide } = require('../../utilitaires/date');
const DescriptionService = require('../descriptionService');

const ERREURS_VALIDATION = {
  NOM_INVALIDE: 'NOM_INVALIDE',
  NOM_EXISTANT: 'NOM_EXISTANT',
  SIRET_INVALIDE: 'SIRET_INVALIDE',
  NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE:
    'NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE',
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
        'nombreOrganisationsUtilisatrices',
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
    return this.siret.replace(/[^0-9]/g, '');
  }

  aUnDossierHomologationComplet() {
    const nbProprieteDossierHomologationVide = [
      this.dateHomologation,
      this.dureeHomologation,
      this.nomAutoriteHomologation,
      this.fonctionAutoriteHomologation,
    ].filter((p) => p === '' || p === undefined).length;
    return nbProprieteDossierHomologationVide === 0;
  }

  *valideDescriptionService(nomServicesExistants) {
    if (!this.nom) yield ERREURS_VALIDATION.NOM_INVALIDE;
    if (nomServicesExistants.includes(this.nom))
      yield ERREURS_VALIDATION.NOM_EXISTANT;

    if (!/^\d{14}$/.test(this.siretFormatte()))
      yield ERREURS_VALIDATION.SIRET_INVALIDE;

    yield* [
      [
        this.type,
        this.referentiel.descriptionsTypeService(),
        ERREURS_VALIDATION.TYPE_INVALIDE,
      ],
      [
        this.nombreOrganisationsUtilisatrices,
        this.referentiel.labelsNombreOrganisationsUtilisatrices(),
        ERREURS_VALIDATION.NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE,
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
    ]
      .filter(([propriete, referentiel]) =>
        proprieteNEstPasAdmise(propriete, referentiel)
      )
      .map(([, , typeErreur]) => typeErreur);
  }

  *valideDossierHomologation() {
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
      yield ERREURS_VALIDATION.DOSSIER_HOMOLOGATION_INCOMPLET;

    if (this.aUnDossierHomologationComplet()) {
      if (dateInvalide(this.dateHomologation))
        yield ERREURS_VALIDATION.DATE_HOMOLOGATION_INVALIDE;

      if (
        proprieteNEstPasAdmise(
          this.dureeHomologation,
          this.referentiel.descriptionsEcheanceRenouvellement()
        )
      )
        yield ERREURS_VALIDATION.DUREE_HOMOLOGATION_INVALIDE;
    }
  }

  valide(nomServicesExistants = []) {
    return [
      ...this.valideDescriptionService(nomServicesExistants),
      ...this.valideDossierHomologation(),
    ];
  }

  enDonneesService() {
    const donneesDescriptionService = {
      delaiAvantImpactCritique:
        this.referentiel.delaiAvantImpactCritiqueParDescription(
          this.delaiAvantImpactCritique
        ),
      localisationDonnees: this.referentiel.localisationDonneesParDescription(
        this.localisation
      ),
      nomService: this.nom,
      provenanceService: this.referentiel.provenanceServiceParDescription(
        this.provenance
      ),
      statutDeploiement: this.referentiel.statutDeploiementParDescription(
        this.statut
      ),
      typeService: [this.referentiel.typeServiceParDescription(this.type)],
      organisationResponsable: {
        siret: this.siretFormatte(),
      },
      nombreOrganisationsUtilisatrices:
        this.referentiel.nombreOrganisationsUtilisatricesParLabel(
          this.nombreOrganisationsUtilisatrices
        ),
    };

    const niveauSecurite = DescriptionService.estimeNiveauDeSecurite(
      donneesDescriptionService
    );

    return {
      descriptionService: { ...donneesDescriptionService, niveauSecurite },
      ...(this.aUnDossierHomologationComplet() && {
        dossier: {
          decision: {
            dateHomologation: this.dateHomologation,
            dureeValidite:
              this.referentiel.echeanceRenouvellementParDescription(
                this.dureeHomologation
              ),
          },
          autorite: {
            nom: this.nomAutoriteHomologation,
            fonction: this.fonctionAutoriteHomologation,
          },
        },
      }),
    };
  }
}

module.exports = ServiceTeleverse;
