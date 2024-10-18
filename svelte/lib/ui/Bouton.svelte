<script lang="ts">
  export let titre: string;
  export let icone: 'suppression' | '' = '';
  export let type: 'primaire' | 'secondaire' | 'lien';
  export let actif: boolean = true;
  export let enCoursEnvoi: boolean = false;
  export let boutonSoumission: boolean = true;
</script>

<button
  class="bouton {type} {icone}"
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
  }

  .suppression:before {
    content: '';
    background-image: url('/statique/assets/images/icone_poubelle.svg');
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
