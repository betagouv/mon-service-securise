import { ReferentielV2 } from '../../referentiel.interface.js';
import {
  ActiviteExternalisee,
  questionsV2,
} from '../../../donneesReferentielMesuresV2.js';
import {
  DescriptionServiceV2,
  DonneesDescriptionServiceV2,
} from '../descriptionServiceV2.js';
import { ValidationServiceTeleverseV2 } from './validationV2.js';
import {
  DescriptionStatutDeploiement,
  NomAudienceCible,
  NomDureeDysfonctionnementAcceptable,
  NomLocalisationDonneesTraitees,
  NomOuvertureSysteme,
  NomTypeDeService,
  NomTypeHebergement,
  NomVolumetrieDonneesTraitees,
  trouveIdentifiantDonneeParDescription,
  trouveIdentifiantDonneeParNom,
} from './correspondanceReferentielV2.js';

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

type DonneesMinimalesRequisesDossierHomologation = {
  decision: { dateHomologation: Date; dureeValidite: string };
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
  readonly donneesOrigine: LigneServiceTeleverseV2;
  readonly referentiel: ReferentielV2;

  constructor(donnees: LigneServiceTeleverseV2, referentiel: ReferentielV2) {
    this.donneesOrigine = donnees;

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
    descriptionService: DonneesDescriptionServiceV2;
    dossier?: DonneesMinimalesRequisesDossierHomologation;
  } {
    const donneesDescriptionService = {
      nomService: this.donnees.nom,
      organisationResponsable: { siret: this.donnees.siret },
      statutDeploiement: trouveIdentifiantDonneeParDescription(
        questionsV2.statutDeploiement,
        this.donnees.statutDeploiement
      ),
      typeService: this.donnees.typeService.map((type) =>
        trouveIdentifiantDonneeParNom(questionsV2.typeDeService, type)
      ),
      typeHebergement: trouveIdentifiantDonneeParNom(
        questionsV2.typeHebergement,
        this.donnees.typeHebergement
      ),
      ouvertureSysteme: trouveIdentifiantDonneeParNom(
        questionsV2.ouvertureSysteme,
        this.donnees.ouvertureSysteme
      ),
      audienceCible: trouveIdentifiantDonneeParNom(
        questionsV2.audienceCible,
        this.donnees.audienceCible
      ),
      dureeDysfonctionnementAcceptable: trouveIdentifiantDonneeParNom(
        questionsV2.dureeDysfonctionnementAcceptable,
        this.donnees.dureeDysfonctionnementAcceptable
      ),
      volumetrieDonneesTraitees: trouveIdentifiantDonneeParNom(
        questionsV2.volumetrieDonneesTraitees,
        this.donnees.volumetrieDonneesTraitees
      ),
      localisationDonneesTraitees: trouveIdentifiantDonneeParNom(
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

    const activitesExternalisees: ActiviteExternalisee[] =
      donneesDescriptionService.typeHebergement === 'saas'
        ? ['administrationTechnique', 'developpementLogiciel']
        : [];

    return {
      descriptionService: {
        ...donneesDescriptionService,
        niveauSecurite,
        pointsAcces: [],
        activitesExternalisees,
        categoriesDonneesTraitees: [],
        categoriesDonneesTraiteesSupplementaires: [],
        specificitesProjet: [],
      },
      ...(this.donnees.dossierHomologation && {
        dossier: {
          decision: {
            dateHomologation: this.donnees.dossierHomologation.dateHomologation,
            dureeValidite:
              this.referentiel.echeanceRenouvellementParDescription(
                this.donnees.dossierHomologation.dureeHomologation
              ) as string,
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

  nom() {
    return this.donnees.nom;
  }

  toJSON() {
    return this.donneesOrigine;
  }
}
