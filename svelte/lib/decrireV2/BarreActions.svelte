<script lang="ts">
  type ModeAffichage = 'Résumé' | 'Édition' | 'MiseÀJourForcéeBesoinsSécurité';
  interface Props {
    mode: ModeAffichage;
    afficheInfoBesoinsSecurite?: boolean;
    activeBoutonEnregistrer?: boolean;
    onModifier?: () => void;
    onEnregistrer?: () => void;
    onAnnuler?: () => void;
  }

  let {
    mode,
    afficheInfoBesoinsSecurite = false,
    activeBoutonEnregistrer = true,
    onAnnuler,
    onEnregistrer,
    onModifier,
  }: Props = $props();
</script>

<div class="barre-actions">
  <div class="les-boutons">
    {#if mode === 'Résumé'}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        titre="Modifier le service"
        variante="tertiaire"
        taille="md"
        icone="edit-line"
        positionIcone="droite"
        onclick={() => onModifier?.()}
      ></lab-anssi-bouton>
    {:else if mode === 'Édition' || mode === 'MiseÀJourForcéeBesoinsSécurité'}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        titre="Enregistrer les modifications"
        variante="primaire"
        taille="md"
        icone="save-line"
        positionIcone="gauche"
        actif={activeBoutonEnregistrer}
        onclick={() => onEnregistrer?.()}
      ></lab-anssi-bouton>
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <lab-anssi-bouton
        titre={mode === 'Édition' ? 'Annuler' : 'Annuler les modifications'}
        variante="tertiaire"
        taille="md"
        positionIcone="sans"
        onclick={() => onAnnuler?.()}
      ></lab-anssi-bouton>
      {#if afficheInfoBesoinsSecurite}
        <span class="attention-aux-besoins">
          <img src="/statique/assets/images/icone_attention_rose.svg" alt="" />
          En modifiant ce service, ses besoins en sécurité pourront être réévalués.
        </span>
      {/if}
    {/if}
  </div>
</div>

<style lang="scss">
  .barre-actions {
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 1px solid #ddd;
    padding: 24px 0;

    .les-boutons {
      max-width: 1000px;
      padding: 0 54px;
      margin: 0 auto;

      display: flex;
      align-items: center;
      gap: 16px;

      lab-anssi-bouton {
        flex-shrink: 0;
      }

      .attention-aux-besoins {
        color: #666;
        text-align: left;
        display: flex;
        img {
          width: 16px;
          filter: invert(41%) sepia(0%) saturate(0%) hue-rotate(16deg)
            brightness(94%) contrast(87%);
          margin-right: 4px;
        }
      }
    }
  }
</style>
