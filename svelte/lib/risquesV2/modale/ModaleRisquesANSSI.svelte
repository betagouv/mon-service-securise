<script lang="ts">
  import Modale from '../../ui/Modale.svelte';
  import type {
    Niveau,
    Risque,
    RisqueSpecifiqueV2,
    TousRisques,
  } from '../risquesV2.d';
  import TitreOngletDSFR from '../../ui/TitreOngletDSFR.svelte';
  import type {
    ReferentielCategoriesObjectifsVises,
    ReferentielVecteursRisque,
  } from '../../risques/risques';
  import AccordeonGroupe from '../../ui/AccordeonGroupe.svelte';
  import CartoucheCategorieRisque from '../../ui/CartoucheCategorieRisque.svelte';
  import { mappingNomCategories } from '../kit/kit';
  import CartoucheIdentifiantRisque from '../kit/CartoucheIdentifiantRisque.svelte';
  import CartoucheIdentifiantRisqueSpecifiqueV2 from '../kit/CartoucheIdentifiantRisqueSpecifiqueV2.svelte';
  import { ajouteRisqueSpecifiqueV2 } from '../risquesV2.api';
  import { toasterStore } from '../../ui/stores/toaster.store';

  let elementModale: Modale | undefined;

  interface Props {
    idService: string;
    risques: TousRisques;
    vecteursRisque: ReferentielVecteursRisque;
    categoriesObjectifsVises: ReferentielCategoriesObjectifsVises;
  }

  let { idService, risques, vecteursRisque, categoriesObjectifsVises }: Props =
    $props();

  let idTabActive: number = $state(0);

  const configurationsTabs = [
    {
      id: 'tous',
      label: 'Tous',
    },
    {
      id: 'appliques',
      label: 'Appliqués',
    },
    {
      id: 'non-appliques',
      label: 'Non appliqués',
    },
  ];

  let vecteurObjectifViseVersRisqueApplique = $derived(
    Object.fromEntries(
      Object.entries(vecteursRisque)
        .flatMap(([idVecteur, vecteur]) =>
          Object.keys(vecteur.intitulesObjectifsVises).map((idObjectif) => ({
            idVecteur,
            idObjectif,
          }))
        )
        .map(({ idVecteur, idObjectif }) => [
          idLigne(idVecteur, idObjectif),
          risqueCorrespondantA(idVecteur, idObjectif),
        ])
    )
  );

  const risqueCorrespondantA = (idVecteur: string, idObjectif: string) => {
    const risqueSpecifique = risques.risquesSpecifiques.find(
      (rs) => rs.idModele === idLigne(idVecteur, idObjectif)
    );
    if (risqueSpecifique) {
      return {
        type: 'specifique',
        ...risqueSpecifique,
      };
    }
    const risque = risques.risques.find(
      (r) =>
        r.idVecteur === idVecteur && r.idsObjectifsVises.includes(idObjectif)
    );
    if (risque) {
      return {
        type: 'ANSSI',
        ...risque,
      };
    }
    return undefined;
  };

  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    idTabActive = e.detail.index;
  };

  const idLigne = (idVecteur: string, idObjectif: string): string =>
    `${idVecteur}${idObjectif}`;

  const creeRisqueSpecifiqueCorrespondant = async (
    idVecteur: string,
    idObjectif: string
  ) => {
    const vecteur = vecteursRisque[idVecteur];
    const intitule = `${vecteur.intitule} ${vecteur.intitulesObjectifsVises[idObjectif]}`;
    await ajouteRisqueSpecifiqueV2(idService, {
      categories: categoriesObjectifsVises[idObjectif],
      intitule,
      gravite: 0 as Niveau,
      graviteBrute: 0 as Niveau,
      vraisemblance: 0 as Niveau,
      vraisemblanceBrute: 0 as Niveau,
      idModele: idLigne(idVecteur, idObjectif),
    });
    toasterStore.succes('Succès', `Le risque ${intitule} a été ajouté.`);
    document.body.dispatchEvent(new CustomEvent('risques-v2-modifies'));
  };

  export const affiche = () => {
    elementModale?.affiche();
  };
</script>

