<script lang="ts">
  import { untrack } from 'svelte';
  import Toaster from '../ui/Toaster.svelte';
  import ModaleRevocationCleApi from './ModaleRevocationCleApi.svelte';
  import FormulaireCreationCleApi from './FormulaireCreationCleApi.svelte';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { api } from './cleApi.api';
  import type { CleApiCreee, CleApiProps } from './cleApi.d';

  let { cles: clesInitiales, urlDocumentationApi }: CleApiProps = $props();

  let cles = $state(untrack(() => clesInitiales));
  let idCleARevoquer = $state<string | null>(null);
  let enCoursRevocation = $state(false);
  let modaleRevocationOuverte = $state(false);

  let cleARevoquer = $derived(cles.find((cle) => cle.id === idCleARevoquer));

  const formateDate = (date: string | Date) =>
    new Date(date).toLocaleDateString('fr-FR');

  const ajouteCle = (cle: CleApiCreee) => {
    cles = [
      {
        id: cle.id,
        prefixe: cle.prefixe,
        dateCreation: cle.dateCreation,
        dateExpiration: cle.dateExpiration,
      },
      ...cles,
    ];
  };

  const demandeRevocation = (id: string) => {
    idCleARevoquer = id;
    modaleRevocationOuverte = true;
  };

  const confirmeRevocation = async () => {
    if (!idCleARevoquer) return;

    enCoursRevocation = true;
    try {
      await api.revoqueCle(idCleARevoquer);
      cles = cles.filter((cle) => cle.id !== idCleARevoquer);
      modaleRevocationOuverte = false;
      toasterStore.succes('Succès', 'La clé a été révoquée.');
    } catch {
      toasterStore.erreur(
        'Erreur',
        "La clé n'a pas pu être révoquée, veuillez réessayer."
      );
    } finally {
      enCoursRevocation = false;
    }
  };
</script>

<h1>
  Clés d'API <dsfr-badge
    label="BÊTA"
    type="accent"
    accent="green-emeraude"
    size="sm"
  ></dsfr-badge>
</h1>
<p>
  Générez une clé d'API personnelle pour relire, dans vos propres outils, les
  données des services auxquels vous avez déjà accès.
</p>
<p>
  Vous trouverez la documentation à l'adresse suivante : <dsfr-link
    href={urlDocumentationApi}
    label={urlDocumentationApi}
    blank
    neutral
  ></dsfr-link>
</p>

<FormulaireCreationCleApi onCleCreee={ajouteCle} />

<div class="conteneur-liste">
  <h2>Clés actives</h2>
  {#if cles.length === 0}
    <p>Aucune clé active pour le moment.</p>
  {:else}
    <dsfr-table
      columns={[
        { key: 'prefixe', label: 'Clé' },
        { key: 'dateExpiration', label: 'Expire le' },
        { key: 'actions', label: 'Actions' },
      ]}
      rows={cles}
      rich
      multiline
    >
      {#each cles as cle, i (cle.id)}
        <div slot="cell:prefixe:{i}">
          <code>mss_live_{cle.prefixe}_…</code>
        </div>
        <div slot="cell:dateExpiration:{i}">
          {formateDate(cle.dateExpiration)}
        </div>
        <div slot="cell:actions:{i}" class="conteneur-actions">
          <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
          <dsfr-button
            label="Révoquer"
            kind="secondary"
            size="sm"
            has-icon
            icon="delete-line"
            icon-place="left"
            type="button"
            onclick={() => demandeRevocation(cle.id)}
          ></dsfr-button>
        </div>
      {/each}
    </dsfr-table>
  {/if}
</div>

<ModaleRevocationCleApi
  ouverte={modaleRevocationOuverte}
  prefixe={cleARevoquer?.prefixe}
  enCours={enCoursRevocation}
  onConfirme={confirmeRevocation}
  onAnnule={() => (modaleRevocationOuverte = false)}
/>

<Toaster />

<style lang="scss">
  :global(main:has(#conteneur-cle-api)) {
    background: white;
    text-align: left;
  }

  :global(#conteneur-cle-api) {
    width: 792px;
  }

  h1 {
    color: #161616;
    font-size: 2rem;
    line-height: 2.5rem;
    margin: 56px 0 0;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h2 {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  h1 + p {
    color: #3a3a3a;
    font-size: 1.25rem;
    line-height: 2rem;
    margin: 16px 0 0;
    text-align: left;
  }

  .conteneur-liste {
    margin: 32px 0;
  }

  .conteneur-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
</style>
