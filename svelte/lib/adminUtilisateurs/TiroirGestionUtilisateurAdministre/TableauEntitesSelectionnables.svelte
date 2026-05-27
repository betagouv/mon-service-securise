<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';
  import type { ServiceAdministre } from '../adminUtilisateurs.api';

  type SIRET = string;

  interface Props {
    toutesEntites: Array<EntiteSupervisee>;
    servicesParEntite: Record<SIRET, ServiceAdministre[]>;
  }

  let { toutesEntites, servicesParEntite }: Props = $props();

  let siretEntitesDepliees = new SvelteSet<string>();
  const deplieEntite = (siret: string) => {
    if (siretEntitesDepliees.has(siret)) siretEntitesDepliees.delete(siret);
    else siretEntitesDepliees.add(siret);
  };

  export const reinitialise = () => {
    siretEntitesDepliees.clear();
    servicesSelectionnes.clear();
  };

  let servicesSelectionnes = new SvelteSet<string>();
  const selectionneService = (idService: string, selectionne: boolean) => {
    if (selectionne) servicesSelectionnes.add(idService);
    else servicesSelectionnes.delete(idService);
  };
  type EtatSelection = 'Aucun' | 'Partiel' | 'Tout';
  let entitesSelectionnes: Record<SIRET, EtatSelection> = $derived.by(() =>
    Object.fromEntries(
      toutesEntites.map((entite) => {
        const services = servicesParEntite[entite.siret] ?? [];
        if (services.length === 0) return [entite.siret, 'Aucun'];
        const nbSelectionnes = services.filter((s) =>
          servicesSelectionnes.has(s.id)
        ).length;
        const etat: EtatSelection =
          nbSelectionnes === 0
            ? 'Aucun'
            : nbSelectionnes === services.length
              ? 'Tout'
              : 'Partiel';
        return [entite.siret, etat];
      })
    )
  );

  const basculeSelectionEntite = (siret: SIRET) => {
    const doitSelectionner = entitesSelectionnes[siret] !== 'Tout';
    const services = servicesParEntite[siret] ?? [];
    for (const service of services) {
      selectionneService(service.id, doitSelectionner);
    }
  };
</script>

<table>
  <tbody>
    {#each Object.entries(servicesParEntite) as [siretEntite, services] (siretEntite)}
      {@const nomEntite = toutesEntites.find(
        (e) => e.siret === siretEntite
      )?.nom}
      {@const ouvert = siretEntitesDepliees.has(siretEntite)}
      <tr onclick={() => deplieEntite(siretEntite)} class="ligne-entite">
        <td>
          <div class="conteneur-ligne-entite">
            <div class="icone-fleche" class:ouvert>
              <lab-anssi-icone nom="arrow-down-s-line" taille="sm"
              ></lab-anssi-icone>
            </div>
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
            <dsfr-checkbox
              id="checkbox-{siretEntite}"
              size="sm"
              name="checkbox-{siretEntite}"
              onclick={(e: MouseEvent) => {
                e.stopPropagation();
              }}
              onvaluechanged={() => {
                basculeSelectionEntite(siretEntite);
              }}
              checked={entitesSelectionnes[siretEntite] === 'Tout'}
              indeterminate={entitesSelectionnes[siretEntite] === 'Partiel'}
            ></dsfr-checkbox>
            <span>{nomEntite}</span>
          </div>
        </td>
      </tr>
      {#if ouvert}
        {#each services as service (service.id)}
          <tr>
            <td>
              <div class="conteneur-ligne-service">
                <dsfr-checkbox
                  id="checkbox-{service.id}"
                  size="sm"
                  name="checkbox-{service.id}"
                  checked={servicesSelectionnes.has(service.id)}
                  onvaluechanged={(e: CustomEvent<boolean>) => {
                    selectionneService(service.id, e.detail);
                  }}
                ></dsfr-checkbox>
                <span>{service.nomService}</span>
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    {/each}
  </tbody>
</table>

<style lang="scss">
  table {
    border-collapse: collapse;
    width: 100%;

    tr {
      border: 1px solid #929292;

      .conteneur-ligne-service {
        display: flex;
        gap: 16px;

        span {
          color: #3a3a3a;
          font-size: 0.875rem;
          line-height: 1.5rem;
        }
      }

      dsfr-checkbox {
        margin-right: -8px;
      }

      &.ligne-entite {
        background: #f6f6f6;
        font-weight: bold;

        span {
          color: #3a3a3a;
          font-size: 0.875rem;
          font-weight: 700;
          line-height: 1.5rem;
        }

        .conteneur-ligne-entite {
          display: flex;
          gap: 16px;
          cursor: pointer;

          .icone-fleche {
            transition: all 0.2s ease-in-out;
            width: fit-content;
            height: fit-content;

            &.ouvert {
              transform: rotate(180deg);
            }
          }
        }
      }

      td {
        padding: 8px 16px;
      }
    }
  }
</style>
