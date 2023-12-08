<script lang="ts">
  import type {
    Mesures,
    ReferentielMesuresGenerales,
  } from './tableauDesMesures.d';
  import LigneMesure from './ligne/LigneMesure.svelte';

  export let mesures: Mesures;
  export let referentielMesuresGenerales: ReferentielMesuresGenerales;
  export let categories: Record<string, string>;
  export let statuts: Record<string, string>;
</script>

<div class="tableau-des-mesures">
  {#each mesures.mesuresGenerales as mesure (mesure.id)}
    {@const donneesMesure = referentielMesuresGenerales[mesure.id]}
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
</div>
