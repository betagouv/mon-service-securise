<script lang="ts">
  export let nombreServices: number;
  export let nombreServicesHomologues: number;
</script>

<div class="bandeau-cartes-info">
  <div class="carte-info" id="carte-info-nombre-services">
    <span class="contenu-carte">
      <span class="libelle-carte">
        <span class="metrique">{nombreServices}</span> Services enregistrés</span
      >
    </span>
  </div>
  <div class="carte-info" id="carte-info-nombre-services-homologues">
    <span class="contenu-carte">
      <span class="libelle-carte">
        <span class="metrique">{nombreServicesHomologues}</span> Services homologués</span
      >
    </span>
  </div>
</div>

<style>
  .bandeau-cartes-info {
    display: flex;
    gap: 12px;
  }

  .carte-info {
    gap: 32px;
    padding: 32px;
    border-radius: 10px;
    box-sizing: border-box;
    border: 1px;
    width: 280px;
    height: 140px;
  }

  .contenu-carte::before {
    content: '';
    display: block;
    width: 64px;
    height: 64px;
    background-size: contain;
  }

  #carte-info-nombre-services-homologues .contenu-carte::before {
    background: url('/statique/assets/images/tableauDeBord/icone_nombre_services_homologues.svg')
      no-repeat center;
  }

  #carte-info-nombre-services .contenu-carte::before {
    background: url('/statique/assets/images/tableauDeBord/icone_nombre_services.svg')
      no-repeat center;
  }

  #carte-info-nombre-services {
    background-color: #e9ddff;
  }

  #carte-info-nombre-services-homologues {
    background-color: #defbe5;
  }

  .contenu-carte {
    display: flex;
    gap: 32px;
  }

  .libelle-carte {
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .metrique {
    font-size: 1.25rem;
    font-weight: bold;
    line-height: 1.75rem;
  }
</style>
