<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsMiseAJourPropriete,
  } from '../../mesure.d';
  import type { ReferentielStatut } from '../../../ui/types';
  import type { StatutMesure } from '../../../modeles/mesure';
  import TagStatutMesure from '../../../ui/TagStatutMesure.svelte';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  export let activite: ActiviteMesure;
  export let statuts: ReferentielStatut;

  const details = <DetailsMiseAJourPropriete>activite.details;
  const ancienStatut = <StatutMesure>details.ancienneValeur;
  const nouveauStatut = <StatutMesure>details.nouvelleValeur;
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
