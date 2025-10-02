<script lang="ts">
  import donneesNiveauxDeSecurite from '../../niveauxDeSecurite/donneesNiveauxDeSecurite';

  let niveauSelectionne = '';
</script>

<div>
  <hr />
  <p class="explication-etape">
    Sur la base des informations renseignées, l'ANSSI a évalué à titre indicatif
    les besoins de sécurité de votre service et la démarche adaptée.
  </p>
  <p class="explication-cta">
    Sélectionnez les besoins identifiés ou des besoins plus élevés pour
    découvrir la liste des mesures pour sécuriser votre service. Si vous
    souhaitez en savoir plus retrouvez <lab-anssi-lien
      href="https://monservicesecurise-ressources.cellar-c2.services.clever-cloud.com/LAB_Homologation_Simplifiee.pdf"
      cible="_blank"
      titre="l’homologation simplifiée"
    />
  </p>

  {#each donneesNiveauxDeSecurite as niveauSecurite}
    <div
      class="conteneur-niveau-securite"
      class:selectionne={niveauSelectionne === niveauSecurite.id}
    >
      <div class="entete-niveau-securite">
        <h5>{niveauSecurite.nom}</h5>
        <dsfr-tag
          label="Besoins identifiés par l'ANSSI"
          size="md"
          hasIcon
          icon="star-s-fill"
        />
        <p>{niveauSecurite.resume}</p>
        <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
        <lab-anssi-bouton
          titre={niveauSelectionne === niveauSecurite.id
            ? 'Sélectionné'
            : 'Sélectionner'}
          variante={niveauSelectionne === niveauSecurite.id
            ? 'primaire'
            : 'secondaire'}
          taille="sm"
          icone={niveauSelectionne === niveauSecurite.id ? 'check-line' : ''}
          positionIcone={niveauSelectionne === niveauSecurite.id
            ? 'gauche'
            : 'sans'}
          on:click={() => (niveauSelectionne = niveauSecurite.id)}
        />
      </div>
      <div class="corps-niveau-securite"></div>
    </div>
  {/each}
</div>

<style lang="scss">
  .conteneur-niveau-securite {
    padding: 24px;
    border-radius: 8px;
    border: 1px solid #ddd;

    &.selectionne {
      border-color: var(--bleu-mise-en-avant);
    }
  }

  .entete-niveau-securite {
    display: grid;
    gap: 10px 8px;
    grid-template-columns: auto 1fr auto;
    grid-template-areas:
      'titre badge bouton'
      'resume resume bouton';
  }

  dsfr-tag {
    grid-area: badge;
    align-self: baseline;
  }

  lab-anssi-bouton {
    grid-area: bouton;
    justify-self: end;
    align-self: center;
  }

  h5 {
    grid-area: titre;
    padding: 0;
    align-self: baseline;
    font-weight: 700;
    font-size: 1.375rem;
    line-height: 1.75rem;
    margin: 0 8px 0 0;
  }

  p {
    grid-area: resume;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0;
    padding: 0;
  }

  .explication-etape {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.75rem;
  }

  .explication-etape,
  .explication-cta {
    max-width: 800px;
    margin-bottom: 24px;
  }

  hr {
    width: 690px;
    color: #ddd;
    background: #ddd;
    border-color: transparent;
    border-bottom: none;
    padding: 0;
    margin: -24px 0 64px;
  }

  .conteneur-niveau-securite:not(:last-of-type) {
    margin-bottom: 16px;
  }
</style>
