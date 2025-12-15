// import * as fs from 'fs';
// import * as fsPromises from 'fs/promises';

// import { ReplaySubject, first } from 'rxjs';

// import { AccountKey } from './account-key';
// import {
//   AuthorizeAccountRequest,
//   AuthorizeAccountResponse
// } from './b2-api/authorize-account';
// import {
//   DownloadFileByIdRequest,
//   DownloadFileByIdResponse
// } from './b2-api/download-file-by-id';
// import {
//   GetUploadUrlRequest,
//   GetUploadUrlResponse
// } from './b2-api/get-upload-url';
// import {
//   Bucket,
//   ListBucketsRequest,
//   ListBucketsResponse
// } from './b2-api/list-buckets';
// import {
//   File,
//   ListFileNamesRequest,
//   ListFileNamesResponse
// } from './b2-api/list-file-names';
// import { UploadFileRequest, UploadFileResponse } from './b2-api/upload-file';

// export class B2Interface {
//   private auths = new ReplaySubject<AuthorizeAccountResponse>(1);

//   constructor() {
//     this.authorize(AccountKey.fromFile());
//   }

//   authorize(key: AccountKey) {
//     new AuthorizeAccountRequest(key).send().then(
//       (res: AuthorizeAccountResponse) => {
//         this.auths.next(res);
//       }
//     );
//   }

//   async downloadFile(bucketName: string, filePath: string, outPath: string) {
//     const auths: AuthorizeAccountResponse  = await this.getAuth();

//     const bucketsRes: ListBucketsResponse = await new ListBucketsRequest(
//       auths.apiUrl,
//       auths.authorizationToken,
//       auths.accountId
//     ).send();
//     const bucket: Bucket | undefined
//       = bucketsRes.buckets.find((bucket: Bucket) => {
//         return bucket.name === bucketName;
//       });
//     if (!bucket) {
//       throw new Error(`No bucket found with name ${bucketName}`);
//     }

//     const filesRes: ListFileNamesResponse = await new ListFileNamesRequest(
//       auths.apiUrl,
//       auths.authorizationToken,
//       bucket.id
//     ).send();
//     const file: File | undefined = filesRes.files.find((file: File) => {
//       return file.fileName === filePath;
//     });
//     if (!file) {
//       throw new Error(
//         `No file found in bucket ${bucketName} at path ${filePath}`
//       );
//     }

//     if (file.contentLength <= auths.recommendedPartSize) {
//       this.smallDownload(file.fileId, outPath);
//     } else {
//       console.log('too big');
//     }
//   }

//   async uploadFile(
//     srcFilePath: string,
//     bucketName: string,
//     dstFilePath: string
//   ) {
//     const auths: AuthorizeAccountResponse = await this.getAuth();
//     const bucketsRes: ListBucketsResponse = await new ListBucketsRequest(
//       auths.apiUrl,
//       auths.authorizationToken,
//       auths.accountId,
//       bucketName
//     ).send();
//     if (bucketsRes.buckets.length <= 0) {
//       console.log(`Bucket "${bucketName}" not found.`)
//       return;
//     }
//     if (bucketsRes.buckets.length !== 1) {
//       console.log(`Unexpectedly found more than one bucket, ${JSON.stringify(bucketsRes)}`);
//       return;
//     }
//     const bucketId = bucketsRes.buckets[0].id;
//     const srcFileSizeBytes: BigInt = (await fsPromises.lstat(
//       srcFilePath,
//       { bigint: true}
//     )).size;
//     if (srcFileSizeBytes < BigInt(auths.absoluteMinimumPartSize)) {
//       const srcData: Buffer = await fsPromises.readFile(srcFilePath);
//       const uploadUrlRes: GetUploadUrlResponse = await new GetUploadUrlRequest(
//         auths.apiUrl,
//         auths.authorizationToken,
//         bucketId
//       ).send();
//       const uploadFileRes: UploadFileResponse = await new UploadFileRequest(
//         uploadUrlRes.uploadUrl,
//         uploadUrlRes.uploadAuthToken,
//         dstFilePath,
//         srcData
//       ).send();
//       console.log(JSON.stringify(uploadFileRes));
//     } else {
//       this.bigUpload('fileId', 'outPath');
//     }
//   }

//   private getAuth(): Promise<AuthorizeAccountResponse> {
//     return new Promise<AuthorizeAccountResponse>((resolve) => {
//       this.auths.pipe(first()).subscribe(
//         (auth: AuthorizeAccountResponse) => { resolve(auth); }
//       );
//     });
//   }

//   private async smallDownload(fileId: string, outPath: string) {
//     const auth: AuthorizeAccountResponse = await this.getAuth();
//     new DownloadFileByIdRequest(
//       auth.downloadUrl,
//       auth.authorizationToken,
//       fileId
//     ).send().then((res: DownloadFileByIdResponse) => {
//       fs.writeFileSync(outPath, new DataView(res.data));
//     });
//   }

//   private async bigUpload(fileId: string, outPath: string) {
//     // startLargeFile and get the file ID
//     // getUploadPartUrl with file ID
//     // uploadPart
//   }
// }
