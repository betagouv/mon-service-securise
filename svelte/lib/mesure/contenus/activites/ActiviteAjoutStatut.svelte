<script lang="ts">
  import type { ActiviteMesure, DetailsAjoutPropriete } from '../../mesure.d';
  import type { ReferentielStatut } from '../../../ui/types';
  import type { StatutMesure } from '../../../modeles/mesure';
  import TagStatutMesure from '../../../ui/TagStatutMesure.svelte';

  export let activite: ActiviteMesure;
  export let statuts: ReferentielStatut;
  // eslint-disable-next-line svelte/valid-compile
  export let priorites;

  const details = <DetailsAjoutPropriete>activite.details;
  const statut = <StatutMesure>details.nouvelleValeur;
</script>

<div>
  Le statut de la <b>mesure #{activite.identifiantNumeriqueMesure}</b> est
  <TagStatutMesure referentielStatuts={statuts} {statut} />
</div>
