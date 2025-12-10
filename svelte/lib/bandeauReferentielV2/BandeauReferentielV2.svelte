<script lang="ts">
  import type { UUID } from '../typesBasiquesSvelte';
  import ExplicationNouveauReferentiel from '../explicationNouveauReferentiel/ExplicationNouveauReferentiel.svelte';

  export let idService: UUID;
  let modaleExplication: ExplicationNouveauReferentiel;
</script>

<div class="conteneur-bandeau-referentiel-v2">
  <div class="conteneur-info">
    <p class="info">
      Un nouveau référentiel de mesures est désormais disponible
    </p>
    <p>
      Il fait évoluer le formulaire de création d'un service (nouvelles
      questions). <br />
      Visualisez les changements (mesures, indice cyber) avant d’opérer le changement.
    </p>
  </div>
  <div class="conteneur-actions">
    <lab-anssi-lien
      titre="Lancer la simulation"
      apparence="bouton"
      variante="primaire"
      taille="md"
      positionIcone="sans"
      href="/service/{idService}/simulation-referentiel-v2"
    />
    <button on:click={() => modaleExplication?.affiche()}>En savoir plus</button
    >
  </div>
</div>

<ExplicationNouveauReferentiel
  afficheAuMontage={false}
  avecModaleConfirmation={false}
  bind:this={modaleExplication}
/>

<style lang="scss">
  .conteneur-bandeau-referentiel-v2 {
    background-color: #e8edff;
    padding: 16px 24px;
    display: flex;
    flex-direction: row;
    gap: 24px;
  }

  .conteneur-info {
    margin-left: 76px;
    text-align: left;
    color: #0063cb;

    p {
      margin: 0;
      padding: 0;
    }

    .info {
      font-weight: 700;
      display: flex;
      gap: 8px;
      flex-direction: row;
      margin-bottom: 8px;

      &:before {
        content: '';
        width: 19px;
        height: 19px;
        background-repeat: no-repeat;
        background-size: contain;
        background-image: url('/statique/assets/images/icone_info.svg');
        filter: brightness(0) saturate(100%) invert(28%) sepia(64%)
          saturate(1960%) hue-rotate(192deg) brightness(96%) contrast(110%)
          opacity(100%);
      }
    }
  }

  .conteneur-actions {
    display: flex;
    flex-direction: row;
    gap: 24px;
    align-items: center;
  }

  button {
    display: flex;
    flex-direction: row;
    align-items: center;
    white-space: nowrap;
    border: none;
    border-bottom: 1px solid #0079d0;
    color: #0079d0;
    background-color: transparent;
    cursor: pointer;
    padding: 2px 0;
    margin-left: 2px;
    border-radius: 0;

    &:after {
      margin-left: 8px;
      content: '';
      width: 13px;
      height: 13px;
      display: inline-block;
      background-repeat: no-repeat;
      background-size: contain;
      background-image: url('/statique/assets/images/icone_question_dsfr.svg');
      filter: brightness(0) saturate(100%) invert(38%) sepia(99%)
        saturate(5191%) hue-rotate(190deg) brightness(96%) contrast(101%)
        opacity(100%);
    }

    &:hover {
      border-bottom: 2px solid #0079d0;

      &:after {
        transform: translateY(1px);
      }
    }

    &:focus {
      background-color: white;
      outline: 2px solid #0079d0;
      outline-offset: 1px;
      text-decoration: none;
    }

    &:active {
      background-color: rgba(0, 0, 0, 0.08);
    }
  }
</style>
