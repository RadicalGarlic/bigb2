export function isNum(s: string | null | undefined): boolean {
  if ((s === null) || (s === undefined)) {
    return false;
  }
  return !isNaN(parseInt(s));
}

export function assertNum(s: string | null | undefined, err: Error): number {
  if (!isNum(s)) {
    throw err;
  }
  return parseInt(s!);
}
