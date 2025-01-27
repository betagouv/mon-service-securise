<script lang="ts">
  import { decode } from 'html-entities';
  import EtiquetteIndiceCyber from './elementsDeService/EtiquetteIndiceCyber.svelte';
  import EtiquetteHomologation from './elementsDeService/EtiquetteHomologation.svelte';
  import EtiquetteContributeurs from './elementsDeService/EtiquetteContributeurs.svelte';
  import IconeChargementEnCours from '../ui/IconeChargementEnCours.svelte';
  import EtiquetteProprietaire from './elementsDeService/EtiquetteProprietaire.svelte';
  import ActionRecommandee from './elementsDeService/ActionRecommandee.svelte';
  import { resultatsDeRecherche } from './stores/resultatDeRecherche.store';
  import ActionsDesServices from './ActionsDesServices.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirGestionContributeurs from '../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import {
    affichageParStatutHomologation,
    affichageParStatutHomologationSelectionne,
    resultatsDeRechercheDuStatutHomologationSelectionne,
  } from './stores/affichageParStatutHomologation';
  import { selectionIdsServices } from './stores/selectionService.store';
  import { affichageTableauVide } from './stores/affichageTableauVide';
  import Onglet from '../ui/Onglet.svelte';
  import TableauVide from './TableauVide.svelte';
  import EtiquetteCompletude from './elementsDeService/EtiquetteCompletude.svelte';
  import Lien from '../ui/Lien.svelte';

  $: selection = $resultatsDeRecherche.filter((service) =>
    $selectionIdsServices.includes(service.id)
  );

  $: toutEstCoche = selection.length === $resultatsDeRecherche.length;
  const basculeSelectionTousServices = () => {
    if (toutEstCoche) $selectionIdsServices = [];
    else
      $selectionIdsServices = $resultatsDeRecherche.map(
        (service) => service.id
      );
  };

  $: $resultatsDeRecherche, selectionIdsServices.vide();

  $: $selectionIdsServices, tiroirStore.ferme();

  const supprimeRechercheEtFiltres = () => {
    $rechercheTextuelle = '';
  };

  const libellesNiveauSecurite = {
    niveau1: 'Élémentaires',
    niveau2: 'Modérés',
    niveau3: 'Importants',
  };
</script>

