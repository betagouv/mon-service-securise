<script lang="ts">
  import type {
    Mesures,
    ReferentielMesuresGenerales,
  } from './tableauDesMesures.d';
  import LigneMesure from './ligne/LigneMesure.svelte';
  import { recupereMesures } from './tableauDesMesures.api';
  import { onMount } from 'svelte';

  export let referentielMesuresGenerales: ReferentielMesuresGenerales;
  export let idService: string;
  export let categories: Record<string, string>;
  export let statuts: Record<string, string>;

  let mesures: Mesures;
  onMount(async () => {
    mesures = await recupereMesures(idService);
  });
</script>

<div class="tableau-des-mesures">
  {#if mesures}
    {#each Object.entries(mesures.mesuresGenerales) as [id, mesure] (id)}
      {@const donneesMesure = referentielMesuresGenerales[id]}
      {@const labelReferentiel = donneesMesure.indispensable
        ? 'Indispensable'
        : 'Recommandé'}
      <LigneMesure
        referentiel={{ label: labelReferentiel, classe: 'mss' }}
        nom={donneesMesure.description}
        categorie={categories[donneesMesure.categorie]}
        idStatut={mesure.statut}
        referentielStatuts={statuts}
      />
    {/each}
    {#each mesures.mesuresSpecifiques as mesure, index (index)}
      <LigneMesure
        referentiel={{ label: 'Nouvelle' }}
        nom={mesure.description}
        categorie={categories[mesure.categorie]}
        idStatut={mesure.statut}
        referentielStatuts={statuts}
      />
    {/each}
  {/if}
</div>
