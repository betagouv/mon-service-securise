<script lang="ts">
  import type { Contributeur } from '../../tableauDesMesures/tableauDesMesures.d';
  import Initiales from '../../ui/Initiales.svelte';
  import { storeAutorisations } from '../../gestionContributeurs/stores/autorisations.store';

  export let items: Contributeur[];
  export let callback: (c: Contributeur) => void;

  let activeIdx = 0;

  export function onKeyDown(event: KeyboardEvent) {
    if (event.repeat) {
      return false;
    }

    switch (event.key) {
      case 'ArrowUp':
        activeIdx = (activeIdx + items.length - 1) % items.length;
        return true;
      case 'ArrowDown':
        activeIdx = (activeIdx + 1) % items.length;
        return true;
      case 'Enter':
        callback(items[activeIdx]);
        return true;
      case 'Tab':
        callback(items[activeIdx]);
        return true;
    }

    return false;
  }
</script>

<ul>
  {#each items as contributeur, i}
    <li>
      <div
        class:active={i === activeIdx}
        class="contenu-nom-prenom"
        on:click={() => callback(contributeur)}
        on:keypress
        role="button"
        tabindex="0"
      >
        <Initiales
          valeur={contributeur.initiales}
          resumeNiveauDroit={$storeAutorisations.autorisations[contributeur.id]
            ?.resumeNiveauDroit}
        />
        <span class="prenom-nom">{@html contributeur.prenomNom}</span>
      </div>
    </li>
  {/each}
</ul>

<style>
  ul {
    background: white;
    margin: 0;
    list-style: none;
    border-radius: 6px;
    border: 1px solid var(--liseres-fonce);
    padding: 0;
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
