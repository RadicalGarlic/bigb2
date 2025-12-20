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

export async function getFileByPath(b2Api: B2Api, bucketId: string, filePath: string) {
  const files: ListFileNamesResponse = await b2Api.listFileNames(bucketId, undefined, filePath);
  if (files.files.length <= 0) {
    throw new Bigb2Error(`No files found for filePath=${filePath} in bucketId=${bucketId}`);
  }
  if (files.files.length > 1) {
    throw new Bigb2Error(`Multiple files found for filePath=${filePath} in bucketId=${bucketId}`);
  }
  return {
    accountId: files.files[0].accountId,
    bucketId: files.files[0].bucketId,
    fileId: files.files[0].fileId,
    fileName: files.files[0].fileName,
    contentLength: files.files[0].contentLength,
  };
}
