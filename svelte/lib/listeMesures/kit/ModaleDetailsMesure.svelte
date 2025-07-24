<script lang="ts">
  import type {
    MesureReferentiel,
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
  import type {
    ModeleDeMesure,
    ServiceAssocieAUneMesure,
  } from '../listeMesures.d';

  export let referentielStatuts: ReferentielStatut;
  export let referentielTypesService: ReferentielTypesService;

  let elementModale: Modale;
  let modeleDeMesure: ModeleDeMesure;

  let servicesAvecMesure: ServiceAssocieAUneMesure[] = [];

  $: servicesAvecMesure =
    modeleDeMesure &&
    $servicesAvecMesuresAssociees
      .filter((s) => modeleDeMesure.idsServicesAssocies.includes(s?.id))
      .map(({ mesuresAssociees, mesuresSpecifiques, ...autresDonnees }) => ({
        ...autresDonnees,
        mesure:
          modeleDeMesure.type === 'generale'
            ? mesuresAssociees[modeleDeMesure.id]
            : mesuresSpecifiques.find(
                (ms) => ms.idModele === modeleDeMesure.id
              )!,
      }));

  export const affiche = async (modeleMesureAAfficher: ModeleDeMesure) => {
    modeleDeMesure = modeleMesureAAfficher;
    await tick();
    elementModale.affiche();
  };

  const configureMesure = () => {
    if (modeleDeMesure.type === 'generale') {
      tiroirStore.afficheContenu(TiroirConfigurationMesure, {
        mesure: modeleDeMesure as MesureReferentiel,
        statuts: referentielStatuts,
      });
      elementModale.ferme();
    }
  };
</script>

{#if modeleDeMesure}
  <Modale bind:this={elementModale}>
    <svelte:fragment slot="entete">
      <h4>Mesure</h4>
      <DescriptionCompleteMesure {modeleDeMesure} />
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
        on:click={configureMesure}
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
