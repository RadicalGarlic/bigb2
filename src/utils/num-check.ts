export function isNum(s: string | null | undefined): boolean {
  if ((s === null) || (s === undefined)) {
    return false;
  }
  return !isNaN(parseInt(s));
}

export function assertNum(a: any, err: Error): number {
  if ((a === null) || (a === undefined)) {
    throw err;
  }

  if ((typeof a) === 'string') {
    const test = parseInt(a);
    if (isNaN(test)) {
      throw err;
    }
    return test;
  }

  throw err;
}
