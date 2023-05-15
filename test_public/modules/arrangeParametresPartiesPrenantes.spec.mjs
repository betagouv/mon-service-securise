import expect from 'expect.js';
import arrangeParametresPartiesPrenantes from '../../public/modules/arrangeParametresPartiesPrenantes.mjs';

describe("Une demande d'arrangement des paramètres des parties prenantes", () => {
  it('ne modifie pas les paramètres quand il y a uniquement des paramètres atomiques', () => {
    const parametres = {
      autoriteHomologation: 'Jean',
      fonctionAutoriteHomologation: '',
      expertCybersecurite: 'Jacques',
      fonctionExpertCybersecurite: '',
      delegueProtectionDonnees: 'Michael',
      fonctionDelegueProtectionDonnees: '',
      piloteProjet: 'Paul',
      fonctionPiloteProjet: '',
    };

    arrangeParametresPartiesPrenantes(parametres);

    expect(parametres.autoriteHomologation).to.equal('Jean');
    expect(parametres.fonctionAutoriteHomologation).to.equal('');
    expect(parametres.expertCybersecurite).to.equal('Jacques');
    expect(parametres.fonctionExpertCybersecurite).to.equal('');
    expect(parametres.delegueProtectionDonnees).to.equal('Michael');
    expect(parametres.fonctionDelegueProtectionDonnees).to.equal('');
    expect(parametres.piloteProjet).to.equal('Paul');
    expect(parametres.fonctionPiloteProjet).to.equal('');
  });

  it("groupe les acteurs de l'homologation spécifiques", () => {
    const parametres = {
      'role-acteur-homologation-0': 'Acteur 1',
      'nom-acteur-homologation-0': 'Jim',
      'fonction-acteur-homologation-0': '',
      'role-acteur-homologation-1': 'Acteur 2',
      'nom-acteur-homologation-1': 'Joe',
      'fonction-acteur-homologation-1': '',
    };

    arrangeParametresPartiesPrenantes(parametres);

    expect(parametres).to.not.have.property('role-acteur-homologation-0');
    expect(parametres).to.not.have.property('nom-acteur-homologation-0');
    expect(parametres).to.not.have.property('fonction-acteur-homologation-0');
    expect(parametres).to.not.have.property('role-acteur-homologation-1');
    expect(parametres).to.not.have.property('nom-acteur-homologation-1');
    expect(parametres).to.not.have.property('fonction-acteur-homologation-1');
    expect(parametres.acteursHomologation).to.eql([
      {
        role: 'Acteur 1',
        nom: 'Jim',
      },
      {
        role: 'Acteur 2',
        nom: 'Joe',
      },
    ]);
  });

  it('intègre le développement et fourniture dans les parties prenantes', () => {
    const parametres = {
      developpementFournitureNom: 'une ESN',
      developpementFournitureNatureAcces: '',
      developpementFourniturePointContact: '',
    };

    arrangeParametresPartiesPrenantes(parametres);

    expect(parametres.partiesPrenantes).to.eql([
      {
        nom: 'une ESN',
        type: 'DeveloppementFourniture',
      },
    ]);
    expect(parametres).to.not.have.property('developpementFournitureNom');
    expect(parametres).to.not.have.property(
      'developpementFournitureNatureAcces'
    );
    expect(parametres).to.not.have.property(
      'developpementFourniturePointContact'
    );
  });

  it("intègre l'hébergement dans les parties prenantes", () => {
    const parametres = {
      hebergementNom: 'lws',
      hebergementNatureAcces: 'une nature',
      hebergementPointContact: '',
    };

    arrangeParametresPartiesPrenantes(parametres);

    expect(parametres.partiesPrenantes).to.eql([
      {
        nom: 'lws',
        natureAcces: 'une nature',
        type: 'Hebergement',
      },
    ]);
    expect(parametres).to.not.have.property('hebergementNom');
    expect(parametres).to.not.have.property('hebergementNatureAcces');
    expect(parametres).to.not.have.property('hebergementPointContact');
  });

  it('intègre la maintenance du service dans les parties prenantes', () => {
    const parametres = {
      maintenanceServiceNom: 'Mainteneur',
      maintenanceServiceNatureAcces: 'une nature de maintenance',
      maintenanceServicePointContact: 'un point de contact',
    };

    arrangeParametresPartiesPrenantes(parametres);

    expect(parametres.partiesPrenantes).to.eql([
      {
        nom: 'Mainteneur',
        natureAcces: 'une nature de maintenance',
        pointContact: 'un point de contact',
        type: 'MaintenanceService',
      },
    ]);
    expect(parametres).to.not.have.property('maintenanceServiceNom');
    expect(parametres).to.not.have.property('maintenanceServiceNatureAcces');
    expect(parametres).to.not.have.property('maintenanceServicePointContact');
  });

  it('intègre la sécurité du service dans les parties prenantes', () => {
    const parametres = {
      securiteServiceNom: 'Un service de sécurité',
      securiteServiceNatureAcces: 'une nature de securite',
      securiteServicePointContact: 'un point de contact sécurisé',
    };

    arrangeParametresPartiesPrenantes(parametres);

    expect(parametres.partiesPrenantes).to.eql([
      {
        nom: 'Un service de sécurité',
        natureAcces: 'une nature de securite',
        pointContact: 'un point de contact sécurisé',
        type: 'SecuriteService',
      },
    ]);
    expect(parametres).to.not.have.property('securiteServiceNom');
    expect(parametres).to.not.have.property('securiteServiceNatureAcces');
    expect(parametres).to.not.have.property('securiteServicePointContact');
  });

  it('groupe les parties prenantes spécifiques', () => {
    const parametres = {
      'nom-partie-prenante-specifique-1': 'Entité 1',
      'natureAcces-partie-prenante-specifique-1': '',
      'pointContact-partie-prenante-specifique-1': '',
      'nom-partie-prenante-specifique-2': 'Entité 2',
      'natureAcces-partie-prenante-specifique-2': '',
      'pointContact-partie-prenante-specifique-2': '',
    };

    arrangeParametresPartiesPrenantes(parametres);

    expect(parametres).to.not.have.property('nom-partie-prenante-specifique-1');
    expect(parametres).to.not.have.property(
      'natureAcces-partie-prenante-specifique-1'
    );
    expect(parametres).to.not.have.property(
      'pointContact-partie-prenante-specifique-1'
    );
    expect(parametres).to.not.have.property('nom-partie-prenante-specifique-2');
    expect(parametres).to.not.have.property(
      'natureAcces-partie-prenante-specifique-2'
    );
    expect(parametres).to.not.have.property(
      'pointContact-partie-prenante-specifique-2'
    );
    expect(
      parametres.partiesPrenantes.some((objet) => objet?.nom === 'Entité 1')
    ).to.be(true);
    expect(
      parametres.partiesPrenantes.some((objet) => objet?.nom === 'Entité 2')
    ).to.be(true);
  });

  it('intègre les parties prenantes spécifiques avec les autres parties prenantes', () => {
    const parametres = {
      'nom-partie-prenante-specifique-1': 'Entité 1',
      'natureAcces-partie-prenante-specifique-1': '',
      'pointContact-partie-prenante-specifique-1': '',
      hebergementNom: 'lws',
      hebergementNatureAcces: 'une nature',
      hebergementPointContact: '',
    };

    arrangeParametresPartiesPrenantes(parametres);

    expect(
      parametres.partiesPrenantes.find(
        (objet) => objet?.type === 'PartiePrenanteSpecifique'
      )
    ).to.eql({
      nom: 'Entité 1',
      type: 'PartiePrenanteSpecifique',
    });
    expect(
      parametres.partiesPrenantes.find((objet) => objet?.type === 'Hebergement')
    ).to.eql({
      nom: 'lws',
      natureAcces: 'une nature',
      type: 'Hebergement',
    });
  });
});
