<script lang="ts">
  import type { MesuresReferentielsExternes } from '../mesure';
  import { singulierPluriel } from '../../outils/string';

  interface Props {
    mesuresReferentielsExternes: MesuresReferentielsExternes;
    visible: boolean;
  }

  let { mesuresReferentielsExternes, visible }: Props = $props();

  let nombreTotalMesuresExternes = $derived(
    Object.values(mesuresReferentielsExternes).flat().length
  );
</script>

{#if visible}
  <div class="contenu-onglet-referentiels-externes">
    <h3>
      {nombreTotalMesuresExternes}
      {singulierPluriel(
        'correspondance',
        'correspondances',
        nombreTotalMesuresExternes
      )} avec des référentiels d'exigences
    </h3>

    {#if mesuresReferentielsExternes.ReCyf.length > 0}
      <h4>
        {singulierPluriel(
          'Exigence',
          'Exigences',
          mesuresReferentielsExternes.ReCyf.length
        )} NIS 2
      </h4>
      {#each mesuresReferentielsExternes.ReCyf as mesure (mesure.id)}
        <div class="tags">
          <dsfr-tag label={mesure.objectif} size="sm"></dsfr-tag>
          <dsfr-tag label={mesure.thematique} size="sm"></dsfr-tag>
          <dsfr-tag label={mesure.id} size="sm"></dsfr-tag>
        </div>
        <p>{mesure.description}</p>
        <dsfr-link
          label="Voir les exigences et comparaison sur MesServicesCyber"
          href="https://messervices.cyber.gouv.fr/nis2#exigences"
          blank
        ></dsfr-link>
      {/each}
    {/if}
  </div>
{/if}

<style lang="scss">
  .contenu-onglet-referentiels-externes {
    display: flex;
    flex-direction: column;
    gap: 32px;

    h3 {
      margin: 0;
      font-size: 1.375rem;
      line-height: 1.75rem;
    }

    h4 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.5rem;
    }

    .tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    p {
      margin: 0;
      max-width: 578px;
    }
  }
</style>
