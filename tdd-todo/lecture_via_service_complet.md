# La TODO list du refacto visant à ne garder que `adaptateurPersistance.servicesComplets()`, mais au singulier

Le but : garder UN SEUL point d'entrée SQL pour la lecture de service.
Que ce soit PLUSIEURS (ceux d'un utilisateur / par hash de SIRET) ou UN SEUL (par ID de service)

- [x] Lecture de plusieurs services par ID utilisateur : déjà fait, c'est ce qui a amené à créer `adaptateurPersistance.servicesComplets`
- [x] Lecture d'un service par ID de service
- [x] Lecture de plusieurs services par hash de siret
- [x] Remplacer aussi les appels à `adaptateurPersistance.tousLesServices()`…
- [x] Ne plus avoir de méthode du type `depot.enrichisService()` qui rappelle de la persistance plusieurs fois pour hydrater un Service.
- [ ] … et donc pouvoir supprimer `adaptateurPersistance.service()` (et peut-être `adaptateurPersistance.autorisationsDuService()` etc.)
