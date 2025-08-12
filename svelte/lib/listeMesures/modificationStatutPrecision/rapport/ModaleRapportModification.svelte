<script lang="ts">
  import { servicesAvecMesuresAssociees } from '../../servicesAssocies/servicesAvecMesuresAssociees.store';
  import Modale from '../../../ui/Modale.svelte';
  import Bouton from '../../../ui/Bouton.svelte';
  import TableauServicesAssocies from '../../servicesAssocies/TableauServicesAssocies.svelte';
  import Toast from '../../../ui/Toast.svelte';
  import { modaleRapportStore } from './modaleRapport.store';
  import type {
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../../ui/types.d';

  export let referentielStatuts: ReferentielStatut;
  export let referentielTypesService: ReferentielTypesService;

  let elementModale: Modale;

  $: servicesAvecMesure = $modaleRapportStore.modeleMesureGenerale
    ? $servicesAvecMesuresAssociees
        .filter((s) => $modaleRapportStore.idServicesModifies?.includes(s.id))
        .map(({ mesuresAssociees, ...autresDonnees }) => ({
          ...autresDonnees,
          mesure: {
            ...mesuresAssociees[$modaleRapportStore.modeleMesureGenerale!.id],
            id: $modaleRapportStore.modeleMesureGenerale!.id,
            type: 'generale',
          },
        }))
    : [];

  modaleRapportStore.subscribe(({ ouvert }) =>
    ouvert ? elementModale?.affiche() : elementModale?.ferme()
  );

  let titre = '';
  let contenu = '';
  $: {
    const { champsModifies, idServicesModifies, modeleMesureGenerale } =
      $modaleRapportStore;
    if (champsModifies && idServicesModifies && modeleMesureGenerale) {
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
        modeleMesureGenerale!.description
      }</b> ${verbe} à ${idServicesModifies.length} service${
        servicesMultiples ? 's' : ''
      }.`;
    }
  }
</script>

<Modale bind:this={elementModale} on:close>
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
        {referentielTypesService}
        avecNomCliquable
        avecTypeEtBesoinDeSecurite
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
