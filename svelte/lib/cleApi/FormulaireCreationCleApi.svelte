<script lang="ts">
  import { SvelteDate } from 'svelte/reactivity';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { api } from './cleApi.api';
  import type { CleApiCreee } from './cleApi.d';
  import { formateDateCourte } from '../ui/formatDate';

  interface Props {
    onCleCreee: (cle: CleApiCreee) => void;
  }

  let { onCleCreee }: Props = $props();

  let dureeValiditeEnJours = $state<number | null>(null);
  let enCoursCreation = $state(false);
  let cleCreee = $state<CleApiCreee | null>(null);

  const dateExpirationPrevue = (joursDeValidite: number) => {
    const date = new SvelteDate();
    date.setDate(date.getDate() + joursDeValidite);
    return date;
  };

  const optionsDuree = [30, 60, 90].map((jours) => ({
    label: `${jours} jours (${dateExpirationPrevue(jours).toLocaleDateString('fr-FR')})`,
    value: String(jours),
  }));

  const creeCle = async () => {
    if (dureeValiditeEnJours === null) return;

    enCoursCreation = true;
    try {
      const { data } = await api.creeCle(dureeValiditeEnJours);
      cleCreee = data;
      onCleCreee(data);
      dureeValiditeEnJours = null;
    } catch {
      toasterStore.erreur(
        'Erreur',
        "La clé d'API n'a pas pu être créée, veuillez réessayer."
      );
    } finally {
      enCoursCreation = false;
    }
  };

  const copieValeurEnClair = async () => {
    if (!cleCreee) return;
    await navigator.clipboard.writeText(cleCreee.valeurEnClair);
    toasterStore.succes('Copié', 'La clé a été copiée dans le presse-papiers.');
  };
</script>

<div class="conteneur-global">
  <h2>{cleCreee ? 'Copiez votre clé maintenant' : 'Nouvelle clé'}</h2>

  {#if cleCreee}
    <div class="conteneur-revelation">
      <dsfr-input
        action
        id="cle-en-clair"
        label="Votre clé valable jusqu'au {formateDateCourte(
          cleCreee.dateExpiration
        )}"
        value={cleCreee.valeurEnClair}
      >
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          slot="button"
          label="Copier"
          size="sm"
          has-icon
          icon="file-line"
          icon-place="left"
          type="button"
          onclick={copieValeurEnClair}
        ></dsfr-button>
      </dsfr-input>

      <dsfr-alert
        size="sm"
        type="warning"
        text="Cette valeur ne sera plus jamais affichée. Conservez-la dans un endroit sûr."
      ></dsfr-alert>

      <hr />
    </div>
  {:else}
    <p>La clé s'affichera une seule fois, juste après sa génération.</p>
  {/if}

  <div class="conteneur-creation">
    <dsfr-select
      id="duree-validite-cle-api"
      label={cleCreee ? 'Générer une nouvelle clé' : 'Durée de validité'}
      hint={cleCreee ? 'Durée de validité' : ''}
      options={optionsDuree}
      value={dureeValiditeEnJours !== null ? String(dureeValiditeEnJours) : ''}
      onvaluechanged={(e: CustomEvent<string>) => {
        dureeValiditeEnJours = e.detail ? Number(e.detail) : null;
      }}
    ></dsfr-select>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Générer une clé"
      kind={cleCreee ? 'secondary' : 'primary'}
      size="md"
      type="button"
      disabled={dureeValiditeEnJours === null || enCoursCreation}
      onclick={creeCle}
    ></dsfr-button>
  </div>
</div>

<style lang="scss">
  .conteneur-global {
    border: 1px solid #ddd;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    padding: 40px;
    margin: 24px 0 56px;

    h2 {
      color: #161616;
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: 700;
      margin: 0 0 16px;
    }

    h2 + p {
      color: #3a3a3a;
      font-size: 1rem;
      line-height: 1.5rem;
      margin: 0;
    }

    .conteneur-revelation {
      margin-top: 8px;

      hr,
      dsfr-alert {
        margin: 24px 0 0;
      }
    }

    .conteneur-creation {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin: 24px 0 0;

      dsfr-select {
        width: 100%;
      }

      dsfr-button {
        white-space: nowrap;
      }
    }
  }
</style>
