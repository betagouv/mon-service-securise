<script lang="ts">
  import DOMPurify from 'isomorphic-dompurify';
  import { createEventDispatcher } from 'svelte';
  import { glisse } from './animations/transitions';

  export let niveau: 'info' | 'succes' | 'erreur' | 'alerte';
  export let titre: string;
  export let contenu: string;

  export let avecOmbre: boolean = true;
  export let avecAnimation: boolean = true;
  export let avecFermeture: boolean = false;

  const icones = {
    info: 'icone_info',
    succes: 'icone_succes',
    erreur: 'icone_erreur',
    alerte: 'icone_alerte',
  };

  const transitionConditionnelle = (
    noeud: HTMLElement,
    options: Record<string, any>
  ) => {
    if (avecAnimation) return options.fonction(noeud, options);
  };

  const emetEvenement = createEventDispatcher();
</script>

<article
  class={niveau}
  class:avecOmbre
  transition:transitionConditionnelle|global={{
    fonction: glisse,
    depuis: 'right',
    duree: 250,
  }}
>
  {#if avecFermeture}
    <button
      class="fermeture"
      on:click={() => emetEvenement('close')}
      title="Fermeture du toast">✕</button
    >
  {/if}
  <div class="conteneur-icone">
    <div class="icone">
      <img
        src={`/statique/assets/images/toasts/${icones[niveau]}.svg`}
        alt=""
        width="24"
        height="24"
      />
    </div>
  </div>
  <div class="conteneur-texte">
    <p class="titre">{titre}</p>
    <p class="texte">
      {@html DOMPurify.sanitize(contenu, { ALLOWED_TAGS: ['b'] })}
    </p>
  </div>
</article>

<style lang="scss">
  article {
    font-size: 0.8em;
    --couleur: transparent;
    border: 1px solid var(--couleur);
    display: flex;
    flex-direction: row;
    background: white;
    align-items: stretch;
    border-radius: 8px;
    width: fit-content;
    min-width: 430px;
    max-width: 790px;
    position: relative;

    &.avecOmbre {
      box-shadow: 0 12px 20px 0 #0000001f;
    }

    &.info {
      --couleur: var(--bleu-mise-en-avant);
    }

    &.succes {
      --couleur: #0c8626;
    }

    &.erreur {
      --couleur: #ce0500;
    }

    &.alerte {
      --couleur: #e48800;
    }

    .fermeture {
      position: absolute;
      top: 8px;
      right: 12px;
      border: none;
      cursor: pointer;
      margin: 0;
      padding: 0;
      font-size: 0.875rem;
      font-weight: bold;
      color: var(--texte-fonce);
      background: none;
    }

    .conteneur-icone {
      background: var(--couleur);
      padding: 18px 10px;
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }

    .conteneur-texte {
      text-align: left;
      padding: 16px;

      p {
        margin: 0;
      }

      .titre {
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1.75rem;
        margin-bottom: 4px;
      }

      .texte {
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5rem;
      }
    }
  }
</style>
