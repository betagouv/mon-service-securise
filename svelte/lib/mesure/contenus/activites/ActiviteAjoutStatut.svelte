<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import type { ReferentielStatut } from '../../../ui/types';
  import type { StatutMesure } from '../../../modeles/modeleMesure';
  import TagStatutMesure from '../../../ui/TagStatutMesure.svelte';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  interface Props {
    activite: ActiviteMesure;
    statuts: ReferentielStatut;
  }

  let { activite, statuts }: Props = $props();

  const details = <DetailsAjoutPropriete>activite.details;
  const statut = <StatutMesure>details.nouvelleValeur;
</script>

<div>
  Le statut de la <DesignationMesureActivite {activite} /> est
  <TagStatutMesure referentielStatuts={statuts} {statut} />
</div>
