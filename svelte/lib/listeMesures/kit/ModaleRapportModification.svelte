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
</script>

<Modale bind:this={elementModale}>
  <svelte:fragment slot="entete">
    <Toast
      avecOmbre={false}
      titre="Statut et précision mis à jour avec succès"
      avecAnimation={false}
      niveau="succes"
      contenu="Le nouveau statut et la précision de la mesure Activer l'authentification multifacteur pour l'accès des administrateurs au service ont été appliqués à 2 services."
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
    margin: 0 0 24px;
    text-align: left;
  }
</style>
