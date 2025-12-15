export class CopyOperation {
  public static readonly SRC_ARG = '--src';
  public static readonly DST_ARG = '--dst';

  constructor(argsArray: string[]) {
    for (let i = 0; i < argsArray.length; i) {
      if (CopyOperation.SRC_ARG === argsArray[i]) {
        if (this.args.get(CopyOperation.SRC_ARG)) {
          throw new Error(`${CopyOperation.SRC_ARG} specified multiple times`);
        }
        this.args.set(CopyOperation.SRC_ARG, argsArray[i + 1]);
        i += 2;
      } else if (CopyOperation.DST_ARG === argsArray[i]) {
        if (this.args.get(CopyOperation.DST_ARG)) {
          throw new Error(`${CopyOperation.DST_ARG} specified multiple times`);
        }
        this.args.set(CopyOperation.DST_ARG, argsArray[i + 1]);
        i += 2;
      }
      else {
        throw new Error(`Unrecognized argument ${argsArray[i]}`)
      }
    }

    this.args.forEach((value: string, key: string) => {
      if (!value) {
        throw new Error(`${key} not specified`);
      }
    });
  }

  run() {
  }

  private args: Map<string, string> = new Map<string, string>([
    [CopyOperation.SRC_ARG, ''],
    [CopyOperation.DST_ARG, '']
  ]);
}
