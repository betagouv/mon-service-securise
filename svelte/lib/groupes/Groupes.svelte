<script lang="ts">
  import { untrack } from 'svelte';
  import type { AxiosError } from 'axios';
  import Toaster from '../ui/Toaster.svelte';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { api } from './groupes.api';
  import type { GroupesProps } from './groupes.d';

  let { groupes: groupesInitiaux }: GroupesProps = $props();

  let groupes = $state(untrack(() => groupesInitiaux));
  let nouveauLibelle = $state('');
  let erreurLibelle = $state('');
  let enCoursAjout = $state(false);

  const estUnLibelleDejaUtilise = (e: unknown) => {
    const { response } = e as AxiosError<{ erreur: { code: string } }>;
    return (
      response?.status === 422 &&
      response.data?.erreur?.code === 'LIBELLE_GROUPE_DEJA_EXISTANT'
    );
  };

  const ajouteGroupe = async () => {
    if (!nouveauLibelle.trim()) return;

    enCoursAjout = true;
    erreurLibelle = '';
    try {
      const { data } = await api.ajouteGroupe(nouveauLibelle);
      groupes = [...groupes, data];
      nouveauLibelle = '';
    } catch (e) {
      if (estUnLibelleDejaUtilise(e)) {
        erreurLibelle = 'Vous avez déjà un groupe avec ce libellé.';
        return;
      }
      toasterStore.erreur(
        'Erreur',
        "Le groupe n'a pas pu être ajouté, veuillez réessayer."
      );
    } finally {
      enCoursAjout = false;
    }
  };
</script>

<h1>Mes groupes</h1>

<dsfr-input
  id="nouveau-groupe"
  label="Nouveau groupe"
  hint="exemple : Enfance et famille"
  value={nouveauLibelle}
  onvaluechanged={(e: CustomEvent<string>) => (nouveauLibelle = e.detail)}
  maxlength="200"
  status={erreurLibelle ? 'error' : 'default'}
  errorMessage={erreurLibelle}
  action
>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button
    slot="button"
    label="Créer le groupe"
    size="md"
    has-icon
    icon="add-line"
    icon-place="left"
    type="button"
    disabled={enCoursAjout || !nouveauLibelle.trim()}
    onclick={ajouteGroupe}
  ></dsfr-button>
</dsfr-input>

{#if groupes.length === 0}
  <div class="aucun-groupe">
    <img src="/statique/assets/images/illustration_recherche_vide.svg" alt="" />
    <p>Aucun groupe pour le moment.</p>
  </div>
{:else}
  <div class="conteneur-liste">
    <p>
      Un service peut appartenir à plusieurs groupes : la somme des colonnes
      «&nbsp;Services&nbsp;» peut donc dépasser le nombre total de services
      enregistrés. Pour classer un service dans un groupe, rendez-vous sur le
      tableau de bord.
    </p>
    <dsfr-table
      columns={[
        { key: 'libelle', label: 'Libellé' },
        { key: 'actions', label: 'Actions' },
      ]}
      rows={groupes}
      rich
      multiline
    >
      {#each groupes as groupe, i (groupe.id)}
        <div slot="cell:libelle:{i}">{groupe.libelle}</div>
        <div slot="cell:actions:{i}" class="conteneur-actions"></div>
      {/each}
    </dsfr-table>
  </div>
{/if}

<Toaster />

<style lang="scss">
  :global(main:has(#conteneur-groupes)) {
    background: white;
    text-align: left;
  }

  :global(#conteneur-groupes) {
    width: 792px;
  }

  h1 {
    color: #161616;
    font-size: 2rem;
    line-height: 2.5rem;
    margin: 56px 0 32px;
  }

  dsfr-button {
    white-space: nowrap;
  }

  .conteneur-liste {
    margin: 8px 0 24px;

    p {
      margin: 24px 0 8px;
      color: #3a3a3a;
      font-size: 0.875rem;
      line-height: 1.5rem;
    }
  }

  .conteneur-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .aucun-groupe {
    padding: 36px 0;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-direction: column;
    color: #161616;

    img {
      max-width: 128px;
      transform: scaleX(-1);
    }

    p {
      margin: 0;
      font-size: 1.25rem;
      line-height: 2rem;
      font-weight: bold;
    }
  }
</style>
