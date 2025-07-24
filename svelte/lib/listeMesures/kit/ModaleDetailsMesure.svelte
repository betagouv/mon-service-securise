<script lang="ts">
  import type {
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../ui/types.d';
  import { servicesAvecMesuresAssociees } from '../stores/servicesAvecMesuresAssociees.store';
  import DescriptionCompleteMesure from './DescriptionCompleteMesure.svelte';
  import Modale from '../../ui/Modale.svelte';
  import { tick } from 'svelte';
  import Bouton from '../../ui/Bouton.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import TiroirConfigurationMesure from './tiroir/TiroirConfigurationMesure.svelte';
  import TableauServicesAssocies from './TableauServicesAssocies.svelte';
  import type { MesureDeLaListe } from '../listeMesures.d';

  export let referentielStatuts: ReferentielStatut;
  export let referentielTypesService: ReferentielTypesService;

  let elementModale: Modale;
  let mesure: MesureDeLaListe;
  $: servicesAvecMesure =
    mesure &&
    $servicesAvecMesuresAssociees
      .filter((s) => mesure.idsServicesAssocies.includes(s?.id))
      .map(({ mesuresAssociees, mesuresSpecifiques, ...autresDonnees }) => ({
        ...autresDonnees,
        mesure:
          mesure.type === 'generale'
            ? mesuresAssociees[mesure.id]
            : mesuresSpecifiques.find((ms) => ms.idModele === mesure.id),
      }));

  export const affiche = async (mesureAAfficher: MesureDeLaListe) => {
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
