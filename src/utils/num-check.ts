export function isNum(a: any): boolean {
  return (typeof a) === 'number';
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
