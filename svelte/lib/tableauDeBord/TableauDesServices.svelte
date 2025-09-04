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
  import { referentielNiveauxSecurite } from '../ui/referentielNiveauxSecurite';
  import { brouillonsService } from './stores/brouillonsService.store';

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

  export let indicesCyberCharges: boolean = false;
</script>

<table>
  {#if !$affichageTableauVide.doitAfficher}
    <colgroup>
      <col class="selection-service" />
      <col class="nom-service" />
      <col class="contributeurs" />
      <col class="besoins-securite" />
      <col class="completion" />
      <col class="indice-cyber" />
      <col class="homologation" />
      <col class="actions-recommandees" />
    </colgroup>
  {/if}
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
        <th class="cellule-selection" id="selection-toutes-lignes" scope="row">
          <input
            type="checkbox"
            on:change={basculeSelectionTousServices}
            checked={toutEstCoche}
            indeterminate={!toutEstCoche && selection.length > 0}
            title="Sélection de tous les services"
          />
        </th>
        <th>Nom du service</th>
        <th>Contributeurs</th>
        <th>Besoins de sécurité</th>
        <th>Complétion</th>
        <th>Indice&nbsp;cyber</th>
        <th>Homologation</th>
        <th>Actions recommandées</th>
      </tr>
    {/if}
  </thead>
  {#if $affichageTableauVide.doitAfficher}
    <TableauVide />
  {:else}
    <tbody class="contenu-tableau-services">
      {#each $brouillonsService as brouillon (brouillon.id)}
        <tr class="ligne-service brouillon" data-id-brouillon={brouillon.id}>
          <th class="cellule-selection" scope="row"></th>
          <td class="cellule-noms">
            <a
              class="lien-service"
              href="/service/v2/creation?id={brouillon.id}"
              title="Ouvrir le brouillon"
            >
              <span class="denomination-service">
                <span class="indicateur-brouillon">Brouillon en cours</span>
                <span class="nom-service">{brouillon.nomService}</span>
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
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>
            <lab-anssi-lien
              titre="Continuer la création"
              cible=""
              apparence="bouton"
              variante="secondaire"
              taille="sm"
              icone="draft-line"
              positionIcone="gauche"
              actif
              href="/service/v2/creation?id={brouillon.id}"
            />
          </td>
        </tr>
      {/each}
      {#each $resultatsDeRechercheDuStatutHomologationSelectionne as service (service.id)}
        {@const idService = service.id}
        {@const indiceCyberDuService = service.indiceCyber}
        <tr
          class="ligne-service"
          data-id-service={idService}
          class:selectionnee={$selectionIdsServices.includes(idService)}
        >
          <th class="cellule-selection" scope="row">
            <input
              class="selection-service"
              type="checkbox"
              bind:group={$selectionIdsServices}
              value={idService}
              title="Sélection du service {service.nomService}"
            />
          </th>
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
            {#if service.niveauSecurite}
              <Lien
                classe="lien-niveau-securite"
                titre={referentielNiveauxSecurite[service.niveauSecurite]}
                href="/service/{idService}/descriptionService?etape=3"
                type="lien"
                taille="petit"
              />
            {/if}
          </td>
          <td>
            {#if service.pourcentageCompletude !== undefined}
              <EtiquetteCompletude
                {idService}
                pourcentageCompletude={service.pourcentageCompletude}
              />
            {/if}
          </td>
          <td>
            {#if indiceCyberDuService !== undefined}
              <EtiquetteIndiceCyber score={indiceCyberDuService} {idService} />
            {:else if !indicesCyberCharges}
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
    z-index: 3;
    -webkit-box-shadow: 5px 0 0 0 #ffffff;
    box-shadow: 5px 0 0 0 #ffffff;
  }

  #ligne-entete-tableau,
  #ligne-entete-action {
    position: relative;
  }

  #ligne-entete-tableau:after,
  #ligne-entete-action:after {
    content: '';
    background-image: linear-gradient(0deg, #ddd, #ddd),
      linear-gradient(0deg, #ddd, #ddd), linear-gradient(0deg, #ddd, #ddd),
      linear-gradient(0deg, #ddd, #ddd);
    background-position:
      0 0,
      100% 0,
      0 0,
      0 100%;
    background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
    background-size:
      1px 100%,
      1px 100%,
      100% 1px,
      0 0;
    height: 100%;
    left: 0;
    pointer-events: none;
    position: absolute;
    width: 100%;
    z-index: 2;
  }

  #ligne-entete-tableau::after {
    background-size:
      1px 100%,
      1px 100%,
      100% 1px,
      100% 1px;
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

  .ligne-service td {
    background-image: linear-gradient(0deg, #ddd, #ddd),
      linear-gradient(0deg, #ddd, #ddd);
    background-position: 100% 100%;
    background-repeat: no-repeat;
    background-size: 100% 1px;
  }

  .ligne-service th,
  #ligne-entete-tableau th:first-of-type {
    background-image: linear-gradient(0deg, #ddd, #ddd),
      linear-gradient(0deg, #ddd, #ddd);
    background-position:
      0 100%,
      100% 0;
    background-repeat: no-repeat, no-repeat;
    background-size:
      100% 1px,
      1px 100%;
  }

  table:after {
    background-position:
      0 0,
      0 0,
      100% 100%,
      0 100%;
    background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
    background-size:
      100% 1px,
      1px 100%,
      1px 100%,
      100% 1px;
    content: '';
    display: block;
    height: 100%;
    left: 0;
    pointer-events: none;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
    background-image: linear-gradient(0deg, #ddd, #ddd),
      linear-gradient(0deg, #ddd, #ddd), linear-gradient(0deg, #ddd, #ddd),
      linear-gradient(0deg, #ddd, #ddd);
  }

  table {
    position: relative;
  }

  .ligne-service:hover {
    background-color: #fafbfc;
  }

  .ligne-service:has(a:active) {
    background-color: #eee;
  }

  table tr.ligne-service {
    position: relative;
  }

  table tr.ligne-service::after {
    background-image: linear-gradient(
        0deg,
        var(--bleu-mise-en-avant),
        var(--bleu-mise-en-avant)
      ),
      linear-gradient(
        0deg,
        var(--bleu-mise-en-avant),
        var(--bleu-mise-en-avant)
      ),
      linear-gradient(
        0deg,
        var(--bleu-mise-en-avant),
        var(--bleu-mise-en-avant)
      ),
      linear-gradient(
        0deg,
        var(--bleu-mise-en-avant),
        var(--bleu-mise-en-avant)
      );
    background-position:
      0 0,
      100% 0,
      0 0,
      0 100%;
    background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
    background-size:
      2px 100%,
      2px 100%,
      100% 2px,
      0 0;
    height: 100%;
    left: 0;
    pointer-events: none;
    position: absolute;
    transform: translateY(-2px);
    width: 100%;
    z-index: 2;
  }

  table tr.ligne-service.selectionnee + tr.ligne-service.selectionnee::after {
    background-size:
      2px 100%,
      2px 100%,
      0 0,
      0 0;
  }

  table tr.ligne-service.selectionnee + tr::after,
  table tr.ligne-service.selectionnee::after {
    content: '';
  }

  table
    tr.ligne-service.selectionnee
    + tr.ligne-service:not(.selectionnee)::after {
    background-size:
      0 0,
      0 0,
      100% 2px,
      0 0;
  }

  table tr.ligne-service:first-of-type.selectionnee::after {
    background-size:
      2px 100%,
      2px 100%,
      100% 4px,
      0 0;
  }

  table tr.ligne-service:last-of-type.selectionnee::after {
    border-bottom: 2px solid var(--bleu-mise-en-avant);
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

  .indicateur-brouillon {
    font-style: italic;
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.25rem;
    color: #3a3a3a;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .indicateur-brouillon:before {
    content: url('/statique/assets/images/icone_brouillon.svg');
    display: flex;
    width: 12px;
    height: 12px;
    padding: 6px;
  }

  .nom-service,
  .nom-organisation {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .nom-organisation {
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: 18px;
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
    position: relative;
    transform: translateY(1px);
    z-index: 3;
  }

  .ligne-onglet:after {
    background-image: linear-gradient(0deg, white, white),
      linear-gradient(0deg, white, white), linear-gradient(0deg, white, white),
      linear-gradient(0deg, white, white);
    background-position:
      0 0,
      100% 0,
      0 0,
      0 100%;
    background-repeat: no-repeat, no-repeat, no-repeat, no-repeat;
    background-size:
      0 0,
      2px 100%,
      0 0,
      0 0;
    height: 100%;
    left: 0;
    pointer-events: none;
    position: absolute;
    transform: translateY(-2px);
    width: 100%;
    z-index: 2;
    content: '';
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

  col.selection-service {
    width: 3.8%;
  }

  col.nom-service {
    width: 23.8%;
  }

  col.contributeurs {
    width: 10.3%;
  }

  col.besoins-securite {
    width: 13%;
  }

  col.completion {
    width: 9.1%;
  }

  col.indice-cyber {
    width: 8.3%;
  }

  col.homologation {
    width: 13%;
  }

  col.actions-recommandees {
    width: 18.7%;
  }

  @media screen and (max-width: 1280px) {
    table thead th {
      padding: 8px;
    }

    .cellule-noms {
      max-width: 280px;
      min-width: 280px;
    }
  }
</style>
