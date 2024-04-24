<script lang="ts">
  import type { ConfigurationIndicateurEtape } from '../visiteGuidee.d';

  export let configuration: ConfigurationIndicateurEtape;
  export let etapeCourante: string;
</script>

<ul>
  {#each configuration.etapes as etape}
    <li id="etape-{etape.id}" class:active={etape.id === etapeCourante}>
      <img src={etape.icone} alt="" width="20" height="20" />
      <span>{etape.titre}</span>
    </li>
  {/each}
</ul>

<style>
  ul {
    list-style: none;
    padding-left: 0;
  }

  ul li {
    font-weight: 500;
    padding-bottom: 16px;
    display: flex;
    flex-direction: row;
    align-items: start;
    gap: 8px;
    color: var(--liseres-fonce);
  }

  ul li img {
    filter: brightness(0) invert(83%) sepia(4%) saturate(776%)
      hue-rotate(178deg) brightness(111%) contrast(76%);
  }

  .active {
    color: var(--texte-fonce);
  }

  ul li.active img {
    filter: brightness(0) invert(45%) sepia(53%) saturate(7500%)
      hue-rotate(187deg) brightness(91%) contrast(101%);
  }
</style>
