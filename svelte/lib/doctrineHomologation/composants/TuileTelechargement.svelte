<script lang="ts">
  export let titre: string;
  export let illustration: string;
  export let contenu: string;
  export let href: string;
  export let lienExterne: boolean = false;
</script>

<a class="tuile-telechargement" {href} title={titre}>
  <div class="conteneur-image">
    <img src={illustration} alt="" />
  </div>
  <div class="conteneur-texte">
    <p class="titre">{titre}</p>
    <p class="contenu">{contenu}</p>
    <a {href} target="_blank" class="lien" class:lien-externe={lienExterne}
      >{lienExterne ? 'Découvrir le document' : 'Télécharger le PDF'}</a
    >
  </div>
</a>

<style>
  .tuile-telechargement {
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    color: var(--texte-fonce);
    overflow: hidden;
    transition: box-shadow 0.1s ease-in-out;
    max-width: 385px;
    flex: 1;
  }

  .conteneur-image {
    background: #d9d9d9;
    width: 100%;
    height: 160px;
    overflow: hidden;
  }

  img {
    max-width: 150px;
    transform: translateY(26px);
    transition: transform 0.1s ease-in-out;
  }

  .conteneur-texte {
    padding: 24px;
    text-align: left;
    display: flex;
    flex-direction: column;
  }

  .titre {
    color: #273375;
    font-weight: 700;
    margin-bottom: 8px;
    font-size: 20px;
    line-height: 28px;
    margin-top: 0;
  }

  .contenu {
    font-size: 14px;
    line-height: 24px;
    margin-bottom: 12px;
    margin-top: 0;
  }

  a.lien {
    font-size: 12px;
    font-style: normal;
    line-height: 20px;
    align-self: end;
    display: flex;
    gap: 12px;
    align-items: end;
    text-underline-offset: 4px;
  }

  a.lien:after {
    content: url(/statique/assets/images/icone_telechargement.svg);
    display: flex;
    width: 16px;
    height: 16px;
  }

  a.lien.lien-externe:after {
    content: url(/statique/assets/images/icone_lien_nouvel_onglet.svg);
  }

  .tuile-telechargement:hover {
    box-shadow: 0 2px 6px 0 rgba(0, 0, 18, 0.16);
  }

  .tuile-telechargement:hover img {
    transform: translateY(36px);
  }

  .tuile-telechargement:hover a.lien {
    text-decoration: underline;
  }
</style>
