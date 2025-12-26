import { Bigb2Error } from "bigb2-error";

export type PrimitiveName = 'string' | 'number';

export function assertPrimitiveField(obj: any, fieldName: string, primitiveName: PrimitiveName): any {
  if (obj === null) {
    throw new Bigb2Error('Object was null');
  }
  if (obj === undefined) {
    throw new Bigb2Error('Object was undefined');
  }
  if (obj[fieldName] === undefined) {
    throw new Bigb2Error(`"${fieldName}" undefined`);
  }
  if (obj[fieldName] === null) {
    throw new Bigb2Error(`"${fieldName}" null`);
  }
  if ((typeof obj[fieldName]) !== primitiveName) {
    throw new Bigb2Error(`Type of "${fieldName}" was "${typeof obj[fieldName]}", not "${primitiveName}"`)
  }
  return obj[fieldName];
}
