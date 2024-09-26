<script lang="ts">
  import MenuFlottant from '../ui/MenuFlottant.svelte';
  import ChampTexte from '../ui/ChampTexte.svelte';

  export let valeurs: string[];
  export let requis: boolean = false;
  let autreFonction: string = '';

  const fonctions = [
    { id: 'RSSI', libelle: 'Cybersécurité / SSI' },
    { id: 'DSI', libelle: 'Numérique et systèmes d’information' },
    { id: 'METIER', libelle: 'Direction métier' },
    { id: 'DPO', libelle: 'Protection des données' },
    { id: 'JURI', libelle: 'Juridique' },
    { id: 'RISQ', libelle: 'Gestion des risques' },
    { id: 'DG', libelle: 'Direction générale' },
    { id: 'autre', libelle: 'Autre' },
  ];
  let selection: string[] = [];
  $: label =
    selection.length === 0
      ? 'Sélectionner une fonction'
      : selection
          .map((id) => fonctions.find((f) => f.id === id)?.libelle)
          .join(', ');
  $: afficheAutre = selection.includes('autre');
  $: valeurs = [
    ...selection.filter((f) => f !== 'autre'),
    ...(afficheAutre ? [autreFonction] : ''),
  ];
</script>

<div class="conteneur">
  <div class="info-label" class:requis>Fonction / poste occupé :</div>
  <MenuFlottant
    parDessusDeclencheur={true}
    classePersonnalisee="selection-fonction"
  >
    <div slot="declencheur">
      <button
        class="bouton bouton-secondaire contenu-declencheur"
        class:complete={selection.length > 0}
      >
        {label}
      </button>
    </div>
    <div class="fonctions">
      <div class="rappel-declencheur contenu-declencheur">
        {label}
      </div>
      <div class="options">
        {#each fonctions as fonction}
          <div class="case-et-label">
            <input
              type="checkbox"
              bind:group={selection}
              id={fonction.id}
              name={fonction.id}
              value={fonction.id}
            />
            <label for={fonction.id}>{fonction.libelle}</label>
          </div>
        {/each}
      </div>
    </div>
  </MenuFlottant>
  {#if afficheAutre}
    <label for="autreFonction">Merci de préciser votre fonction/poste </label>
    <ChampTexte
      id="autreFonction"
      nom="autreFonction"
      bind:valeur={autreFonction}
    />
  {/if}
</div>

<style>
  .conteneur {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .info-label {
    margin-bottom: 8px;
  }

  .bouton {
    width: 100%;
    border-radius: 6px;
    color: var(--texte-clair);
    border-color: var(--liseres-fonce);
  }

  .bouton.complete {
    color: black;
  }

  .bouton::after {
    content: '';
    display: inline-block;

    width: 0.4em;
    height: 0.4em;

    border: 2px #000 solid;
    border-left: 0;
    border-bottom: 0;

    transform: rotate(135deg);
    filter: brightness(0%);
    right: 16px;
    position: absolute;
    top: 14px;
  }

  .rappel-declencheur::after {
    content: '';
    display: inline-block;

    width: 0.4em;
    height: 0.4em;

    border: 2px #000 solid;
    border-left: 0;
    border-bottom: 0;

    transform: rotate(315deg);
    filter: brightness(0%);
    right: 16px;
    position: absolute;
    top: 18px;
  }

  .bouton:hover {
    border-color: var(--bleu-mise-en-avant);
  }

  :global(.selection-fonction .declencheur) {
    width: 100%;
  }

  :global(.selection-fonction .svelte-menu-flottant.parDessusDeclencheur) {
    width: 100%;
    left: 0;
    transform: translate(0, 0) !important;
  }

  .fonctions {
    border: 1px solid var(--bleu-mise-en-avant);
    background-color: white;
    width: calc(100% - 2px);
    border-radius: 6px;
    color: black;
  }

  .rappel-declencheur {
    border-bottom: 1px solid var(--bleu-mise-en-avant);
    padding-top: 17px;
  }

  .contenu-declencheur {
    padding: 8px 16px;
    margin: 0;
    text-align: left;
    font-size: 16px;
  }

  .options {
    display: flex;
    gap: 16px;
    flex-direction: column;
    padding: 12px 16px 26px;
  }

  input[type='checkbox'] + label {
    margin: 0;
  }

  .requis:before {
    content: '*';
    color: #e3271c;
    margin-right: 4px;
    font-size: 16px;
  }
</style>
