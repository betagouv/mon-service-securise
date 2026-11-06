<script lang="ts">
  import Modale from '../../ui/Modale.svelte';
  import { type TousRisques } from '../risquesV2.d';
  import TitreOngletDSFR from '../../ui/TitreOngletDSFR.svelte';
  import type {
    ReferentielCategoriesObjectifsVises,
    ReferentielVecteursRisque,
  } from '../../risques/risques';
  import ContenuOngletListeRisquesANSSI from './ContenuOngletListeRisquesANSSI.svelte';
  import { risquesAppliques } from '../risquesAppliques';

  let elementModale: Modale | undefined;

  interface Props {
    idService: string;
    risques: TousRisques;
    vecteursRisque: ReferentielVecteursRisque;
    categoriesObjectifsVises: ReferentielCategoriesObjectifsVises;
    estLectureSeule: boolean;
  }

  let {
    idService,
    risques,
    vecteursRisque,
    categoriesObjectifsVises,
    estLectureSeule,
  }: Props = $props();

  let idTabActive: number = $state(0);

  const configurationsTabs = [
    { id: 'tous', label: 'Tous' },
    { id: 'appliques', label: 'Appliqués' },
    { id: 'non-appliques', label: 'Non appliqués' },
  ];

  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    idTabActive = e.detail.index;
  };

  let idVecteurVersIdLigneVersRisqueApplique = $derived(
    risquesAppliques(risques, vecteursRisque)
  );

  let nombreToutesLignes = $derived(
    Object.values(idVecteurVersIdLigneVersRisqueApplique).flatMap((v) =>
      Object.keys(v)
    ).length
  );
  let nombreLignesAppliquees = $derived(
    Object.values(idVecteurVersIdLigneVersRisqueApplique).flatMap((ligne) =>
      Object.values(ligne).filter((risqueApplique) => !!risqueApplique)
    ).length
  );

  export const affiche = () => {
    elementModale?.affiche();
  };
</script>

<Modale id="modale-risques-anssi" bind:this={elementModale}>
  {#snippet contenu()}
    <h4>
      <lab-anssi-icone nom="arrow-right-line" taille="lg"></lab-anssi-icone>
      Liste des risques ANSSI
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
            libellePastille={nombreToutesLignes.toString()}
          />
        </div>
        <div slot="tab-2">
          <TitreOngletDSFR
            active={idTabActive === 1}
            libelle={configurationsTabs[1].label}
            libellePastille={nombreLignesAppliquees.toString()}
          />
        </div>
        <div slot="tab-3">
          <TitreOngletDSFR
            active={idTabActive === 2}
            libelle={configurationsTabs[2].label}
            libellePastille={`${nombreToutesLignes - nombreLignesAppliquees}`}
          />
        </div>
        <div slot="panel-1">
          {#each Object.keys(vecteursRisque) as idVecteur (idVecteur)}
            <ContenuOngletListeRisquesANSSI
              etat="tous"
              {idService}
              {idVecteur}
              {vecteursRisque}
              {categoriesObjectifsVises}
              idLigneVersRisqueApplique={idVecteurVersIdLigneVersRisqueApplique[
                idVecteur
              ]}
              {estLectureSeule}
            />
          {/each}
        </div>
        <div slot="panel-2">
          {#each Object.keys(vecteursRisque) as idVecteur (idVecteur)}
            <ContenuOngletListeRisquesANSSI
              etat="appliques"
              {idService}
              {idVecteur}
              {vecteursRisque}
              {categoriesObjectifsVises}
              idLigneVersRisqueApplique={idVecteurVersIdLigneVersRisqueApplique[
                idVecteur
              ]}
              {estLectureSeule}
            />
          {/each}
        </div>
        <div slot="panel-3">
          {#if nombreToutesLignes === nombreLignesAppliquees}
            <p>Tous les risques sont appliqués.</p>
          {:else}
            {#each Object.keys(vecteursRisque) as idVecteur (idVecteur)}
              <ContenuOngletListeRisquesANSSI
                etat="nonAppliques"
                {idService}
                {idVecteur}
                {vecteursRisque}
                {categoriesObjectifsVises}
                idLigneVersRisqueApplique={idVecteurVersIdLigneVersRisqueApplique[
                  idVecteur
                ]}
                {estLectureSeule}
              />
            {/each}
          {/if}
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
    max-width: 820px;
    max-height: 800px;
    width: calc(100% - 48px);
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
