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
    | 'inviter'
    | 'plus'
    | 'configuration'
    | '' = '';
  export let taille: 'petit' | 'moyen' | 'grand' = 'grand';
  export let type: 'primaire' | 'secondaire' | 'lien' | 'lien-dsfr';
  export let actif: boolean = true;
  export let enCoursEnvoi: boolean = false;
  export let boutonSoumission: boolean = true;
  export let classe: string = '';
</script>

<button
  class="bouton {type} {icone} {taille} {classe}"
  class:avecIcone={!!icone}
  type={boutonSoumission ? 'submit' : 'button'}
  on:click
  disabled={!actif || enCoursEnvoi}
  class:en-cours-chargement={enCoursEnvoi}
>
  {titre}
</button>

<style lang="scss">
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
    white-space: nowrap;
  }

  button.petit {
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
    padding: 3px 12px;
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

  .inviter:before {
    background-image: url('/statique/assets/images/icone_inviter.svg');
    filter: invert(100%) sepia(100%) saturate(2%) hue-rotate(245deg)
      brightness(105%) contrast(101%);
  }

  .plus:before {
    background-image: url('/statique/assets/images/icone_plus_dsfr.svg');
    transform: translateY(1px);
  }

  .configuration:before {
    background-image: url('/statique/assets/images/icone_configuration.svg');
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

  .moyen.avecIcone:before,
  .petit.avecIcone:before {
    width: 16px;
    height: 16px;
  }

  .primaire {
    background: var(--bleu-mise-en-avant);
  }

  .secondaire {
    color: var(--bleu-mise-en-avant);
    border-color: var(--bleu-mise-en-avant);
    background-color: transparent;
  }

  .lien {
    color: var(--bleu-mise-en-avant);
    background-color: #fff;
    border: none;
  }

  button.primaire:disabled,
  button.primaire:disabled:hover,
  button.secondaire:disabled,
  button.secondaire:disabled:hover {
    cursor: not-allowed;
    border-color: var(--fond-gris-fonce);
    color: var(--gris-inactif);
  }

  button.primaire:disabled,
  button.primaire:disabled:hover {
    background-color: var(--fond-gris-fonce);
  }

  button.secondaire:disabled,
  button.secondaire:disabled:hover {
    background-color: transparent;
  }

  button.lien:disabled,
  button.lien:disabled:hover {
    background: none;
    border: none;
    color: #929292;
  }

  button.lien:hover {
    background: #f5f5f5;
  }

  button.lien:active {
    background: var(--fond-gris-pale-composant);
    color: var(--systeme-design-etat-bleu);
  }

  button.lien.avecIcone:active::before {
    filter: brightness(0) invert(8%) sepia(52%) saturate(5373%)
      hue-rotate(237deg) brightness(125%) contrast(140%);
  }

  button.lien.avecIcone:disabled::before,
  button.primaire.avecIcone:disabled::before,
  button.secondaire.avecIcone:disabled::before {
    filter: invert(65%) sepia(1%) saturate(0%) hue-rotate(358deg)
      brightness(90%) contrast(84%);
  }

  button.secondaire.avecIcone::before {
    filter: brightness(0) invert(32%) sepia(83%) saturate(1522%)
      hue-rotate(184deg) brightness(92%) contrast(101%);
  }

  button.secondaire:hover {
    color: var(--bleu-mise-en-avant);
    background: #f5f5f5;
  }

  button.secondaire:active {
    background: #eeeeee;
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

  .lien-dsfr {
    color: #042794;
    background-color: #fff;
    border: none;
    text-decoration: underline;
    text-decoration-color: #042794;
    text-underline-offset: 5px;
    padding: 2px 0;
    margin-left: 2px;
    display: inline;
    border-radius: 0;

    &:hover {
      text-decoration-thickness: 2px;
    }

    &:active {
      background-color: #eee;
    }

    &:focus {
      background-color: white;
      outline: 2px solid #0079d0;
      outline-offset: 1px;
      text-decoration: none;
    }
  }
</style>
