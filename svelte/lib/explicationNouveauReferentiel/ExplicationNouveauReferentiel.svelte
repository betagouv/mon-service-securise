<script lang="ts">
  import Modale from '../ui/Modale.svelte';
  import { onMount } from 'svelte';
  let elementModale: Modale;

  onMount(() => {
    elementModale?.affiche();
  });
</script>

<Modale bind:this={elementModale} id="modale-explication-nouveau-referentiel">
  <svelte:fragment slot="contenu">
    <dsfr-badge
      label="Nouveau"
      type="accent"
      accent="yellow-tournesol"
      size="md"
      hasIcon
      icon="flashlight-fill"
    />
    <h4>Mise en place d’un nouveau référentiel de mesures</h4>
    <div class="contenu-modale">
      <p>
        <b
          >Le formulaire d’ajout de service a été mis à jour avec de nouvelles
          questions. Les mesures associées à chaque besoin de sécurité ont
          également été évoluées : certaines ont été ajoutées, d'autres
          modifiées ou supprimées.</b
        >
      </p>
      <div>
        <p><b>Les principaux axes de cette mise à jour :</b></p>
        <ul>
          <li>Des mesures séparées pour une analyse plus fine</li>
          <li>
            Des ajouts de mesures "simples" basées sur les bonnes pratiques
          </li>
          <li>Un alignement avec la directive NIS2</li>
          <li>
            Une meilleure adaptation au périmètre d’homologation, selon les
            contextes
          </li>
          <li>
            Un renforcement du principe de proportionnalité, pour cibler les
            mesures là où les risques sont les plus élevés.
          </li>
        </ul>
      </div>
      <div>
        <h5>Évolution du nombre de mesures</h5>
        <p>
          Le nombre affiché pour chaque besoin de sécurité est le maximum
          possible (par exemple si votre service présente un grand nombre de
          caractéristiques)
        </p>
      </div>
    </div>
  </svelte:fragment>
</Modale>

<style lang="scss">
  :global(#modale-explication-nouveau-referentiel) {
    max-width: 792px;
    max-height: 740px;

    :global(.contenu-modale) {
      margin-top: 0;
    }
  }

  h4 {
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 2rem;
    color: #161616;
    margin: 16px 0;
  }

  .contenu-modale {
    display: flex;
    flex-direction: column;
    gap: 24px;

    p {
      font-size: 1rem;
      line-height: 1.5rem;
      color: #3a3a3a;
      margin: 0;
    }

    ul {
      padding: 0 0 0 15px;
      margin: 0;
      font-size: 1rem;
      line-height: 1.5rem;
    }

    h5 {
      line-height: 1.75rem;
      font-size: 1.125rem;
      margin: 0 0 4px;
    }
  }
</style>
