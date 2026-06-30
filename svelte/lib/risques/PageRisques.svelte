<script lang="ts">
  import {
    type MatriceNiveauxRisque,
    type ReferentielCategories,
    type ReferentielGravites,
    type ReferentielNiveauxRisque,
    type ReferentielRisques,
    type ReferentielVraisemblances,
  } from './risques.d';
  import type { RisquesV1 as TypeRisquesV1 } from '../risquesV2/risquesV2.d';
  import type { ReferentielStatut } from '../ui/types';
  import type { EtapeService } from '../menuNavigationService/menuNavigationService.d';
  import { VersionService } from '../../../src/modeles/versionService';
  import RisquesV2 from '../risquesV2/RisquesV2.svelte';
  import { tousRisques } from './risques';
  import RisquesV1 from './RisquesV1.svelte';

  interface Props {
    idService: string;
    estLectureSeule: boolean;
    categoriesRisque: ReferentielCategories;
    niveauxGravite: ReferentielGravites;
    niveauxVraisemblance: ReferentielVraisemblances;
    referentielRisques: ReferentielRisques;
    matriceNiveauxRisque: MatriceNiveauxRisque;
    niveauxRisque: ReferentielNiveauxRisque;
    visible: Record<EtapeService, boolean>;
    risquesV1: TypeRisquesV1;
    statuts: ReferentielStatut;
    avecRisquesV2: boolean;
    versionService: VersionService | undefined;
  }

  let {
    idService,
    estLectureSeule,
    risquesV1,
    statuts,
    categoriesRisque,
    niveauxGravite,
    niveauxVraisemblance,
    referentielRisques,
    matriceNiveauxRisque,
    niveauxRisque,
    visible,
    versionService,
    avecRisquesV2,
  }: Props = $props();
</script>

{#if avecRisquesV2 && versionService === VersionService.v2}
  <RisquesV2
    {idService}
    {risquesV1}
    {statuts}
    {niveauxGravite}
    {niveauxVraisemblance}
    {visible}
    {estLectureSeule}
    {avecRisquesV2}
    {versionService}
  />
{:else}
  <RisquesV1
    {idService}
    risques={risquesV1 ? tousRisques(risquesV1) : []}
    {niveauxGravite}
    {niveauxVraisemblance}
    {visible}
    {referentielRisques}
    {matriceNiveauxRisque}
    {niveauxRisque}
    {estLectureSeule}
    {categoriesRisque}
    {avecRisquesV2}
    {versionService}
  />
{/if}
