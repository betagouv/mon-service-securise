<script lang="ts">
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';
  import { mesuresAvecServicesAssociesStore } from './mesuresAvecServicesAssocies.store';
  import type { MesureReferentiel } from '../ui/types';
  import Bouton from '../ui/Bouton.svelte';
  import { createEventDispatcher } from 'svelte';

  export let mesure: MesureReferentiel;
  $: mesureAvecServicesAssocies = $mesuresAvecServicesAssociesStore[mesure.id];

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
    {#if mesureAvecServicesAssocies?.length > 0}
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
</tr>

<style lang="scss">
  .services-associes {
    color: var(--gris-fonce);
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
