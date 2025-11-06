import { ReferentielV2 } from '../../referentiel.interface.js';
import {
  AudienceCible,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  OuvertureSysteme,
  questionsV2,
  StatutDeploiement,
  TypeDeService,
  TypeHebergement,
  VolumetrieDonneesTraitees,
} from '../../../donneesReferentielMesuresV2.js';
import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../descriptionServiceV2.js';
import { ValidationServiceTeleverseV2 } from './validationV2.js';

type DescriptionStatutDeploiement =
  (typeof questionsV2.statutDeploiement)[StatutDeploiement]['description'];
type NomTypeDeService =
  (typeof questionsV2.typeDeService)[TypeDeService]['nom'];
type NomTypeHebergement =
  (typeof questionsV2.typeHebergement)[TypeHebergement]['nom'];
type NomOuvertureSysteme =
  (typeof questionsV2.ouvertureSysteme)[OuvertureSysteme]['nom'];
type NomAudienceCible =
  (typeof questionsV2.audienceCible)[AudienceCible]['nom'];
type NomDureeDysfonctionnementAcceptable =
  (typeof questionsV2.dureeDysfonctionnementAcceptable)[DureeDysfonctionnementAcceptable]['nom'];
type NomVolumetrieDonneesTraitees =
  (typeof questionsV2.volumetrieDonneesTraitees)[VolumetrieDonneesTraitees]['nom'];
type NomLocalisationDonneesTraitees =
  (typeof questionsV2.localisationDonneesTraitees)[LocalisationDonneesTraitees]['nom'];

export type LigneServiceTeleverseV2 = {
  nom: string;
  siret: string;
  statutDeploiement: DescriptionStatutDeploiement;
  typeService: NomTypeDeService[];
  typeHebergement: NomTypeHebergement;
  ouvertureSysteme: NomOuvertureSysteme;
  audienceCible: NomAudienceCible;
  dureeDysfonctionnementAcceptable: NomDureeDysfonctionnementAcceptable;
  volumetrieDonneesTraitees: NomVolumetrieDonneesTraitees;
  localisationDonneesTraitees: NomLocalisationDonneesTraitees;
  dateHomologation?: Date;
  dureeHomologation?: string;
  nomAutoriteHomologation?: string;
  fonctionAutoriteHomologation?: string;
};

type DonneesMinimalesRequisesDescriptionServiceV2 = Omit<
  DonneesDescriptionServiceV2,
  | 'pointsAcces'
  | 'specificitesProjet'
  | 'activitesExternalisees'
  | 'categoriesDonneesTraitees'
  | 'categoriesDonneesTraiteesSupplementaires'
>;

type DonneesMinimalesRequisesDossierHomologation = {
  decision: { dateHomologation: string; dureeValidite: string };
  autorite: { nom: string; fonction: string };
};

export type DonneesServiceTeleverseV2 = Omit<
  LigneServiceTeleverseV2,
  | 'dateHomologation'
  | 'dureeHomologation'
  | 'nomAutoriteHomologation'
  | 'fonctionAutoriteHomologation'
> & {
  dossierHomologation?: {
    dateHomologation: Date;
    dureeHomologation: string;
    nomAutoriteHomologation: string;
    fonctionAutoriteHomologation: string;
  };
};

export class ServiceTeleverseV2 {
  readonly donnees: DonneesServiceTeleverseV2;
  readonly referentiel: ReferentielV2;

  constructor(donnees: LigneServiceTeleverseV2, referentiel: ReferentielV2) {
    const aAuMoinsUneInfoDuDossier = () =>
      [
        donnees.dateHomologation,
        donnees.dureeHomologation,
        donnees.nomAutoriteHomologation,
        donnees.fonctionAutoriteHomologation,
      ].some((p) => p !== '' && p !== undefined);

    this.donnees = {
      ...donnees,
      siret: donnees.siret.replace(/[^0-9]/g, ''),
      ...(aAuMoinsUneInfoDuDossier() && {
        dossierHomologation: {
          dateHomologation: donnees.dateHomologation!,
          dureeHomologation: donnees.dureeHomologation!,
          nomAutoriteHomologation: donnees.nomAutoriteHomologation!,
          fonctionAutoriteHomologation: donnees.fonctionAutoriteHomologation!,
        },
      }),
    };
    this.referentiel = referentiel;
  }

