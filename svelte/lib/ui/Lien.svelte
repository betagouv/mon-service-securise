<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements';

  interface $$Props extends HTMLAnchorAttributes {
    titre: string;
    icone?:
      | 'plus'
      | 'editer'
      | 'homologation'
      | 'indiceCyber'
      | 'telecharger'
      | 'telecharger-blanc'
      | 'medaille'
      | 'ajout-liste'
      | 'brouillon'
      | 'redemarrer'
      | 'rafraichir'
      | undefined;
    type?:
      | 'bouton-primaire'
      | 'bouton-secondaire'
      | 'bouton-tertiaire'
      | 'lien';
    taille?: 'petit' | 'moyen';
    classe?: string;
    href: string;
    inactif?: boolean;
  }
  export let titre: string;
  export let href: string;
  export let classe: string | undefined = undefined;
  export let icone:
    | 'plus'
    | 'editer'
    | 'homologation'
    | 'indiceCyber'
    | 'telecharger'
    | 'telecharger-blanc'
    | 'medaille'
    | 'brouillon'
    | 'ajout-liste'
    | 'redemarrer'
    | 'rafraichir'
    | undefined = undefined;
  export let type:
    | 'bouton-primaire'
    | 'bouton-secondaire'
    | 'bouton-tertiaire'
    | 'lien' = 'bouton-primaire';
  export let taille: 'petit' | 'moyen' = 'moyen';
  export let inactif: boolean = false;
</script>

<a
  class="{type} {icone} {taille} {classe || ''}"
  class:avecIcone={!!icone}
  class:inactif
  href={inactif ? '#' : href}
  rel={$$restProps.rel || 'noopener'}
  {...$$restProps}
>
  {titre}
</a>

<style>
  a {
    align-items: center;
    gap: 8px;
    display: flex;
    margin: 0;

    color: #fff;

    text-decoration: none;
    user-select: none;
    justify-content: center;

    white-space: nowrap;
    width: fit-content;
  }

  .petit {
    font-size: 14px;
    font-weight: 500;
    line-height: 24px;
    padding: 3px 12px;
  }

  .moyen {
    font-size: 16px;
    font-weight: 500;
    line-height: 24px;
    padding: 7px 16px;
  }

  .plus:before {
    background-image: url('/statique/assets/images/icone_plus_dsfr.svg');
    transform: translateY(1px);
  }

  .editer:before {
    background-image: url('/statique/assets/images/icone_editer.svg');
  }

  .homologation:before {
    background-image: url('/statique/assets/images/icone_homologuer.svg');
  }

  .indiceCyber:before {
    background-image: url('/statique/assets/images/icone_indice_cyber.svg');
  }

  .telecharger:before {
    background-image: url('/statique/assets/images/icone_telecharger.svg');
  }

  .telecharger-blanc:before {
    background-image: url('/statique/assets/images/icone_telecharger_blanc.svg');
  }

  .medaille:before {
    background-image: url('/statique/assets/images/icone_medaille.svg');
  }

  .ajout-liste:before {
    background-image: url('/statique/assets/images/icone_ajout_liste.svg');
  }

  .brouillon:before {
    background-image: url('/statique/assets/images/icone_continuer_brouillon.svg');
  }

  .redemarrer:before {
    background-image: url('/statique/assets/images/icone_rafraichir.svg');
  }

  .rafraichir:before {
    background-image: url('/statique/assets/images/icone_reprendre.svg');
  }

  .avecIcone:before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    background-repeat: no-repeat;
    background-size: contain;
  }

  .lien {
    color: #042794;
    font-weight: 400;
    text-decoration: underline;
    text-underline-offset: 8px;
    padding: 0;
  }

  .lien:hover {
    text-decoration-thickness: 2px;
  }

  .lien:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }

  .lien:active {
    background-color: #eee;
  }

  .bouton-primaire,
  .bouton-secondaire {
    border: solid 1px var(--bleu-mise-en-avant);
    border-radius: 4px;
  }

  .bouton-primaire {
    background: var(--bleu-mise-en-avant);
  }

  .bouton-primaire:hover {
    background: #026ab5;
  }

  .bouton-primaire:active {
    background: #025591;
  }

  .bouton-primaire:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }

  .bouton-secondaire {
    color: var(--bleu-mise-en-avant);
  }

  .bouton-tertiaire {
    background: white;
    border-radius: 4px;
    color: var(--bleu-mise-en-avant);
  }

  .bouton-tertiaire:hover {
    background: #f6f6f6;
  }

  .bouton-tertiaire:active {
    background: #ededed;
  }

  .bouton-secondaire:hover {
    background: #f5f5f5;
  }

  .bouton-secondaire:active {
    background: #eeeeee;
  }

  .bouton-secondaire:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }

  .bouton-primaire.inactif,
  .bouton-primaire.inactif:hover,
  .bouton-secondaire.inactif,
  .bouton-secondaire.inactif:hover {
    color: var(--gris-inactif);
    cursor: not-allowed;
    border-color: var(--fond-gris-fonce);
  }

  .bouton-primaire.inactif,
  .bouton-primaire.inactif:hover {
    background-color: var(--fond-gris-fonce);
  }

  .bouton-secondaire.inactif,
  .bouton-secondaire.inactif:hover {
    background-color: transparent;
  }

  .bouton-secondaire.avecIcone.inactif::before {
    filter: invert(65%) sepia(1%) saturate(0%) hue-rotate(358deg)
      brightness(90%) contrast(84%);
  }

  .bouton-tertiaire.avecIcone::before {
    filter: brightness(0) invert(34%) sepia(21%) saturate(5161%)
      hue-rotate(183deg) brightness(97%) contrast(103%);
  }
</style>
