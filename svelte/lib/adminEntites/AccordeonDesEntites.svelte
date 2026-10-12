<script lang="ts">
  import { untrack } from 'svelte';
  import type { EntiteSupervisee } from './adminEntites.types';
  import type { GroupeEntites } from '../groupes/groupes.d';
  import TableauDesEntites from './TableauDesEntites.svelte';
  import Pastille from '../ui/Pastille.svelte';

  interface Props {
    entites: EntiteSupervisee[];
    groupe?: GroupeEntites;
    ouvertParDefaut?: boolean;
  }

  let { entites, groupe, ouvertParDefaut = false }: Props = $props();

  let estOuvert = $state(untrack(() => ouvertParDefaut));
</script>

<div class="contenu-groupe">
  <button class:ouvert={estOuvert} onclick={() => (estOuvert = !estOuvert)}>
    <lab-anssi-icone nom="folder-2-line" taille="md"></lab-anssi-icone>
    <span>{groupe ? groupe.libelle : 'Sans groupe'}</span>
    <Pastille contenu={`${entites.length}`} active={estOuvert} />
    <lab-anssi-icone class="fleche" nom="arrow-up-s-line" taille="md"
    ></lab-anssi-icone>
  </button>
  <div class="contenu" class:ouvert={estOuvert}>
    <TableauDesEntites {entites} />
  </div>
</div>

<style lang="scss">
  .contenu-groupe {
    margin: 16px 0 0;
    z-index: 0;

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
