<script lang="ts">
  import { store } from '../mesure.store';
  import SelectionPriorite from '../../ui/SelectionPriorite.svelte';
  import Avertissement from '../../ui/Avertissement.svelte';
  import SelectionStatut from '../../ui/SelectionStatut.svelte';
  import type { ReferentielPriorite, ReferentielStatut } from '../../ui/types';
  import SelectionEcheance from '../../tableauDesMesures/ligne/SelectionEcheance.svelte';

  export let visible: boolean;
  export let estLectureSeule: boolean;
  export let priorites: ReferentielPriorite;
  export let statuts: ReferentielStatut;

  const planDActionDisponible = (statut) =>
    statut === 'aLancer' || statut === 'enCours';

  $: selectionDesactivee = !planDActionDisponible(
    $store.mesureEditee.mesure.statut
  );

  const afficheAvertissementStatut = !planDActionDisponible(
    $store.mesureEditee.mesure.statut
  );
</script>

<div id="contenu-onglet-plan-action" class:visible>
  {#if afficheAvertissementStatut}
    <Avertissement niveau="info">
      <div class="info-accessibilite-plan-action">
        <p>
          Le plan d’action est accessible uniquement pour les mesures au statut <b
            >À lancer</b
          >
          et <b>Partielle</b>
        </p>
        <p>
          <b>Pour y accéder, modifiez le statut de cette mesure</b>
          <SelectionStatut
            bind:statut={$store.mesureEditee.mesure.statut}
            id="statut"
            {estLectureSeule}
            referentielStatuts={statuts}
            version="accentuee"
          />
        </p>
      </div>
    </Avertissement>
  {:else}
    <p class="presentation">
      Le plan d'action vous permet de mettre en oeuvre plus rapidement les
      mesures en équipe.
    </p>
  {/if}
  <SelectionPriorite
    id="priorite"
    bind:priorite={$store.mesureEditee.mesure.priorite}
    label="Priorité"
    estLectureSeule={estLectureSeule || selectionDesactivee}
    avecLibelleOption
    {priorites}
  />
  <SelectionEcheance
    bind:echeance={$store.mesureEditee.mesure.echeance}
    avecLabel={true}
    estLectureSeule={estLectureSeule || selectionDesactivee}
  />
</div>

<style>
  #contenu-onglet-plan-action:not(.visible) {
    display: none;
  }

  #contenu-onglet-plan-action {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  p {
    margin: 0;
  }

  p.presentation {
    font-weight: bold;
    line-height: 22px;
    font-size: 16px;
    margin: 0;
  }

  .info-accessibilite-plan-action {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
</style>
