<script lang="ts" generics="G extends GroupeAffichable">
  import { toasterStore } from '../ui/stores/toaster.store';
  import { estUnLibelleDejaUtilise } from './groupes.api';
  import type { ApiGroupes, GroupeAffichable } from './groupes.d';

  interface Props {
    identifiant: string;
    api: ApiGroupes<G>;
    groupe: G | null;
    onRenommee: (groupe: G) => void;
    onFerme: () => void;
  }

  let { identifiant, api, groupe, onRenommee, onFerme }: Props = $props();

  let libelle = $derived(groupe?.libelle ?? '');
  let erreur = $state('');
  let enCours = $state(false);

  const ferme = () => {
    erreur = '';
    onFerme();
  };

  const renomme = async () => {
    if (!groupe || !libelle.trim()) return;

    const libelleRenomme = libelle.trim();
    enCours = true;
    erreur = '';
    try {
      await api.renommeGroupe(groupe.id, libelleRenomme);
      onRenommee({ ...groupe, libelle: libelleRenomme });
      toasterStore.succes('Succès', 'Le groupe a été renommé.');
      ferme();
    } catch (e) {
      if (estUnLibelleDejaUtilise(e)) {
        erreur = 'Vous avez déjà un groupe avec ce libellé.';
        return;
      }
      toasterStore.erreur(
        'Erreur',
        "Le groupe n'a pas pu être renommé, veuillez réessayer."
      );
    } finally {
      enCours = false;
    }
  };
</script>

<dsfr-modal
  id="modale-renommage-groupe-{identifiant}"
  has-footer
  opened={groupe !== null}
  title="Renommer le groupe «&nbsp;{groupe?.libelle}&nbsp;»"
  onclose={ferme}
>
  <p>
    Vous pouvez renommer ce groupe sans modifier les services qu’il contient.
  </p>
  <dsfr-input
    id="libelle-groupe-renomme-{identifiant}"
    label="Nom du groupe"
    value={libelle}
    onvaluechanged={(e: CustomEvent<string>) => (libelle = e.detail)}
    maxlength="200"
    status={erreur ? 'error' : 'default'}
    errorMessage={erreur}
  ></dsfr-input>
  <div slot="footer" class="conteneur-actions-modale">
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Annuler"
      kind="secondary"
      size="md"
      type="button"
      onclick={ferme}
    ></dsfr-button>
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <dsfr-button
      label="Enregistrer"
      kind="primary"
      size="md"
      type="button"
      disabled={enCours || !libelle.trim()}
      onclick={renomme}
    ></dsfr-button>
  </div>
</dsfr-modal>

<style lang="scss">
  p {
    color: #161616;
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0 0 24px;
  }

  .conteneur-actions-modale {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
  }
</style>
