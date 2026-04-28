<script lang="ts">
  import { untrack } from 'svelte';
  import type {
    AvisHomologation,
    Dossier,
  } from '../../homologuer/homologuer.types';
  import * as api from '../parcoursHomologation.api';
  import Explication from '../kit/Explication.svelte';
  import CarteFormulaire from '../../../../ui/CarteFormulaire.svelte';
  import type {
    EcheancesRenouvellementHomologation,
    StatutsAvisDossierHomologation,
  } from '../../../pagesService.d';
  import TextareaDSFR from '../../../../ui/TextareaDSFR.svelte';

  interface Props {
    idService: string;
    dossier: Dossier;
    statutsAvisDossierHomologation: StatutsAvisDossierHomologation;
    echeancesRenouvellement: EcheancesRenouvellementHomologation;
    estLectureSeule: boolean;
  }

  let {
    idService,
    dossier,
    statutsAvisDossierHomologation,
    echeancesRenouvellement,
    estLectureSeule,
  }: Props = $props();

  const commandeAvis = {
    avisVide: () => ({
      collaborateurs: [],
      collaborateursString: '',
      commentaires: '',
      dureeValidite: '',
      statut: '',
    }),
    supprime: (index: number) => {
      avis.splice(index, 1);
      avecAvis = avis.length > 0;
    },
    ajouteUnVide: () => {
      avis.push(commandeAvis.avisVide());
    },
    updateAvecAvis: (e: { detail: boolean }) => {
      avecAvis = e.detail;
      if (!avecAvis) avis = [];
      else avis.push(commandeAvis.avisVide());
    },
    update: (unAvis: AvisHomologation) => ({
      statut: (e: { detail: string }) => {
        unAvis.statut = e.detail;
      },
      dureeValidite: (e: { detail: string }) => {
        unAvis.dureeValidite = e.detail;
      },
    }),
    collaborateurs: () => ({
      versString: (collaborateurs: string[]) => collaborateurs.join('\n'),
      versArray: (collaborateurs: string) => collaborateurs.split('\n'),
    }),
  };

  type AvisHomologationPourSaisie = AvisHomologation & {
    collaborateursString: string;
  };

  let avecAvis = $state(untrack(() => dossier.avecAvis ?? false));
  let avis: AvisHomologationPourSaisie[] = $state(
    untrack(() =>
      dossier.avis?.map((a) => ({
        ...a,
        collaborateursString: commandeAvis
          .collaborateurs()
          .versString(a.collaborateurs),
      }))
    )
  );

  export const enregistre = async () => {
    const pourEnregistrement = avis
      .map((a) => ({
        ...a,
        collaborateurs: commandeAvis
          .collaborateurs()
          .versArray(a.collaborateursString),
      }))
      .map(({ collaborateursString: _, ...donnees }) => donnees);

    await api.enregistrement(idService).avis(avecAvis, pourEnregistrement);
  };
</script>

<Explication>
  Renseignez, si vous le souhaitez, un ou plusieurs avis sur la sécurité du
  service pour aider l'autorité d'homologation à prendre sa décision. Nous vous
  recommandons au moins un avis groupé.
</Explication>

<dsfr-radios-group
  onvaluechanged={commandeAvis.updateAvecAvis}
  radios={[
    { label: 'Aucun avis à renseigner', id: 'aucun', value: false },
    {
      label: 'Renseigner un ou plusieurs avis',
      id: 'un-ou-plusieurs',
      value: true,
    },
  ]}
  status="default"
  value={avecAvis}
  disabled={estLectureSeule}
></dsfr-radios-group>

{#if avecAvis}
  <div class="les-avis">
    {#each avis as unAvis, index (index)}
      <CarteFormulaire
        titre={`Avis n°${index + 1}`}
        {...estLectureSeule
          ? {}
          : { onsupprimer: () => commandeAvis.supprime(index) }}
      >
        <TextareaDSFR
          label="Collaborateurs métier et techniques renseignant l'avis"
          hint="Un collaborateur par ligne"
          rows={3}
          bind:value={unAvis.collaborateursString}
          disabled={estLectureSeule}
        />
        <dsfr-radios-group
          legend="Avis sur l'homologation du service"
          id="avis"
          onvaluechanged={commandeAvis.update(unAvis).statut}
          radios={Object.entries(statutsAvisDossierHomologation).map(
            ([cle, valeur]) => ({
              id: cle,
              label: valeur.description,
              value: cle,
            })
          )}
          value={unAvis.statut}
          disabled={estLectureSeule}
        ></dsfr-radios-group>

        <dsfr-radios-group
          legend="Durée proposée de validité de l'homologation"
          id="duree"
          onvaluechanged={commandeAvis.update(unAvis).dureeValidite}
          radios={Object.entries(echeancesRenouvellement).map(
            ([cle, valeur]) => ({
              id: cle,
              label: valeur.description,
              value: cle,
            })
          )}
          value={unAvis.dureeValidite}
          disabled={estLectureSeule}
        ></dsfr-radios-group>

        <TextareaDSFR
          label="Commentaires et recommandations"
          rows={6}
          bind:value={unAvis.commentaires}
          disabled={estLectureSeule}
        ></TextareaDSFR>
      </CarteFormulaire>
    {/each}
  </div>
  {#if !estLectureSeule}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      class="ajouter-avis"
      label="Ajouter un avis"
      kind="tertiary"
      has-icon
      icon-place="left"
      icon="add-line"
      type="button"
      onclick={commandeAvis.ajouteUnVide}
    ></dsfr-button>
  {/if}
{/if}

<style lang="scss">
  .les-avis {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .ajouter-avis {
    margin-top: 2rem;
  }
</style>
