<script lang="ts">
  import { servicesAvecMesuresAssociees } from '../stores/servicesAvecMesuresAssociees.store';
  import Modale from '../../ui/Modale.svelte';
  import Bouton from '../../ui/Bouton.svelte';
  import TableauServicesAssocies from './TableauServicesAssocies.svelte';
  import Toast from '../../ui/Toast.svelte';
  import { modaleRapportStore } from '../stores/modaleRapport.store';
  import type { ReferentielStatut } from '../../ui/types';

  export let referentielStatuts: ReferentielStatut;

  let elementModale: Modale;

  $: servicesAvecMesure = $modaleRapportStore.mesure
    ? $servicesAvecMesuresAssociees
        .filter((s) => $modaleRapportStore.idServicesModifies?.includes(s.id))
        .map(({ mesuresAssociees, ...autresDonnees }) => ({
          ...autresDonnees,
          mesure: mesuresAssociees[$modaleRapportStore.mesure!.id],
        }))
    : [];

  modaleRapportStore.subscribe(({ ouvert }) =>
    ouvert ? elementModale?.affiche() : elementModale?.ferme()
  );

  let titre = '';
  let contenu = '';
  $: {
    const { champsModifies, idServicesModifies, mesure } = $modaleRapportStore;
    if (champsModifies && idServicesModifies && mesure) {
      const servicesMultiples = idServicesModifies.length > 1;
      let sujetChaine = '';
      let verbe = '';

      if (
        champsModifies.includes('statut') &&
        champsModifies.includes('modalites')
      ) {
        sujetChaine = 'Le nouveau statut et la précision';
        verbe = 'ont été appliqués';
        titre = 'Statut et précision mis à jour avec succès';
      } else if (champsModifies.includes('statut')) {
        sujetChaine = 'Le nouveau statut';
        verbe = 'a été appliqué';
        titre = 'Statut mis à jour avec succès';
      } else if (champsModifies.includes('modalites')) {
        sujetChaine = 'La nouvelle précision';
        verbe = 'a été appliquée';
        titre = 'Précision mise à jour avec succès';
      }

      contenu = `${sujetChaine} de la mesure <b>${
        mesure!.description
      }</b> ${verbe} à ${idServicesModifies.length} service${
        servicesMultiples ? 's' : ''
      }.`;
    }
  }
</script>

<Modale bind:this={elementModale}>
  <svelte:fragment slot="entete">
    <Toast
      avecOmbre={false}
      {titre}
      avecAnimation={false}
      niveau="succes"
      {contenu}
    />
    <h4>
      {servicesAvecMesure.length}
      {servicesAvecMesure.length > 1 ? 'services associés' : 'service associé'} à
      cette mesure
    </h4>
  </svelte:fragment>
  <svelte:fragment slot="contenu">
    {#if servicesAvecMesure}
      <TableauServicesAssocies
        servicesAssocies={servicesAvecMesure}
        {referentielStatuts}
      />
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="actions">
    <Bouton
      titre="Retour à la liste de mesures"
      type="secondaire"
      taille="moyen"
      on:click={() => modaleRapportStore.ferme()}
    />
  </svelte:fragment>
</Modale>

<style lang="scss">
  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    text-align: left;
    margin: 48px 0 0;
  }
</style>
