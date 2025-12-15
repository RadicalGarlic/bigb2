// import fetch, { Response } from 'node-fetch';

// import { UrlProvider } from './url-provider';
// import { AUTHORIZATION } from 'src/constants';

// export class GetUploadUrlRequest {
//   constructor(
//     private apiUrl: URL,
//     private authToken: string,
//     private bucketId: string
//   ) { }

//   async send(): Promise<GetUploadUrlResponse> {
//     const res: Response = await fetch(
//       UrlProvider.getUploadUrlUrl(this.apiUrl).toString(),
//       {
//         method: 'POST',
//         headers: { AUTHORIZATION: this.authToken },
//         body: JSON.stringify({ bucketId: this.bucketId })
//       }
//     );

//     return Promise.resolve(GetUploadUrlResponse.fromJson(await res.text()));
//   }
// }

// export class GetUploadUrlResponse {
//   constructor(
//     public readonly uploadUrl: URL,
//     public readonly uploadAuthToken: string,
//     public readonly bucketId: string
//   ) { }

//   static fromJson(json: string): GetUploadUrlResponse {
//     const obj = JSON.parse(json);
//     if (
//       (typeof(obj.uploadUrl) !== 'string')
//       || (typeof(obj.authorizationToken) !== 'string')
//       || (typeof(obj.bucketId) !== 'string')
//     ) {
//       throw new Error(`GetUploadUrlResponse bad field(s) ${json}`);
//     }

//     return new GetUploadUrlResponse(
//       new URL(obj.uploadUrl),
//       obj.authorizationToken,
//       obj.bucketId
//     );
//   }
// }
