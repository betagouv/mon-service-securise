<script lang="ts">
  import type { MesuresAssocieesARisque, Niveau, Risque } from '../risquesV2.d';
  import BadgesTiroirRisqueV2 from './BadgesTiroirRisqueV2.svelte';
  import { onMount, untrack } from 'svelte';
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import Onglets from '../../ui/Onglets.svelte';
  import { mappingNiveauVraisemblance } from '../kit/kit';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import { metsAJourRisque } from '../risquesV2.api';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import TagStatutMesure from '../../ui/TagStatutMesure.svelte';
  import type { ReferentielStatut } from '../../ui/types';
  import type { ReferentielGravites } from '../../risques/risques.d';

  interface Props {
    idService: string;
    risque: Risque;
    statuts: ReferentielStatut;
    niveauxGravite: ReferentielGravites;
    estLectureSeule: boolean;
  }

  let { idService, risque, statuts, niveauxGravite, estLectureSeule }: Props =
    $props();

  export const titre = untrack(() => risque.intitule);
  export const sousTitre = '';
  export const composantEntete = BadgesTiroirRisqueV2;
  export const propsComposantEntete = untrack(() => ({ risque }));

  let ongletActif: 'infos' | 'mesuresAssociees' = $state('infos');

  let commentaire = $state(untrack(() => risque.commentaire));
  let gravite = $state(untrack(() => risque.gravite));

  let niveauxGraviteSelectionnables = $derived(
    Object.entries(niveauxGravite)
      .map(([, { description, position }]) => ({
        value: position,
        label: `${position} - ${description}`,
      }))
      .filter(({ value }) => value > 0)
  );

  const metsAJourCommentaire = (e: CustomEvent<string>) => {
    commentaire = e.detail;
  };

  const metsAJourGravite = (e: CustomEvent<string>) => {
    gravite = parseInt(e.detail) as Niveau;
  };

  let actif = $state(untrack(() => !risque.desactive));

  const metsAJour = async () => {
    await metsAJourRisque(idService, risque.id, {
      desactive: !actif,
      commentaire,
      ...(gravite !== risque.graviteCalculee ? { gravite } : {}),
    });
    document.body.dispatchEvent(new CustomEvent('risques-v2-modifies'));
    toasterStore.succes('Succès', `Le risque ${risque.id} a été mis à jour.`);
    tiroirStore.ferme();
  };

  let mesures: MesuresAssocieesARisque['mesuresGenerales'] | undefined =
    $state();

  onMount(async () => {
    const resultat = await axios.get<MesuresAssocieesARisque>(
      `/api/service/${idService}/mesures`
    );
    mesures = resultat.data?.mesuresGenerales;
  });

  let mesuresAssociesParThematique = $derived.by(() => {
    if (!mesures) return {};
    const mesuresAssocies = risque.mesuresAssociees.map((id) => ({
      ...mesures![id],
      id,
    }));
    return Object.groupBy(mesuresAssocies, (m) => m.thematique);
  });
</script>

