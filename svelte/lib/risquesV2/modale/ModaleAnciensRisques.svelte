<script lang="ts">
  import Modale from '../../ui/Modale.svelte';
  import type { Niveau, RisquesV1, TousRisques } from '../risquesV2.d';
  import type {
    ReferentielGravites,
    ReferentielVraisemblances,
  } from '../../risques/risques.d';
  import type { ReferentielStatut } from '../../ui/types';
  import TableauRisquesV2 from '../TableauRisquesV2.svelte';
  import type { UUID } from '../../typesBasiquesSvelte';

  let elementModale: Modale | undefined;

  interface Props {
    risquesV1: RisquesV1;
    niveauxGravite: ReferentielGravites;
    niveauxVraisemblance: ReferentielVraisemblances;
    statuts: ReferentielStatut;
  }

  let { risquesV1, niveauxGravite, niveauxVraisemblance, statuts }: Props =
    $props();

  const graviteDepuisIdentifiant = (identifiant: string) => {
    return niveauxGravite[identifiant as keyof ReferentielGravites]
      ?.position as Niveau;
  };

  const vraisemblanceDepuisIdentifiant = (identifiant: string) => {
    return niveauxVraisemblance[identifiant as keyof ReferentielVraisemblances]
      ?.position as Niveau;
  };

  let tousLesRisques: TousRisques = $derived.by(() => {
    const risques = risquesV1.risquesGeneraux.map((r) => ({
      ...r,
      gravite: graviteDepuisIdentifiant(r.niveauGravite),
      vraisemblance: vraisemblanceDepuisIdentifiant(r.niveauVraisemblance),
      mesuresAssociees: [],
      id: r.identifiantNumerique,
    }));
    const risquesSpecifiques = risquesV1.risquesSpecifiques.map((r) => ({
      ...r,
      gravite: graviteDepuisIdentifiant(r.niveauGravite),
      graviteBrute: graviteDepuisIdentifiant(r.niveauGravite),
      vraisemblance: vraisemblanceDepuisIdentifiant(r.niveauVraisemblance),
      vraisemblanceBrute: vraisemblanceDepuisIdentifiant(r.niveauVraisemblance),
      id: r.id as UUID,
    }));

    return {
      risques,
      risquesBruts: [],
      risquesCibles: [],
      risquesSpecifiques,
    };
  });

  export const affiche = () => {
    elementModale?.affiche();
  };
</script>

<Modale id="modale-anciens-risques" bind:this={elementModale}>
  {#snippet contenu()}
    <h4>Anciens risques</h4>
    <div class="contenu-modale">
      <p>
        Cette vue vous permet de consulter les risques issus de l’ancienne
        version. Ils sont accessibles en lecture seule et ne sont plus pris en
        compte dans le calcul de votre cartographie des risques.
        <br />
        Vous pouvez les télécharger au format CSV si nécessaire ou supprimer définitivement
        la liste.
      </p>
      <TableauRisquesV2
        risques={tousLesRisques}
        {statuts}
        {niveauxGravite}
        {niveauxVraisemblance}
        estLectureSeule
      />
    </div>
  {/snippet}
  {#snippet actions()}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Fermer"
      kind="secondary"
      size="md"
      onclick={() => elementModale?.ferme()}
    ></dsfr-button>
  {/snippet}
</Modale>

<style lang="scss">
  :global(#modale-anciens-risques) {
    max-width: 1400px;
    max-height: 800px;
    width: calc(100% - 48px);

    :global(.contenu-modale) {
      margin-top: 0;
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
    gap: 26px;
    margin-bottom: 24px;

    p {
      margin: 0;
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }
</style>
