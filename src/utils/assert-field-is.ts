import { Bigb2Error } from "bigb2-error";

export function assertFieldIs(obj: any, fieldName: string): any {
  if (obj === null) {
    throw new Bigb2Error('Object was null');
  }
  if (obj === undefined) {
    throw new Bigb2Error('Object was undefined');
  }
  if (!obj) {
    throw new Bigb2Error('Object was falsey');
  }
  if (obj[fieldName] === undefined) {
    throw new Bigb2Error(`"${fieldName}" undefined`);
  }
  if (obj[fieldName] === null) {
    throw new Bigb2Error(`"${fieldName}" null`);
  }
  if (!obj[fieldName]) {
    throw new Bigb2Error(`"${fieldName}" falsey`);
  }
  return obj[fieldName];
}
