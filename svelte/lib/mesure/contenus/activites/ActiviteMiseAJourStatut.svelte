<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import type { ReferentielStatut } from '../../../ui/types';
  import type { StatutMesure } from '../../../modeles/mesure';
  import TagStatutMesure from '../../../ui/TagStatutMesure.svelte';

  export let activite: ActiviteMesure;
  export let statuts: ReferentielStatut;

  const details = <DetailsMiseAJourPropriete>activite.details;
  const ancienStatut = <StatutMesure>details.ancienneValeur;
  const nouveauStatut = <StatutMesure>details.nouvelleValeur;
</script>

<div>
  Le statut de la <b>mesure #{activite.identifiantNumeriqueMesure}</b> a été
  modifié de
  <span class="tag"
    ><TagStatutMesure
      referentielStatuts={statuts}
      statut={ancienStatut}
    /></span
  >
  à
  <span class="tag"
    ><TagStatutMesure
      referentielStatuts={statuts}
      statut={nouveauStatut}
    /></span
  >
</div>

<style>
  .tag {
    margin: 2px 0;
    display: inline-block;
  }
</style>
