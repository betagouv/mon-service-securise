import * as JournalMemoire from '../../../src/adaptateurs/adaptateurJournalMSSMemoire.js';
import {
  AdaptateurJournalMSS,
  EvenementJournal,
} from '../../../src/adaptateurs/adaptateurJournalMSS.interface.ts';
import { consigneRisquesV2DansJournal } from '../../../src/bus/abonnements/consigneRisquesV2DansJournal.ts';
import { EvenementRisquesV2ServiceModifies as MssRisquesV2ServiceModifies } from '../../../src/bus/evenementRisquesV2ServiceModifies.ts';
import { unUUID } from '../../constructeurs/UUID.ts';
import { RisquesV2 } from '../../../src/moteurRisques/v2/risquesV2.ts';
import { RisqueV2 } from '../../../src/moteurRisques/v2/risqueV2.ts';

describe("L'abonnement qui consigne les risques v2dans le journal MSS", () => {
  let adaptateurJournal: AdaptateurJournalMSS;

  beforeEach(() => {
    adaptateurJournal = JournalMemoire.nouvelAdaptateur();
  });

  it('consigne un événement contenant les données des risques V2', async () => {
    let evenementRecu: EvenementJournal;
    adaptateurJournal.consigneEvenement = async (evenement) => {
      evenementRecu = evenement;
    };

    await consigneRisquesV2DansJournal({ adaptateurJournal })(
      new MssRisquesV2ServiceModifies(
        unUUID('S'),
        new RisquesV2({
          risques: [new RisqueV2('V3', { OV1: 3 }, 4, [], {})],
          risquesBruts: [],
          risquesCibles: [],
          risquesSpecifiques: [],
        })
      )
    );

    expect(evenementRecu!.type).toEqual('RISQUES_V2_SERVICE_MODIFIES');
  });
});
