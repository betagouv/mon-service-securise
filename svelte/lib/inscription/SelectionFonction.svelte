<script lang="ts">
  import MenuFlottant from '../ui/MenuFlottant.svelte';

  const fonctions = [
    {
      id: 'RSSI',
      libelle: "Responsable de la sécurité des systèmes d'information",
    },
    {
      id: 'DSI',
      libelle: "Responsable des systèmes d'information",
    },
    {
      id: 'DPO',
      libelle: 'Délégué/e à la protection des données personnelles',
    },
    {
      id: 'autre',
      libelle: 'Autre',
    },
  ];
</script>

<div class="info-label">Fonction / poste occupé :</div>
<MenuFlottant parDessusDeclencheur={true}>
  <div slot="declencheur">
    <button class="bouton bouton-secondaire contenu-declencheur">
      Sélectionner une fonction
    </button>
  </div>
  <div class="fonctions">
    <div class="rappel-declencheur contenu-declencheur">
      Sélectionner une fonction
    </div>
    <div class="options">
      {#each fonctions as fonction}
        <div class="case-et-label">
          <input
            type="checkbox"
            id={fonction.id}
            name={fonction.id}
            value={fonction.id}
          />
          <label for={fonction.id}>{fonction.libelle}</label>
        </div>
      {/each}
    </div>
  </div>
</MenuFlottant>

<style>
  .info-label {
    margin-bottom: 8px;
  }

  .bouton {
    width: 100%;
    border-radius: 6px;
    color: var(--texte-clair);
    border-color: var(--liseres-fonce);
  }

  .bouton::after {
    content: '';
    display: inline-block;

    width: 0.4em;
    height: 0.4em;

    border: 2px #000 solid;
    border-left: 0;
    border-bottom: 0;

    transform: rotate(135deg);
    filter: brightness(0%);
    right: 16px;
    position: absolute;
    top: 14px;
  }

  .rappel-declencheur::after {
    content: '';
    display: inline-block;

    width: 0.4em;
    height: 0.4em;

    border: 2px #000 solid;
    border-left: 0;
    border-bottom: 0;

    transform: rotate(315deg);
    filter: brightness(0%);
    right: 16px;
    position: absolute;
    top: 18px;
  }

  .bouton:hover {
    border-color: var(--bleu-mise-en-avant);
  }

  :global(.declencheur) {
    width: 100%;
  }

  :global(.svelte-menu-flottant.parDessusDeclencheur) {
    width: 100%;
    left: 0;
    transform: translate(0, 0) !important;
  }

  .fonctions {
    border: 1px solid var(--bleu-mise-en-avant);
    background-color: white;
    width: calc(100% - 2px);
    border-radius: 6px;
    color: black;
  }

  .rappel-declencheur {
    border-bottom: 1px solid var(--bleu-mise-en-avant);
    padding-top: 17px;
  }

  .contenu-declencheur {
    padding: 8px 16px;
    margin: 0;
    text-align: left;
    font-size: 16px;
  }

  .options {
    display: flex;
    gap: 16px;
    flex-direction: column;
    padding: 12px 16px 26px;
  }

  input[type='checkbox'] + label {
    margin: 0;
  }
</style>
