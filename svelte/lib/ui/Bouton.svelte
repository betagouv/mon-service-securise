<script lang="ts">
  export let titre: string;
  export let icone: 'suppression' | 'ajout' | '' = '';
  export let type: 'primaire' | 'secondaire' | 'lien';
  export let actif: boolean = true;
  export let enCoursEnvoi: boolean = false;
  export let boutonSoumission: boolean = true;
</script>

<button
  class="bouton {type} {icone}"
  class:avecIcone={!!icone}
  type={boutonSoumission ? 'submit' : 'button'}
  on:click
  disabled={!actif || enCoursEnvoi}
  class:en-cours-chargement={enCoursEnvoi}
>
  {titre}
</button>

<style>
  button {
    align-items: center;
    gap: 8px;
    display: flex;
    margin: 0;
    padding: 7px 16px;

    border: solid 1px var(--bleu-mise-en-avant);
    border-radius: 4px;

    color: #fff;

    text-decoration: none;
    user-select: none;
    justify-content: center;
  }

  .suppression:before {
    background-image: url('/statique/assets/images/icone_poubelle.svg');
  }

  .ajout:before {
    background-image: url('/statique/assets/images/icone_plus_gris.svg');
    filter: invert(100%) sepia(100%) saturate(2%) hue-rotate(245deg)
      brightness(105%) contrast(101%);
  }

  .avecIcone:before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 24px;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .primaire {
    background: var(--bleu-mise-en-avant);
  }

  .secondaire {
    color: var(--bleu-mise-en-avant);
    border-color: var(--bleu-mise-en-avant);
    background-color: #fff;
  }

  .lien {
    color: var(--bleu-mise-en-avant);
    background-color: #fff;
    border: none;
  }

  button:disabled {
    background-color: var(--gris-inactif);
    border-color: var(--gris-inactif);
    color: #fff;
  }
</style>
