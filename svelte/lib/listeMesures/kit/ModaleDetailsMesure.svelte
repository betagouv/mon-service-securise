<script lang="ts">
  import type {
    MesureReferentiel,
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../ui/types.d';
  import { mesuresAvecServicesAssociesStore } from '../stores/mesuresAvecServicesAssocies.store';
  import { servicesAvecMesuresAssociees } from '../stores/servicesAvecMesuresAssociees.store';
  import DescriptionCompleteMesure from './DescriptionCompleteMesure.svelte';
  import Modale from '../../ui/Modale.svelte';
  import { tick } from 'svelte';
  import Bouton from '../../ui/Bouton.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import TiroirConfigurationMesure from './tiroir/TiroirConfigurationMesure.svelte';
  import TableauServicesAssocies from './TableauServicesAssocies.svelte';

  export let referentielStatuts: ReferentielStatut;
  export let referentielTypesService: ReferentielTypesService;

  let elementModale: Modale;
  let mesure: MesureReferentiel;
  $: servicesAvecMesure =
    mesure &&
    $servicesAvecMesuresAssociees
      .filter((s) => {
        return $mesuresAvecServicesAssociesStore[mesure.id].includes(s?.id);
      })
      .map(({ mesuresAssociees, ...autresDonnees }) => ({
        ...autresDonnees,
        mesure: mesuresAssociees[mesure.id],
      }));

  export const affiche = async (mesureAAfficher: MesureReferentiel) => {
    mesure = mesureAAfficher;
    await tick();
    elementModale.affiche();
  };
</script>

{#if mesure}
  <Modale bind:this={elementModale}>
    <svelte:fragment slot="entete">
      <h4>Mesure</h4>
      <DescriptionCompleteMesure {mesure} />
      <h4>
        {servicesAvecMesure.length}
        {servicesAvecMesure.length > 1
          ? 'services associés'
          : 'service associé'} à cette mesure
      </h4>
    </svelte:fragment>
    <svelte:fragment slot="contenu">
      <TableauServicesAssocies
        servicesAssocies={servicesAvecMesure}
        {referentielStatuts}
        {referentielTypesService}
        avecTypeEtBesoinDeSecurite
        avecNomCliquable
      />
    </svelte:fragment>
    <svelte:fragment slot="actions">
      <Bouton
        titre="Retour à la liste de mesures"
        type="secondaire"
        taille="moyen"
        on:click={() => elementModale.ferme()}
      />
      <Bouton
        titre="Configurer la mesure"
        type="primaire"
        taille="moyen"
        icone="configuration"
        on:click={() => {
          tiroirStore.afficheContenu(TiroirConfigurationMesure, {
            mesure,
            statuts: referentielStatuts,
          });
          elementModale.ferme();
        }}
      />
    </svelte:fragment>
  </Modale>
{/if}

<style lang="scss">
  h4 {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 2rem;
    margin: 0;
    text-align: left;
  }
</style>
