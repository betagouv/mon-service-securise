<script lang="ts">
  import { run } from 'svelte/legacy';

  import type {
    ModeleMesureGenerale,
    ReferentielStatut,
    ReferentielTypesService,
  } from '../../ui/types.d';
  import { servicesAvecMesuresAssociees } from '../servicesAssocies/servicesAvecMesuresAssociees.store';
  import DescriptionCompleteMesure from './DescriptionCompleteMesure.svelte';
  import Modale from '../../ui/Modale.svelte';
  import { tick } from 'svelte';
  import Bouton from '../../ui/Bouton.svelte';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import TiroirModificationMultipleMesuresGenerales from '../mesureGenerale/modification/TiroirModificationMultipleMesuresGenerales.svelte';
  import TableauServicesAssocies from '../servicesAssocies/TableauServicesAssocies.svelte';
  import type {
    ModeleDeMesure,
    ServiceAssocieAUneMesure,
    ListeMesuresProps,
  } from '../listeMesures.d';
  import TiroirConfigurationModeleMesureSpecifique from '../mesureSpecifique/configuration/TiroirConfigurationModeleMesureSpecifique.svelte';

  interface Props {
    referentielStatuts: ReferentielStatut;
    referentielTypesService: ReferentielTypesService;
    categories: ListeMesuresProps['categories'];
  }

  let { referentielStatuts, referentielTypesService, categories }: Props =
    $props();

  let elementModale: Modale = $state();
  let modeleDeMesure: ModeleDeMesure = $state();

  let servicesAvecMesure: ServiceAssocieAUneMesure[] = $state([]);

  run(() => {
    servicesAvecMesure =
      modeleDeMesure &&
      $servicesAvecMesuresAssociees
        .filter((s) => modeleDeMesure.idsServicesAssocies.includes(s?.id))
        .map(({ mesuresAssociees, mesuresSpecifiques, ...autresDonnees }) => ({
          ...autresDonnees,
          mesure:
            modeleDeMesure.type === 'generale'
              ? {
                  ...mesuresAssociees[modeleDeMesure.id],
                  id: modeleDeMesure.id,
                  type: 'generale',
                }
              : {
                  ...mesuresSpecifiques.find(
                    (ms) => ms.idModele === modeleDeMesure.id
                  ),
                  id: modeleDeMesure.id,
                  type: 'specifique',
                },
        }));
  });

  export const affiche = async (modeleMesureAAfficher: ModeleDeMesure) => {
    modeleDeMesure = modeleMesureAAfficher;
    await tick();
    elementModale.affiche();
  };

  const configureMesure = () => {
    if (modeleDeMesure.type === 'generale') {
      tiroirStore.afficheContenu(TiroirModificationMultipleMesuresGenerales, {
        modeleMesureGenerale: modeleDeMesure as ModeleMesureGenerale,
        statuts: referentielStatuts,
      });
    } else {
      tiroirStore.afficheContenu(TiroirConfigurationModeleMesureSpecifique, {
        categories,
        statuts: referentielStatuts,
        modeleMesure: modeleDeMesure,
        referentielTypesService,
        ongletActif: 'info',
      });
    }
    elementModale.ferme();
  };
</script>

{#if modeleDeMesure}
  <Modale bind:this={elementModale}>
    {#snippet entete()}
      <h4>Mesure</h4>
      <DescriptionCompleteMesure {modeleDeMesure} />
      <h4>
        {servicesAvecMesure.length}
        {servicesAvecMesure.length > 1
          ? 'services associés'
          : 'service associé'} à cette mesure
      </h4>
    {/snippet}
    {#snippet contenu()}
      <TableauServicesAssocies
        servicesAssocies={servicesAvecMesure}
        {referentielStatuts}
        {referentielTypesService}
        avecTypeEtBesoinDeSecurite
        avecNomCliquable
      />
    {/snippet}
    {#snippet actions()}
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
    {/snippet}
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
