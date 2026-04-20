<script lang="ts">
  import NavigationSecuriser from '../../kit/NavigationSecuriser.svelte';
  import { onMount } from 'svelte';
  import type { DonneesIndiceCyber } from './indiceCyber.types';
  import IndiceCyber from '../../../indiceCyber/IndiceCyber.svelte';
  import IndiceCyberPersonnalise from '../../../indiceCyberPersonnalise/IndiceCyberPersonnalise.svelte';

  interface Props {
    idService: string;
    indiceCyber: DonneesIndiceCyber;
    indiceCyberPersonnalise: DonneesIndiceCyber;
    noteMax: number;
    referentielsMesureConcernes: string;
    nombreMesuresSpecifiques: number;
    nombreMesuresNonFait: number;
  }

  let {
    idService,
    indiceCyber,
    indiceCyberPersonnalise,
    noteMax,
    referentielsMesureConcernes,
    nombreMesuresSpecifiques,
    nombreMesuresNonFait,
  }: Props = $props();

  const configurationsTabs = [
    {
      id: 'indice-cyber-anssi',
      label: 'Indice cyber ANSSI',
    },
    {
      id: 'indice-cyber-personnalise',
      label: 'Indice cyber personnalisé',
    },
  ];

  let tabActive = $state(0);
  onMount(() => {
    const requete = new URLSearchParams(window.location.search);
    const ongletActif = requete.get('onglet');
    if (ongletActif) {
      tabActive = configurationsTabs.findIndex((c) => c.id === ongletActif);
    }
  });

  const gereChangementTab = (e: CustomEvent<{ index: number }>) => {
    tabActive = e.detail.index;

    const url = new URL(window.location.href);
    url.searchParams.set('onglet', configurationsTabs[tabActive].id);
    history.pushState(null, '', url);
  };

  const metAuPluriel = (chaine: string, estAuPluriel: boolean) =>
    estAuPluriel ? `${chaine}s` : chaine;
</script>

<div class="conteneur-indice-cyber">
  <NavigationSecuriser {idService} />
  <dsfr-tabs
    tabs={configurationsTabs}
    activeTabIndex={tabActive}
    ontabchanged={gereChangementTab}
  >
    <div slot="tab-1" class="label-onglet">
      <span>Indice cyber ANSSI</span>
      <span class="pastille" class:active={tabActive === 0}
        >{indiceCyber.total.toFixed(1)}/{noteMax}</span
      >
    </div>
    <div slot="tab-2" class="label-onglet">
      <span>Indice cyber personnalisé</span>
      <span class="pastille" class:active={tabActive === 1}
        >{indiceCyberPersonnalise.total.toFixed(1)}/{noteMax}</span
      >
    </div>
    <div slot="panel-1" class="conteneur-onglet">
      <div class="cadre-indice-cyber">
        <div class="disque-indice-cyber">
          <IndiceCyber indiceCyber={indiceCyber.total} {noteMax} {idService} />
        </div>
        <div class="description-indice-cyber">
          <div class="texte">
            <h4>Indice cyber ANSSI</h4>
            <span>
              L'indice cyber est une évaluation indicative du niveau de
              sécurisation du service, calculé à partir des mesures faites et
              partielles proposées par {referentielsMesureConcernes} dans MonServiceSécurisé.
            </span>
          </div>
          <dsfr-link
            label="Comment est calculé l’indice cyber ANSSI ?"
            size="md"
            icon="checkbox-line"
            icon-place="left"
            href="https://aide.monservicesecurise.cyber.gouv.fr/fr/article/lindice-cyber-anssi-que-represente-t-il-et-comment-est-il-calcule-1l94rzd/"
            title="Calcul de l'indice cyber - nouvelle fenêtre"
            blank
          >
          </dsfr-link>
        </div>
      </div>
    </div>
    <div slot="panel-2" class="conteneur-onglet">
      <div class="cadre-indice-cyber">
        <div class="disque-indice-cyber">
          <IndiceCyberPersonnalise
            indiceCyberPersonnalise={indiceCyber.total}
            {noteMax}
            {idService}
          />
        </div>
        <div class="description-indice-cyber">
          <div class="texte">
            <h4>Indice cyber personnalisé</h4>
            <span>
              L'indice cyber personnalisé reprend les mêmes règles de calcul que
              l'indice cyber ANSSI en intégrant également les mesures
              spécifiques ajoutées par l'équipe et excluant les mesures de
              {referentielsMesureConcernes} signalées comme "non prises en compte".
            </span>
            <span>
              Incluant : {nombreMesuresSpecifiques}
              {metAuPluriel('mesure', nombreMesuresSpecifiques > 1)}
              {metAuPluriel('spécifique', nombreMesuresSpecifiques > 1)}
              {metAuPluriel('ajoutée', nombreMesuresSpecifiques > 1)}.
              <br />
              Excluant : {nombreMesuresNonFait}
              {metAuPluriel('mesure', nombreMesuresNonFait > 1)}
              {metAuPluriel('proposée', nombreMesuresNonFait > 1)} par {referentielsMesureConcernes},
              "non {metAuPluriel('prise', nombreMesuresNonFait > 1)} en compte" par
              l'équipe.
            </span>
          </div>
          <dsfr-link
            label="Comment est calculé l’indice cyber personnalisé ?"
            size="md"
            icon="checkbox-line"
            icon-place="left"
            href="https://aide.monservicesecurise.cyber.gouv.fr/fr/article/lindice-cyber-personnalise-que-represente-t-il-et-comment-est-il-calcule-13ffv4p/"
            title="Calcul de l'indice cyber personnalisé - nouvelle fenêtre"
            blank
          >
          </dsfr-link>
        </div>
      </div>
    </div>
  </dsfr-tabs>
</div>

<style lang="scss">
  .cadre-indice-cyber {
    display: inline-grid;
    align-self: stretch;
    grid-template-rows: repeat(1, fit-content(100%));
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    border: 1px solid #dddddd;
    align-items: center;

    .disque-indice-cyber {
      width: 200px;
      justify-self: center;
    }

    .description-indice-cyber {
      display: flex;
      flex-direction: column;
      gap: 24px;
      padding: 40px;

      .texte {
        display: flex;
        flex-direction: column;
        gap: 16px;
        font-size: 1rem;
        line-height: 1.5rem;

        h4 {
          margin: 0;
          padding: 0;
          font-size: 1.5rem;
          line-height: 2rem;
          font-weight: bold;
        }
      }
    }
  }
  .label-onglet {
    display: flex;
    gap: 8px;
    align-items: center;

    .pastille {
      background-color: white;
      color: #161616;
      padding: 2px 4px;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1rem;
      height: fit-content;

      &.active {
        background-color: var(--bleu-mise-en-avant);
        color: white;
      }
    }
  }
</style>
