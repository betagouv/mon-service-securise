import { derived } from 'svelte/store';
import { leBrouillon } from '../brouillon.store';
import type {
  ActiviteExternalisee,
  AudienceCible,
  BrouillonIncomplet,
  BrouillonSvelte,
  CategorieDonneesTraitees,
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

export const resume = derived<
  [typeof leBrouillon],
  Record<keyof BrouillonSvelte, string | string[]>
>([leBrouillon], ([$b]) => {
  return {
    id: $b.id!,
    niveauSecurite: $b.niveauSecurite,
    nomService: $b.nomService,
    siret: $b.siret,
    statutDeploiement:
      questionsV2.statutDeploiement[$b.statutDeploiement as StatutDeploiement]
        .description,
    presentation: $b.presentation,
    pointsAcces: $b.pointsAcces,
    typeService: $b.typeService.map(
      (typeService) => questionsV2.typeDeService[typeService as TypeService].nom
    ),
    specificitesProjet: $b.specificitesProjet.map(
      (specificiteProjet) =>
        questionsV2.specificiteProjet[specificiteProjet as SpecificiteProjet]
          .nom
    ),
    typeHebergement:
      questionsV2.typeHebergement[$b.typeHebergement as TypeHebergement].nom,
    activitesExternalisees: $b.activitesExternalisees.map(
      (activitesExternalisees) =>
        questionsV2.activiteExternalisee[
          activitesExternalisees as ActiviteExternalisee
        ].nom
    ),
    ouvertureSysteme:
      questionsV2.ouvertureSysteme[$b.ouvertureSysteme as OuvertureSysteme].nom,
    audienceCible:
      questionsV2.audienceCible[$b.audienceCible as AudienceCible].nom,
    dureeDysfonctionnementAcceptable:
      questionsV2.dureeDysfonctionnementAcceptable[
        $b.dureeDysfonctionnementAcceptable as DureeDysfonctionnementAcceptable
      ].nom,
    categoriesDonneesTraitees: $b.categoriesDonneesTraitees.map(
      (c) =>
        questionsV2.categorieDonneesTraitees[c as CategorieDonneesTraitees].nom
    ),
    categoriesDonneesTraiteesSupplementaires:
      $b.categoriesDonneesTraiteesSupplementaires,
    volumetrieDonneesTraitees:
      questionsV2.volumetrieDonneesTraitees[
        $b.volumetrieDonneesTraitees as VolumetrieDonneesTraitees
      ].nom,
    localisationsDonneesTraitees: $b.localisationsDonneesTraitees.map(
      (l) =>
        questionsV2.localisationDonneesTraitees[
          l as LocalisationDonneesTraitees
        ].nom
    ),
  };
});
