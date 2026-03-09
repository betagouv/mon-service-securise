<script lang="ts">
  import ContenuTiroir from '../../ui/tiroirs/ContenuTiroir.svelte';
  import ActionsTiroir from '../../ui/tiroirs/ActionsTiroir.svelte';
  import Toast from '../../ui/Toast.svelte';
  import Tableau from '../../ui/Tableau.svelte';
  import { modelesMesureSpecifique } from '../../ui/stores/modelesMesureSpecifique.store';
  import CartoucheCategorieMesure from '../../ui/CartoucheCategorieMesure.svelte';
  import type { IdCategorie, IdService } from '../tableauDesMesures.d';
  import { tiroirStore } from '../../ui/stores/tiroir.store';
  import SeparateurHorizontal from '../../ui/SeparateurHorizontal.svelte';
  import { associeModelesMesureSpecifiqueAuService } from '../tableauDesMesures.api';
  import { toasterStore } from '../../ui/stores/toaster.store';
  import { singulierPluriel } from '../../outils/string';
  import Infobulle from '../../ui/Infobulle.svelte';
  import type { ModeleMesureSpecifique } from '../../ui/types';
  import Avertissement from '../../ui/Avertissement.svelte';
  import Lien from '../../ui/Lien.svelte';

  export const titre: string = 'Ajouter des mesures depuis ma liste';
  export const sousTitre: string =
    'Sélectionnez des mesures que vous souhaitez ajouter à ce service.';
  export const taille = 'large';

  interface Props {
    categories: Record<IdCategorie, string>;
    idService: IdService;
  }

  let { categories, idService }: Props = $props();

  let etapeCourante: 1 | 2 = $state(1);
  let idsModelesSelectionnes: string[] = $state([]);
  let enCoursEnvoi = $state(false);

  let itemsFiltrageCategories = $derived(
    Object.entries(categories).map(([id, label]) => ({
      libelle: label,
      valeur: id,
      idCategorie: 'categorie',
    }))
  );

  let modelesAssociesACeService = $derived(
    $modelesMesureSpecifique.filter((m) =>
      m.idsServicesAssocies.includes(idService)
    )
  );

  const doitEtreALaFin = (modeleMesure: ModeleMesureSpecifique) =>
    modeleMesure.idsServicesAssocies.includes(idService);

  let modelesMesureSpecifiqueOrdonnes = $derived(
    $modelesMesureSpecifique.sort((a, b) => {
      if (
        (doitEtreALaFin(a) && doitEtreALaFin(b)) ||
        (!doitEtreALaFin(a) && !doitEtreALaFin(b))
      ) {
        return 0;
      }
      return doitEtreALaFin(a) ? 1 : -1;
    })
  );

  const associeModeles = async () => {
    enCoursEnvoi = true;
    try {
      await associeModelesMesureSpecifiqueAuService(
        idService,
        idsModelesSelectionnes
      );
      const titrePluralise = singulierPluriel(
        'Mesures ajoutées avec succès !',
        'Mesure ajoutée avec succès !',
        idsModelesSelectionnes.length
      );
      const sousTitrePluralise = singulierPluriel(
        `1 mesure a été appliquée à votre service. Elles est désormais prête à être lancée (statut “À lancer”).`,
        `${idsModelesSelectionnes.length} mesures ont été appliquées à votre service. Elles sont désormais prêtes à être lancées (statut “À lancer”).`,
        idsModelesSelectionnes.length
      );
      toasterStore.succes(titrePluralise, sousTitrePluralise);
      document.body.dispatchEvent(
        new CustomEvent('mesure-modifiee', {
          detail: { sourceDeModification: 'tiroir' },
        })
      );
      document.body.dispatchEvent(
        new CustomEvent('modeles-mesure-specifique-associes')
      );
      await modelesMesureSpecifique.rafraichis();
      tiroirStore.ferme();
    } catch {
      toasterStore.erreur(
        'Une erreur est survenue',
        "Veuillez réessayer. Si l'erreur persiste, merci de contacter le support."
      );
    } finally {
      enCoursEnvoi = false;
    }
  };
</script>

