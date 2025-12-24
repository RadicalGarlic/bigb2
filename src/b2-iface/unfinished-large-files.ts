import { B2Api } from "b2-api/b2-api";
import { ListPartsRequest, ListPartsResponse, Part } from "b2-api/calls/list-parts";
import {
  UnfinishedLargeFile as UnfinishedLargeFileB2Api,
  ListUnfinishedLargeFilesRequest,
  ListUnfinishedLargeFilesResponse,
 } from "b2-api/calls/list-unfinished-large-files";

export interface UnfinishedLargeFile {
  accountId: string;
  action: string; // TODO: Restrict to documented values
  bucketId: string;
  fileId: string;
  fileName: string;
  contentLength: number;
}

export async function getAllUnfinishedLargeFiles(b2Api: B2Api, bucketId: string, namePrefix?: string): Promise<UnfinishedLargeFile[]> {
  let nextFileId = '';
  const results: UnfinishedLargeFileB2Api[][] = [];
  do {
    const req: ListUnfinishedLargeFilesRequest = new ListUnfinishedLargeFilesRequest({
      apiUrl: new URL(b2Api.auths!.apiUrl),
      authToken: b2Api.auths!.authorizationToken,
      bucketId: bucketId,
      namePrefix: namePrefix,
      startFileId: nextFileId ? nextFileId : undefined,
    });
    const res: ListUnfinishedLargeFilesResponse = await req.send();
    results.push(res.files);
    nextFileId = res.nextFileId ?? '';
  } while (nextFileId)
  return results.flat().map((value: UnfinishedLargeFileB2Api) => {
    return {
      accountId: value.accountId,
      action: value.action,
      bucketId: value.bucketId,
      fileId: value.fileId,
      fileName: value.fileName,
      contentLength: value.contentLength,
    };
  });
}

export interface UnfinishedLargeFilePart {
  fileId: string;
  partNumber: number;
  contentLength: number;
  contentSha1: string;
}

export async function getAllUnfinishedLargeFileParts(b2Api: B2Api, fileId: string): Promise<UnfinishedLargeFilePart[]> {
  let nextPartNum = 0;
  const results = [];
  do {
    const req = new ListPartsRequest({
      apiUrl: new URL(b2Api.auths!.apiUrl),
      authToken: b2Api.auths!.authorizationToken,
      fileId: fileId,
      startPartNumber: nextPartNum ? nextPartNum : undefined,
    });
    const res: ListPartsResponse = await req.send();
    nextPartNum = res.nextPartNumber ?? 0;
    results.push(res.parts);
  } while (nextPartNum)
  return results
    .flat()
    .sort((a: Part, b: Part) => a.partNumber - b.partNumber)
    .map((value: Part) => {
      return {
        fileId: value.fileId,
        partNumber: value.partNumber,
        contentLength: value.contentLength,
        contentSha1: value.contentSha1,
      };
    });
}
