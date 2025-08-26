import * as uuid from 'uuid';

const genereUUID = () => uuid.v4();

const fabriqueAdaptateurUUID = () => ({ genereUUID });

export { genereUUID, fabriqueAdaptateurUUID };
