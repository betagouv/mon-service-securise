<script lang="ts">
  import type { Mesures, MesuresDTO } from './tableauDesMesures.d';
  import LigneMesure from './ligne/LigneMesure.svelte';
  import { recupereMesures, enregistreMesures } from './tableauDesMesures.api';
  import { onMount } from 'svelte';

  export let idService: string;
  export let categories: Record<string, string>;
  export let statuts: Record<string, string>;

  let mesures: Mesures;
  onMount(async () => {
    mesures = await recupereMesures(idService);
  });

  const metAJourMesures = async () => {
    await enregistreMesures(idService, mesures);
  };
</script>

<div class="tableau-des-mesures">
  {#if mesures}
    {#each Object.entries(mesures.mesuresGenerales) as [id, mesure] (id)}
      {@const labelReferentiel = mesure.indispensable
        ? 'Indispensable'
        : 'Recommandé'}
      <LigneMesure
        referentiel={{ label: labelReferentiel, classe: 'mss' }}
        nom={mesure.description}
        categorie={categories[mesure.categorie]}
        referentielStatuts={statuts}
        bind:mesure
        on:modificationStatut={metAJourMesures}
      />
    {/each}
    {#each mesures.mesuresSpecifiques as mesure, index (index)}
      <LigneMesure
        referentiel={{ label: 'Nouvelle' }}
        nom={mesure.description}
        categorie={categories[mesure.categorie]}
        referentielStatuts={statuts}
        bind:mesure
        on:modificationStatut={metAJourMesures}
      />
    {/each}
  {/if}
</div>
