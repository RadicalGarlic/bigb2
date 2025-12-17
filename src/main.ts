import * as os from 'node:os';

import { listBucketsOperation } from './operations/list-buckets';
import { downloadOperation } from './operations/download';
import { CopyOperation } from './operations/copy-operation';

function getUsageMessage(): string {
  const INDENT = '  ';
  const APP_NAME = 'bigb2'
  return 'Usage: '
    + `${os.EOL}${INDENT}${APP_NAME} list-buckets`
    // + os.EOL + indent + 'bigb2 download bucket srcFilePath dstFilePath'
    // + os.EOL + indent + `bigb2 copy ${CopyOperation.SRC_ARG} someBucket:some/file/path ${CopyOperation.DST_ARG} someOtherBucket:some/other/file/path`;
}

async function main(): Promise<null> {
  if (process.argv.length < 3) {
    console.log('Not enough args');
    console.log(getUsageMessage());
    return null;
  }

  if (process.argv[2] === 'list-buckets') {
    await listBucketsOperation();
  // } else if (process.argv[2] === 'download') {
  //   if (process.argv.length < 6) {
  //     console.log('Specify bucket, path, and output path');
  //     console.log(getUsageMessage());
  //     return;
  //   }
  //   await downloadOperation(process.argv[3], process.argv[4], process.argv[5]);
  // } else if ('copy' === process.argv[2]) {
  //   new CopyOperation(process.argv.slice(3)).run();
  } else {
    console.log('Unrecognized args');
    console.log(getUsageMessage());
  }
  return null;
}

main()
  .then((value: null) => {})
  .catch((err: unknown) => { throw err; });
