<script lang="ts">
  import Tableau from '../ui/Tableau.svelte';
  import Niveau from './kit/Niveau.svelte';
  import Switch from '../ui/Switch.svelte';
  import TiroirRisqueGeneralV2 from './tiroir/TiroirRisqueGeneralV2.svelte';
  import CartoucheIdentifiantRisque from './kit/CartoucheIdentifiantRisque.svelte';
  import CartouchesRisqueV2 from './kit/CartouchesRisqueV2.svelte';
  import type { Risque, TousRisques } from './risquesV2.d';
  import type { DonneesRisqueSpecifiqueV2 } from './risquesV2.d';
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

<Tableau
  colonnes={[
    { cle: 'id', libelle: 'Identifiant' },
    { cle: 'intitule', libelle: 'Intitulé du risque' },
    { cle: 'gravite', libelle: 'Gravité' },
    { cle: 'vraisemblance', libelle: 'Vraisemblance' },
    { cle: 'actions', libelle: 'Actions' },
  ]}
  donnees={tousLesRisques}
>
  {#snippet cellule({ donnee, colonne })}
    {#if colonne.cle === 'id'}
      <div
        class="colonne-identifiant colonne"
        class:inactif={donnee.desactive || estLectureSeule}
      >
        {#if estRisqueGeneral(donnee)}
          <CartoucheIdentifiantRisque risque={donnee} />
        {:else}
          <dsfr-badge label="Risque spécifique" type="statut"></dsfr-badge>
        {/if}
      </div>
    {:else if colonne.cle === 'intitule'}
      {#if estRisqueGeneral(donnee)}
        {@const risqueBrut = risques.risquesBruts.find(
          (r) => r.id === donnee.id
        )}
        <div
          class="colonne-intitule colonne"
          class:inactif={donnee.desactive || estLectureSeule}
        >
          <button
            class="lien-intitule-risque"
            disabled={donnee.desactive}
            onclick={() => {
              if (!idService || !risqueBrut) return;
              tiroirStore.afficheContenu(TiroirRisqueGeneralV2, {
                idService,
                risque: donnee,
                risqueBrut,
                statuts,
              });
            }}
          >
            <span>{donnee.intitule}</span>
            <CartouchesRisqueV2 risque={donnee} />
          </button>
        </div>
      {:else}
        {@const {
          type: _type,
          desactive: _desactive,
          ...donneeRisque
        } = donnee}
        <div class="colonne-intitule colonne" class:inactif={estLectureSeule}>
          <button
            class="lien-intitule-risque"
            onclick={() => {
              if (!idService) return;
              tiroirStore.afficheContenu(TiroirRisqueSpecifiqueV2, {
                idService,
                niveauxGravite,
                niveauxVraisemblance,
                risque: donneeRisque,
              });
            }}
          >
            <span>{donnee.intitule}</span>
            <CartouchesRisqueV2 risque={donnee} risqueAjoute />
          </button>
        </div>
      {/if}
    {:else if colonne.cle === 'gravite'}
      <div
        class="colonne-gravite colonne"
        class:inactif={donnee.desactive || estLectureSeule}
      >
        <Niveau niveau={donnee.gravite} />
      </div>
    {:else if colonne.cle === 'vraisemblance'}
      <div
        class="colonne-vraisemblance colonne"
        class:inactif={donnee.desactive || estLectureSeule}
      >
        <Niveau niveau={donnee.vraisemblance} />
      </div>
    {:else if colonne.cle === 'actions'}
      {#if estRisqueGeneral(donnee)}
        <div class="colonne colonne-actions" class:inactif={estLectureSeule}>
          <Switch
            bind:actif={
              () => !donnee.desactive, (valeur) => (donnee.desactive = !valeur)
            }
            id="risque-{donnee.id}-actif"
            onChange={async (actif) =>
              await metsAJourDesactivationRisque(donnee, !actif)}
          />
        </div>
      {/if}
    {/if}
  {/snippet}
</Tableau>

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
  }
</style>
