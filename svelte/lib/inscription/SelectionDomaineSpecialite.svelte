<script lang="ts">
  import MenuFlottant from '../ui/MenuFlottant.svelte';
  import ChampTexte from '../ui/ChampTexte.svelte';
  import ControleFormulaire from '../ui/ControleFormulaire.svelte';
  import { validationChamp } from '../directives/validationChamp';
  import { tick } from 'svelte';

  export let valeurs: string[];
  export let requis: boolean = false;
  export let id: string = '';
  let autreDomaine: string = '';
  let champDeclencheur: HTMLInputElement;

  if (!valeurs) valeurs = [];

  const domaines = [
    { id: 'RSSI', libelle: 'Cybersécurité / SSI' },
    { id: 'DSI', libelle: 'Numérique et systèmes d’information' },
    { id: 'METIER', libelle: 'Direction métier' },
    { id: 'DPO', libelle: 'Protection des données' },
    { id: 'JURI', libelle: 'Juridique' },
    { id: 'RISQ', libelle: 'Gestion des risques' },
    { id: 'DG', libelle: 'Direction générale' },
    { id: 'autre', libelle: 'Autre' },
  ];
  const idsDesDomaines = domaines.map((f) => f.id);

  let selection: string[] = valeurs.filter((v) => idsDesDomaines.includes(v));
  const autreValeur = valeurs.find((v) => !idsDesDomaines.includes(v));
  if (autreValeur) {
    selection.push('autre');
    autreDomaine = autreValeur;
  }

  $: label = selection
    .map((id) => domaines.find((f) => f.id === id)?.libelle)
    .join(', ');

  $: {
    if (label) {
      tick().then(() => champDeclencheur.dispatchEvent(new Event('input')));
    }
  }

  $: labelRappelDeclencheur =
    selection.length === 0 ? 'Sélectionner un domaine de spécialité' : label;

  $: afficheAutre = selection.includes('autre');
  $: valeurs = [
    ...selection.filter((f) => f !== 'autre'),
    ...(afficheAutre ? [autreDomaine] : ''),
  ];
</script>

<div class="conteneur">
  <MenuFlottant
    parDessusDeclencheur={true}
    classePersonnalisee="selection-domaine"
  >
    <div slot="declencheur" class="avec-fleche">
      <input
        {id}
        type="text"
        role="button"
        placeholder="Sélectionner un domaine de spécialité"
        class="bouton bouton-secondaire contenu-declencheur"
        class:complete={selection.length > 0}
        bind:value={label}
        required
        use:validationChamp={requis
          ? 'Le domaine est obligatoire. Veuillez le renseigner.'
          : ''}
        bind:this={champDeclencheur}
      />
    </div>
    <div class="domaines">
      <div class="rappel-declencheur contenu-declencheur">
        {labelRappelDeclencheur}
      </div>
      <div class="options">
        {#each domaines as domaine}
          <div class="case-et-label">
            <input
              type="checkbox"
              bind:group={selection}
              id={domaine.id}
              name={domaine.id}
              value={domaine.id}
            />
            <label for={domaine.id}>{domaine.libelle}</label>
          </div>
        {/each}
      </div>
    </div>
  </MenuFlottant>
  {#if afficheAutre}
    <ControleFormulaire
      {requis}
      libelle="Merci de préciser votre domaine de spécialité"
    >
      <ChampTexte
        id="autreDomaine"
        nom="autreDomaine"
        bind:valeur={autreDomaine}
        {requis}
        messageErreur="La précision du domaine de spécialité est obligatoire. Veuillez la renseigner."
      />
    </ControleFormulaire>
  {/if}
</div>

<style>
  .conteneur {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bouton {
    width: 100%;
    border-radius: 5px;
    color: var(--texte-clair);
    border-color: var(--liseres-fonce);
  }

  .bouton.complete {
    color: black;
  }

  .avec-fleche::after,
  .rappel-declencheur::after {
    content: '';
    display: inline-block;

    width: 0.4rem;
    height: 0.4rem;

    border: 2px #000 solid;
    border-left: 0;
    border-bottom: 0;

    transform: rotate(135deg);
    filter: brightness(0%);
    right: 16px;
    position: absolute;
    top: 14px;
  }

  .bouton::placeholder {
    color: var(--texte-clair);
    opacity: 1;
  }

  .bouton::-ms-input-placeholder {
    /* Edge 12 -18 */
    color: var(--texte-clair);
  }

  .bouton:hover {
    border-color: var(--bleu-mise-en-avant);
  }

  :global(.selection-domaine .declencheur) {
    width: 100%;
  }

  :global(.selection-domaine .svelte-menu-flottant.parDessusDeclencheur) {
    width: 100%;
    left: 0;
    transform: translate(0, 0) !important;
  }

  .domaines {
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
    font-size: 1rem;
    line-height: 1.5rem;
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
</style>
