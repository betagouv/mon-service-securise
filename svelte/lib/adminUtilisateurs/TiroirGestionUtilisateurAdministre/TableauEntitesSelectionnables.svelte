<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import type { EntiteSupervisee } from '../../adminEntites/adminEntites.types';
  import BadgeAdmin from '../BadgeAdmin.svelte';
  import {
    labelsRole,
    type ServiceAdministre,
  } from '../adminUtilisateurs.types';

  type SIRET = string;

  interface Props {
    toutesEntites: Array<EntiteSupervisee>;
    servicesParEntite: Record<SIRET, ServiceAdministre[]>;
    onAjouteRole: (idServicesSelectionnes: string[]) => void;
    onRetireAcces?: (idServicesSelectionnes: string[]) => void;
    messageSiVide: string;
  }

  let {
    toutesEntites,
    servicesParEntite,
    onAjouteRole,
    onRetireAcces,
    messageSiVide,
  }: Props = $props();

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

  let nombreTotalServices = $derived(
    Object.values(servicesParEntite).flatMap((s) => s).length
  );
  let nombreTotalServicesSelectionnables = $derived(
    Object.values(servicesParEntite)
      .flatMap((s) => s)
      .filter((s) => s.role !== 'ADMIN').length
  );

  let toutEstSelectionne = $derived(
    servicesSelectionnes.size === nombreTotalServicesSelectionnables
  );
  const basculeTouteSelection = () => {
    if (toutEstSelectionne) servicesSelectionnes.clear();
    else
      for (const service of Object.values(servicesParEntite).flatMap(
        (s) => s
      )) {
        if (service.role !== 'ADMIN') servicesSelectionnes.add(service.id);
      }
  };
</script>

{#if Object.keys(servicesParEntite).length === 0}
  <dsfr-alert text={messageSiVide} type="info" size="md" has-description
  ></dsfr-alert>
{:else}
  <div class="barre-actions">
    <span class="sous-texte">
      {#if servicesSelectionnes.size > 0}
        {@const pluriel = servicesSelectionnes.size > 1 ? 's' : ''}
        {servicesSelectionnes.size} service{pluriel} sélectionné{pluriel}
      {:else}
        {nombreTotalServices} service{nombreTotalServices > 1 ? 's' : ''} au total
      {/if}
    </span>
    <div>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Attribuer un rôle commun"
        onclick={() => onAjouteRole([...servicesSelectionnes])}
        kind="tertiary-no-outline"
        size="sm"
        has-icon
        icon="edit-line"
        icon-place="left"
        disabled={servicesSelectionnes.size === 0}
      ></dsfr-button>
      {#if onRetireAcces}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          label="Retirer"
          onclick={() => onRetireAcces([...servicesSelectionnes])}
          kind="tertiary-no-outline"
          size="sm"
          has-icon
          icon="delete-bin-line"
          icon-place="left"
          disabled={servicesSelectionnes.size === 0}
        ></dsfr-button>
      {/if}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label={toutEstSelectionne ? 'Tout désélectionner' : 'Tout sélectionner'}
        onclick={() => basculeTouteSelection()}
        kind="tertiary-no-outline"
        size="sm"
      ></dsfr-button>
    </div>
  </div>
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
                  label={nomEntite}
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
              <span class="sous-texte">Géré via le droit admin</span>
            {:else}
              {@const nombreServicesSelectionnes = services.filter((s) =>
                servicesSelectionnes.has(s.id)
              ).length}
              <span class="sous-texte"
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
                      label={service.nomService}
                      size="sm"
                      name="checkbox-{service.id}"
                      checked={servicesSelectionnes.has(service.id)}
                      onvaluechanged={(e: CustomEvent<boolean>) => {
                        selectionneService(service.id, e.detail);
                      }}
                    ></dsfr-checkbox>
                  {/if}
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
{/if}

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
    }
  }

  .barre-actions {
    margin-bottom: 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    & > div {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }

  .sous-texte {
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: #929292;
    white-space: nowrap;
  }
</style>
