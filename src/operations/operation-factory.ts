import { ListBuckets } from "./list-buckets-operation";
import { Operation } from "./operation";
import { UsageError } from "./usage-error";
import { DownloadOperation } from "./download-operation/download-operation";
import { UploadOperation } from "./upload-operation";

export class OperationFactory {
  private constructor() { }

  public static get(cliArgs: string[]): Operation {
    if (cliArgs.length < 3) {
      throw new UsageError('Not enough args');
    }

    let operation: Operation | null = null;
    if (cliArgs[2] === 'list-buckets') {
      operation = new ListBuckets();
    } else if (cliArgs[2] === 'download') {
      operation = new DownloadOperation();
    } else if (cliArgs[2] === 'upload') {
      operation = new UploadOperation();
    }
    if (!operation) {
      throw new UsageError('Unrecognized arg');
    }

    return operation;
  }
}
