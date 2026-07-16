<script lang="ts">
  import type { MesuresReferentielsExternes } from '../mesure';
  import { singulierPluriel } from '../../outils/string';
  import {
    LIBELLES_REFERENTIELS_EXTERNES,
    type ReferentielExterne,
  } from '../../referentielsExternesDeMesures/referentielsExternes';
  import ListeDeroulanteRiche from '../../ui/ListeDeroulanteRiche.svelte';

  interface Props {
    mesuresReferentielsExternes: MesuresReferentielsExternes;
    visible: boolean;
  }

  let { mesuresReferentielsExternes, visible }: Props = $props();

  let nombreTotalMesuresExternes = $derived(
    Object.values(mesuresReferentielsExternes).flat().length
  );

  let referentielsAffiches: { referentielExterne: ReferentielExterne[] } =
    $state({ referentielExterne: [] });

  const doitAfficherMesuresDe = (referentielExterne: ReferentielExterne) =>
    referentielsAffiches.referentielExterne.length === 0 ||
    referentielsAffiches.referentielExterne.includes(referentielExterne);
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

    <ListeDeroulanteRiche
      libelle="Filtrer"
      id="filtre-referentiels-externes"
      bind:valeursSelectionnees={referentielsAffiches}
      options={{
        categories: [
          {
            id: 'referentielExterne',
            libelle: 'Référentiels d’exigences associés',
          },
        ],
        items: Object.entries(LIBELLES_REFERENTIELS_EXTERNES)
          .filter(
            ([cle]) =>
              mesuresReferentielsExternes[cle as ReferentielExterne].length > 0
          )
          .map(([valeur, libelle]) => ({
            libelle,
            valeur,
            idCategorie: 'referentielExterne',
          })),
      }}
    />

    {#if mesuresReferentielsExternes.ReCyf.length > 0 && doitAfficherMesuresDe('ReCyf')}
      {#each mesuresReferentielsExternes.ReCyf as mesure (mesure.id)}
        <div class="bloc-mesure">
          <div class="conteneur-entete-referentiels-externes">
            <h4>
              {singulierPluriel(
                'Exigence',
                'Exigences',
                mesuresReferentielsExternes.ReCyf.length
              )}
              {LIBELLES_REFERENTIELS_EXTERNES['ReCyf']}
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
    {#if mesuresReferentielsExternes.ISO2700X.length > 0 && doitAfficherMesuresDe('ISO2700X')}
      {#each mesuresReferentielsExternes.ISO2700X as mesure (mesure.id)}
        <div class="bloc-mesure">
          <div class="conteneur-entete-referentiels-externes">
            <h4>
              {singulierPluriel(
                'Exigence',
                'Exigences',
                mesuresReferentielsExternes.ISO2700X.length
              )}
              {LIBELLES_REFERENTIELS_EXTERNES['ISO2700X']}
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
    {#if mesuresReferentielsExternes.AE2690.length > 0 && doitAfficherMesuresDe('AE2690')}
      {#each mesuresReferentielsExternes.AE2690 as mesure (mesure.id)}
        <div class="bloc-mesure">
          <div class="conteneur-entete-referentiels-externes">
            <h4>
              {singulierPluriel(
                'Exigence',
                'Exigences',
                mesuresReferentielsExternes.AE2690.length
              )}
              {LIBELLES_REFERENTIELS_EXTERNES['AE2690']}
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
