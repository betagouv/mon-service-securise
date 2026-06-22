<script lang="ts">
  import EtiquetteIndiceCyber from './elementsDeService/EtiquetteIndiceCyber.svelte';
  import EtiquetteHomologation from './elementsDeService/EtiquetteHomologation.svelte';
  import EtiquetteContributeurs from './elementsDeService/EtiquetteContributeurs.svelte';
  import IconeChargementEnCours from '../ui/IconeChargementEnCours.svelte';
  import EtiquetteProprietaire from './elementsDeService/EtiquetteProprietaire.svelte';
  import ActionRecommandee from './elementsDeService/ActionRecommandee.svelte';
  import { resultatsDeRecherche } from './stores/resultatDeRecherche.store';
  import ActionsDesServices, {
    type TypeSelection,
  } from './ActionsDesServices.svelte';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import TiroirGestionContributeurs from '../ui/tiroirs/TiroirGestionContributeurs.svelte';
  import { resultatsDeRechercheDuStatutHomologationSelectionne } from './stores/affichageParStatutHomologation';
  import { selectionIdsServices } from './stores/selectionService.store';
  import { affichageTableauVide } from './stores/affichageTableauVide';
  import TableauVide from './TableauVide.svelte';
  import EtiquetteCompletude from './elementsDeService/EtiquetteCompletude.svelte';
  import Lien from '../ui/Lien.svelte';
  import { referentielNiveauxSecurite } from '../ui/referentielNiveauxSecurite';
  import { resultatsDeRechercheBrouillons } from './stores/resultatDeRechercheBrouillons.store';
  import { singulierPluriel } from '../outils/string';

  let selection = $derived([
    ...$resultatsDeRecherche
      .filter((service) => $selectionIdsServices.includes(service.id))
      .map((s) => ({ ...s, type: 'Service' as TypeSelection })),
    ...$resultatsDeRechercheBrouillons
      .filter((brouillon) => $selectionIdsServices.includes(brouillon.id))
      .map((b) => ({ ...b, type: 'Brouillon' as TypeSelection })),
  ]);

  $effect(() => {
    if ($resultatsDeRecherche) selectionIdsServices.vide();
  });

  $effect(() => {
    if ($selectionIdsServices) tiroirStore.ferme();
  });

  interface Props {
    indicesCyberCharges?: boolean;
  }

  let { indicesCyberCharges = false }: Props = $props();
</script>

{#if $affichageTableauVide.doitAfficher}
  <TableauVide />
{:else}
  <div class="barre-actions">
    <span class="sous-texte">
      {#if $selectionIdsServices.length > 0}
        {$selectionIdsServices.length}
        {singulierPluriel(
          'ligne sélectionnée',
          'lignes sélectionnées',
          $selectionIdsServices.length
        )}
      {/if}
    </span>
    <ActionsDesServices {selection} />
  </div>
  <dsfr-table
    columns={[
      { key: 'nom', label: 'Nom du service' },
      { key: 'contributeurs', label: 'Contributeurs' },
      { key: 'besoinsSecurite', label: 'Besoins de sécurité' },
      { key: 'completion', label: 'Complétion' },
      { key: 'indiceCyber', label: 'Indice cyber' },
      { key: 'homologation', label: 'Homologation' },
      { key: 'actionsRecommandees', label: 'Actions recommandées' },
    ]}
    rows={[
      ...$resultatsDeRechercheBrouillons,
      ...$resultatsDeRechercheDuStatutHomologationSelectionne,
    ]}
    row-key="id"
    selectable
    rich
    select-all
    selected-row-keys={JSON.stringify($selectionIdsServices)}
    onselectionchanged={(
      e: CustomEvent<{ keys: string[]; rows: Record<string, unknown>[] }>
    ) => {
      $selectionIdsServices = e.detail.keys;
    }}
  >
    {#each $resultatsDeRechercheBrouillons as brouillon, i (brouillon.id)}
      <div slot="cell:nom:{i}" class="cellule-noms">
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
      </div>
      <div slot="cell:contributeurs:{i}">-</div>
      <div slot="cell:besoinsSecurite:{i}">-</div>
      <div slot="cell:completion:{i}">-</div>
      <div slot="cell:indiceCyber:{i}">-</div>
      <div slot="cell:homologation:{i}">-</div>
      <div slot="cell:actionsRecommandees:{i}">
        <Lien
          titre="Continuer la création"
          type="bouton-secondaire"
          href="/service/v2/creation?id={brouillon.id}"
          taille="petit"
          icone="brouillon"
          classe="continuerCreationV2"
        />
      </div>
    {/each}
    {#each $resultatsDeRechercheDuStatutHomologationSelectionne as service, i (service.id)}
      {@const idService = service.id}
      {@const indiceCyberDuService = service.indiceCyber}
      {@const index = i + $resultatsDeRechercheBrouillons.length}
      <div slot="cell:nom:{index}" class="cellule-noms">
        <a
          class="lien-service"
          href="/service/{idService}"
          title="Ouvrir la page du service"
        >
          <span class="denomination-service">
            {#if service.estAdmin}
              <dsfr-badge
                label="Admin"
                type="accent"
                accent="blue-cumulus"
                size="sm"
              ></dsfr-badge>
            {:else if service.estProprietaire}
              <EtiquetteProprietaire />
            {/if}
            <span class="nom-service">{service.nomService}</span>
            <span class="nom-organisation">
              {service.organisationResponsable}
            </span>
          </span>
          <div class="icone-voir-service">
            <img
              src="/statique/assets/images/tableauDeBord/icone_ouvrir_agrandir.svg"
              alt="Ouvrir la page du service"
            />
            <span>Ouvrir</span>
          </div>
        </a>
      </div>
      <div slot="cell:contributeurs:{index}">
        <EtiquetteContributeurs
          nombreContributeurs={service.nombreContributeurs}
          onclick={() =>
            tiroirStore.afficheContenu(TiroirGestionContributeurs, {
              services: [service],
            })}
        />
      </div>
      <div slot="cell:besoinsSecurite:{index}">
        {#if service.niveauSecurite}
          <Lien
            classe="lien-niveau-securite"
            titre={referentielNiveauxSecurite[service.niveauSecurite]}
            href="/service/{idService}/descriptionService?etape=3"
            type="lien"
            taille="petit"
          />
        {/if}
      </div>
      <div slot="cell:completion:{index}">
        {#if service.pourcentageCompletude !== undefined}
          <EtiquetteCompletude
            {idService}
            pourcentageCompletude={service.pourcentageCompletude}
          />
        {/if}
      </div>
      <div slot="cell:indiceCyber:{index}">
        {#if indiceCyberDuService !== undefined}
          <EtiquetteIndiceCyber score={indiceCyberDuService} {idService} />
        {:else if !indicesCyberCharges}
          <IconeChargementEnCours />
        {/if}
      </div>
      <div slot="cell:homologation:{index}">
        {#if service.statutHomologation}
          <EtiquetteHomologation
            statutHomologation={service.statutHomologation.id}
            label={service.statutHomologation.libelle}
            dateExpiration={service.statutHomologation.dateExpiration}
            {idService}
          />
        {/if}
      </div>
      <div slot="cell:actionsRecommandees:{index}">
        {#if service.actionRecommandee}
          <ActionRecommandee action={service.actionRecommandee} {service} />
        {/if}
      </div>
    {/each}
  </dsfr-table>
{/if}

<style>
  .barre-actions {
    margin-bottom: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .sous-texte {
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: #666666;
    white-space: nowrap;
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
    gap: 8px;
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
    align-items: end;
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
</style>
