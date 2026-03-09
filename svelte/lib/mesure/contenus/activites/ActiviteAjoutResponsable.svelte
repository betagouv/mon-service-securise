<script lang="ts">
  import type {
    ActiviteMesure,
    DetailsModificationResponsable,
  } from '../../mesure.d';
  import { contributeurs } from '../../../tableauDesMesures/stores/contributeurs.store';
  import DesignationMesureActivite from './DesignationMesureActivite.svelte';

  interface Props {
    activite: ActiviteMesure;
  }

  let { activite }: Props = $props();

  const details = <DetailsModificationResponsable>activite.details;
  const idResponsable: string = details.valeur;
  let intitule: string = $state('');
  $effect(() => {
    const contributeursTrouves = $contributeurs.filter(
      (c) => c.id === idResponsable
    );
    intitule =
      contributeursTrouves.length === 0
        ? 'Un·e utilisateur·rice'
        : contributeursTrouves[0].prenomNom;
  });
</script>

<div>
  <b>{intitule}</b> a été désigné·e responsable de la
  <DesignationMesureActivite {activite} />
</div>
