<script lang="ts">
  import ModaleSousEtape from '../../kit/ModaleSousEtape.svelte';
  import { onMount } from 'svelte';

  let cibleNomService: HTMLElement;
  let cibleBesoinsSecurite: HTMLElement;
  let cibleGererContributeurs: HTMLElement;
  onMount(() => {
    document.body.dispatchEvent(
      new CustomEvent('svelte-recharge-niveaux-de-securite', {
        detail: {
          niveauDeSecuriteMinimal: 'niveau1',
          lectureSeule: false,
          avecSuggestionBesoinsSecuriteRetrogrades: false,
          idService: 'ID',
          modeVisiteGuidee: true,
        },
      })
    );
    cibleNomService = document.getElementById('nom-service')!;
    cibleBesoinsSecurite = document.getElementById('niveaux-de-securite')!;
    cibleGererContributeurs = document.getElementById('gerer-contributeurs')!;
  });
</script>

{#if cibleNomService && cibleBesoinsSecurite && cibleGererContributeurs}
  <ModaleSousEtape
    sousEtapes={[
      {
        cible: cibleNomService,
        callbackInitialeCible: (cible) => {
          document.body.dispatchEvent(
            new CustomEvent('jquery-affiche-decrire-etape-1')
          );
          cible.style.width = '50%';
          window.scrollTo(0, 0); // Ici on force le scroll pour ne pas être dérangé par "Erreur de saisie"
        },
        callbackFinaleCible: (cible) => (cible.style.width = '100%'),
        positionnementModale: 'MilieuDroite',
        titre: 'Décrivez votre service',
        description:
          'Dans un premier temps, renseignez quelques informations afin d’obtenir une liste personnalisée de mesures de sécurité.',
        animation: '/statique/assets/images/visiteGuidee/decrire.gif',
        margeElementMisEnAvant: 28,
      },
      {
        cible: cibleBesoinsSecurite,
        callbackInitialeCible: (cible) => {
          document.body.dispatchEvent(
            new CustomEvent('jquery-replie-menu-navigation-visite-guidee')
          );
          document.body.dispatchEvent(
            new CustomEvent('jquery-affiche-decrire-etape-3')
          );
          cible.scrollIntoView({ block: 'start' });
        },
        delaiAvantAffichage: 300,
        callbackFinaleCible: () => {
          window.scrollTo(0, 0);
        },
        positionnementModale: 'DeuxTiersCentre',
        titre: 'Sélectionnez le besoin de sécurité',
        description:
          'Sélectionnez les besoins identifiés par l’ANSSI ou des besoins plus élevés pour découvrir la liste des mesures pour sécuriser votre service.',
        animation: '/statique/assets/images/visiteGuidee/besoins_securite.gif',
        margesElementMisEnAvant: '0 20 0 20',
      },
      {
        cible: cibleGererContributeurs,
        callbackInitialeCible: (cible) => {
          cible.inert = true;
          document.getElementsByClassName(
            'inviter-contributeurs'
          )[0].style.display = 'flex';
          document.body.dispatchEvent(
            new CustomEvent('jquery-deplie-menu-navigation-visite-guidee')
          );
          document.body.dispatchEvent(
            new CustomEvent('jquery-affiche-tiroir-contributeurs-visite-guidee')
          );
          document.getElementsByClassName('tiroir')[0].style.zIndex = '10001';
        },
        callbackFinaleCible: () =>
          document
            .getElementsByClassName('fermeture-tiroir')[0]
            .dispatchEvent(new Event('click')),
        positionnementModale: 'HautDroite',
        titre: 'Collaborez avec votre équipe',
        description:
          'Vous pouvez travailler en équipe, inviter vos collègues mais également vos prestataires. Différents niveaux de droits sont disponibles (lecture, édition…).',
        animation: '/statique/assets/images/visiteGuidee/contributeurs.gif',
        margeElementMisEnAvant: 3,
      },
    ]}
  />
{/if}
