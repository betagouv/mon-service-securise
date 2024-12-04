<script lang="ts">
  import Lien from '../Lien.svelte';

  export let type: 'PDF' | 'ZIP';
  export let nom: string;
  export let description: string;
  export let lien: string;
</script>

<div class="document-telechargeable">
  <img
    alt=""
    src="/statique/assets/images/icone_telechargement_{type.toLowerCase()}.svg"
  />
  <div class="contenu-texte">
    <p class="titre-document">{nom}</p>
    <p class="description-document">{description}</p>
  </div>
  <Lien
    titre="Télécharger"
    type="bouton-primaire"
    href={lien}
    target="_blank"
  />
</div>

<style>
  .document-telechargeable {
    display: flex;
    flex-direction: row;
    gap: 16px;
    border: 1px solid var(--liseres-fonce);
    border-radius: 8px;
    padding: 16px;
    align-items: center;
  }

  p {
    margin: 0;
  }

  .contenu-texte {
    flex: 1;
  }

  .titre-document {
    font-weight: bold;
    color: var(--bleu-anssi);
    margin-bottom: 8px;
  }

  .description-document {
    font-size: 0.9rem;
  }

  img {
    width: 44px;
    height: 44px;
  }
</style>
