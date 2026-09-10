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
  import CartoucheIdentifiantRisqueSpecifiqueV2 from './kit/CartoucheIdentifiantRisqueSpecifiqueV2.svelte';
  import { ciblage, cibleDeVisiteGuidee } from '../visiteGuideeSPA/ciblage';
  import { singulierPluriel } from '../outils/string';
  import Bouton from '../ui/Bouton.svelte';

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

  function ouvreTiroirRisqueGeneral(
    risque: Risque,
    ongletActif: 'infos' | 'mesuresAssociees' = 'infos'
  ) {
    const url = new URL(window.location.href);
    url.searchParams.set('id', risque.id);
    history.replaceState(history.state, '', url.href);
    tiroirStore.afficheContenu(TiroirRisqueGeneralV2, {
      idService: idService!,
      risque: risque,
      niveauxGravite,
      statuts,
      estLectureSeule,
      ongletActif,
    });
  }
</script>

<dsfr-table
  columns={[
    { key: 'id', label: 'Identifiant' },
    { key: 'intitule', label: 'Intitulé du risque' },
    { key: 'gravite', label: 'Gravité' },
    { key: 'vraisemblance', label: 'Vraisemblance' },
    { key: 'mesuresAssociees', label: 'Mesures associées' },
    { key: 'actions', label: 'Actions' },
  ]}
  rows={tousLesRisques}
  rich
  multiline
>
  {#each tousLesRisques as donnee, i (donnee.id)}
    {@const { type: _type, desactive: _desactive, ...donneeRisque } = donnee}
    {@const risqueBrut = risques.risquesBruts.find((r) => r.id === donnee.id)}
    <div
      slot="cell:id:{i}"
      class="colonne-identifiant colonne"
      class:inactif={donnee.desactive}
      class:avec-risques-specifiques={risques.risquesSpecifiques.length}
      {@attach cibleDeVisiteGuidee(ciblage().securiser().ligneRisque(i).id())}
    >
      {#if estRisqueGeneral(donnee)}
        <CartoucheIdentifiantRisque risque={donnee} />
      {:else}
        <CartoucheIdentifiantRisqueSpecifiqueV2 risque={donnee} />
      {/if}
    </div>
    {#if estRisqueGeneral(donnee)}
      <div
        slot="cell:intitule:{i}"
        class="colonne-intitule colonne"
        class:inactif={donnee.desactive}
      >
        <span>{donnee.intitule}</span>
        <CartouchesRisqueV2 risque={donnee} />
      </div>
    {:else}
      <div slot="cell:intitule:{i}" class="colonne-intitule colonne">
        <span>{donnee.intitule}</span>
        <CartouchesRisqueV2 risque={donnee} risqueAjoute />
      </div>
    {/if}
    <div
      slot="cell:gravite:{i}"
      class="colonne-gravite colonne"
      class:inactif={donnee.desactive}
    >
      <Niveau niveau={donnee.gravite} desactive={donnee.desactive} />
    </div>
    <div
      slot="cell:vraisemblance:{i}"
      class="colonne-vraisemblance colonne"
      class:inactif={donnee.desactive}
    >
      <Niveau niveau={donnee.vraisemblance} desactive={donnee.desactive} />
    </div>
    <div
      slot="cell:mesuresAssociees:{i}"
      class="colonne-mesures-associees colonne"
      class:inactif={donnee.desactive}
    >
      {#if risqueBrut}
        <Bouton
          type="lien-dsfr"
          taille="petit"
          actif={!donnee.desactive}
          titre={singulierPluriel(
            `${risqueBrut?.mesuresAssociees.length} mesure associée`,
            `${risqueBrut?.mesuresAssociees.length} mesures associées`,
            risqueBrut?.mesuresAssociees.length
          )}
          onclick={() =>
            ouvreTiroirRisqueGeneral(risqueBrut, 'mesuresAssociees')}
        ></Bouton>
      {/if}
    </div>
    <div
      slot="cell:actions:{i}"
      class="colonne colonne-actions"
      {@attach cibleDeVisiteGuidee(ciblage().securiser().ligneRisque(i).id())}
    >
      {#if estRisqueGeneral(donnee)}
        <dsfr-toggle
          state
          label={donnee.desactive ? 'Désactivé' : 'Activé'}
          hide-label
          id="risque-{donnee.id}-actif"
          disabled={estLectureSeule}
          checked={!donnee.desactive}
          onvaluechanged={async (e: CustomEvent<boolean>) =>
            await metsAJourDesactivationRisque(donnee, !e.detail)}
        ></dsfr-toggle>
      {/if}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <dsfr-button
        label={estLectureSeule ? 'Voir le risque' : 'Modifier'}
        has-icon
        icon="edit-line"
        size="sm"
        kind="tertiary"
        onclick={() => {
          if (!idService) return;
          if (estRisqueGeneral(donnee)) {
            if (!risqueBrut) return;
            ouvreTiroirRisqueGeneral(donnee);
          } else {
            tiroirStore.afficheContenu(TiroirRisqueSpecifiqueV2, {
              idService,
              niveauxGravite,
              niveauxVraisemblance,
              risque: donneeRisque as RisqueSpecifiqueV2,
              estLectureSeule,
            });
          }
        }}
      ></dsfr-button>
    </div>
  {/each}
</dsfr-table>

<style lang="scss">
  .colonne.inactif {
    opacity: 0.65;
  }

  .colonne-identifiant {
    width: 168px;

    &.avec-risques-specifiques {
      width: 190px;
    }
  }

  .colonne-intitule {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .colonne-actions {
    min-width: 132px;
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }

  dsfr-button {
    white-space: nowrap;
  }
</style>
