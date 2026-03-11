<script module lang="ts">
  export type DonneesModificationAAppliquer = {
    statut: StatutMesure | '';
    modalites: string;
    idsServices: string[];
  };
</script>

<script lang="ts">
  import { run } from 'svelte/legacy';

  import EtapierTiroir from '../EtapierTiroir.svelte';
  import SecondeEtape from './SecondeEtape.svelte';
  import TroisiemeEtape from './TroisiemeEtape.svelte';
  import PremiereEtape from './PremiereEtape.svelte';
  import type { ReferentielStatut } from '../../../ui/types';
  import type { StatutMesure } from '../../../modeles/modeleMesure';
  import { createEventDispatcher } from 'svelte';
  import type { ServiceAssocie } from '../../mesureGenerale/modification/TiroirModificationMultipleMesuresGenerales.svelte';
  import SeparateurHorizontal from '../../../ui/SeparateurHorizontal.svelte';

  interface Props {
    etapeCourante: number;
    statuts: ReferentielStatut;
    servicesAssocies: ServiceAssocie[];
    boutonSuivantActif?: boolean;
  }

  let {
    etapeCourante = $bindable(),
    statuts,
    servicesAssocies,
    boutonSuivantActif = $bindable(false),
  }: Props = $props();

  let statutSelectionne: StatutMesure | '' = $state('');
  let precision: string = $state('');
  let idsServicesSelectionnes: string[] = $state([]);

  let modificationPrecisionUniquement = $derived(
    !statutSelectionne && !!precision
  );

  const emetEvenement = createEventDispatcher<{
    'modification-a-appliquer': DonneesModificationAAppliquer;
  }>();

  export const etapePrecedente = () => {
    if (etapeCourante > 0) etapeCourante--;
  };

  export const etapeSuivante = () => {
    if (etapeCourante < 3) etapeCourante++;
    else
      emetEvenement('modification-a-appliquer', {
        statut: statutSelectionne,
        modalites: precision,
        idsServices: idsServicesSelectionnes,
      });
  };

  $effect(() => {
    switch (etapeCourante) {
      case 1:
        boutonSuivantActif = !!statutSelectionne || !!precision;
        break;
      case 2:
        boutonSuivantActif = idsServicesSelectionnes.length > 0;
        break;
      case 3:
        boutonSuivantActif = true;
        break;
    }
  });
</script>

<EtapierTiroir {etapeCourante} />
<SeparateurHorizontal />
{#if etapeCourante === 1}
  <PremiereEtape {statuts} bind:statutSelectionne bind:precision />
{:else if etapeCourante === 2}
  <SecondeEtape
    {statuts}
    {modificationPrecisionUniquement}
    {servicesAssocies}
    bind:idsServicesSelectionnes
  />
{:else if etapeCourante === 3}
  <TroisiemeEtape
    {precision}
    {statuts}
    {statutSelectionne}
    servicesConcernes={servicesAssocies.filter((s) =>
      idsServicesSelectionnes.includes(s.id)
    )}
  />
{/if}
