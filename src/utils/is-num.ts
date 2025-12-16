export function isNum(s: string | null | undefined): boolean {
  if ((s === null) || (s === undefined)) {
    return false;
  }
  return !isNaN(parseInt(s));
}