  valide(nomServicesExistants: string[] = []) {
    const validation = new ValidationServiceTeleverseV2(nomServicesExistants);
    return validation.valide(this.donnees);
  }

  enDonneesService(): {
    descriptionService: DonneesMinimalesRequisesDescriptionServiceV2;
    dossier?: DonneesMinimalesRequisesDossierHomologation;
  } {
    const trouveIdentifiantDonneePourDescription = <
      T extends Record<string, { description: string }>,
    >(
      d: T,
      description: string
    ): keyof T =>
      Object.entries(d).find(
        ([, valeur]) => valeur.description === description
      )?.[0] as keyof T;

    const trouveIdentifiantDonneePourNom = <
      T extends Record<string, { nom: string }>,
    >(
      d: T,
      nom: string
    ): keyof T =>
      Object.entries(d).find(
        ([, valeur]) => valeur.nom === nom
      )?.[0] as keyof T;

    const donneesDescriptionService: Omit<
      DonneesMinimalesRequisesDescriptionServiceV2,
      'niveauSecurite'
    > = {
      nomService: this.donnees.nom,
      organisationResponsable: {
        siret: this.donnees.siret,
      },
      statutDeploiement: trouveIdentifiantDonneePourDescription(
        questionsV2.statutDeploiement,
        this.donnees.statutDeploiement
      ),
      typeService: this.donnees.typeService.map((type) =>
        trouveIdentifiantDonneePourNom(questionsV2.typeDeService, type)
      ),
      typeHebergement: trouveIdentifiantDonneePourNom(
        questionsV2.typeHebergement,
        this.donnees.typeHebergement
      ),
      ouvertureSysteme: trouveIdentifiantDonneePourNom(
        questionsV2.ouvertureSysteme,
        this.donnees.ouvertureSysteme
      ),
      audienceCible: trouveIdentifiantDonneePourNom(
        questionsV2.audienceCible,
        this.donnees.audienceCible
      ),
      dureeDysfonctionnementAcceptable: trouveIdentifiantDonneePourNom(
        questionsV2.dureeDysfonctionnementAcceptable,
        this.donnees.dureeDysfonctionnementAcceptable
      ),
      volumetrieDonneesTraitees: trouveIdentifiantDonneePourNom(
        questionsV2.volumetrieDonneesTraitees,
        this.donnees.volumetrieDonneesTraitees
      ),
      localisationDonneesTraitees: trouveIdentifiantDonneePourNom(
        questionsV2.localisationDonneesTraitees,
        this.donnees.localisationDonneesTraitees
      ),
    };

    const niveauSecurite = DescriptionServiceV2.niveauSecuriteMinimalRequis({
      volumetrie: donneesDescriptionService.volumetrieDonneesTraitees,
      categories: [],
      autresDonneesTraitees: [],
      disponibilite: donneesDescriptionService.dureeDysfonctionnementAcceptable,
      audienceCible: donneesDescriptionService.audienceCible,
      ouvertureSysteme: donneesDescriptionService.ouvertureSysteme,
    });

    return {
      descriptionService: { ...donneesDescriptionService, niveauSecurite },
      ...(this.donnees.dossierHomologation && {
        dossier: {
          decision: {
            dateHomologation:
              this.donnees.dossierHomologation.dateHomologation.toLocaleDateString(
                'fr-FR'
              ),
            dureeValidite:
              this.referentiel.echeanceRenouvellementParDescription(
                this.donnees.dossierHomologation.dureeHomologation
              ),
          },
          autorite: {
            nom: this.donnees.dossierHomologation.nomAutoriteHomologation,
            fonction:
              this.donnees.dossierHomologation.fonctionAutoriteHomologation,
          },
        },
      }),
    };
  }
}
