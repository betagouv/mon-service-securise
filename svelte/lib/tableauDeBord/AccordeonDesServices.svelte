<script lang="ts">
  import type {
    BrouillonService,
    GroupeServices,
    ServiceAvecIndiceCyber,
  } from './tableauDeBord.d';
  import TableauDeServices from './TableauDeServices.svelte';
  import Pastille from '../ui/Pastille.svelte';
  import { untrack } from 'svelte';
  import { derived } from 'svelte/store';
  import { selectionIdsServices } from './stores/selectionService.store';
  import { singulierPluriel } from '../outils/string';
  import { toasterStore } from '../ui/stores/toaster.store';

  interface Props {
    indicesCyberCharges?: boolean;
    servicesAAfficher: ServiceAvecIndiceCyber[];
    brouillonsAAfficher: BrouillonService[];
    ouvertParDefaut?: boolean;
    groupe?: GroupeServices;
  }
  let {
    indicesCyberCharges = false,
    servicesAAfficher,
    brouillonsAAfficher,
    ouvertParDefaut = false,
    groupe,
  }: Props = $props();

  let elementAccordeon: HTMLDivElement | undefined = $state();
  let estOuvert = $state(untrack(() => ouvertParDefaut));
  $effect(() => {
    if (elementAccordeon && estOuvert) {
      const top =
        elementAccordeon.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });

  let servicesSelectionnesDansAccordeon = derived(
    [selectionIdsServices],
    ([$s]) => {
      return $s.filter((id) => servicesAAfficher.map((s) => s.id).includes(id));
    }
  );

  const retireServicesDuGroupe = async () => {
    await axios.delete(`/api/groupes-services/${groupe?.id}/associations`, {
      data: { idsServices: $servicesSelectionnesDansAccordeon },
    });
    toasterStore.succes(
      singulierPluriel(
        'Service retiré',
        'Services retirés',
        $servicesSelectionnesDansAccordeon.length
      ),
      `${$servicesSelectionnesDansAccordeon.length} ${singulierPluriel('service a été retiré', 'services ont été retirés', $servicesSelectionnesDansAccordeon.length)} de « ${groupe?.libelle} ».`
    );
    selectionIdsServices.vide();
    document.body.dispatchEvent(new CustomEvent('rafraichis-groupes'));
  };
</script>

<div class="contenu-groupe" bind:this={elementAccordeon}>
  <button
    class:ouvert={estOuvert}
    onclick={() => {
      estOuvert = !estOuvert;
    }}
  >
    <lab-anssi-icone nom="folder-2-line" taille="md"></lab-anssi-icone>
    <span>{groupe ? groupe.libelle : 'Sans groupe'}</span>
    <Pastille
      contenu={`${servicesAAfficher.length + brouillonsAAfficher.length}`}
      active={estOuvert}
    />
    <lab-anssi-icone class="fleche" nom="arrow-up-s-line" taille="md"
    ></lab-anssi-icone>
  </button>
  {#if groupe && servicesAAfficher.length > 0}
    <div class="selection" class:ouvert={estOuvert}>
      <p>
        {#if $servicesSelectionnesDansAccordeon.length === 0}
          Aucun service sélectionné
        {:else}
          {$servicesSelectionnesDansAccordeon.length}
          {singulierPluriel(
            'service sélectionné',
            'services sélectionnés',
            $servicesSelectionnesDansAccordeon.length
          )} dans ce groupe
        {/if}
      </p>
      <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
      <dsfr-button
        kind="secondary"
        disabled={$servicesSelectionnesDansAccordeon.length === 0}
        label="Supprimer de ce groupe"
        has-icon
        size="sm"
        icon="close-circle-line"
        onclick={async () => await retireServicesDuGroupe()}
      >
      </dsfr-button>
    </div>
  {/if}
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
