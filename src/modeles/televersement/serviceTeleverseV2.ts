// import Base from '../base.js';
// import * as Referentiel from '../../referentiel.js';
// import { dateInvalide } from '../../utilitaires/date.js';
// import DescriptionService from '../descriptionService.js';

//
import { ReferentielV2 } from '../../referentiel.interface.js';
import { dateInvalide } from '../../utilitaires/date.js';
import { DescriptionStatutDeploiement } from '../../../donneesReferentielMesuresV2.js';

const proprieteNEstPasAdmise = (propriete: string, referentiel: string[]) =>
  !referentiel.includes(propriete);

enum ERREURS_VALIDATION {
  NOM_INVALIDE = 'NOM_INVALIDE',
  NOM_EXISTANT = 'NOM_EXISTANT',
  SIRET_INVALIDE = 'SIRET_INVALIDE',
  STATUT_DEPLOIEMENT_INVALIDE = 'STATUT_DEPLOIEMENT_INVALIDE',
  // NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE = 'NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE',
  // TYPE_INVALIDE = 'TYPE_INVALIDE',
  // PROVENANCE_INVALIDE = 'PROVENANCE_INVALIDE',
  // STATUT_INVALIDE = 'STATUT_INVALIDE',
  // LOCALISATION_INVALIDE = 'LOCALISATION_INVALIDE',
  // DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE = 'DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE',
  DOSSIER_HOMOLOGATION_INCOMPLET = 'DOSSIER_HOMOLOGATION_INCOMPLET',
  DATE_HOMOLOGATION_INVALIDE = 'DATE_HOMOLOGATION_INVALIDE',
  DUREE_HOMOLOGATION_INVALIDE = 'DUREE_HOMOLOGATION_INVALIDE',
}

export type DonneesServiceTeleverseV2 = {
  // !!donnees.presentation &&
  // !!donnees.typeService &&
  // donnees.typeService.length > 0 &&
  // !!donnees.typeHebergement &&
  // !!donnees.ouvertureSysteme &&
  // !!donnees.audienceCible &&
  // !!donnees.dureeDysfonctionnementAcceptable &&
  // !!donnees.volumetrieDonneesTraitees &&
  // !!donnees.localisationsDonneesTraitees &&
  // donnees.localisationsDonneesTraitees?.length > 0
  nom: string;
  siret: string;
  statutDeploiement: DescriptionStatutDeploiement;

  dateHomologation: string;
  dureeHomologation: string;
  nomAutoriteHomologation: string;
  fonctionAutoriteHomologation: string;
};

export class ServiceTeleverseV2 {
  readonly nom: string;
  readonly siret: string;
  readonly statutDeploiement: DescriptionStatutDeploiement;
  readonly dateHomologation: string;
  readonly dureeHomologation: string;
  readonly nomAutoriteHomologation: string;
  readonly fonctionAutoriteHomologation: string;

  readonly referentiel: ReferentielV2;

  constructor(donnees: DonneesServiceTeleverseV2, referentiel: ReferentielV2) {
    this.nom = donnees.nom;
    this.siret = donnees.siret;
    this.statutDeploiement = donnees.statutDeploiement;
    this.dateHomologation = donnees.dateHomologation;
    this.dureeHomologation = donnees.dureeHomologation;
    this.nomAutoriteHomologation = donnees.nomAutoriteHomologation;
    this.fonctionAutoriteHomologation = donnees.fonctionAutoriteHomologation;

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

  *valideDescriptionService(nomServicesExistants: string[]) {
    if (!this.nom) yield ERREURS_VALIDATION.NOM_INVALIDE;
    if (nomServicesExistants.includes(this.nom))
      yield ERREURS_VALIDATION.NOM_EXISTANT;

    if (!/^\d{14}$/.test(this.siretFormatte()))
      yield ERREURS_VALIDATION.SIRET_INVALIDE;

    yield* [
      [
        this.statutDeploiement,
        this.referentiel.descriptionsStatutDeploiement(),
        ERREURS_VALIDATION.STATUT_DEPLOIEMENT_INVALIDE,
      ],
      // [
      //   this.nombreOrganisationsUtilisatrices,
      //   this.referentiel.labelsNombreOrganisationsUtilisatrices(),
      //   ERREURS_VALIDATION.NOMBRE_ORGANISATIONS_UTILISATRICES_INVALIDE,
      // ],
      // [
      //   this.provenance,
      //   this.referentiel.descriptionsProvenanceService(),
      //   ERREURS_VALIDATION.PROVENANCE_INVALIDE,
      // ],
      // [
      //   this.statut,
      //   this.referentiel.descriptionsStatutDeploiement(),
      //   ERREURS_VALIDATION.STATUT_INVALIDE,
      // ],
      // [
      //   this.localisation,
      //   this.referentiel.descriptionLocalisationDonnees(),
      //   ERREURS_VALIDATION.LOCALISATION_INVALIDE,
      // ],
      // [
      //   this.delaiAvantImpactCritique,
      //   this.referentiel.descriptionsDelaiAvantImpactCritique(),
      //   ERREURS_VALIDATION.DELAI_AVANT_IMPACT_CRITIQUE_INVALIDE,
      // ],
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

  valide(nomServicesExistants: string[] = []) {
    return [
      ...this.valideDescriptionService(nomServicesExistants),
      ...this.valideDossierHomologation(),
    ];
  }
  //
  // enDonneesService() {
  //   const donneesDescriptionService = {
  //     delaiAvantImpactCritique:
  //       this.referentiel.delaiAvantImpactCritiqueParDescription(
  //         this.delaiAvantImpactCritique
  //       ),
  //     localisationDonnees: this.referentiel.localisationDonneesParDescription(
  //       this.localisation
  //     ),
  //     nomService: this.nom,
  //     provenanceService: this.referentiel.provenanceServiceParDescription(
  //       this.provenance
  //     ),
  //     statutDeploiement: this.referentiel.statutDeploiementParDescription(
  //       this.statut
  //     ),
  //     typeService: [this.referentiel.typeServiceParDescription(this.type)],
  //     organisationResponsable: {
  //       siret: this.siretFormatte(),
  //     },
  //     nombreOrganisationsUtilisatrices:
  //       this.referentiel.nombreOrganisationsUtilisatricesParLabel(
  //         this.nombreOrganisationsUtilisatrices
  //       ),
  //   };
  //
  //   const niveauSecurite = DescriptionService.estimeNiveauDeSecurite(
  //     donneesDescriptionService
  //   );
  //
  //   return {
  //     descriptionService: { ...donneesDescriptionService, niveauSecurite },
  //     ...(this.aUnDossierHomologationComplet() && {
  //       dossier: {
  //         decision: {
  //           dateHomologation: this.dateHomologation,
  //           dureeValidite:
  //             this.referentiel.echeanceRenouvellementParDescription(
  //               this.dureeHomologation
  //             ),
  //         },
  //         autorite: {
  //           nom: this.nomAutoriteHomologation,
  //           fonction: this.fonctionAutoriteHomologation,
  //         },
  //       },
  //     }),
  //   };
  // }
}
