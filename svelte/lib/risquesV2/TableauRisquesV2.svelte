<script lang="ts">
  import Niveau from './kit/Niveau.svelte';
  import TiroirRisqueGeneralV2 from './tiroir/TiroirRisqueGeneralV2.svelte';
  import CartoucheIdentifiantRisque from './kit/CartoucheIdentifiantRisque.svelte';
  import CartouchesRisqueV2 from './kit/CartouchesRisqueV2.svelte';
  import type {
    DonneesRisqueSpecifiqueV2,
    Risque,
    RisqueSpecifiqueV2,
    TousRisques,
  } from './risquesV2.d';
  import { metsAJourRisque } from './risquesV2.api';
  import { tiroirStore } from '../ui/stores/tiroir.store';
  import type { ReferentielStatut } from '../ui/types';
  import TiroirRisqueSpecifiqueV2 from './tiroir/TiroirRisqueSpecifiqueV2.svelte';
  import type {
    ReferentielGravites,
    ReferentielVraisemblances,
  } from '../risques/risques.d';

  interface Props {
    idService?: string;
    risques: TousRisques;
    statuts: ReferentielStatut;
    niveauxGravite: ReferentielGravites;
    niveauxVraisemblance: ReferentielVraisemblances;
    estLectureSeule?: boolean;
  }

  let {
    idService,
    risques,
    statuts,
    niveauxGravite,
    niveauxVraisemblance,
    estLectureSeule = false,
  }: Props = $props();

  type TypeRisque = 'general' | 'specifique';
  let tousLesRisques = $derived([
    ...risques.risques.map((r) => ({ ...r, type: 'general' as TypeRisque })),
    ...risques.risquesSpecifiques.map((r) => ({
      ...r,
      type: 'specifique' as TypeRisque,
      desactive: false,
    })),
  ]);
  const estRisqueGeneral = (
    r:
      | (Risque & { type: TypeRisque })
      | (DonneesRisqueSpecifiqueV2 & { type: TypeRisque })
  ): r is Risque & { type: TypeRisque } => r.type === 'general';

  const metsAJourDesactivationRisque = async (
    risque: Risque,
    desactive: boolean
  ) => {
    if (!idService) return;

    await metsAJourRisque(idService, risque.id, {
      desactive,
      commentaire: risque.commentaire,
    });
    document.body.dispatchEvent(new CustomEvent('risques-v2-modifies'));
  };
</script>

<dsfr-table
  columns={[
    { key: 'id', label: 'Identifiant' },
    { key: 'intitule', label: 'Intitulé du risque' },
    { key: 'gravite', label: 'Gravité' },
    { key: 'vraisemblance', label: 'Vraisemblance' },
    { key: 'actions', label: 'Actions' },
  ]}
  rows={tousLesRisques}
  rich
  multiline
>
  {#each tousLesRisques as donnee, i (donnee.id)}
    {@const { type: _type, desactive: _desactive, ...donneeRisque } = donnee}
    {@const risqueBrut = risques.risquesBruts.find((r) => r.id === donnee.id)}
    <div slot="cell:id:{i}" class="colonne-identifiant colonne">
      {#if estRisqueGeneral(donnee)}
        <CartoucheIdentifiantRisque risque={donnee} />
      {:else}
        <dsfr-badge label="Risque spécifique" type="statut"></dsfr-badge>
      {/if}
    </div>
    {#if estRisqueGeneral(donnee)}
      <div
        slot="cell:intitule:{i}"
        class="colonne-intitule colonne"
        class:inactif={donnee.desactive || estLectureSeule}
      >
        <span>{donnee.intitule}</span>
        <CartouchesRisqueV2 risque={donnee} />
      </div>
    {:else}
      <div
        slot="cell:intitule:{i}"
        class="colonne-intitule colonne"
        class:inactif={estLectureSeule}
      >
        <span>{donnee.intitule}</span>
        <CartouchesRisqueV2 risque={donnee} risqueAjoute />
      </div>
    {/if}
    <div
      slot="cell:gravite:{i}"
      class="colonne-gravite colonne"
      class:inactif={donnee.desactive || estLectureSeule}
    >
      <Niveau niveau={donnee.gravite} desactive={donnee.desactive} />
    </div>
    <div
      slot="cell:vraisemblance:{i}"
      class="colonne-vraisemblance colonne"
      class:inactif={donnee.desactive || estLectureSeule}
    >
      <Niveau niveau={donnee.vraisemblance} desactive={donnee.desactive} />
    </div>
    <div
      slot="cell:actions:{i}"
      class="colonne colonne-actions"
      class:inactif={estLectureSeule}
    >
      {#if estRisqueGeneral(donnee)}
        <dsfr-toggle
          state
          label={donnee.desactive ? 'Désactivé' : 'Activé'}
          hide-label
          id="risque-{donnee.id}-actif"
          checked={!donnee.desactive}
          onvaluechanged={async (e: CustomEvent<boolean>) =>
            await metsAJourDesactivationRisque(donnee, !e.detail)}
        ></dsfr-toggle>
      {/if}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label="Modifier"
        has-icon
        icon="edit-line"
        size="sm"
        kind="tertiary"
        onclick={() => {
          if (!idService) return;
          if (estRisqueGeneral(donnee)) {
            if (!risqueBrut) return;
            const url = new URL(window.location.href);
            url.searchParams.set('id', donnee.id);
            history.replaceState(history.state, '', url.href); //on supprime le paramètre sans recharger la page
            tiroirStore.afficheContenu(TiroirRisqueGeneralV2, {
              idService,
              risque: donnee,
              niveauxGravite,
              statuts,
            });
          } else {
            tiroirStore.afficheContenu(TiroirRisqueSpecifiqueV2, {
              idService,
              niveauxGravite,
              niveauxVraisemblance,
              risque: donneeRisque as RisqueSpecifiqueV2,
            });
          }
        }}
      ></dsfr-button>
    </div>
  {/each}
</dsfr-table>

<style lang="scss">
  .colonne.inactif {
    opacity: 0.5;
  }

  .colonne-identifiant {
    width: 168px;
  }

  .colonne:not(.inactif) .lien-intitule-risque {
    cursor: pointer;

    &:hover span {
      color: var(--bleu-mise-en-avant);
    }
  }

  .colonne-intitule {
    .lien-intitule-risque {
      display: flex;
      flex-direction: column;
      gap: 8px;
      border: none;
      outline: none;
      background: none;
      text-align: left;

      span {
        font-weight: 500;
      }
    }
  }

  .colonne-actions {
    min-width: 132px;
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }
</style>
