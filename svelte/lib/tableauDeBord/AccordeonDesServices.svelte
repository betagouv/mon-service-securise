<script lang="ts">
  import type {
    BrouillonService,
    ServiceAvecIndiceCyber,
  } from './tableauDeBord.d';
  import TableauDeServices from './TableauDeServices.svelte';
  import Pastille from '../ui/Pastille.svelte';
  import { untrack } from 'svelte';

  interface Props {
    indicesCyberCharges?: boolean;
    servicesAAfficher: ServiceAvecIndiceCyber[];
    brouillonsAAfficher: BrouillonService[];
    ouvertParDefaut?: boolean;
    titre: string;
  }
  let {
    indicesCyberCharges = false,
    servicesAAfficher,
    brouillonsAAfficher,
    ouvertParDefaut = false,
    titre,
  }: Props = $props();

  let estOuvert = $state(untrack(() => ouvertParDefaut));
</script>

<div class="contenu-groupe">
  <button
    class:ouvert={estOuvert}
    onclick={() => {
      estOuvert = !estOuvert;
    }}
  >
    <lab-anssi-icone nom="folder-2-line" taille="md"></lab-anssi-icone>
    {titre}
    <Pastille
      contenu={`${servicesAAfficher.length + brouillonsAAfficher.length}`}
      active={estOuvert}
    />
    <lab-anssi-icone class="fleche" nom="arrow-up-s-line" taille="md"
    ></lab-anssi-icone>
  </button>
  <div class="contenu" class:ouvert={estOuvert}>
    <TableauDeServices
      {indicesCyberCharges}
      {servicesAAfficher}
      {brouillonsAAfficher}
    />
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
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 2rem;
      background: transparent;

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
