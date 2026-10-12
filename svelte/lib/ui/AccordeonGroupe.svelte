<script lang="ts">
  import type { Snippet } from 'svelte';
  import Pastille from './Pastille.svelte';

  interface Props {
    libelle: string;
    nombreElements: number;
    ouvert?: boolean;
    texteSelection?: string;
    onRetireSelection?: () => Promise<void>;
    children: Snippet;
  }

  let {
    libelle,
    nombreElements,
    ouvert = $bindable(false),
    texteSelection,
    onRetireSelection,
    children,
  }: Props = $props();

  let elementAccordeon: HTMLDivElement | undefined = $state();

  export const focus = () => {
    if (elementAccordeon) {
      elementAccordeon.scrollIntoView({ behavior: 'smooth', block: 'start' });
      ouvert = true;
    }
  };

  export const ferme = () => {
    ouvert = false;
  };
</script>

<div class="contenu-groupe" bind:this={elementAccordeon}>
  <button class:ouvert onclick={() => (ouvert = !ouvert)}>
    <lab-anssi-icone nom="folder-2-line" taille="md"></lab-anssi-icone>
    <span>{libelle}</span>
    <Pastille contenu={`${nombreElements}`} active={ouvert} />
    <lab-anssi-icone class="fleche" nom="arrow-up-s-line" taille="md"
    ></lab-anssi-icone>
  </button>
  {#if texteSelection}
    <div class="selection" class:ouvert>
      <p>{texteSelection}</p>
      <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
      <dsfr-button
        kind="secondary"
        label="Supprimer de ce groupe"
        has-icon
        size="sm"
        icon="close-circle-line"
        onclick={async () => await onRetireSelection?.()}
      >
      </dsfr-button>
    </div>
  {/if}
  <div class="contenu" class:ouvert>
    {@render children()}
  </div>
</div>

<style lang="scss">
  .contenu-groupe {
    margin: 16px 0 0;
    z-index: 0;
    scroll-margin-top: calc(var(--hauteur-barre-actions, 0px) + 8px);

    .selection {
      display: none;

      &.ouvert {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 24px;
        border-left: 1px solid #929292;
        border-right: 1px solid #929292;

        p {
          margin: 0;
          color: #666;
          font-size: 0.875rem;
          font-weight: 400;
          line-height: 1.5rem;
        }
      }
    }

    .contenu {
      display: none;
      z-index: 1;
      margin-bottom: -2.5rem;
      margin-top: -2rem;
    }

    .contenu.ouvert {
      display: block;
    }

    button {
      border: 1px solid #929292;
      display: grid;
      grid-template-columns: auto auto 1fr auto;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 12px 14px;
      cursor: pointer;
      z-index: 2;
      position: relative;
      width: 100%;
      color: #3a3a3a;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.75rem;
      background: transparent;
      text-align: left;

      .fleche {
        transition: transform 200ms ease-out;
      }

      &.ouvert {
        border-bottom: none;
        background-color: #cce6ff;

        .fleche {
          transform: rotate(180deg);
        }
      }
    }
  }
</style>
