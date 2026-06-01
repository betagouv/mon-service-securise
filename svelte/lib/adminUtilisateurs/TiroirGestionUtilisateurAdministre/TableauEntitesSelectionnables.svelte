<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';
  import { labelsRole, type ServiceAdministre } from '../adminUtilisateurs.api';
  import BadgeAdmin from '../BadgeAdmin.svelte';

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
  <thead>
    <tr>
      <th>Nom du service</th>
      <th>Rôle</th>
    </tr>
  </thead>
  <tbody>
    {#each Object.entries(servicesParEntite) as [siretEntite, services] (siretEntite)}
      {@const nomEntite = toutesEntites.find(
        (e) => e.siret === siretEntite
      )?.nom}
      {@const ouvert = siretEntitesDepliees.has(siretEntite)}
      {@const estAdmin = services.every((s) => s.role === 'ADMIN')}
      <tr
        onclick={() => deplieEntite(siretEntite)}
        class="ligne-entite"
        class:estAdmin
      >
        <td>
          <div class="conteneur-ligne-entite">
            <div class="icone-fleche" class:ouvert>
              <lab-anssi-icone nom="arrow-down-s-line" taille="sm"
              ></lab-anssi-icone>
            </div>
            {#if !estAdmin}
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
            {/if}
            <span>{nomEntite}</span>
            {#if estAdmin}
              <BadgeAdmin />
            {/if}
            <dsfr-tag
              label={`${services.length} service${services.length > 1 ? 's' : ''}`}
              type="default"
              accent="défaut"
              size="sm"
            ></dsfr-tag>
          </div>
        </td>
        <td>
          {#if estAdmin}
            <span class="nombre-services">Géré via le droit admin</span>
          {:else}
            {@const nombreServicesSelectionnes = services.filter((s) =>
              servicesSelectionnes.has(s.id)
            ).length}
            <span class="nombre-services"
              >{nombreServicesSelectionnes} sélectionné{nombreServicesSelectionnes >
              1
                ? 's'
                : ''} sur {services.length}</span
            >
          {/if}
        </td>
      </tr>
      {#if ouvert}
        {#each services as service (service.id)}
          <tr>
            <td>
              <div class="conteneur-ligne-service" class:estAdmin>
                {#if !estAdmin}
                  <dsfr-checkbox
                    id="checkbox-{service.id}"
                    size="sm"
                    name="checkbox-{service.id}"
                    checked={servicesSelectionnes.has(service.id)}
                    onvaluechanged={(e: CustomEvent<boolean>) => {
                      selectionneService(service.id, e.detail);
                    }}
                  ></dsfr-checkbox>
                {/if}
                <span>{service.nomService}</span>
              </div>
            </td>
            <td>
              {#if estAdmin}
                <BadgeAdmin />
              {:else if service.role}
                <span>{labelsRole[service.role]}</span>
              {/if}
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

        &.estAdmin {
          span {
            color: #666666;
          }
        }

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
        cursor: pointer;

        &:hover {
          background: #eeeeee;
        }

        &.estAdmin {
          span {
            color: #666666;
          }
        }

        span {
          color: #3a3a3a;
          font-size: 0.875rem;
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

      td,
      th {
        padding: 8px 16px;
      }

      th {
        background: #f6f6f6;
        color: #3a3a3a;
        font-size: 0.875rem;
        font-weight: 700;
        line-height: 1.5rem;
      }

      .nombre-services {
        font-size: 0.75rem;
        color: #929292;
        white-space: nowrap;
      }
    }
  }
</style>
