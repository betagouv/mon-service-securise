import { UUID } from '../../src/typesBasiques.js';

export function unUUID(bit: string): UUID {
  return <UUID>'11111111-1111-1111-1111-111111111111'.replace(/1/g, bit);
}
