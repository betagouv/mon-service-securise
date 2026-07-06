<script lang="ts">
  import ComposantNiveau from './kit/Niveau.svelte';
  import CartouchesRisqueV2 from './kit/CartouchesRisqueV2.svelte';
  import type { DonneesRisqueV1, Niveau, RisquesV1 } from './risquesV2.d';
  import type {
    ReferentielGravites,
    ReferentielVraisemblances,
  } from '../risques/risques.d';

  interface Props {
    risques: RisquesV1;
    niveauxGravite: ReferentielGravites;
    niveauxVraisemblance: ReferentielVraisemblances;
  }

  let { risques, niveauxGravite, niveauxVraisemblance }: Props = $props();

  type TypeRisque = 'general' | 'specifique';
  let tousLesRisques = $derived([
    ...risques.risquesGeneraux.map((r) => ({
      ...r,
      type: 'general' as TypeRisque,
    })),
    ...risques.risquesSpecifiques.map((r) => ({
      ...r,
      type: 'specifique' as TypeRisque,
      desactive: false,
    })),
  ]);

  const graviteDepuisIdentifiant = (
    identifiant: string | undefined
  ): Niveau | undefined => {
    return niveauxGravite[identifiant as keyof ReferentielGravites]?.position;
  };

  const vraisemblanceDepuisIdentifiant = (
    identifiant: string | undefined
  ): Niveau | undefined => {
    return niveauxVraisemblance[identifiant as keyof ReferentielVraisemblances]
      ?.position;
  };

  const estRisqueGeneral = (
    r: DonneesRisqueV1 & { type: TypeRisque }
  ): r is DonneesRisqueV1 & { type: TypeRisque } => r.type === 'general';
</script>

<dsfr-table
  columns={[
    { key: 'id', label: 'Identifiant' },
    { key: 'intitule', label: 'Intitulé du risque' },
    { key: 'gravite', label: 'Gravité' },
    { key: 'vraisemblance', label: 'Vraisemblance' },
    { key: 'actions', label: 'État' },
  ]}
  rows={tousLesRisques}
  rich
  multiline
>
  {#each tousLesRisques as donnee, i (donnee.id)}
    <div slot="cell:id:{i}" class="colonne-identifiant colonne inactif">
      {#if estRisqueGeneral(donnee)}
        <dsfr-badge label={donnee.identifiantNumerique}></dsfr-badge>
      {:else}
        <dsfr-badge label="Risque spécifique" type="statut"></dsfr-badge>
      {/if}
    </div>
    <div slot="cell:intitule:{i}" class="colonne-intitule colonne inactif">
      <span>{donnee.intitule}</span>
      <CartouchesRisqueV2
        risque={donnee}
        risqueAjoute={estRisqueGeneral(donnee) === false}
      />
    </div>
    <div slot="cell:gravite:{i}" class="colonne-gravite colonne inactif">
      <ComposantNiveau
        niveau={graviteDepuisIdentifiant(donnee.niveauGravite)}
        desactive={donnee.desactive}
      />
    </div>
    <div
      slot="cell:vraisemblance:{i}"
      class="colonne-vraisemblance colonne inactif"
    >
      <ComposantNiveau
        niveau={vraisemblanceDepuisIdentifiant(donnee.niveauVraisemblance)}
        desactive={donnee.desactive}
      />
    </div>
    <div slot="cell:actions:{i}" class="colonne colonne-actions inactif">
      {#if estRisqueGeneral(donnee)}
        <dsfr-toggle
          state
          label={donnee.desactive ? 'Désactivé' : 'Activé'}
          hide-label
          id="risque-{donnee.id}-actif"
          disabled
          checked={!donnee.desactive}
        ></dsfr-toggle>
      {/if}
    </div>
  {/each}
</dsfr-table>

<style lang="scss">
  .colonne.inactif {
    opacity: 0.65;
  }

  .colonne-identifiant {
    width: 168px;
  }

  .colonne-actions {
    min-width: 132px;
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }
</style>
