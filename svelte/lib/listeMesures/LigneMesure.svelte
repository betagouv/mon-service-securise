<script lang="ts">
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';
  import { mesuresAvecServicesAssociesStore } from './stores/mesuresAvecServicesAssocies.store';
  import type { MesureReferentiel, ReferentielStatut } from '../ui/types';
  import Bouton from '../ui/Bouton.svelte';
  import { createEventDispatcher } from 'svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirConfigurationMesure from './TiroirConfigurationMesure.svelte';

  export let mesure: MesureReferentiel;
  export let statuts: ReferentielStatut;

  $: mesureAvecServicesAssocies = $mesuresAvecServicesAssociesStore[mesure.id];
  $: actionDisponible = mesureAvecServicesAssocies?.length > 0;

  const emet = createEventDispatcher<{
    servicesCliques: null;
  }>();

  const servicesCliques = () => {
    emet('servicesCliques');
  };
</script>

<tr>
  <td>
    <div>
      <span>{mesure.description}</span>
      <div>
        <CartoucheReferentiel referentiel={mesure.referentiel} />
        <CartoucheCategorieMesure categorie={mesure.categorie} />
        <CartoucheIdentifiantMesure identifiant={mesure.identifiantNumerique} />
      </div>
    </div>
  </td>
  <td class="services-associes">
    {#if actionDisponible}
      Cette mesure est associée à
      <Bouton
        type="lien-dsfr"
        titre={`${mesureAvecServicesAssocies.length} ${
          mesureAvecServicesAssocies.length > 1 ? 'services' : 'service'
        }`}
        on:click={servicesCliques}
      />
    {:else}
      <span class="aucun-service">Aucun service associé</span>
    {/if}
  </td>
  <td>
    <Bouton
      titre="Configurer la mesure"
      type="secondaire"
      taille="petit"
      icone="configuration"
      actif={actionDisponible}
      on:click={() =>
        tiroirStore.afficheContenu(TiroirConfigurationMesure, {
          mesure,
          statuts,
        })}
    />
  </td>
</tr>

<style lang="scss">
  .services-associes {
    color: var(--gris-fonce);
    white-space: nowrap;
  }

  .aucun-service {
    color: var(--gris-inactif);
  }

  td {
    padding: 8px 16px;
    border-top: 1px solid #dddddd;

    & > div {
      display: flex;
      flex-direction: column;
      gap: 8px;

      span {
        font-size: 0.875rem;
        font-weight: bold;
        line-height: 1.5rem;
      }

      div {
        display: flex;
        flex-direction: row;
        gap: 8px;
      }
    }
  }
</style>
