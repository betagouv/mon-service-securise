<script lang="ts" generics="T extends any">
  import type { OptionsListeDeroulante } from './ui.types.d';
  import { validationChampDsfr } from '../directives/validationChampDsfr';

  export let label: string;
  export let id: string;
  export let options: OptionsListeDeroulante<T>;
  export let valeur: T | null = null;

  export let aideSaisie: string = 'Sélectionner une option';
  export let texteDescriptionAdditionnel: string = '';
  export let desactive: boolean = false;
  export let requis: boolean = false;

  export let messageErreur: string = '';
  export let messageValide: string = '';
</script>

<div class="conteneur-liste-deroulante" class:desactive>
  <label for={id}>
    {label}
    {#if texteDescriptionAdditionnel}
      <span>{texteDescriptionAdditionnel}</span>
    {/if}
  </label>

  <div class="conteneur-select">
    <img
      src="/statique/assets/images/ui-kit/fleche_bas.svg"
      alt="Icône de flêche de la liste déroulante"
    />
    <select
      {id}
      disabled={desactive}
      bind:value={valeur}
      required={requis}
      use:validationChampDsfr={requis && messageErreur && messageValide
        ? { invalide: messageErreur, valide: messageValide }
        : { invalide: '', valide: '' }}
      class:avecValidation={messageValide !== ''}
    >
      <option value={null} selected disabled hidden>{aideSaisie}</option>
      {#each options as option}
        <option label={option.label} value={option.valeur} />
      {/each}
    </select>
  </div>
</div>

<style>
  label {
    font-size: 1.11em;
    line-height: 1.5em;
    display: block;
    margin-bottom: 8px;
  }

  .conteneur-liste-deroulante {
    position: relative;
  }

  .conteneur-liste-deroulante.desactive label {
    color: var(--gris-inactif);
  }

  label span {
    display: block;
    font-size: 0.75em;
    line-height: 1.57em;
    margin-top: 4px;
    color: var(--gris-texte-additionnel);
  }

  .conteneur-select {
    position: relative;
    width: fit-content;
  }

  .conteneur-select img {
    position: absolute;
    right: 12px;
    top: 12px;
  }

  select {
    appearance: none;
    padding: 8px 38px 8px 16px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border: none;
    box-shadow: inset 0 -2px 0 0 var(--gris-fonce);
    cursor: pointer;
    font-size: 1.11em;
    line-height: 1.5em;
    background: var(--fond-gris-pale-composant);
    background-size: 1.11em 1.11em;
    min-width: 288px;
  }

  select:invalid {
    box-shadow: inset 0 -2px 0 0 var(--erreur-texte);
  }

  select.avecValidation:valid {
    box-shadow: inset 0 -2px 0 0 var(--succes-texte);
  }

  select option {
    font-size: 1.11em;
    line-height: 1.5em;
  }

  select[disabled] {
    background-color: #e5e5e5;
    color: var(--gris-inactif);
    box-shadow: none;
    cursor: not-allowed;
  }

  .conteneur-liste-deroulante.desactive .conteneur-select img {
    filter: brightness(0) invert(66%) sepia(0%) saturate(140%)
      hue-rotate(144deg) brightness(88%) contrast(84%);
  }

  .conteneur-liste-deroulante:has(select:invalid) label {
    color: var(--erreur-texte);
  }

  .conteneur-liste-deroulante:has(select.avecValidation:valid) label {
    color: var(--succes-texte);
  }

  .conteneur-liste-deroulante:has(select:invalid):before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: -12px;
    width: 2px;
    height: 100%;
    background: var(--erreur-texte);
  }

  .conteneur-liste-deroulante:has(select.avecValidation:valid):before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: -12px;
    width: 2px;
    height: 100%;
    background: var(--succes-texte);
  }
</style>