<table>
  <thead>
    <tr class="ligne-onglet">
      <th colspan="8">
        <div class="conteneur-onglet">
          <Onglet
            bind:ongletActif={$affichageParStatutHomologationSelectionne}
            cetOnglet="tous"
            labelOnglet="Tous les services"
            badge={$affichageParStatutHomologation.tous.length}
          />
          <Onglet
            bind:ongletActif={$affichageParStatutHomologationSelectionne}
            cetOnglet="enCoursEdition"
            labelOnglet="Homologation en cours"
            badge={$affichageParStatutHomologation.enCoursEdition.length}
          />
          <Onglet
            bind:ongletActif={$affichageParStatutHomologationSelectionne}
            cetOnglet="bientotExpiree"
            labelOnglet="Homologation bientôt expirée"
            badge={$affichageParStatutHomologation.bientotExpiree.length}
          />
          <Onglet
            bind:ongletActif={$affichageParStatutHomologationSelectionne}
            cetOnglet="expiree"
            labelOnglet="Homologation expirée"
            badge={$affichageParStatutHomologation.expiree.length}
          />
        </div>
      </th>
    </tr>
    {#if !$affichageTableauVide.doitAfficher}
      <tr id="ligne-entete-action">
        <td colspan="8" class="case-conteneur-action">
          <ActionsDesServices {selection} />
        </td>
      </tr>
      <tr id="ligne-entete-tableau">
        <td class="cellule-selection" id="selection-toutes-lignes">
          <input
            type="checkbox"
            on:change={basculeSelectionTousServices}
            checked={toutEstCoche}
            indeterminate={!toutEstCoche && selection.length > 0}
            title="Sélection de tous les services"
          />
        </td>
        <th>Nom du service</th>
        <th>Contributeurs</th>
        <th>Besoins de sécurité</th>
        <th>Complétion</th>
        <th>Indice cyber</th>
        <th>Homologation</th>
        <th>Actions recommandées</th>
      </tr>
    {/if}
  </thead>
  {#if $affichageTableauVide.doitAfficher}
    <TableauVide />
  {:else}
    <tbody class="contenu-tableau-services">
      {#each $resultatsDeRechercheDuStatutHomologationSelectionne as service (service.id)}
        {@const idService = service.id}
        {@const indiceCyberDuService = service.indiceCyber}
        <tr
          class="ligne-service"
          data-id-service={idService}
          class:selectionnee={$selectionIdsServices.includes(idService)}
        >
          <td class="cellule-selection">
            <input
              class="selection-service"
              type="checkbox"
              bind:group={$selectionIdsServices}
              value={idService}
              title="Sélection du service {service.nomService}"
            />
          </td>
          <td class="cellule-noms">
            <a
              class="lien-service"
              href="/service/{idService}"
              title="Ouvrir la page du service"
            >
              <span class="denomination-service">
                {#if service.estProprietaire}
                  <EtiquetteProprietaire />
                {/if}
                <span class="nom-service">{decode(service.nomService)}</span>
                <span class="nom-organisation"
                  >{decode(service.organisationResponsable)}</span
                >
              </span>
              <div class="icone-voir-service">
                <img
                  src="/statique/assets/images/tableauDeBord/icone_ouvrir_agrandir.svg"
                  alt="Ouvrir la page du service"
                />
                <span>Ouvrir</span>
              </div>
            </a>
          </td>
          <td>
            <EtiquetteContributeurs
              nombreContributeurs={service.nombreContributeurs}
              on:click={() =>
                tiroirStore.afficheContenu(TiroirGestionContributeurs, {
                  services: [service],
                })}
            />
          </td>
          <td>
            <Lien
              titre={libellesNiveauSecurite[service.niveauSecurite]}
              href="/service/{service.id}/descriptionService?etape=3"
              type="lien"
              taille="petit"
            />
          </td>
          <td>
            <EtiquetteCompletude
              pourcentageCompletude={service.pourcentageCompletude}
            />
          </td>
          <td>
            {#if indiceCyberDuService !== undefined}
              <EtiquetteIndiceCyber score={indiceCyberDuService} {idService} />
            {:else}
              <IconeChargementEnCours />
            {/if}
          </td>
          <td>
            {#if service.statutHomologation}
              <EtiquetteHomologation
                statutHomologation={service.statutHomologation.id}
                label={service.statutHomologation.libelle}
                dateExpiration={service.statutHomologation.dateExpiration}
                {idService}
              />
            {/if}
          </td>
          <td>
            {#if service.actionRecommandee}
              <ActionRecommandee action={service.actionRecommandee} {service} />
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  {/if}
</table>

<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }

  thead {
    position: sticky;
    top: 83px;
    background-color: white;
    z-index: 1;
  }

  #ligne-entete-tableau,
  #ligne-entete-action {
    box-shadow: inset 0 -1px #ddd;
    border-top: none;
    border-bottom: none;
  }

  table tr {
    border: 1px solid #ddd;
  }

  table td,
  table th {
    padding: 8px 16px;
  }

  table th {
    font-size: 14px;
    font-weight: 700;
    line-height: 24px;
    white-space: nowrap;
  }

  table td:first-of-type {
    border-right: 1px solid #ddd;
  }

  .ligne-service:hover {
    background-color: #f5f5f5;
  }

  .ligne-service:has(a:active) {
    background-color: #eee;
  }

  table tr.ligne-service.selectionnee td {
    border-top: 1px solid var(--bleu-mise-en-avant);
    border-bottom: 1px solid var(--bleu-mise-en-avant);
  }

  table tr.ligne-service.selectionnee td:first-of-type {
    border-left: 1px solid var(--bleu-mise-en-avant);
  }

  table tr.ligne-service.selectionnee td:last-of-type {
    border-right: 1px solid var(--bleu-mise-en-avant);
  }

  .lien-service {
    display: flex;
    gap: 4px;
    justify-content: space-between;
  }

  .icone-voir-service img {
    width: 16px;
  }

  .icone-voir-service {
    color: var(--bleu-mise-en-avant);
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    pointer-events: none;
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
    padding: 2px;
  }

  .cellule-noms {
    max-width: 340px;
    min-width: 340px;
  }

  .cellule-noms:not(:hover) .icone-voir-service {
    display: none;
  }

  .denomination-service {
    overflow: hidden;
  }

  .denomination-service {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    font-weight: 700;
    line-height: 24px;
    color: var(--texte-fonce);
  }

  .nom-service,
  .nom-organisation {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .nom-organisation {
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
  }

  .lien-service:hover .nom-service {
    color: var(--bleu-mise-en-avant);
  }

  input[type='checkbox'] {
    appearance: none;
    border-radius: 4px;
    border: 1px solid #042794;
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
    transform: none;
  }

  input[type='checkbox']:checked,
  input[type='checkbox']:indeterminate {
    background: var(--bleu-mise-en-avant);
    border-color: var(--bleu-mise-en-avant);
  }

  input[type='checkbox']:checked::before {
    content: '';
    width: 4px;
    height: 8px;
    border-right: 1.5px solid white;
    border-bottom: 1.5px solid white;
    display: block;
    transform: translate(4px, 1px) rotate(45deg);
    margin: 0;
  }

  input[type='checkbox']:focus-visible {
    outline: 2px solid var(--bleu-mise-en-avant);
    outline-offset: 2px;
  }

  input[type='checkbox']:indeterminate::before {
    content: '';
    height: 8px;
    border-bottom: 1.5px solid white;
    display: block;
    transform: translate(4px, -1.5px) rotate(0);
    border-right: 0;
    width: 6px;
  }

  .case-conteneur-action {
    padding: 0;
  }

  .cellule-selection {
    text-align: center;
  }

  .ligne-onglet {
    border: none;
    box-shadow: inset 0 -1px #ddd;
  }

  .ligne-onglet th {
    padding: 0;
  }

  .conteneur-onglet {
    margin: 0 0 0 -0.5px;
    display: flex;
    flex-direction: row;
    gap: 8px;
  }

  tbody tr:first-of-type,
  tbody tr:first-of-type td {
    border-top: none;
  }
</style>
