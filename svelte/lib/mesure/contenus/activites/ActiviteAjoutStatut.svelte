<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import type { ReferentielStatut } from '../../../ui/types';
  import type { StatutMesure } from '../../../modeles/mesure';
  import TagStatutMesure from '../../../ui/TagStatutMesure.svelte';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  export let activite: ActiviteMesure;
  export let statuts: ReferentielStatut;

  const details = <DetailsAjoutPropriete>activite.details;
  const statut = <StatutMesure>details.nouvelleValeur;
</script>

<div>
  Le statut de la <DesignationMesureActivite {activite} /> est
  <TagStatutMesure referentielStatuts={statuts} {statut} />
</div>