<Modale id="modale-risques-anssi" bind:this={elementModale}>
  {#snippet contenu()}
    <h4>
      <lab-anssi-icone nom="arrow-right-line" taille="lg"></lab-anssi-icone> Liste
      des risques ANSSI
    </h4>
    <div class="contenu-modale">
      <p>
        L'ensemble des risques usuels, décliné pour chaque combinaison de
        vecteur d'attaque et d'objectif visé. Les risques non appliqués peuvent
        être ajoutés à votre service en tant que risques spécifiques.
      </p>

      <dsfr-alert
        has-description
        text="Le moteur de risques n'intègre pas les risques ajoutés depuis cette liste. Leur gravité et leur vraisemblance sont à renseigner et à mettre à jour par vos soins."
        type="info"
        size="md"
      ></dsfr-alert>

      <dsfr-tabs
        tabs={configurationsTabs}
        activeTabIndex={idTabActive}
        ontabchanged={gereChangementTab}
      >
        <div slot="tab-1">
          <TitreOngletDSFR
            active={idTabActive === 0}
            libelle={configurationsTabs[0].label}
            libellePastille="5"
          />
        </div>
        <div slot="panel-1">
          {#each Object.keys(vecteursRisque) as idVecteur (idVecteur)}
            {@const vecteur = vecteursRisque[idVecteur]}
            <AccordeonGroupe
              libelle={vecteur.intitule}
              ouvert
              nombreElements={Object.keys(vecteur.intitulesObjectifsVises)
                .length}
            >
              <div class="contenu-accordeon">
                {#each Object.entries(vecteur.intitulesObjectifsVises) as [idObjectif, objectif] (idObjectif)}
                  <div class="contenu-objectif">
                    <div>{vecteur.intitule} {objectif}</div>
                    <div class="risque-correspondant">
                      {#if vecteurObjectifViseVersRisqueApplique[idLigne(idVecteur, idObjectif)]}
                        {@const risqueApplique =
                          vecteurObjectifViseVersRisqueApplique[
                            idLigne(idVecteur, idObjectif)
                          ]}
                        {#if risqueApplique!.type === 'ANSSI'}
                          <CartoucheIdentifiantRisque
                            risque={risqueApplique! as Risque}
                          />
                        {:else}
                          <CartoucheIdentifiantRisqueSpecifiqueV2
                            risque={risqueApplique! as RisqueSpecifiqueV2}
                          />
                        {/if}
                      {:else}
                        <!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
                        <dsfr-button
                          kind="secondary"
                          label="Ajouter"
                          has-icon
                          icon-place="left"
                          icon="add-line"
                          onclick={async () =>
                            creeRisqueSpecifiqueCorrespondant(
                              idVecteur,
                              idObjectif
                            )}
                        ></dsfr-button>
                      {/if}
                    </div>
                    <div class="badges">
                      {#each categoriesObjectifsVises[idObjectif] as categorie (categorie)}
                        <CartoucheCategorieRisque
                          libelleCategorie={mappingNomCategories[categorie]}
                        />
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
              <div></div>
            </AccordeonGroupe>
          {/each}
        </div>
      </dsfr-tabs>
    </div>
  {/snippet}
  {#snippet actions()}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Annuler"
      kind="primary"
      size="md"
      onclick={() => elementModale?.ferme()}
    ></dsfr-button>
  {/snippet}
</Modale>

<style lang="scss">
  :global(#modale-risques-anssi) {
    max-width: 792px;
    max-height: 800px;
    width: calc(100% - 48px);
  }

  .contenu-accordeon {
    margin-top: 2rem;
    border: 1px solid #929292;
    border-top: none;
    margin-bottom: 64px;

    .contenu-objectif {
      padding: 8px 16px;
      display: grid;
      grid-template-columns: auto 196px;
      gap: 8px;
      align-items: center;

      .risque-correspondant {
        grid-column: 2;
        grid-row-start: 1;
        grid-row-end: 3;
      }

      .badges {
        display: flex;
        gap: 8px;
      }

      &:not(:last-child) {
        border-bottom: 1px solid #929292;
      }
    }
  }

  h4 {
    margin: 0 0 16px;
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: bold;
  }

  .contenu-modale {
    display: flex;
    flex-direction: column;
    gap: 24px;
    margin-bottom: 24px;

    p {
      margin: 0;
      color: #3a3a3a;
      font-size: 1.125rem;
      font-weight: 400;
      line-height: 1.75rem;
    }
  }
</style>
