import { getAllUnfinishedLargeFiles, UnfinishedLargeFile } from "b2-iface/unfinished-large-files";
import { Operation } from "./operation";
import { UsageError } from "./usage-error";
import { B2Api } from "b2-api/b2-api";
import { Bucket, getBucketByName } from "b2-iface/buckets";
import { Bigb2Error } from "bigb2-error";

export class ListUnfinishedLargeFilesOperation extends Operation {
  constructor(private bucketName?: string) {
    super();
  }

  public parseCliArgs(cliArgs: string[]) {
    if (cliArgs.length < 4) {
      throw new UsageError('Unexpected end of arguments');
    }
    this.bucketName = cliArgs[3];
  }

  public async run(): Promise<number> {
    if (!this.bucketName) {
      throw new Bigb2Error('Bucket name not set');
    }
    const b2Api: B2Api = await B2Api.fromKeyFile();
    const bucket: Bucket = await getBucketByName(b2Api, this.bucketName);
    const unfinishedLargeFiles: UnfinishedLargeFile[] = await getAllUnfinishedLargeFiles(b2Api, bucket.bucketId);
    console.log(JSON.stringify(unfinishedLargeFiles, null, 2));
    return 0;
  }
}
