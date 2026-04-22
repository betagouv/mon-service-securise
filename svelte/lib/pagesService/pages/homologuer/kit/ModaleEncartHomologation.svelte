<script lang="ts">
  import Modale from '../../../../ui/Modale.svelte';

  interface Props {
    idService: string;
  }

  let { idService }: Props = $props();

  let modale: Modale;
  export const affiche = () => modale?.affiche();
</script>

<Modale bind:this={modale} id="modale-encart-homologation">
  {#snippet contenu()}
    <h1>Félicitations pour votre homologation !</h1>
    <img
      src="/statique/assets/images/exemple_encart_homologation.png"
      alt="Exemple d'encart d'homologation"
    />
    <p>
      Vous pouvez dès à présent télécharger les encarts d'homologation
      personnalisés pour votre service. Nous vous proposons ces encarts en
      divers formats, afin de faciliter leur utilisation sur votre site
      internet.
    </p>
    <ul>
      <li>
        <b>Au format .png</b>
        <ul>
          <li>
            images d'encart d'homologation. Pour les formats téléphone, tablette
            et bureau.
          </li>
          <li>image de tampon d'homologation.</li>
        </ul>
      </li>
      <li>
        <b>Au format .html</b>
        <ul>
          <li>
            fichiers contenant les encarts d'homologation au format base64.
          </li>
          <li>fichier contenant le tampon d'homologation au format base64.</li>
        </ul>
      </li>
    </ul>
  {/snippet}
  {#snippet actions()}
    <dsfr-button
      label="Télécharger l'encart d'homologation"
      kind="primary"
      icon="download-line"
      icon-place="left"
      markup="a"
      has-icon
      size="md"
      href="/api/service/{idService}/archive/tamponHomologation.zip"
    ></dsfr-button>
  {/snippet}
</Modale>

<style lang="scss">
  :global(#modale-encart-homologation) {
    max-width: 700px;
    height: fit-content;
    text-align: left;
  }

  :global(#modale-encart-homologation .contenu-modale) {
    margin-top: 0;
  }

  h1 {
    margin: 0 0 24px;
    align-self: start;
  }

  img {
    max-width: 100%;
  }

  ul {
    margin-top: 0;
  }
</style>
