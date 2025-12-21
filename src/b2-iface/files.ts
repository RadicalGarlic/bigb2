import { B2Api } from "b2-api/b2-api";
import { ListFileNamesResponse } from "b2-api/calls/list-file-names";
import { Bigb2Error } from "bigb2-error";

export interface File {
  accountId: string;
  bucketId: string;
  fileId: string;
  fileName: string;
  contentLength: number;
}

export async function getFileByPath(b2Api: B2Api, bucketId: string, filePath: string): Promise<File> {
  const files: ListFileNamesResponse = await b2Api.listFileNames(bucketId, undefined, filePath);
  if ((files.files.length <= 0) || (files.files[0].fileName !== filePath)) {
    throw new Bigb2Error(`No files found for filePath=${filePath} in bucketId=${bucketId}. Response=${JSON.stringify(files)}`);
  }
  return {
    accountId: files.files[0].accountId,
    bucketId: files.files[0].bucketId,
    fileId: files.files[0].fileId,
    fileName: files.files[0].fileName,
    contentLength: files.files[0].contentLength,
  };
}
