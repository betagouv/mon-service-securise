<script lang="ts">
  import CartoucheIdentifiantRisque from '../kit/CartoucheIdentifiantRisque.svelte';
  import CartoucheCategorieRisque from '../../ui/CartoucheCategorieRisque.svelte';
  import CartoucheIdentifiantRisqueSpecifiqueV2 from '../kit/CartoucheIdentifiantRisqueSpecifiqueV2.svelte';
  import {
    idLigne,
    type Niveau,
    type Risque,
    type RisqueApplique,
    type RisqueSpecifiqueV2,
  } from '../risquesV2.d';
  import type {
    ReferentielCategoriesObjectifsVises,
    ReferentielVecteursRisque,
  } from '../../risques/risques';
  import { ajouteRisqueSpecifiqueV2 } from '../risquesV2.api';
  import { mappingNomCategories } from '../kit/kit';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import AccordeonGroupe from '../../ui/AccordeonGroupe.svelte';

  interface Props {
    idService: string;
    etat: 'tous' | 'appliques' | 'nonAppliques';
    vecteursRisque: ReferentielVecteursRisque;
    categoriesObjectifsVises: ReferentielCategoriesObjectifsVises;
    idVecteur: string;
    idLigneVersRisqueApplique: Record<string, RisqueApplique>;
  }

  let {
    idService,
    etat,
    vecteursRisque,
    categoriesObjectifsVises,
    idVecteur,
    idLigneVersRisqueApplique,
  }: Props = $props();

  let vecteur = $derived(vecteursRisque[idVecteur]);

  const creeRisqueSpecifiqueCorrespondant = async (
    idVecteur: string,
    idObjectif: string
  ) => {
    const vecteur = vecteursRisque[idVecteur];
    const intitule = `${vecteur.intitule} ${vecteur.intitulesObjectifsVises[idObjectif]}`;
    const { identifiantNumerique } = await ajouteRisqueSpecifiqueV2(idService, {
      categories: categoriesObjectifsVises[idObjectif],
      intitule,
      gravite: 0 as Niveau,
      graviteBrute: 0 as Niveau,
      vraisemblance: 0 as Niveau,
      vraisemblanceBrute: 0 as Niveau,
      idModele: idLigne(idVecteur, idObjectif),
    });
    toasterStore.succes(
      `Risque spécifique ${identifiantNumerique} ajouté à votre service`,
      `Renseignez sa gravité et sa vraisemblance : le moteur de risques ne les calcule pas.`
    );
    document.body.dispatchEvent(new CustomEvent('risques-v2-modifies'));
  };

  let doitAfficherAccordeon = $derived(
    etat === 'tous' ||
      (etat === 'appliques' &&
        Object.values(idLigneVersRisqueApplique).some(
          (risqueApplique) => !!risqueApplique
        )) ||
      (etat === 'nonAppliques' &&
        Object.values(idLigneVersRisqueApplique).some(
          (risqueApplique) => !risqueApplique
        ))
  );

  let libellePastille = $derived.by(() => {
    let nombreAppliques = Object.values(idLigneVersRisqueApplique).filter(
      (r) => !!r
    ).length;
    let nombreTotal = Object.values(idLigneVersRisqueApplique).length;
    switch (etat) {
      case 'tous':
        return `${nombreAppliques} sur ${nombreTotal} appliqués`;
      case 'appliques':
        return nombreAppliques.toString();
      case 'nonAppliques':
        return (nombreTotal - nombreAppliques).toString();
    }
  });
</script>

{#if doitAfficherAccordeon}
  <AccordeonGroupe libelle={vecteur.intitule} ouvert {libellePastille}>
    <div class="contenu-accordeon">
      {#each Object.entries(vecteur.intitulesObjectifsVises) as [idObjectif, objectif] (idObjectif)}
        {@const risqueApplique =
          idLigneVersRisqueApplique[idLigne(idVecteur, idObjectif)]}
        {#if etat === 'tous' || (etat === 'appliques' && !!risqueApplique) || (etat === 'nonAppliques' && !risqueApplique)}
          <div class="contenu-objectif">
            <div>{vecteur.intitule} {objectif}</div>
            <div class="risque-correspondant">
              {#if risqueApplique}
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
                  size="sm"
                  onclick={async () =>
                    creeRisqueSpecifiqueCorrespondant(idVecteur, idObjectif)}
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
        {/if}
      {/each}
    </div>
  </AccordeonGroupe>
{/if}

<style lang="scss">
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
</style>
