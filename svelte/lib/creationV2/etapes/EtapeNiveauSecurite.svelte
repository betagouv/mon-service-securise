<script lang="ts">
  import donneesNiveauxDeSecurite from '../../niveauxDeSecurite/donneesNiveauxDeSecurite';

  let niveauSelectionne = '';
  let niveauDeplie = '';
</script>

<div>
  <hr class="separateur-etapier" />
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

  {#each donneesNiveauxDeSecurite as niveauSecurite, index}
    <div
      class="conteneur-niveau-securite"
      class:selectionne={niveauSelectionne === niveauSecurite.id}
      class:deplie={niveauDeplie === niveauSecurite.id}
    >
      <div
        class="entete-niveau-securite"
        on:click={() => (niveauDeplie = niveauSecurite.id)}
        on:keydown={() => (niveauDeplie = niveauSecurite.id)}
        tabindex="0"
        role="button"
        aria-roledescription="Déplie ou replie le contenu explicatif du niveau {niveauSecurite.nom}"
      >
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
      <div class="corps-niveau-securite">
        <hr />
        <div class="description-niveau-securite">
          <div class="conteneur-illustration">
            <img
              src="/statique/assets/images/niveauxSecurite/{niveauSecurite.id}.svg"
              alt="Illustration du niveau {index + 1} de sécurité"
            />
          </div>
          <div class="conteneur-texte">
            <h6>Exemples de services numériques</h6>
            <ul class="liste-exemples-services">
              {#each niveauSecurite.description.exemplesServicesNumeriques as exemple}
                <li>{exemple}</li>
              {/each}
            </ul>
            <h6>Sécurisation et évaluation de la sécurité</h6>
            {#if niveauSecurite.description.securisation.length === 1}
              <p>{@html niveauSecurite.description.securisation[0]}</p>
            {:else}
              <ul>
                {#each niveauSecurite.description.securisation as securisation}
                  <li>{@html securisation}</li>
                {/each}
              </ul>
            {/if}
            <h6>Homologation</h6>
            <ul>
              {#each niveauSecurite.description.homologation as homologation}
                <li>{@html homologation}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
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
    grid-template-columns: auto 1fr auto auto;
    grid-template-areas:
      'titre badge bouton switch'
      'resume resume bouton switch';
    cursor: pointer;
  }

  .entete-niveau-securite::after {
    content: '';
    grid-area: switch;
    width: 16px;
    height: 16px;
    margin-left: 8px;
    background: url('/statique/assets/images/icone_fleche_bas.svg') no-repeat
      center;
    background-size: contain;
    filter: brightness(0) saturate(100%) invert(31%) sepia(32%) saturate(4173%)
      hue-rotate(186deg) brightness(99%) contrast(101%) opacity(1);

    justify-self: end;
    align-self: center;
  }

  .corps-niveau-securite {
    display: none;
  }

  .conteneur-niveau-securite.deplie .corps-niveau-securite {
    display: block;
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
    color: #ddd;
    background: #ddd;
    border-color: transparent;
    border-bottom: none;
    padding: 0;
  }

  hr.separateur-etapier {
    margin: -24px 0 64px;
    width: 690px;
  }

  .corps-niveau-securite hr {
    margin: 32px 0;
  }

  .conteneur-niveau-securite:not(:last-of-type) {
    margin-bottom: 16px;
  }

  .description-niveau-securite {
    display: flex;
    flex-direction: row;
    gap: 32px;
    align-items: center;
    justify-content: space-between;

    h6 {
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.5rem;
      margin: 0 0 8px;
      padding: 0;
    }

    h6:not(:first-of-type) {
      margin-top: 24px;
    }

    img {
      padding: 24px;
    }

    p,
    li {
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5rem;
    }

    ul {
      padding-inline-start: 24px;
    }
  }
</style>
