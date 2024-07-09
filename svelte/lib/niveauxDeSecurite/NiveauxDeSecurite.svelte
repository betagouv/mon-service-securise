<script lang="ts">
  import {
    type IdNiveauDeSecurite,
    ordreDesNiveaux,
  } from './niveauxDeSecurite.d';
  import donneesNiveauxDeSecurite from './donneesNiveauxDeSecurite';

  export let niveauDeSecuriteMinimal: IdNiveauDeSecurite;
  export let niveauSecuriteExistant: IdNiveauDeSecurite | null = null;

  let niveauChoisi: IdNiveauDeSecurite;
  let niveauSurbrillance: IdNiveauDeSecurite;

  const niveauEstRehausse = !niveauSecuriteExistant
    ? false
    : ordreDesNiveaux[niveauDeSecuriteMinimal] >
      ordreDesNiveaux[niveauSecuriteExistant];

  if (niveauSecuriteExistant && !niveauEstRehausse) {
    niveauChoisi = niveauSecuriteExistant;
    niveauSurbrillance = niveauSecuriteExistant;
  }

  const estNiveauTropBas = (candidat: IdNiveauDeSecurite) =>
    ordreDesNiveaux[candidat] < ordreDesNiveaux[niveauDeSecuriteMinimal];

  const estNiveauSuperieur = (candidat: IdNiveauDeSecurite) =>
    ordreDesNiveaux[candidat] > ordreDesNiveaux[niveauDeSecuriteMinimal];

  $: {
    if (niveauChoisi) {
      document.getElementById('diagnostic')?.removeAttribute('disabled');
    }
  }
</script>

