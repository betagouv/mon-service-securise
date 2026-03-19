<script lang="ts">
  import type { MesuresAssocieesARisque, Risque } from '../risquesV2.d';
  import CartoucheIdentifiantRisque from '../kit/CartoucheIdentifiantRisque.svelte';
  import CartouchesRisqueV2 from '../kit/CartouchesRisqueV2.svelte';
  import { onMount } from 'svelte';
  import TagStatutMesure from '../../ui/TagStatutMesure.svelte';
  import type { ReferentielStatut } from '../../ui/types';

  interface Props {
    risques: Risque[];
    idService: string;
    statuts: ReferentielStatut;
  }

  let { risques, idService, statuts }: Props = $props();

  let mesures: MesuresAssocieesARisque['mesuresGenerales'] = $state({});

  onMount(async () => {
    const resultat = await axios.get<MesuresAssocieesARisque>(
      `/api/service/${idService}/mesures`
    );
    mesures = resultat.data?.mesuresGenerales;
  });
</script>

<div class="tableau-pliable">
  <div class="entete-tableau">
    <span>Identifiant</span>
    <span>Intitulé du risque</span>
    <span>Statut</span>
    <span>Actions</span>
  </div>
  {#each risques as risque (risque.id)}
    <div class="ligne-tableau">
      <div class="identifiant"><CartoucheIdentifiantRisque {risque} /></div>
      <div class="intitule">
        <span>{risque.intitule}</span>
        <CartouchesRisqueV2 {risque} />
      </div>
      <div></div>
      <div></div>
      {#each risque.mesuresAssociees as idMesure, index (idMesure)}
        {@const mesureAssociee = mesures[idMesure]}
        <div class="ligne-mesure">
          <div class="intitule-mesure">
            <span><b>{index === 0 ? 'Mesures associées' : ''}</b></span>
          </div>
          <div><span>{mesureAssociee?.description}</span></div>
          <div>
            <TagStatutMesure
              referentielStatuts={statuts}
              statut={mesureAssociee?.statut}
            />
          </div>
          <div></div>
        </div>
      {/each}
    </div>
  {/each}
</div>

<style lang="scss">
  .tableau-pliable {
    display: grid;
    grid-template-columns: 1fr 4fr 1fr 1fr;

    & > * {
      padding: 8px 16px;
    }

    .entete-tableau {
      border: 1px solid #929292;
      background: #f6f6f6;
    }

    .ligne-tableau {
      border: 1px solid #929292;
      border-top: none;

      .intitule {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .identifiant {
        display: flex;
        align-items: center;
      }
    }

    .entete-tableau,
    .ligne-mesure,
    .ligne-tableau {
      & > * {
        padding: 8px 16px;
      }
      padding: 0px;
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: subgrid;
    }
  }
</style>
