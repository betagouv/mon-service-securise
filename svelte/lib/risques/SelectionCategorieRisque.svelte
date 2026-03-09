<script lang="ts">
  import {
    run,
    createBubbler,
    preventDefault,
    stopPropagation,
  } from 'svelte/legacy';

  const bubble = createBubbler();
  import MenuFlottant from '../ui/MenuFlottant.svelte';
  import { validationChamp } from '../directives/validationChamp';
  import { tick } from 'svelte';
  import type { ReferentielCategories } from './risques.d';

  interface Props {
    valeurs: string[];
    requis?: boolean;
    id?: string;
    referentielCategories: ReferentielCategories;
  }

  let {
    valeurs = $bindable(),
    requis = false,
    id = '',
    referentielCategories,
  }: Props = $props();
  let menu: MenuFlottant = $state();
  let champDeclencheur: HTMLInputElement = $state();

  if (!valeurs) valeurs = [];

  const categories = Object.keys(referentielCategories).map((id) => ({
    id,
    libelle: referentielCategories[id],
  }));

  let label = $derived(
    valeurs.map((id) => categories.find((f) => f.id === id)?.libelle).join(', ')
  );

  run(() => {
    if (label) {
      tick().then(() => champDeclencheur.dispatchEvent(new Event('input')));
    }
  });

  let labelRappelDeclencheur = $derived(
    valeurs.length === 0 ? 'Définir la/les catégorie·s' : label
  );

  const refermeMenu = () => menu.fermeLeMenu();
</script>

<div class="conteneur">
  <MenuFlottant
    bind:this={menu}
    parDessusDeclencheur={true}
    classePersonnalisee="selection-categorie"
  >
    {#snippet declencheur()}
      <div class="avec-fleche">
        <input
          {id}
          type="text"
          role="button"
          placeholder="Définir la/les catégorie·s"
          class="bouton bouton-secondaire contenu-declencheur"
          class:complete={valeurs.length > 0}
          bind:value={label}
          required
          use:validationChamp={requis
            ? 'La catégorie est obligatoire. Veuillez la renseigner.'
            : ''}
          bind:this={champDeclencheur}
        />
      </div>
    {/snippet}
    <div class="categories">
      <div
        role="button"
        tabindex="0"
        onkeypress={bubble('keypress')}
        class="rappel-declencheur contenu-declencheur"
        onclick={stopPropagation(preventDefault(refermeMenu))}
      >
        {labelRappelDeclencheur}
      </div>
      <div class="options">
        {#each categories as categorie}
          <div class="case-et-label">
            <input
              type="checkbox"
              bind:group={valeurs}
              id={categorie.id}
              name={categorie.id}
              value={categorie.id}
            />
            <label for={categorie.id}>{categorie.libelle}</label>
          </div>
        {/each}
      </div>
    </div>
  </MenuFlottant>
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

  :global(.selection-categorie .declencheur) {
    width: 100%;
  }

  :global(.selection-categorie .svelte-menu-flottant.parDessusDeclencheur) {
    width: 100%;
    left: 0;
    transform: translate(0, 0) !important;
  }

  :global(.selection-categorie input.invalide) {
    border-color: var(--rose-anssi) !important;
  }

  .categories {
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