<div class="racine">
  {#if niveauEstRehausse}
    <div class="avertissement bleu">
      <img
        src="/statique/assets/images/icone_information_suppression.svg"
        alt="Icône de danger"
      />
      <div>
        <span>
          <b>
            Les modifications que vous venez d'effectuer impliquent un
            changement de niveau de sécurité pour votre service.
          </b>
        </span>
        <br />
        <span>
          Suite à une analyse par l'ANSSI, il a été déterminé que ce nouveau
          niveau de service correspond à un <b>niveau supérieur</b> à celui précédemment
          identifié.
        </span>
      </div>
    </div>
  {/if}
  <div class="niveaux">
    {#each donneesNiveauxDeSecurite as niveau, index (index)}
      <button
        type="button"
        class="boite-niveau"
        class:est-niveau-recommande={niveau.id === niveauDeSecuriteMinimal}
        class:niveau-choisi={niveau.id === niveauChoisi}
        class:boite-en-surbrillance={niveau.id === niveauSurbrillance}
        on:click={() => (niveauSurbrillance = niveau.id)}
      >
        <h4>{niveau.nom}</h4>
        <p>{niveau.resume}</p>
        <div class="conteneur-illustration">
          <img
            src="/statique/assets/images/niveauxSecurite/{niveau.id}.svg"
            alt="Illustration du niveau {index + 1} de sécurité"
          />
        </div>
        <input
          type="radio"
          id={niveau.id}
          bind:group={niveauChoisi}
          name="niveauSecurite"
          value={niveau.id}
          disabled={estNiveauTropBas(niveau.id)}
        />
        {#if estNiveauTropBas(niveau.id)}
          <div class="niveau-trop-bas">
            Il est impossible de sélectionner des besoins de sécurité moins
            élevés que ceux identifiés par l'ANSSI
          </div>
        {:else}
          <label
            class:niveau-choisi={niveau.id === niveauChoisi}
            for={niveau.id}
          >
            {niveau.id === niveauChoisi ? 'Sélectionné' : 'Sélectionner'}
          </label>
        {/if}
      </button>
    {/each}
  </div>
  {#if niveauSurbrillance}
    {@const indexNiveau = donneesNiveauxDeSecurite.findIndex(
      (n) => n.id === niveauSurbrillance
    )}
    {@const descriptionNiveau =
      donneesNiveauxDeSecurite[indexNiveau]?.description}
    {@const niveauPrecedent = donneesNiveauxDeSecurite[indexNiveau - 1] ?? null}
    {@const niveauSuivant = donneesNiveauxDeSecurite[indexNiveau + 1] ?? null}
    {#if descriptionNiveau}
      <div
        class="details-niveau"
        class:details-niveau-choisi={niveauChoisi === niveauSurbrillance}
      >
        {#if estNiveauSuperieur(niveauSurbrillance)}
          <div class="avertissement">
            <img
              src="/statique/assets/images/icone_danger.svg"
              alt="Icône de danger"
            />
            <div>
              <span>
                <b>
                  Ces besoins de sécurité sont supérieurs à ceux identifiés à
                  titre indicatif par l'ANSSI
                </b>
              </span>
              <br />
              <span>
                Cela signifie que la liste des mesures de sécurité sera plus
                complète et la démarche d'homologation plus exigeante
              </span>
            </div>
          </div>
        {/if}
        <span class="chip">Exemples de services numériques</span>
        <ul class="liste-exemples-services">
          {#each descriptionNiveau.exemplesServicesNumeriques as exemple}
            <li>{exemple}</li>
          {/each}
        </ul>
        <h5>
          Démarche indicative adaptée : {descriptionNiveau.demarcheIndicative}
        </h5>
        {#if descriptionNiveau.evalutationBesoins}
          <details>
            <summary>
              <img
                src="/statique/assets/images/niveauxSecurite/icone_bouclier_cle.svg"
                alt="Icône de l'évaluation des besoins de sécurité"
              />
              Evaluation des besoins de sécurité
            </summary>
            <p>{@html descriptionNiveau.evalutationBesoins}</p>
          </details>
        {/if}
        <details>
          <summary>
            <img
              src="/statique/assets/images/niveauxSecurite/icone_taches.svg"
              alt="Icône de la sécurisation et évaluation de la sécurité"
            />
            Sécurisation et évaluation de la sécurité
          </summary>
          {#if descriptionNiveau.securisation.length === 1}
            <p>{@html descriptionNiveau.securisation[0]}</p>
          {:else}
            <ul>
              {#each descriptionNiveau.securisation as securisation}
                <li>{@html securisation}</li>
              {/each}
            </ul>
          {/if}
        </details>
        <details>
          <summary>
            <img
              src="/statique/assets/images/niveauxSecurite/icone_medaille.svg"
              alt="Icône de l'homologation"
            />
            Homologation
          </summary>
          <ul>
            {#each descriptionNiveau.homologation as homologation}
              <li>{@html homologation}</li>
            {/each}
          </ul>
        </details>
        <div class="navigation-description">
          <div class="precedent">
            <button
              type="button"
              class="fleche-navigation"
              class:masque={!niveauPrecedent}
              on:click={() => {
                if (niveauPrecedent) niveauSurbrillance = niveauPrecedent.id;
              }}
            >
              Voir le niveau {niveauPrecedent?.titreNiveau}
            </button>
          </div>
          <div class="pagination">
            {#each donneesNiveauxDeSecurite as niveau}
              <button
                type="button"
                class:actif={niveauSurbrillance === niveau.id}
                on:click={() => (niveauSurbrillance = niveau.id)}
              />
            {/each}
          </div>
          <div class="suivant">
            <button
              type="button"
              class="fleche-navigation"
              class:masque={!niveauSuivant}
              on:click={() => {
                if (niveauSuivant) niveauSurbrillance = niveauSuivant.id;
              }}
            >
              Découvrir le niveau {niveauSuivant?.titreNiveau}
            </button>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .racine {
    padding-top: 48px;
  }

  .niveaux {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    column-gap: 24px;
  }

  input[type='radio'] {
    display: none;
  }

  .boite-niveau {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 32px 11px;
    cursor: pointer;
    outline: 1px dashed var(--liseres-fonce);
    border: none;
    border-radius: 5px;
    background: transparent;
    margin-bottom: 24px;
    transition:
      transform 0.2s ease-out,
      box-shadow 0.2s ease-out;
  }

  .boite-niveau:hover {
    box-shadow: 0 16px 24px 0 rgba(0, 121, 208, 0.12);
    transform: scale(1.02);
  }

  .est-niveau-recommande::before {
    content: "Besoins identifiés par l'ANSSI";
    color: white;
    background: var(--bleu-mise-en-avant);
    padding: 4px 10px;
    border-radius: 40px;
    align-self: center;
    position: relative;
    top: -16px;
  }

  .boite-niveau h4 {
    font-weight: 700;
    font-size: 1.56rem;
    margin: 0 auto 12px auto;
  }

  .boite-niveau.est-niveau-recommande {
    padding-top: 0;
  }

  .boite-niveau.niveau-choisi,
  label.niveau-choisi,
  .details-niveau.details-niveau-choisi {
    outline-color: var(--bleu-mise-en-avant);
  }

  label.niveau-choisi {
    color: white;
    background: var(--bleu-mise-en-avant);
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  label.niveau-choisi::after {
    display: block;
    width: 20px;
    height: 20px;
    content: '';
    background: url(/statique/assets/images/icone_ok_cercle_vert.svg) no-repeat
      center;
    margin-left: 6px;
    background-position-y: -7px;
    background-size: cover;
    filter: brightness(0) invert(1);
  }

  .boite-en-surbrillance {
    outline: 3px solid var(--liseres-fonce);
    position: relative;
  }

  .boite-en-surbrillance::after {
    display: block;
    content: '';
    width: 14px;
    height: 14px;
    border-left: 3px solid var(--liseres-fonce);
    border-bottom: 3px solid var(--liseres-fonce);
    transform: rotate(-45deg);
    position: absolute;
    bottom: -11px;
    background: white;
    left: calc(50% - 7px);
  }

  .niveau-choisi::after {
    border-color: var(--bleu-mise-en-avant);
  }

  label {
    padding: 7px 16px 9px 16px;
    color: var(--bleu-mise-en-avant);
    font-weight: 500;
    border: 1px solid var(--bleu-mise-en-avant);
    border-radius: 4px;
    width: fit-content;
    margin: auto auto 0;
    cursor: pointer;
  }

  .niveau-trop-bas {
    color: var(--texte-clair);
  }

  .details-niveau {
    outline: 3px solid var(--liseres-fonce);
    border-radius: 8px;
    padding: 32px;
    text-align: left;
  }

  .conteneur-illustration {
    text-align: center;
    width: 100%;
    margin: 32px 0;
  }

  .details-niveau .chip {
    padding: 0 10px;
    border-radius: 40px;
    background: var(--fond-bleu-pale);
    font-size: 14px;
    font-weight: 500;
    color: var(--gris-fonce);
  }

  .details-niveau .liste-exemples-services {
    color: var(--texte-clair);
    padding-left: 16px;
  }

  .details-niveau h5 {
    font-size: 25px;
    font-weight: bold;
    margin-top: 36px;
    margin-bottom: 32px;
  }

  .details-niveau details {
    cursor: pointer;
  }

  .details-niveau details p {
    color: var(--texte-clair);
    padding: 0 16px 8px 16px;
  }

  .details-niveau details summary:after {
    content: '';
    width: 16px;
    height: 16px;
    transform: translateY(1px) rotate(90deg);
    transition: transform 0.1s ease-in-out;
    margin-left: auto;
    background: url(/statique/assets/images/forme_chevron_bleu_fonce.svg)
      no-repeat;
    background-size: 16px 16px;
  }

  .details-niveau details[open] summary:after {
    transform: translateY(1px) rotate(-90deg);
  }

  .details-niveau details[open] summary {
    background: var(--fond-bleu-pale);
    color: var(--bleu-survol);
  }

  .details-niveau summary {
    padding: 12px 16px;
    border-top: 1px solid var(--systeme-design-etat-contour-champs);
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 16px;
    font-weight: 500;
    color: var(--bleu-anssi);
  }

  .details-niveau summary:hover {
    background: #0000000a;
  }

  .details-niveau details ul {
    color: var(--texte-clair);
  }

  .details-niveau details ul li {
    margin-bottom: 16px;
  }

  .details-niveau details:last-of-type {
    border-bottom: 1px solid var(--systeme-design-etat-contour-champs);
  }

  .navigation-description {
    padding-top: 48px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .navigation-description .pagination {
    display: flex;
    align-items: center;
    justify-self: center;
    gap: 8px;
  }

  .navigation-description .pagination button {
    width: 10px;
    height: 10px;
    background: var(--liseres-fonce);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    padding: 0;
  }

  .navigation-description .pagination button.actif {
    background: var(--bleu-mise-en-avant);
  }

  .masque {
    opacity: 0;
  }

  .fleche-navigation {
    border: none;
    background: none;
    color: var(--bleu-mise-en-avant);
    cursor: pointer;
    display: flex;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 4px;
  }

  .fleche-navigation:hover {
    background: var(--fond-gris-pale);
    color: var(--bleu-survol);
  }

  .fleche-navigation.masque {
    cursor: default;
  }

  .precedent .fleche-navigation:before {
    content: '';
    background: url(/statique/assets/images/fleche_gauche_bleue.svg);
    display: flex;
    width: 24px;
    height: 24px;
  }

  .suivant {
    justify-self: end;
  }

  .suivant .fleche-navigation:after {
    content: '';
    background: url(/statique/assets/images/fleche_gauche_bleue.svg);
    display: flex;
    width: 24px;
    height: 24px;
    transform: rotate(180deg);
  }

  .avertissement {
    padding: 10px 16px;
    display: flex;
    align-items: start;
    gap: 12px;
    border-radius: 4px;
    border: 1px solid #faa72c;
    background: var(--fond-ocre-pale);
    margin-bottom: 52px;
    text-align: left;
  }

  .avertissement.bleu {
    border: 1px solid var(--bleu-mise-en-avant);
    background: var(--fond-bleu-pale);
  }

  .fleche-navigation:hover:before,
  .fleche-navigation:hover:after {
    filter: brightness(0) invert(22%) sepia(49%) saturate(3021%)
      hue-rotate(188deg) brightness(95%) contrast(91%);
  }
</style>
