<script lang="ts">
  import CartoucheReferentiel from '../ui/CartoucheReferentiel.svelte';
  import CartoucheIdentifiantMesure from '../ui/CartoucheIdentifiantMesure.svelte';
  import CartoucheCategorieMesure from '../ui/CartoucheCategorieMesure.svelte';

  export let mesure;
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
</tr>

<style lang="scss">
  td {
    padding: 8px 16px;
    border: 1px solid #dddddd;

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
