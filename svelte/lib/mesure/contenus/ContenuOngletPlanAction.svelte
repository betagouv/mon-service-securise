<script lang="ts">
  import { store } from '../mesure.store';
  import SelectionPriorite from '../../ui/SelectionPriorite.svelte';
  import Avertissement from '../../ui/Avertissement.svelte';
  import SelectionStatut from '../../ui/SelectionStatut.svelte';
  import type { ReferentielPriorite, ReferentielStatut } from '../../ui/types';
  import SelectionEcheance from '../../tableauDesMesures/ligne/SelectionEcheance.svelte';
  import { planDActionDisponible } from '../../modeles/mesure';
  import { contributeurs } from '../../tableauDesMesures/stores/contributeurs.store';
  import Initiales from '../../ui/Initiales.svelte';
  import type { IdUtilisateur } from '../mesure.d';
  import { storeAutorisations } from '../../gestionContributeurs/stores/autorisations.store';

  export let visible: boolean;
  export let estLectureSeule: boolean;
  export let priorites: ReferentielPriorite;
  export let statuts: ReferentielStatut;

  $: planDactionNonDisponible = !planDActionDisponible(
    $store.mesureEditee.mesure.statut
  );

  $: selectionDesactivee = estLectureSeule || planDactionNonDisponible;

  const afficheAvertissementStatut = !planDActionDisponible(
    $store.mesureEditee.mesure.statut
  );

  $: niveauDeDroitDe = (idUtilisateur: IdUtilisateur) =>
    $storeAutorisations.autorisations[idUtilisateur]?.resumeNiveauDroit;
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
      Le plan d'action vous permet de mettre en œuvre plus rapidement les
      mesures en équipe.
    </p>
  {/if}
  <SelectionPriorite
    id="priorite"
    bind:priorite={$store.mesureEditee.mesure.priorite}
    label="Priorité"
    estLectureSeule={selectionDesactivee}
    avecLibelleOption
    {priorites}
  />
  <SelectionEcheance
    bind:echeance={$store.mesureEditee.mesure.echeance}
    avecLabel={true}
    estLectureSeule={selectionDesactivee}
  />
  <div>
    <p class="label" class:estLectureSeule={selectionDesactivee}>
      Responsable(s)
    </p>
    <p class="sous-titre" class:estLectureSeule={selectionDesactivee}>
      Vous pouvrez attribuer cette mesure à un ou plusieurs responsables.
    </p>

    <div class="responsables">
      {#each $contributeurs as contributeur (contributeur.id)}
        <div class="un-responsable">
          <Initiales
            valeur={contributeur.initiales}
            resumeNiveauDroit={niveauDeDroitDe(contributeur.id)}
          />
          <div class="nom" class:estLectureSeule={selectionDesactivee}>
            {contributeur.prenomNom}
          </div>
          <input
            type="checkbox"
            value={contributeur.id}
            class="checkbox-contributeur"
            disabled={selectionDesactivee}
            bind:group={$store.mesureEditee.mesure.responsables}
          />
        </div>
      {/each}
    </div>
  </div>
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
    margin: 0;
  }

  .info-accessibilite-plan-action {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .label {
    font-weight: 500;
    line-height: 22px;
    text-align: left;
    color: var(--texte-clair);
    margin: 0 0 4px;
  }

  .sous-titre {
    color: var(--texte-clair);
    font-size: 0.8rem;
  }

  .estLectureSeule {
    color: var(--liseres-fonce);
  }

  .responsables {
    display: flex;
    flex-direction: column;
    row-gap: 18px;
    margin-top: 25px;
    width: calc(100% - 50px);
  }

  .un-responsable {
    display: flex;
    align-items: center;

    & .nom {
      font-weight: 500;
      text-overflow: ellipsis;
      overflow: hidden;
      margin-left: 8px;
      width: 15rem;
    }

    & input {
      margin: 0 0 0 auto;
      transform: none;
    }
  }
</style>
