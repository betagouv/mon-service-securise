<script lang="ts">
  import type { MesuresAssocieesARisque, Risque } from '../risquesV2.d';
  import CartoucheIdentifiantRisque from '../kit/CartoucheIdentifiantRisque.svelte';
  import CartouchesRisqueV2 from '../kit/CartouchesRisqueV2.svelte';
  import { onMount } from 'svelte';
  import TagStatutMesure from '../../ui/TagStatutMesure.svelte';
  import type { ReferentielStatut } from '../../ui/types';
  import { SvelteSet } from 'svelte/reactivity';
  import CartoucheCategorieMesureDSFR from '../../ui/CartoucheCategorieMesureDSFR.svelte';

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

  let risquesReplies = new SvelteSet<string>();
  const basculeRepliRisque = (idRisque: string) => {
    if (risquesReplies.has(idRisque)) risquesReplies.delete(idRisque);
    else risquesReplies.add(idRisque);
  };
</script>

<h6>Mesures associées aux risques</h6>
<div class="tableau-pliable">
  <div class="entete-tableau">
    <span>Identifiant</span>
    <span>Intitulé du risque</span>
    <span>Statut</span>
    <span>Actions</span>
  </div>
  {#each risques as risque (risque.id)}
    {@const avecMesuresVisibles = !risquesReplies.has(risque.id)}
    <div class="ligne-tableau">
      <div class="identifiant">
        <button
          class="identifiant-cliquable"
          onclick={() => basculeRepliRisque(risque.id)}
        >
          <lab-anssi-icone
            class:ferme={!avecMesuresVisibles}
            nom="arrow-up-s-line"
            taille="sm"
          ></lab-anssi-icone>
          <div class:inactif={risque.desactive}>
            <CartoucheIdentifiantRisque {risque} />
          </div>
        </button>
      </div>
      <div class="intitule" class:inactif={risque.desactive}>
        <span>{risque.intitule}</span>
        <CartouchesRisqueV2 {risque} />
      </div>
      <div></div>
      <div></div>
      {#if avecMesuresVisibles}
        {#each risque.mesuresAssociees as idMesure, index (idMesure)}
          {@const mesureAssociee = mesures[idMesure]}
          <div class="ligne-mesure">
            <div class="intitule-mesure" class:inactif={risque.desactive}>
              <span><b>{index === 0 ? 'Mesures associées' : ''}</b></span>
            </div>
            <div class="description-mesure" class:inactif={risque.desactive}>
              <span>{mesureAssociee?.description}</span>
              <div class="tags-mesure" class:inactif={risque.desactive}>
                <dsfr-tag
                  label={mesureAssociee?.indispensable
                    ? 'Indispensable'
                    : 'Recommandée'}
                ></dsfr-tag>
                <dsfr-tag label={mesureAssociee?.referentiel}></dsfr-tag>
                <CartoucheCategorieMesureDSFR
                  categorie={mesureAssociee?.categorie}
                />
              </div>
            </div>
            <div class:inactif={risque.desactive}>
              <TagStatutMesure
                referentielStatuts={statuts}
                statut={mesureAssociee?.statut}
              />
            </div>
            <div>
              <dsfr-button
                label="Voir la mesure"
                kind="secondary"
                size="sm"
                markup="a"
                type={undefined}
                target="blank"
                href="/service/{idService}/mesures?idMesure={idMesure}"
              ></dsfr-button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  h6 {
    color: black;
    font-size: 1.25em;
    line-height: 1.75em;
    font-weight: bold;
    margin: 0;
  }

  .tableau-pliable {
    display: grid;
    grid-template-columns: 1fr 4fr 1fr 1fr;

    .inactif {
      opacity: 0.5;
    }

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

      .identifiant-cliquable {
        width: 100%;
        height: 100%;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        color: #3a3a3a;
        gap: 12px;

        lab-anssi-icone {
          transition: transform 0.1s ease-out;

          &.ferme {
            transform: rotate(180deg);
          }
        }
      }

      .tags-mesure {
        display: flex;
        gap: 8px;
      }

      .intitule,
      .description-mesure {
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
