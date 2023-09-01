import ActionAbstraite from './Action.mjs';

const estInvitationDejaEnvoyee = (reponseErreur) =>
  reponseErreur.status === 422 &&
  reponseErreur.data?.erreur?.code === 'INVITATION_DEJA_ENVOYEE';

const metEnFormeLigne = ({ email, prenomNom, initiales }) =>
  `<li class="contributeur-a-inviter" data-email="${email}">
    <div class="initiales contributeur ${
      !initiales ? 'persona' : ''
    }">${initiales}</div>
    <span>${prenomNom}</span>
    <img class="bouton-suppression-contributeur" src="/statique/assets/images/icone_supprimer_gris.svg">
  </li>`;

const rechercheSuggestions = async (recherche, callback) => {
  if (recherche.length < 2) {
    callback([]);
    return;
  }

  const reponse = await axios.get('/api/annuaire/contributeurs', {
    params: { recherche },
  });

  const { suggestions } = reponse.data;

  callback(suggestions);
};

class ActionInvitation extends ActionAbstraite {
  constructor(tableauDesServices) {
    super('#contenu-invitation', tableauDesServices);
    this.appliqueContenu({
      titre: 'Inviter des contributeurs',
      texteSimple:
        'Inviter les personnes de votre choix à contribuer à ce service.',
      texteMultiple:
        'Inviter les personnes de votre choix à contribuer à ces services.',
    });

    $('#liste-ajout-contributeur', this.idConteneur).on('click', (e) => {
      const $elementClique = $(e.target);
      if ($elementClique.hasClass('bouton-suppression-contributeur')) {
        const $ligneASupprimer = $elementClique.parent(
          '.contributeur-a-inviter'
        );
        $ligneASupprimer.remove();
      }
    });

    const REGEX_EMAIL = /[\w]+@[\w]{2,}\.[\w]{2,}/i;
    const $champSaisie = $('#email-invitation-collaboration', this.idConteneur);
    const $champSelectize = $champSaisie.selectize({
      create: (input) =>
        REGEX_EMAIL.test(input)
          ? {
              prenomNom: input.toLowerCase(),
              email: input.toLowerCase(),
              initiales: '',
            }
          : false,
      createFilter: (input) => REGEX_EMAIL.test(input),
      valueField: 'prenomNom',
      searchField: 'prenomNom',
      render: {
        // On affiche la liste des emails en-dessous, on masque donc les items selectize
        item: (contributeur) =>
          `<span class="invisible"  data-email="${contributeur.email}" data-prenom-nom="${contributeur.prenomNom}" data-initiales="${contributeur.initiales}"></span>`,
        option: (option, escape) =>
          `<div class="option suggestion-contributeur"><div class="initiales contributeur ${
            !option.initiales ? 'persona' : ''
          }">${option.initiales}</div> <div>${escape(
            option.prenomNom
          )}</div></div>`,
        option_create: () =>
          '<div class="create option-ajout">Ajouter ce contributeur</div>',
      },
      onItemAdd: (_, $item) => {
        $champSelectize[0].selectize.clear();
        $champSelectize[0].selectize.clearOptions();
        $('#liste-ajout-contributeur').append(
          metEnFormeLigne({
            email: $item.data('email'),
            prenomNom: $item.data('prenom-nom'),
            initiales: $item.data('initiales'),
          })
        );
      },
      load: (recherche, callback) => {
        $champSelectize[0].selectize.clearOptions();
        rechercheSuggestions(recherche, callback);
      },
      score: () => {
        const aucunFiltrage = () => 1; // Le filtrage est assuré par le backend.
        return aucunFiltrage;
      },
    });
  }

  initialise() {
    const $champEmail = $('#email-invitation-collaboration');
    const $listeContributeurs = $('#liste-ajout-contributeur');

    super.initialise();
    $champEmail.val('');
    $('#action-invitation').show();
    $('.message-erreur#invitation-deja-envoyee').hide();
    $listeContributeurs.empty();
  }

  // eslint-disable-next-line class-methods-use-this
  estDisponible({ seulementCreateur }) {
    return seulementCreateur;
  }

  execute() {
    const emailsContributeurs = $.makeArray(
      $('.contributeur-a-inviter', this.idConteneur)
    ).map((el) => $(el).data('email'));

    if (!emailsContributeurs.length) return Promise.reject();

    this.basculeLoader(true);
    $('#action-invitation').hide();

    return Promise.all(
      emailsContributeurs.map((emailContributeur) =>
        axios.post('/api/autorisation', {
          emailContributeur,
          idServices: [...this.tableauDesServices.servicesSelectionnes],
        })
      )
    )
      .then(() => {
        this.tableauDesServices.recupereServices();
        this.basculeLoader(false);
        this.basculeFormulaire(false);
        this.basculeRapport(true);
      })
      .catch((e) => {
        if (estInvitationDejaEnvoyee(e.response)) {
          $('.message-erreur#invitation-deja-envoyee').show();
        }
        $('#action-invitation').show();
        this.basculeLoader(false);
        throw e;
      });
  }
}

export default ActionInvitation;
