<script lang="ts">
  import NavigationSecuriser from '../../kit/NavigationSecuriser.svelte';
  import { onMount } from 'svelte';
  import type { DonneesIndiceCyber, Tranches } from './indiceCyber.types';
  import IndiceCyber from '../../../indiceCyber/IndiceCyber.svelte';
  import IndiceCyberPersonnalise from '../../../indiceCyberPersonnalise/IndiceCyberPersonnalise.svelte';
  import type { IdCategorie } from '../../../tableauDesMesures/tableauDesMesures.d';
  import RadarIndiceCyber from './RadarIndiceCyber.svelte';

  interface Props {
    idService: string;
    indiceCyber: DonneesIndiceCyber;
    indiceCyberPersonnalise: DonneesIndiceCyber;
    noteMax: number;
    referentielsMesureConcernes: string;
    nombreMesuresSpecifiques: number;
    nombreMesuresNonFait: number;
    categories: Record<IdCategorie, string>;
    tranches: Tranches;
    tranchesPersonnalisees: Tranches;
  }

  let {
    idService,
    indiceCyber,
    indiceCyberPersonnalise,
    noteMax,
    referentielsMesureConcernes,
    nombreMesuresSpecifiques,
    nombreMesuresNonFait,
    categories,
    tranches,
    tranchesPersonnalisees,
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

  const indiceCyberDeCategorie = (
    indice: DonneesIndiceCyber,
    categorie: string
  ) => indice[categorie as keyof DonneesIndiceCyber].toFixed(1);
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
      <div class="cadre-indice-cyber cadre-avec-separateur">
        <div class="contenu-details-indice-cyber">
          <h4>Répartition par catégorie</h4>
          <div class="contenu-radar-indice-cyber">
            <RadarIndiceCyber
              {categories}
              {noteMax}
              indicesCyber={indiceCyber}
            />
            <dsfr-transcription
              fullscreen="Agrandir"
              fullscreen-aria-label="Agrandir la transcription"
            >
              <p>Répartition de l'indice cyber par catégorie</p>
              {#each Object.keys(categories) as categorie (categorie)}
                <dl>
                  <dt>
                    {categories[categorie]}
                  </dt>
                  <dd>
                    {indiceCyberDeCategorie(indiceCyber, categorie)}
                  </dd>
                </dl>
              {/each}
            </dsfr-transcription>
          </div>
        </div>
        <div class="separateur"></div>
        <div class="contenu-details-indice-cyber">
          <h4>Quelle est la valeur de l’indice cyber&nbsp;?</h4>
          <div class="liste-tranches">
            <span
              >Face aux risques les plus courants, un indice cyber peut être
              considéré comme :</span
            >
            <ul>
              {#each tranches.descriptions as tranche, index (index)}
                <li class:tranche-courante={tranche.trancheCourante}>
                  {#if tranche.trancheCourante}
                    <lab-anssi-icone nom="arrow-right-line" taille="md"
                    ></lab-anssi-icone>
                  {/if}
                  {tranche.description}
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
      <div class="mise-en-avant">
        <h4>
          <lab-anssi-icone nom="award-line" size="md"
          ></lab-anssi-icone>Recommandation indicative de l'ANSSI en cas de
          décision d'homologation
        </h4>
        <div class="conteneur-texte">
          {#if tranches.valeurs.conseilHomologation}
            <span>{tranches.valeurs.conseilHomologation}</span>
          {/if}
          {#if !tranches.valeurs.deconseillee}
            <div class="separateur"></div>
            <span>Durée d'homologation conseillée</span>
            <dsfr-badge
              label={tranches.valeurs.dureeHomologationConseillee}
              type="accent"
              accent="blue-cumulus"
              size="md"
            ></dsfr-badge>
          {/if}
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
      <div class="cadre-indice-cyber cadre-avec-separateur">
        <div class="contenu-details-indice-cyber">
          <h4>Répartition par catégorie</h4>
          <div class="contenu-radar-indice-cyber">
            <RadarIndiceCyber
              {categories}
              {noteMax}
              indicesCyber={indiceCyberPersonnalise}
            />
            <dsfr-transcription
              fullscreen="Agrandir"
              fullscreen-aria-label="Agrandir la transcription"
            >
              <p>Répartition de l'indice cyber personnalisé par catégorie</p>
              {#each Object.keys(categories) as categorie (categorie)}
                <dl>
                  <dt>
                    {categories[categorie]}
                  </dt>
                  <dd>
                    {indiceCyberDeCategorie(indiceCyberPersonnalise, categorie)}
                  </dd>
                </dl>
              {/each}
            </dsfr-transcription>
          </div>
        </div>
        <div class="separateur"></div>
        <div class="contenu-details-indice-cyber">
          <h4>Quelle est la valeur de l’indice cyber personnalisé&nbsp;?</h4>
          <div class="liste-tranches">
            <span
              >Face aux risques les plus courants, un indice cyber peut être
              considéré comme :</span
            >
            <ul>
              {#each tranchesPersonnalisees.descriptions as tranche, index (index)}
                <li class:tranche-courante={tranche.trancheCourante}>
                  {#if tranche.trancheCourante}
                    <lab-anssi-icone nom="arrow-right-line" taille="md"
                    ></lab-anssi-icone>
                  {/if}
                  {tranche.description}
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </dsfr-tabs>
</div>

<style lang="scss">
  .conteneur-onglet {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .cadre-indice-cyber {
      display: inline-grid;
      align-self: stretch;
      grid-template-rows: repeat(1, fit-content(100%));
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
      border: 1px solid #dddddd;
      align-items: center;
      flex: 1;

      &.cadre-avec-separateur {
        display: grid;
        grid-template-columns: 1fr 1px 1fr;
        gap: 0 2rem;
        align-items: start;

        .separateur {
          border: 1px solid #dddddd;
          align-self: stretch;
          margin-block: 4px;
        }
      }

      .liste-tranches {
        display: flex;
        flex-direction: column;
        gap: 32px;

        ul {
          padding: 0;
          margin: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 370px;

          .tranche-courante {
            color: var(--bleu-mise-en-avant);
            background: #f5f5fe;
            font-weight: bold;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
      }

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

      .contenu-details-indice-cyber {
        padding: 40px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        h4 {
          color: #161616;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 2rem;
          margin: 0 0 16px;
        }

        .contenu-radar-indice-cyber {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          align-self: stretch;
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
  }

  .mise-en-avant {
    padding: 32px 48px;
    border-left: 4px solid var(--border-default-blue-cumulus);
    background: var(--background-contrast-blue-cumulus);
    position: relative;
    color: #161616;
    display: flex;
    flex-direction: column;
    gap: 16px;

    h4 {
      font-weight: bold;
      font-size: 1.5rem;
      line-height: 2rem;
      margin: 0;
      display: flex;
      gap: 8px;
    }

    .conteneur-texte {
      border: 1px solid #dddddd;
      background: white;
      padding: 3px 0;
      font-size: 1rem;
      line-height: 1.5rem;
      display: flex;
      align-items: center;

      span {
        padding: 29px 16px;
      }

      .separateur {
        border: 1px solid #dddddd;
        align-self: stretch;
      }

      dsfr-badge {
        height: fit-content;
      }
    }
  }

  dsfr-transcription {
    width: 100%;
  }
</style>
