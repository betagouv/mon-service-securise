<script lang="ts">
  import type { EntetePageServiceProps } from './entetePageService.d';
  import IndiceCyber from '../indiceCyber/IndiceCyber.svelte';
  import IndiceCyberPersonnalise from '../indiceCyberPersonnalise/IndiceCyberPersonnalise.svelte';

  let {
    nomService,
    organisationResponsable,
    idService,
    indiceCyber,
    indiceCyberPersonnalise,
    noteMax,
  }: EntetePageServiceProps = $props();
</script>

<div class="entete-service">
  <div class="conteneur-nom">
    <h1>{nomService}</h1>
    <h2>{organisationResponsable}</h2>
  </div>
  <div class="indices-cyber">
    <a
      class="conteneur-indice-cyber"
      href="/service/{idService}/indiceCyber?onglet=indice-cyber-anssi"
    >
      <div class="indice-cyber">
        <IndiceCyber {idService} {indiceCyber} {noteMax} />
      </div>
      <div class="intitule-indice-cyber">
        <span>Indice cyber ANSSI</span>
        <span class="detail">
          Voir le détail
          <span class="fleche">
            <lab-anssi-icone nom="arrow-right-line" taille="sm"
            ></lab-anssi-icone>
          </span>
        </span>
      </div>
    </a>
    <a
      class="conteneur-indice-cyber"
      href="/service/{idService}/indiceCyber?onglet=indice-cyber-personnalise"
    >
      <div class="indice-cyber">
        <IndiceCyberPersonnalise
          {idService}
          {indiceCyberPersonnalise}
          {noteMax}
        />
      </div>
      <div class="intitule-indice-cyber">
        <span>Indice cyber personnalisé</span>
        <span class="detail">
          Voir le détail
          <span class="fleche">
            <lab-anssi-icone nom="arrow-right-line" taille="sm"
            ></lab-anssi-icone>
          </span>
        </span>
      </div>
    </a>
  </div>
</div>

<style lang="scss">
  .entete-service {
    background: #f6f6f6;
    padding: 32px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;

    .indices-cyber {
      display: flex;
      gap: 12px;
      flex-shrink: 0;

      .conteneur-indice-cyber {
        border: 1px solid #dddddd;
        padding: 4px 0;
        display: flex;
        align-items: center;
        text-decoration: none;
        background: white;
        overflow: hidden;

        &:hover {
          background: #f6f6f6;
        }

        &:active {
          background: #ededed;
        }

        .indice-cyber {
          width: 60px;
          padding: 0px 8px;
          display: flex;
          align-items: center;
        }
      }

      .intitule-indice-cyber {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 0 12px;

        .detail {
          font-size: 0.75rem;
          line-height: 1.25rem;
          font-weight: normal;
          color: #666666;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .fleche {
            color: #000091;
          }
        }

        span {
          font-size: 0.875rem;
          line-height: 1.5rem;
          font-weight: bold;
          color: #000091;
        }
      }
    }

    .conteneur-nom {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
      min-width: 0;

      h1 {
        font-weight: bold;
        font-size: 1.75rem;
        line-height: 2.25rem;
        color: #161616;
        margin: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      h2 {
        font-weight: 400;
        font-size: 1rem;
        line-height: 1.5rem;
        color: #161616;
        margin: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }
</style>
