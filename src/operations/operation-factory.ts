import { ListBuckets } from "./list-buckets";
import { Operation } from "./operation";
import { UsageError } from "./usage-error";

export class OperationFactory {
  private constructor() { }

  public static get(cliArgs: string[]): Operation {
    if (cliArgs.length < 3) {
      throw new UsageError('Not enough args');
    }

    let operation: Operation | null = null;
    if (cliArgs[2] === 'list-buckets') {
      operation = new ListBuckets();
    }

    if (!operation) {
      throw new UsageError('Unrecognized arg');
    }
    operation.parseCliArgs(cliArgs);
    return operation;
  }
}
