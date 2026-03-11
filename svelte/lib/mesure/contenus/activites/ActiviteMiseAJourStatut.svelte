<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import type { ReferentielStatut } from '../../../ui/types';
  import type { StatutMesure } from '../../../modeles/modeleMesure';
  import TagStatutMesure from '../../../ui/TagStatutMesure.svelte';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  interface Props {
    activite: ActiviteMesure;
    statuts: ReferentielStatut;
  }

  let { activite, statuts }: Props = $props();

  let details = $derived(activite.details as DetailsMiseAJourPropriete);
  let ancienStatut = $derived(details.ancienneValeur as StatutMesure);
  let nouveauStatut = $derived(details.nouvelleValeur as StatutMesure);
</script>

<div>
  <div>
    Le statut de la <DesignationMesureActivite {activite} /> a été modifié
  </div>
  <div class="changements">
    de
    <TagStatutMesure referentielStatuts={statuts} statut={ancienStatut} />
    à
    <TagStatutMesure referentielStatuts={statuts} statut={nouveauStatut} />
  </div>
</div>

<style>
  .changements {
    margin-top: 4px;
  }
</style>
