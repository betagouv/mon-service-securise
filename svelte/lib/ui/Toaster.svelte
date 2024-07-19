<script lang="ts">
  import { toasterStore } from './stores/toaster.store';
  import { glisse } from './animations/transitions';

  const icones = {
    info: 'icone_info',
    succes: 'icone_succes',
  };
</script>

<aside>
  {#each $toasterStore.queue as toast (toast.id)}
    <article
      class={toast.niveau}
      transition:glisse={{ depuis: 'right', duree: 250 }}
    >
      <div class="conteneur-icone">
        <div class="icone">
          <img
            src={'/statique/assets/images/toasts/' +
              icones[toast.niveau] +
              '.svg'}
            alt=""
            width="24"
            height="24"
          />
        </div>
      </div>
      <div class="conteneur-texte">
        <p class="titre">{toast.titre}</p>
        <p class="texte">{@html toast.contenu}</p>
      </div>
    </article>
  {/each}
</aside>

<style>
  aside {
    position: fixed;
    right: 36px;
    top: 0;
    width: 540px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1em;
    padding-top: 2em;
    z-index: 99;
  }

  article {
    font-size: 0.8em;
    --couleur: transparent;
    border: 1px solid var(--couleur);
    display: flex;
    flex-direction: row;
    background: white;
    align-items: stretch;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 12px 20px 0 #0000001f;
  }

  .conteneur-icone {
    background: var(--couleur);
    padding: 18px 10px;
  }

  .conteneur-texte {
    text-align: left;
    padding: 16px;
  }

  .conteneur-texte p {
    margin: 0;
  }

  .conteneur-texte .titre {
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;
    margin-bottom: 4px;
  }

  .conteneur-texte .texte {
    font-size: 0.9rem;
    font-weight: 400;
    line-height: normal;
  }

  .info {
    --couleur: var(--bleu-mise-en-avant);
  }

  .succes {
    --couleur: #0c8626;
  }
</style>
