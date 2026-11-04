<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../../preferences/preferences.api';

  let preferenceActivee = $state(false);
  let messageSauvegardeAffiche = $state(false);
  let messageErreurAffiche = $state(false);

  onMount(async () => {
    const recapitulatif = await api.recuperePreferencesRecapitulatif();
    preferenceActivee =
      recapitulatif.nouveauxServicesSansToutesMesuresSpecifiques;
  });

  const metsAJourPreference = async (e: CustomEvent<boolean>) => {
    messageSauvegardeAffiche = false;
    messageErreurAffiche = false;
    preferenceActivee = e.detail;
    try {
      await api.sauvegardePreferencesRecapitulatif({
        nouveauxServicesSansToutesMesuresSpecifiques: preferenceActivee,
      });
      messageSauvegardeAffiche = true;
    } catch (e) {
      messageErreurAffiche = true;
      throw e;
    }
  };
</script>

<div class="conteneur-encart-preference">
  <h5>Préférence de notifications</h5>
  <dsfr-checkbox
    id="preference-activee"
    checked={preferenceActivee}
    onvaluechanged={metsAJourPreference}
    label="Me prévenir par e-mail quand un service n’a pas mes mesures"
    hint="Notification à l’ajout d’un service et récapitulatif par e-mail une fois par mois. Ce choix est enregistré dès que vous cochez ou décochez la case."
  >
  </dsfr-checkbox>
  <div class="choix-enregistre" class:visible={messageSauvegardeAffiche}>
    <lab-anssi-icone taille="sm" nom="checkbox-circle-line"></lab-anssi-icone> Préférence
    enregistrée
  </div>
  <div class="erreur-sauvegarde" class:visible={messageErreurAffiche}>
    <lab-anssi-icone taille="sm" nom="error-warning-line"></lab-anssi-icone> Erreur
    lors de la sauvegarde
  </div>
</div>

<style lang="scss">
  .conteneur-encart-preference {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: #f6f6f6;
    border-radius: 8px;
    padding: 16px;

    h5 {
      color: #161616;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.5rem;
      margin: 0;
    }

    .choix-enregistre,
    .erreur-sauvegarde {
      display: none;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.5rem;
    }
    .choix-enregistre {
      color: var(--succes-texte);
    }
    .erreur-sauvegarde {
      color: var(--erreur-texte);
    }
    .visible {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }
</style>
