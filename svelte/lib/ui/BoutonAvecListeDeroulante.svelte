<script lang="ts">
  import Bouton from './Bouton.svelte';
  import FermetureSurClicEnDehors from './FermetureSurClicEnDehors.svelte';

  type Options = {
    label: string;
    icone: 'plus' | 'televerser';
    href?: string;
    action?: () => void;
  }[];
  export let titre: string;
  export let options: Options;

  let ouvert = false;
  let elementBoutonDeroulant: HTMLDivElement;
</script>

<FermetureSurClicEnDehors
  bind:doitEtreOuvert={ouvert}
  elements={[elementBoutonDeroulant]}
/>
<div
  class="conteneur-bouton nouveau-service"
  bind:this={elementBoutonDeroulant}
>
  <Bouton
    {titre}
    type="primaire"
    icone="plus"
    taille="moyen"
    on:click={() => (ouvert = !ouvert)}
  />
  {#if ouvert}
    <ul class="contenu-deroulant">
      {#each options as option, idx (idx)}
        {@const tag = option.href ? 'a' : 'button'}
        <li>
          <svelte:element
            this={tag}
            tabindex="0"
            role="button"
            href={option.href}
            on:click={() => {
              option.action?.();
              ouvert = false;
            }}
          >
            <span class={option.icone}>{option.label}</span>
          </svelte:element>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style lang="scss">
  .conteneur-bouton {
    position: relative;
    z-index: 3;

    .contenu-deroulant {
      position: absolute;
      left: 0;
      margin: 0;
      width: 100%;
      padding-left: 0;
      list-style: none;
      border-radius: 4px;
      box-shadow: var(--ombre-sm);
      background: white;

      li {
        border-bottom: 1px solid var(--systeme-design-etat-contour-champs);

        &:last-of-type {
          border-bottom: none;
        }

        &:hover {
          background: rgba(0, 0, 0, 0.04);
        }

        a,
        button {
          color: var(--texte-fonce);
          padding: 12px 16px;
          cursor: pointer;
          border: none;
          background: none;
          outline: none;
          margin: 0;
          display: flex;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.5rem;
        }

        span {
          display: flex;
          flex-direction: row;
          gap: 8px;
          align-items: center;

          &:before {
            content: '';
            display: inline-block;
            background-repeat: no-repeat;
            background-size: contain;
            width: 16px;
            height: 16px;
            filter: brightness(0) invert(12%) sepia(3%) saturate(0%)
              hue-rotate(230deg) brightness(91%) contrast(88%);
          }

          &.plus:before {
            background-image: url('/statique/assets/images/icone_plus_dsfr.svg');
            transform: translateY(1px);
          }

          &.televerser:before {
            background-image: url('/statique/assets/images/icone_ordinateur_dsfr.svg');
            transform: translateY(1px);
          }
        }
      }
    }
  }
</style>