<ContenuTiroir>
  <div class="conteneur-onglets">
    <Onglets
      bind:ongletActif
      onglets={[
        {
          id: 'infos',
          label: 'Information sur le risque',
        },
        {
          id: 'mesuresAssociees',
          label: 'Mesures associées',
        },
      ]}
    />
  </div>
  <div class="contenu-onglet">
    {#if ongletActif === 'infos'}
      <div>
        <p>
          <b>Description du risque</b>
          <span>{@html risque.description}</span>
        </p>
        <p>
          <b>Exemple d'attaque</b>
          <span>{@html risque.exemple}</span>
        </p>

        <div class="niveaux-risque">
          <span><b>Risque actuel</b></span>
          <div class="ligne-niveau-risque">
            <dsfr-select
              label="Vraisemblance"
              id="vraisemblance"
              value={risque.vraisemblance}
              options={[
                {
                  value: risque.vraisemblance,
                  label: `${risque.vraisemblance} - ${mappingNiveauVraisemblance[risque.vraisemblance]}`,
                },
              ]}
              required
              disabled
            ></dsfr-select>
            <dsfr-select
              label="Gravité"
              id="gravite"
              value={gravite}
              options={niveauxGraviteSelectionnables}
              required
              disabled={estLectureSeule}
              onvaluechanged={metsAJourGravite}
            ></dsfr-select>
          </div>
        </div>
        <div>
          <dsfr-input
            type="text"
            id="commentaire"
            label="Commentaire"
            value={commentaire}
            disabled={estLectureSeule}
            hint="Apportez des précisions sur le risque"
            onvaluechanged={metsAJourCommentaire}
            maxlength="1000"
          ></dsfr-input>
        </div>
      </div>
    {:else if ongletActif === 'mesuresAssociees'}
      <div class="contenu-mesures-associees">
        <p class="intitule-mesures-associees">
          Vous trouverez ci-dessous la liste des mesures permettant de réduire
          la vraisemblance de ce risque.
        </p>
        {#each Object.keys(mesuresAssociesParThematique) as thematique, i (i)}
          {@const mesuresDeLaThematique =
            mesuresAssociesParThematique[thematique]}
          {#if mesuresDeLaThematique}
            <div>
              <h3>{thematique}</h3>
              <dsfr-table
                columns={[
                  { key: 'description', label: 'Intitulé de la mesure' },
                  { key: 'statut', label: 'Statut' },
                ]}
                rows={mesuresDeLaThematique}
                rich
              >
                {#each mesuresDeLaThematique as mesureDeLaThematique, index (index)}
                  <div
                    slot="cell:description:{index}"
                    class="description-mesure"
                  >
                    <span>{mesureDeLaThematique.description}</span>
                    <dsfr-link
                      size="sm"
                      label="Voir la mesure"
                      href="/service/{idService}/mesures?idMesure={mesureDeLaThematique.id}"
                    ></dsfr-link>
                  </div>
                  <div slot="cell:statut:{index}">
                    <TagStatutMesure
                      referentielStatuts={statuts}
                      statut={mesureDeLaThematique.statut}
                    />
                  </div>
                {/each}
              </dsfr-table>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</ContenuTiroir>
<ActionsTiroir>
  <div class="actions">
    <dsfr-toggle
      label={actif ? 'Activé' : 'Désactivé'}
      left
      id="risque-{risque.id}-actif"
      disabled={estLectureSeule}
      checked={actif}
      onvaluechanged={async (e: CustomEvent<boolean>) => {
        actif = e.detail;
      }}
    ></dsfr-toggle>
    <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
    <dsfr-button
      label="Enregistrer les modifications"
      disabled={estLectureSeule}
      kind="primary"
      size="md"
      has-icon
      icon="save-line"
      icon-place="left"
      onclick={metsAJour}
    ></dsfr-button>
  </div>
</ActionsTiroir>

<style lang="scss">
  .description-mesure {
    white-space: wrap;
    display: flex;
    flex-direction: column;
  }

  .contenu-mesures-associees {
    display: flex;
    gap: 32px;
  }

  h3 {
    color: #282828;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.5rem;
    margin: 0;
  }

  dsfr-table {
    margin-bottom: -2.5rem;
    margin-top: -1rem;
  }

  .actions {
    display: flex;
    gap: 24px;
    align-items: center;
  }

  .contenu-onglet {
    padding: 32px;
    border: 1px solid #ddd;
    margin-top: -30px;
    border-top: none;

    label {
      margin-bottom: 8px;
      display: block;
    }

    & > div {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    p {
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .niveaux-risque {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .ligne-niveau-risque {
        display: flex;
        gap: 24px;
        & > * {
          flex: 1;
        }
      }
    }
  }

  .conteneur-onglets {
    border-bottom: 1px solid #ddd;
    padding-left: 16px;
  }
</style>
