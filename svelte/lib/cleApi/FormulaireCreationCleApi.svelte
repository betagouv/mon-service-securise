<script lang="ts">
  import { SvelteDate } from 'svelte/reactivity';
  import { toasterStore } from '../ui/stores/toaster.store';
  import { api } from './cleApi.api';
  import type { CleApiCreee } from './cleApi.d';

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

{#if cleCreee}
  <div class="conteneur-revelation">
    <dsfr-alert
      size="md"
      type="warning"
      has-title
      title="Copiez votre clé maintenant"
      has-description
      text="Cette valeur ne sera plus jamais affichée. Conservez-la dans un endroit sûr."
    ></dsfr-alert>
    <div class="valeur-en-clair">
      <code>{cleCreee.valeurEnClair}</code>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Copier"
        kind="secondary"
        size="sm"
        has-icon
        icon="file-line"
        icon-place="left"
        type="button"
        onclick={copieValeurEnClair}
      ></dsfr-button>
    </div>
  </div>
{/if}

<div class="conteneur-creation">
  <dsfr-select
    id="duree-validite-cle-api"
    label="Durée de validité"
    options={optionsDuree}
    value={dureeValiditeEnJours !== null ? String(dureeValiditeEnJours) : ''}
    onvaluechanged={(e: CustomEvent<string>) => {
      dureeValiditeEnJours = e.detail ? Number(e.detail) : null;
    }}
  ></dsfr-select>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <dsfr-button
    label="Générer une clé"
    kind="primary"
    size="md"
    type="button"
    disabled={dureeValiditeEnJours === null || enCoursCreation}
    onclick={creeCle}
  ></dsfr-button>
</div>

<style lang="scss">
  .conteneur-revelation {
    margin: 24px 0;
  }

  .valeur-en-clair {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    padding: 16px;
    background: var(--fond-gris-pale-composant);
    border-radius: 4px;

    code {
      overflow-wrap: anywhere;
    }
  }

  .conteneur-creation {
    display: flex;
    align-items: flex-end;
    gap: 16px;
    margin: 32px 0;
  }
</style>
