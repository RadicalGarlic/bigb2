import * as os from 'node:os';

import { UsageError } from 'operations/usage-error';
import { OperationFactory } from 'operations/operation-factory';

function getUsageMessage(): string {
  const INDENT = '  ';
  const APP_NAME = 'bigb2'
  return 'Usage: '
    + `${os.EOL}${INDENT}${APP_NAME} list-buckets`
    + `${os.EOL}${INDENT}${APP_NAME} download bucketName:file/path [dstFilePath]`
    // + os.EOL + indent + `bigb2 copy ${CopyOperation.SRC_ARG} someBucket:some/file/path ${CopyOperation.DST_ARG} someOtherBucket:some/other/file/path`;
}

async function main(): Promise<void> {
  try {
    const operation = await OperationFactory.get(process.argv);
    operation.parseCliArgs(process.argv);
    process.exitCode = await operation.run();
  } catch (err: unknown) {
    if (err instanceof UsageError) {
      console.log(err.message);
      console.log(getUsageMessage());
    } else {
      throw err;
    }
  }
}

main()
  .then(() => {})
  .catch((err: unknown) => { throw err; });
