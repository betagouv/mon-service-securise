<script lang="ts">
  import { createBubbler } from 'svelte/legacy';

  const bubble = createBubbler();
  import Initiales from '../../ui/Initiales.svelte';
  import { storeAutorisations } from '../../gestionContributeurs/stores/autorisations.store';
  import type {
    SuggestionKeyDownProps,
    SuggestionProps,
  } from '@tiptap/suggestion';
  import tippy, { type GetReferenceClientRect, type Instance } from 'tippy.js';

  interface Props {
    listeVisible: boolean;
  }

  let { listeVisible = $bindable() }: Props = $props();

  type Contributeur = { initiales: string; prenomNom: string; id: string };

  let indexActif = $state(0);
  let element: HTMLUListElement;
  let items = $state<Array<Contributeur>>([]);
  let menuFlotant: Instance[];

  type Commande = (options: { id: string; label: string }) => void;
  let commande: Commande | undefined = $state(undefined);

  const selectionneItem = (item: Contributeur) => {
    if (commande) commande({ id: item.id, label: item.prenomNom });
    listeVisible = false;
  };

  export function onStart(
    props: SuggestionProps<Contributeur, { id: string }>
  ): void {
    if (!props.clientRect) {
      return;
    }

    commande = props.command;
    menuFlotant = tippy('body', {
      getReferenceClientRect: props.clientRect as GetReferenceClientRect,
      appendTo: () => document.body,
      content: element,
      showOnCreate: true,
      interactive: true,
      trigger: 'manual',
      placement: 'bottom-start',
    });
    items = props.items;
    indexActif = 0;
    element.classList.remove('invisible');
    menuFlotant[0].show();
    listeVisible = true;
  }

  export function onExit(
    props: SuggestionProps<Contributeur, { id: string }>
  ): void {
    const range = {
      from: props.editor.state.selection.from,
      to: props.editor.state.selection.from + props.query.length,
    };
    props.editor.commands.setTextSelection(range);
    props.editor.commands.deleteSelection();
    commande = undefined;
    items = [];

    if (menuFlotant) menuFlotant[0]?.destroy();
    listeVisible = false;
  }

  export function onUpdate(
    props: SuggestionProps<Contributeur, { id: string }>
  ): void {
    commande = props.command;
    items = props.items;
    indexActif = 0;

    if (menuFlotant)
      menuFlotant[0]?.setProps({
        getReferenceClientRect: props.clientRect as GetReferenceClientRect,
      });
  }

  export function onKeyDown({ event }: SuggestionKeyDownProps) {
    if (event.repeat) {
      return false;
    }

    switch (event.key) {
      case 'Escape':
        menuFlotant[0].hide();
        return true;
      case 'ArrowUp':
        indexActif = (indexActif + items.length - 1) % items.length;
        return true;
      case 'ArrowDown':
        indexActif = (indexActif + 1) % items.length;
        return true;
      case 'Enter':
        selectionneItem(items[indexActif]);
        return true;
      case 'Tab':
        selectionneItem(items[indexActif]);
        return true;
    }

    return false;
  }

  const survol = (index: number) => {
    indexActif = index;
  };
</script>

<ul bind:this={element} class="invisible">
  {#each items as contributeur, i (i)}
    <li>
      <div
        class:active={i === indexActif}
        class="contenu-nom-prenom"
        onclick={() => selectionneItem(contributeur)}
        onkeypress={bubble('keypress')}
        role="button"
        tabindex="0"
        onmouseover={() => survol(i)}
        onfocus={bubble('focus')}
      >
        <Initiales
          valeur={contributeur.initiales}
          resumeNiveauDroit={$storeAutorisations.autorisations[contributeur.id]
            ?.resumeNiveauDroit}
        />
        <span class="prenom-nom">{contributeur.prenomNom}</span>
      </div>
    </li>
  {/each}
</ul>

<style lang="scss">
  ul {
    background: white;
    margin: 0;
    list-style: none;
    border-radius: 6px;
    border: 1px solid var(--liseres-fonce);
    padding: 0;

    &.invisible {
      display: none;
    }
  }

  .contenu-nom-prenom {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    overflow: hidden;
    padding: 9px 16px;
    cursor: pointer;
  }

  .contenu-nom-prenom.active {
    background: #eff6ff;
  }

  .prenom-nom {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .contenu-nom-prenom.active .prenom-nom {
    color: var(--bleu-mise-en-avant);
  }
</style>
