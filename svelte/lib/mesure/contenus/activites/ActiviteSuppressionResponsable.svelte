<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsModificationResponsable,
  } from '../../mesure.d';
  import { contributeurs } from '../../../tableauDesMesures/stores/contributeurs.store';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';
  import { derived } from 'svelte/store';

  interface Props {
    activite: ActiviteMesure;
  }

  let { activite }: Props = $props();

  let details = $derived(activite.details as DetailsModificationResponsable);
  let idResponsable: string = $derived(details.valeur);
  let intitule = derived(contributeurs, ($s) => {
    const contributeursTrouves = $s.filter((c) => c.id === idResponsable);
    return contributeursTrouves.length === 0
      ? 'Un·e utilisateur·rice'
      : contributeursTrouves[0].prenomNom;
  });
</script>

<div>
  <b>{$intitule}</b> n'est plus responsable de la
  <DesignationMesureActivite {activite} />
</div>
