import { program } from 'commander';
import { DuplicationEnMasseDeServices } from './duplicationEnMasseDeServices.js';

program
  .description('Duplication en masse de services')
  .requiredOption(
    '--emailProprietaire <email>',
    "L'email du propriétaire du service source"
  )
  .requiredOption(
    '--idServiceSource <idService>',
    "L'identifiant du service source"
  )
  .requiredOption(
    '--codePrestataire <code>',
    'Le code du prestataire qui sera rattaché, dans Metabase, aux services clonés'
  )
  .option(
    '--dryRun <bool>',
    "Permet d'exécuter le script sans modifier les données",
    'true'
  )
  .action(async (options) => {
    const dryRunActif = options.dryRun !== 'false';
    const serviceDuplication = new DuplicationEnMasseDeServices(
      'production',
      dryRunActif,
      options.codePrestataire
    );

    await serviceDuplication.dupliqueSelonCsvInputDansConsole(
      options.emailProprietaire,
      options.idServiceSource
    );
    process.exit(0);
  });

program.parse();