<ContenuTiroir>
  {#if etapeCourante === 1}
    {#if $modelesMesureSpecifique.length === 0}
      <Avertissement niveau="info">
        <div class="info-pas-de-modele">
          <p>
            Vous devez d’abord ajouter une/des mesure(s) afin de les associer à
            ce service depuis votre liste de mesures.
          </p>
          <div class="retour-tableau-de-bord">
            <Lien
              type="bouton-secondaire"
              href="/mesures?ongletActif=specifiques"
              titre="Aller à ma liste de mesures"
            />
          </div>
        </div>
      </Avertissement>
    {:else}
      <div class="largeur-contrainte">
        <Toast
          avecOmbre={false}
          avecAnimation={false}
          titre="Une mesure ajoutée reçoit automatiquement le statut «&nbsp;À lancer&nbsp;»."
          niveau="info"
          contenu="Ce statut est obligatoire : il n’est pas possible d’ajouter une mesure sans statut."
        />
      </div>
      <Tableau
        colonnes={[
          { cle: 'description', libelle: 'Intitulé de la mesure' },
          { cle: 'descriptionLongue', libelle: 'Description' },
          { cle: 'categorie', libelle: 'Catégorie' },
        ]}
        donnees={modelesMesureSpecifiqueOrdonnes}
        configurationRecherche={{
          champsRecherche: ['description', 'descriptionLongue'],
        }}
        configurationFiltrage={{
          options: {
            categories: [{ id: 'categorie', libelle: 'Catégories' }],
            items: itemsFiltrageCategories,
          },
        }}
        configurationSelection={{
          texteIndicatif: {
            vide: 'Aucune mesure sélectionnée',
            unique: 'mesure sélectionnée',
            multiple: 'mesures sélectionnées',
          },
          champSelection: 'id',
          predicatSelectionDesactive: (donnee) =>
            donnee.idsServicesAssocies.includes(idService),
        }}
        preSelectionImmuable={modelesAssociesACeService.map((m) => m.id)}
        bind:selection={idsModelesSelectionnes}
      >
        {#snippet cellule({ donnee, colonne })}
          {@const { description, descriptionLongue, categorie } = donnee}
          {@const desactive = donnee.idsServicesAssocies.includes(idService)}
          {#if colonne.cle === 'description'}
            <div class="contenu-intitule">
              <b class:desactive>{description}</b>
              {#if desactive}
                <Infobulle
                  contenu="Vous ne pouvez pas sélectionner cette mesure car elle est déjà associée à ce service."
                />
              {/if}
            </div>
          {:else if colonne.cle === 'descriptionLongue'}
            <span class:desactive>{descriptionLongue}</span>
          {:else if colonne.cle === 'categorie'}
            <div class:desactive>
              <CartoucheCategorieMesure {categorie} />
            </div>
          {/if}
        {/snippet}
      </Tableau>
    {/if}
  {:else}
    {@const pluralise = idsModelesSelectionnes.length > 1 ? 's' : ''}
    <div class="largeur-contrainte">
      <Toast
        avecOmbre={false}
        avecAnimation={false}
        titre="Cette action peut avoir un impact significatif."
        niveau="info"
        contenu="Vous vous apprêtez à associer <b>{idsModelesSelectionnes.length} mesure{pluralise}</b> à ce service. Cela aura un impact sur son indice cyber personnalisé."
        avecInterpolationHTMLDangereuse
      />
    </div>
    <SeparateurHorizontal />
    <h4>
      {idsModelesSelectionnes.length} mesure{pluralise} concernée{pluralise} par cette
      modification
    </h4>
    <Tableau
      colonnes={[
        { cle: 'description', libelle: 'Intitulé de la mesure' },
        { cle: 'descriptionLongue', libelle: 'Description' },
        { cle: 'categorie', libelle: 'Catégorie' },
      ]}
      donnees={$modelesMesureSpecifique.filter((m) =>
        idsModelesSelectionnes.includes(m.id)
      )}
    >
      {#snippet cellule({ donnee, colonne })}
        {@const { description, descriptionLongue, categorie } = donnee}
        {#if colonne.cle === 'description'}
          <b>{description}</b>
        {:else if colonne.cle === 'descriptionLongue'}
          {descriptionLongue}
        {:else if colonne.cle === 'categorie'}
          <CartoucheCategorieMesure {categorie} />
        {/if}
      {/snippet}
    </Tableau>
  {/if}
</ContenuTiroir>
<ActionsTiroir>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <lab-anssi-bouton
    variante="tertiaire-sans-bordure"
    taille="md"
    titre="Annuler"
    onclick={() => tiroirStore.ferme()}
  ></lab-anssi-bouton>
  {#if etapeCourante === 1}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <lab-anssi-bouton
      variante="primaire"
      taille="md"
      titre={`Ajouter ${
        idsModelesSelectionnes.length > 1 ? 'ces mesures' : 'cette mesure'
      } à mon service`}
      icone="add-line"
      position-icone="gauche"
      onclick={() => (etapeCourante = 2)}
      actif={idsModelesSelectionnes.length > 0}
    ></lab-anssi-bouton>
  {:else}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <lab-anssi-bouton
      variante="primaire"
      taille="md"
      titre="Valider les modifications"
      onclick={associeModeles}
      disabled={enCoursEnvoi}
    ></lab-anssi-bouton>
  {/if}
</ActionsTiroir>

<style lang="scss">
  .largeur-contrainte {
    max-width: 600px;
  }

  :global(.texte-tiroir) {
    display: inherit !important;
  }

  h4 {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.75rem;
    margin: 0;
    max-width: 550px;
  }

  .contenu-intitule {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
  }

  .desactive {
    opacity: 0.5;
  }

  .info-pas-de-modele {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 4px 0;
    max-width: 550px;

    p {
      margin: 0;
    }
  }
</style>
