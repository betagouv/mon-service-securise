<script lang="ts">
  import type {
    ConfigurationIndicateurEtape,
    EtapeVisiteGuidee,
  } from '../visiteGuidee.d';

  export let configuration: ConfigurationIndicateurEtape;
  export let etapeCourante: EtapeVisiteGuidee;
  export let etapesVues: EtapeVisiteGuidee[] = [];
  const premiereEtapeNonVue = configuration.etapes.filter(
    (e) => !etapesVues.includes(e.id)
  )[0];
</script>

<ul>
  {#each configuration.etapes as etape}
    {@const vue = etapesVues.includes(etape.id)}
    {@const active = etape.id === etapeCourante}
    {@const disponible = etape.id === premiereEtapeNonVue.id}
    {@const navigable = vue || active || disponible}
    <li id="etape-{etape.id}" class:active class:vue class:disponible>
      <a href={navigable ? etape.lien : null} on:click>
        <img
          src={vue && !active
            ? '/statique/assets/images/icone_fait.svg'
            : etape.icone}
          alt=""
          width="20"
          height="20"
        />
        <span>{etape.titre}</span>
      </a>
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
    color: var(--liseres-fonce);
  }

  ul li:not(.vue) img {
    filter: brightness(0) invert(83%) sepia(4%) saturate(776%)
      hue-rotate(178deg) brightness(111%) contrast(76%);
  }

  .active {
    color: var(--bleu-mise-en-avant) !important;
  }

  .disponible {
    color: var(--texte-fonce);
  }

  ul li.active img {
    filter: brightness(0) invert(45%) sepia(53%) saturate(7500%)
      hue-rotate(187deg) brightness(91%) contrast(101%) !important;
  }

  ul li.disponible img {
    filter: brightness(0) invert(17%) sepia(19%) saturate(649%)
      hue-rotate(165deg) brightness(96%) contrast(86%);
  }

  .vue {
    color: #0e972b;
  }

  a,
  a:visited,
  a:hover,
  a:active {
    color: inherit;
    text-decoration: none;
    display: flex;
    flex-direction: row;
    align-items: start;
    gap: 8px;
  }
</style>
