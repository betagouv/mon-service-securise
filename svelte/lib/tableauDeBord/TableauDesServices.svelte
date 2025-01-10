<script lang="ts">
  import { decode } from 'html-entities';
  import EtiquetteIndiceCyber from './elementsDeService/EtiquetteIndiceCyber.svelte';
  import EtiquetteHomologation from './elementsDeService/EtiquetteHomologation.svelte';
  import EtiquetteContributeurs from './elementsDeService/EtiquetteContributeurs.svelte';
  import IconeChargementEnCours from '../ui/IconeChargementEnCours.svelte';
  import EtiquetteProprietaire from './elementsDeService/EtiquetteProprietaire.svelte';
  import ActionRecommandee from './elementsDeService/ActionRecommandee.svelte';
  import type { IndiceCyber } from './tableauDeBord.d';
  import { resultatsDeRecherche } from './stores/resultatDeRecherche.store';
  import { services } from './stores/services.store';
  import ActionsDesServices from './ActionsDesServices.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirGestionContributeurs from '../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import Bouton from '../ui/Bouton.svelte';
  import { rechercheTextuelle } from './stores/rechercheTextuelle.store';
  import { selectionIdsServices } from './stores/selectionService.store';
  import Lien from '../ui/Lien.svelte';

  export let indicesCybers: IndiceCyber[] = [];

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
</script>

<table>
  {#if $services.length === 0}
    <div class="aucun-service">
      <h4>Laissez vous guider !</h4>
      <p>
        Nous vous accompagnons sur toutes les étapes de sécurisation de votre
        service numérique.
      </p>
      <Lien
        titre="Ajouter votre premier service"
        type="bouton-primaire"
        icone="plus"
        href="/service/creation"
      />
    </div>
  {:else if $resultatsDeRecherche.length === 0}
    <div class="aucun-resultat">
      <img
        src="/statique/assets/images/illustration_recherche_vide.svg"
        alt=""
      />
      Aucun service ne correspond à la recherche.
      <Bouton
        titre="Effacer la recherche"
        type="secondaire"
        icone="rafraichir"
        on:click={supprimeRechercheEtFiltres}
      />
    </div>
  {:else}
    <thead>
      <tr>
        <td colspan="6" class="case-conteneur-action">
          <ActionsDesServices {selection} />
        </td>
      </tr>
      <tr>
        <td>
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
        <th>Indice cyber</th>
        <th>Homologation</th>
        <th>Actions recommandées</th>
      </tr>
    </thead>
    <tbody class="contenu-tableau-services">
      {#each $resultatsDeRecherche as service (service.id)}
        {@const idService = service.id}
        {@const indiceCyberDuService = indicesCybers.find(
          (i) => i.id === idService
        )?.indiceCyber}
        <tr class="ligne-service">
          <td>
            <input
              class="selection-service"
              type="checkbox"
              bind:group={$selectionIdsServices}
              value={idService}
              title="Sélection du service {service.nomService}"
            />
          </td>
          <td class="cellule-noms">
            <a class="lien-service" href="/service/{idService}">
              {#if service.estProprietaire}
                <EtiquetteProprietaire />
              {/if}
              <span class="nom-service">{decode(service.nomService)}</span>
              <span class="nom-organisation"
                >{decode(service.organisationResponsable)}</span
              >
            </a>
          </td>
          <td>
            <EtiquetteContributeurs
              nombreContributeurs={service.nombreContributeurs}
              on:click={() =>
                tiroirStore.afficheContenu(
                  TiroirGestionContributeurs,
                  { services: [service] },
                  {
                    titre: 'Gérer les contributeurs',
                    sousTitre:
                      'Gérer la liste des personnes invitées à contribuer au service.',
                  }
                )}
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
            <EtiquetteHomologation
              statutHomologation={service.statutHomologation.id}
              label={service.statutHomologation.libelle}
              {idService}
            />
          </td>
          <td>
            <ActionRecommandee action={service.actionRecommandee} {idService} />
          </td>
        </tr>
      {/each}
    </tbody>
  {/if}
</table>

<style>
  table {
    border-collapse: collapse;
    border: 1px solid #ddd;
    width: 100%;
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
  }

  table td:first-of-type {
    border-right: 1px solid #ddd;
  }

  .lien-service {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    font-weight: 700;
    line-height: 24px;
    color: var(--texte-fonce);
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

  .aucun-resultat {
    padding: 36px 0;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-direction: column;
    color: var(--texte-clair);
  }

  .aucun-resultat img {
    max-width: 128px;
  }

  .aucun-service {
    margin: 59px auto 47px;
    text-align: center;
    align-items: center;
    display: flex;
    gap: 8px;
    width: 389px;
    flex-direction: column;
  }

  .aucun-service h4 {
    margin: 0;
    padding: 0;
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: bold;
  }

  .aucun-service p {
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: var(--texte-gris);
    margin: 0 0 8px;
  }
</style>
