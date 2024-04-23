<script lang="ts">
  import { onMount } from 'svelte';
  import { visiteGuidee } from '../../visiteGuidee.store';

  let elementModale: HTMLDialogElement;

  onMount(() => {
    // Cela permet d'éviter de faire un focus sur les éléments de la modale
    elementModale.inert = true;
    elementModale.showModal();
    elementModale.inert = false;
  });
</script>

<dialog bind:this={elementModale}>
  <form class="entete" method="dialog">
    <button class="bouton-fermeture" on:click={visiteGuidee.cacheRideau}
      >Fermer</button
    >
  </form>
  <h2>Bonjour,<br />bienvenue sur MonServiceSécurisé !</h2>
  <p>
    Pilotez la sécurité de vos services numériques et homologuez les rapidement.
    Il est gratuit, 100% en ligne, collaboratif et destiné aux entités publiques
    et à leurs prestataires.
  </p>
  <p>
    Les services relevant d'une réglementation encadrant spécifiquement la
    sécurité des systèmes d'information aux besoins de sécurité élevés ne
    peuvent pas être référencés sur MonServiceSécurisé.
  </p>
  <a
    href="https://aide.monservicesecurise.ssi.gouv.fr/fr/article/quels-services-ne-peuvent-pas-etre-references-sur-monservicesecurise-ey6mt1/"
    target="_blank">Obtenir plus d’informations</a
  >
  <p>
    <b>
      Maintenant, découvrons ensemble l’outil, cela prendra quelques minutes...
    </b>
  </p>
  <div class="conteneur-actions">
    <form method="dialog">
      <button
        class="bouton bouton-tertiaire"
        on:click={visiteGuidee.cacheRideau}>Ignorer la visite guidée</button
      >
    </form>
    <button class="bouton" on:click={() => visiteGuidee.etapeSuivante()}
      >Démarrer la visite guidée</button
    >
  </div>
</dialog>

<style>
  ::backdrop {
    opacity: 0;
  }

  dialog {
    max-width: 600px;
    padding: 8px 40px;
    border: none;
    border-radius: 8px;
  }

  dialog h2 {
    text-align: center;
    color: var(--bleu-mise-en-avant);
  }

  button {
    cursor: pointer;
  }

  .bouton-fermeture {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  .bouton-fermeture:after {
    background: url(/statique/assets/images/icone_fermeture_modale.svg);
    content: '';
    width: 16px;
    height: 16px;
    display: inline-block;
    filter: brightness(0) invert(28%) sepia(70%) saturate(1723%)
      hue-rotate(184deg) brightness(107%) contrast(101%);
    background-size: 16px;
    transform: translateY(3px);
  }

  .entete,
  .conteneur-actions {
    display: flex;
    flex-direction: row;
    justify-content: end;
  }

  dialog a {
    color: var(--bleu-mise-en-avant);
    text-decoration: none;
    font-weight: 500;
    display: flex;
    flex-direction: row;
  }

  dialog a:after {
    background: url(/statique/assets/images/icone_lien_nouvel_onglet.svg);
    content: '';
    width: 20px;
    height: 20px;
    display: inline-block;
    margin-left: 3px;
  }

  dialog p {
    color: var(--gris-fonce);
    margin-top: 24px;
  }

  dialog p:nth-of-type(2) {
    margin-bottom: 0;
  }

  .entete button {
    width: fit-content;
    color: var(--bleu-mise-en-avant);
    background: transparent;
    border: none;
    padding: 4px 12px;
  }
</style>
