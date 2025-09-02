import * as uuid from 'uuid';
import { UUID } from '../typesBasiques.js';

export type AdaptateurUUID = {
  genereUUID: () => UUID;
};

const genereUUID = (): UUID => uuid.v4() as UUID;

const fabriqueAdaptateurUUID = (): AdaptateurUUID => ({ genereUUID });

export { genereUUID, fabriqueAdaptateurUUID };
