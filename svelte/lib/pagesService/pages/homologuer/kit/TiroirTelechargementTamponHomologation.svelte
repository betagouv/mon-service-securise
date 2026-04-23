<script lang="ts">
  import ContenuTiroir from '../../../../ui/tiroirs/ContenuTiroir.svelte';

  interface Props {
    idService: string;
  }

  let { idService }: Props = $props();

  export const titre = "Comment utiliser l'encart d'homologation";
</script>

<ContenuTiroir>
  <div>
    <p>
      Vous êtes sur le point de télécharger une archive&nbsp;<code>.zip</code
      >&nbsp;sur le site MonServiceSécurisé.
    </p>
    <p>
      Cette archive contient des encarts d'homologation personnalisés pour votre
      service. Nous vous proposons ces encarts en divers format, afin de
      faciliter leur utilisation sur votre site internet.
    </p>
    <ul>
      <li>
        Au format&nbsp;<code>.png</code>
        <ul>
          <li>
            3 images d'encart d'homologation. Pour les formats téléphone,
            tablette et bureau.
          </li>
          <li>1 image de tampon d'homologation.</li>
        </ul>
      </li>
      <li>
        Au format&nbsp;<code>.html</code>
        <ul>
          <li>
            3 fichiers contenant les encarts d'homologation au format&nbsp;<code
              >base64</code
            >.
          </li>
          <li>
            1 fichier contenant le tampon d'homologation au format&nbsp;<code
              >base64</code
            >.
          </li>
        </ul>
      </li>
    </ul>
    <div class="conteneur-actions">
      <dsfr-button
        label="Télécharger l'encart d'homologation"
        kind="primary"
        size="md"
        icon="download-line"
        icon-place="left"
        markup="a"
        type="button"
        has-icon
        href="/api/service/{idService}/archive/tamponHomologation.zip"
      ></dsfr-button>
    </div>
  </div>
</ContenuTiroir>

<style>
  div {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  code {
    background: var(--fond-bleu-pale);
    padding: 2px;
    border-radius: 4px;
  }

  ul,
  li {
    margin: 0;
  }

  li {
    margin-top: 8px;
  }

  .conteneur-actions {
    margin-top: 32px;
    align-self: flex-end;
  }

  p {
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0;
  }
</style>
