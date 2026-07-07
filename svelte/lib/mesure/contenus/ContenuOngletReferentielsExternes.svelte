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
      {#each mesuresReferentielsExternes.ReCyf as mesure (mesure.id)}
        <div class="bloc-mesure">
          <div class="conteneur-entete-referentiels-externes">
            <h4>
              {singulierPluriel(
                'Exigence',
                'Exigences',
                mesuresReferentielsExternes.ReCyf.length
              )} NIS 2
            </h4>
            <div class="badges">
              {#if mesure.entitesConcernees.find((e) => e === 'EI')}
                <dsfr-badge
                  type="accent"
                  size="sm"
                  label="EI"
                  accent="green-archipel"
                ></dsfr-badge>
              {/if}
              {#if mesure.entitesConcernees.find((e) => e === 'EE')}
                <dsfr-badge
                  type="accent"
                  size="sm"
                  label="EE"
                  accent="green-bourgeon"
                ></dsfr-badge>
              {/if}
            </div>
            <div class="tags">
              <dsfr-tag label={mesure.objectif} size="sm"></dsfr-tag>
              <dsfr-tag label={mesure.thematique} size="sm"></dsfr-tag>
              <dsfr-tag label={mesure.id} size="sm"></dsfr-tag>
            </div>
          </div>
          <p>{@html mesure.description}</p>
          <dsfr-link
            label="Voir les exigences et comparaison sur MesServicesCyber"
            href="https://messervices.cyber.gouv.fr/nis2#exigences"
            blank
          ></dsfr-link>
        </div>
      {/each}
    {/if}
    {#if mesuresReferentielsExternes.ISO2700X.length > 0}
      {#each mesuresReferentielsExternes.ISO2700X as mesure (mesure.id)}
        <div class="bloc-mesure">
          <div class="conteneur-entete-referentiels-externes">
            <h4>
              {singulierPluriel(
                'Exigence',
                'Exigences',
                mesuresReferentielsExternes.ISO2700X.length
              )} ISO 2700X
            </h4>
            <div class="tags">
              <dsfr-tag label={mesure.id} size="sm"></dsfr-tag>
            </div>
          </div>
          <p>{@html mesure.description}</p>
          <dsfr-link
            label="Voir les exigences et comparaison sur MesServicesCyber"
            href="https://messervices.cyber.gouv.fr/nis2#exigences"
            blank
          ></dsfr-link>
        </div>
      {/each}
    {/if}
  </div>
{/if}

<style lang="scss">
  .contenu-onglet-referentiels-externes {
    display: flex;
    flex-direction: column;
    gap: 32px;

    .conteneur-entete-referentiels-externes {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bloc-mesure {
      padding-bottom: 32px;
      display: flex;
      flex-direction: column;
      gap: 32px;

      &:not(:last-child) {
        border-bottom: 1px solid #ddd;
      }
    }

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

    .badges,
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
