import { B2Api } from "b2-api/b2-api";
import { ListFileNamesResponse } from "b2-api/calls/list-file-names";

export interface File {
  accountId: string;
  bucketId: string;
  fileId: string;
  fileName: string;
  contentLength: number;
  action: string; // TODO: enforce limited values
}

export async function getFileByPath(b2Api: B2Api, bucketId: string, filePath: string): Promise<File | null> {
  const files: ListFileNamesResponse = await b2Api.listFileNames(bucketId, undefined, filePath);
  if ((files.files.length <= 0) || (files.files[0].fileName !== filePath)) {
    return null;
  }
  return {
    accountId: files.files[0].accountId,
    bucketId: files.files[0].bucketId,
    fileId: files.files[0].fileId,
    fileName: files.files[0].fileName,
    contentLength: files.files[0].contentLength,
    action: files.files[0].action,
  };
}
