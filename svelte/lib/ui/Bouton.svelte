<script lang="ts">
  export let titre: string;
  export let icone:
    | 'suppression'
    | 'ajout'
    | 'copie'
    | 'export'
    | 'telechargement'
    | 'contributeurs'
    | 'rafraichir'
    | '' = '';
  export let taille: 'moyen' | 'grand' = 'grand';
  export let type: 'primaire' | 'secondaire' | 'lien';
  export let actif: boolean = true;
  export let enCoursEnvoi: boolean = false;
  export let boutonSoumission: boolean = true;
</script>

<button
  class="bouton {type} {icone} {taille}"
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
    background-image: url('/statique/assets/images/icone_poubelle_2.svg');
  }

  .copie:before {
    background-image: url('/statique/assets/images/icone_copier.svg');
  }

  .export:before {
    background-image: url('/statique/assets/images/icone_export_2.svg');
  }

  .telechargement:before {
    background-image: url('/statique/assets/images/icone_telechargement_bleu_carre.svg');
  }

  .contributeurs:before {
    background-image: url('/statique/assets/images/icone_gestion_contributeurs.svg');
  }

  .rafraichir:before {
    background-image: url('/statique/assets/images/icone_rafraichir.svg');
  }

  .ajout:before {
    background-image: url('/statique/assets/images/icone_plus_gris.svg');
    filter: invert(100%) sepia(100%) saturate(2%) hue-rotate(245deg)
      brightness(105%) contrast(101%);
  }

  .avecIcone:before {
    content: '';
    display: inline-block;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .grand.avecIcone:before {
    width: 24px;
    height: 24px;
  }

  .moyen.avecIcone:before {
    width: 16px;
    height: 16px;
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

  button.lien:disabled {
    background: none;
    border: none;
    color: #929292;
  }

  button.lien.avecIcone:disabled:before {
    filter: brightness(0) invert(71%) sepia(13%) saturate(0%) hue-rotate(190deg)
      brightness(80%) contrast(86%);
  }

  button.en-cours-chargement {
    color: transparent;
  }

  button.en-cours-chargement::before {
    position: absolute;
    content: '';
    display: block;
    width: 16px;
    height: 16px;
    margin: 0;
    border-radius: 50%;
    border: 2px solid white;
    border-color: white transparent;
    animation: rotation 1.2s linear infinite;
    top: calc(50% - 10px);
    left: calc(50% - 10px);
  }

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
