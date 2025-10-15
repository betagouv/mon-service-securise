import { derived } from 'svelte/store';
import { leBrouillon } from '../brouillon.store';
import type {
  ActiviteExternalisee,
  AudienceCible,
  CategorieDonneesTraitees,
  DescriptionServiceV2,
  DureeDysfonctionnementAcceptable,
  LocalisationDonneesTraitees,
  OuvertureSysteme,
  SpecificiteProjet,
  StatutDeploiement,
  TypeHebergement,
  TypeService,
  VolumetrieDonneesTraitees,
} from '../../creationV2.types';
import { questionsV2 } from '../../../../../donneesReferentielMesuresV2';

export const convertisDonneesDescriptionEnLibelles = (
  donnees: DescriptionServiceV2
): Record<keyof DescriptionServiceV2, string | string[]> => ({
  niveauSecurite: donnees.niveauSecurite,
  nomService: donnees.nomService,
  siret: donnees.siret,
  statutDeploiement:
    questionsV2.statutDeploiement[
      donnees.statutDeploiement as StatutDeploiement
    ].description,
  presentation: donnees.presentation,
  pointsAcces: donnees.pointsAcces,
  typeService: donnees.typeService.map(
    (typeService) => questionsV2.typeDeService[typeService as TypeService].nom
  ),
  specificitesProjet: donnees.specificitesProjet.map(
    (specificiteProjet) =>
      questionsV2.specificiteProjet[specificiteProjet as SpecificiteProjet].nom
  ),
  typeHebergement:
    questionsV2.typeHebergement[donnees.typeHebergement as TypeHebergement].nom,
  activitesExternalisees: donnees.activitesExternalisees.map(
    (activitesExternalisees) =>
      questionsV2.activiteExternalisee[
        activitesExternalisees as ActiviteExternalisee
      ].nom
  ),
  ouvertureSysteme:
    questionsV2.ouvertureSysteme[donnees.ouvertureSysteme as OuvertureSysteme]
      .nom,
  audienceCible:
    questionsV2.audienceCible[donnees.audienceCible as AudienceCible].nom,
  dureeDysfonctionnementAcceptable:
    questionsV2.dureeDysfonctionnementAcceptable[
      donnees.dureeDysfonctionnementAcceptable as DureeDysfonctionnementAcceptable
    ].nom,
  categoriesDonneesTraitees: donnees.categoriesDonneesTraitees.map(
    (c) =>
      questionsV2.categorieDonneesTraitees[c as CategorieDonneesTraitees].nom
  ),
  categoriesDonneesTraiteesSupplementaires:
    donnees.categoriesDonneesTraiteesSupplementaires,
  volumetrieDonneesTraitees:
    questionsV2.volumetrieDonneesTraitees[
      donnees.volumetrieDonneesTraitees as VolumetrieDonneesTraitees
    ].nom,
  localisationsDonneesTraitees: donnees.localisationsDonneesTraitees.map(
    (l) =>
      questionsV2.localisationDonneesTraitees[l as LocalisationDonneesTraitees]
        .nom
  ),
});

export const resume = derived<
  [typeof leBrouillon],
  Record<keyof DescriptionServiceV2, string | string[]>
>([leBrouillon], ([$b]) => convertisDonneesDescriptionEnLibelles($b));
