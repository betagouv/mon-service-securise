<script lang="ts">
  import type { Dossier } from '../homologuer.types';
  import BadgeStatutHomologation from './BadgeStatutHomologation.svelte';
  import Infobulle from '../../../../ui/Infobulle.svelte';
  import { tiroirStore } from '../../../../ui/stores/tiroir.store';
  import TiroirTelechargementDocumentsService from '../../../../ui/tiroirs/TiroirTelechargementDocumentsService.svelte';

  interface Props {
    idService: string;
    dossier: Dossier;
    statutsHomologation: Record<string, { libelle: string }>;
    avecDocumentsAccessible?: boolean;
    avecTamponAccessible?: boolean;
    avecStatutHomologation?: boolean;
    documentsPdfDisponibles?: string[];
    peutSupprimer?: boolean;
  }

  let {
    idService,
    dossier,
    statutsHomologation,
    avecDocumentsAccessible = false,
    avecTamponAccessible = false,
    avecStatutHomologation = false,
    documentsPdfDisponibles = [],
    peutSupprimer = false,
  }: Props = $props();

  const noteIndiceCyber = (indiceCyber: number) => {
    return `${indiceCyber.toFixed(1)}/5`;
  };

  const formatteDateFrancaise = (dateStr: string) =>
    Intl.DateTimeFormat('fr-FR').format(new Date(dateStr));

  const texteTronque = (texte: string, tailleLimite: number) =>
    texte.length > tailleLimite
      ? texte.substring(0, tailleLimite) + '…'
      : texte;
</script>

<div class="carte">
  {#if avecStatutHomologation}
    <BadgeStatutHomologation
      {statutsHomologation}
      statutHomologation={dossier.statut}
      dateExpiration={dossier.descriptionProchaineDateHomologation}
    />
  {/if}
  <h4>
    {#if dossier.statut === 'nonRealisee'}
      Projet d'homologation
    {:else}
      Décision d'homologation du {formatteDateFrancaise(
        dossier.decision.dateHomologation
      )}
      {#if dossier.importe}
        <Infobulle
          contenu="Vous n'avez pas utilisé MonServiceSécurisé pour l'homologation de ce service, ainsi il ne dispose pas d'Indice Cyber, de tampon d'homologation ni de documents associés."
        />
      {/if}
    {/if}
  </h4>
  <div>
    {#if dossier.statut !== 'nonRealisee'}
      <p>
        Autorité d'homologation : {texteTronque(dossier.autorite.nom, 37)} | {texteTronque(
          dossier.autorite.fonction,
          37
        )}
      </p>
      <p>Date d'échéance : {dossier.descriptionProchaineDateHomologation}</p>
    {:else}
      <p>
        Étape {dossier.etapeCourante.numeroEtape} sur {dossier.etapeCourante
          .numeroDerniereEtape}
      </p>
      <p></p>
    {/if}
  </div>
  {#if !dossier.importe}
    {#if dossier.indiceCyber !== undefined || dossier.indiceCyberPersonnalise !== undefined}
      <div class="indices-cyber">
        {#if dossier.indiceCyber !== undefined}
          <dsfr-badge
            label="Indice cyber ANSSI {noteIndiceCyber(dossier.indiceCyber)}"
            type="accent"
            accent="blue-cumulus"
            size="md"
          ></dsfr-badge>
        {/if}

        {#if dossier.indiceCyberPersonnalise !== undefined}
          <dsfr-badge
            label="Indice cyber personnalisé {noteIndiceCyber(
              dossier.indiceCyberPersonnalise
            )}"
            type="accent"
            accent="green-archipel"
            size="md"
          ></dsfr-badge>
        {/if}
      </div>
    {/if}
  {:else}
    <div class="indices-cyber">
      <dsfr-badge
        label="Homologation importée"
        type="status"
        status="info"
        size="md"
      ></dsfr-badge>
      <dsfr-badge
        label="Aucun Indice cyber"
        type="status"
        status="warning"
        size="md"
      ></dsfr-badge>
    </div>
  {/if}
  {#if dossier.statut === 'nonRealisee' || (avecDocumentsAccessible && !dossier.importe) || avecTamponAccessible}
    <div class="actions">
      {#if dossier.statut === 'nonRealisee'}
        <dsfr-button
          label="Reprendre l'homologation"
          kind="secondary"
          size="md"
          icon="edit-box-line"
          icon-place="left"
          markup="a"
          href="/service/{idService}/homologation/edition/etape/{dossier
            .etapeCourante.nomEtape}"
          type="button"
          has-icon
        ></dsfr-button>
      {/if}
      {#if avecDocumentsAccessible && !dossier.importe}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          label="Accéder aux documents"
          kind="tertiary"
          size="md"
          icon="file-line"
          icon-place="left"
          markup="button"
          type="button"
          has-icon
          onclick={() =>
            tiroirStore.afficheContenu(TiroirTelechargementDocumentsService, {
              service: { id: idService, documentsPdfDisponibles },
            })}
        ></dsfr-button>
      {/if}
      {#if dossier.statut === 'nonRealisee' && peutSupprimer}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          label="Supprimer le projet d'homologation"
          kind="tertiary"
          size="md"
          icon="delete-line"
          icon-place="left"
          markup="button"
          type="button"
          has-icon
          onclick={() =>
            document.body.dispatchEvent(
              new CustomEvent('affiche-tiroir-suppression-dossier-courant')
            )}
        ></dsfr-button>
      {/if}
      {#if avecTamponAccessible}
        <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
        <dsfr-button
          label="Télécharger l'encart d'homologation"
          kind="tertiary"
          size="md"
          icon="download-line"
          icon-place="left"
          markup="button"
          type="button"
          has-icon
          onclick={() =>
            document.body.dispatchEvent(
              new CustomEvent('svelte-affiche-tiroir-telechargement-tampon')
            )}
        ></dsfr-button>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .carte {
    border: 1px solid #ddd;
    display: flex;
    padding: 40px;
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;

    p,
    h4 {
      margin: 0;
      padding: 0;
    }

    p {
      font-size: 1rem;
      line-height: 1.5rem;
      color: #3a3a3a;
    }

    h4 {
      font-size: 1.5rem;
      line-height: 2rem;
      font-weight: bold;
      color: #161616;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .actions {
      display: flex;
      gap: 16px;
      margin-top: 8px;

      dsfr-button {
        white-space: nowrap;
      }
    }

    .indices-cyber {
      display: flex;
      gap: 8px;
    }
  }
</style>
