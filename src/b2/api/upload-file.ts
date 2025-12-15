// import fetch, { Response } from 'node-fetch';
// import * as crypto from 'crypto';

// import { AUTHORIZATION } from 'src/constants';

// export class UploadFileRequest {
//   constructor(
//     private uploadUrl: URL,
//     private uploadAuthToken: string,
//     private dstFilePath: string,
//     private srcData: Buffer
//   ) { }

//   async send(): Promise<UploadFileResponse> {
//     const sha1 = crypto.createHash('sha1');
//     sha1.update(new DataView(this.srcData.buffer));
//     const hash = sha1.digest('hex');

//     const res: Response = await fetch(
//       this.uploadUrl.toString(),
//       {
//         method: 'POST',
//         headers: {
//           AUTHORIZATION: this.uploadAuthToken,
//           'X-Bz-File-Name': encodeURI(this.dstFilePath),
//           'Content-Type': 'application/octet-stream',
//           'Content-Length': this.srcData.byteLength.toString(),
//           'X-Bz-Content-Sha1': hash
//         },
//         body: this.srcData.buffer
//       }
//     );

//     return Promise.resolve(UploadFileResponse.fromJson(await res.text()));
//   }
// }

// export class UploadFileResponse {
//   constructor(
//     public readonly fileId: string,
//     public readonly fileName: string,
//     public readonly sha1Hex: string
//   ) { }

//   static fromJson(json: string): UploadFileResponse {
//     const obj = JSON.parse(json);
//     if (
//       (typeof(obj.fileId) !== 'string')
//       || (typeof(obj.fileName) !== 'string')
//       || (typeof(obj.contentSha1) !== 'string')
//     ) {
//       throw new Error(`UploadFileResponse bad field(s), ${json}`);
//     }
//     return new UploadFileResponse(obj.fileId, obj.fileName, obj.contentSha1);
//   }
// }
