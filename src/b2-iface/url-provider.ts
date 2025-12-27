import * as path from 'path';

enum Version {
  V2 = 'v2',
  V3 = 'v3',
}

export class UrlProvider {
  private static readonly VERSION = Version.V2;
  private static readonly B2API = 'b2api';

  static authorizeUrl(): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_authorize_account'),
      'https://api.backblazeb2.com'
    );
  }

  static getDownloadAuthorizationUrl(apiUrl: URL): URL {
    return new URL(
      path.join(
        UrlProvider.B2API,
        UrlProvider.VERSION,
        'b2_get_download_authorization'
      ),
      apiUrl
    );
  }

  static getFileInfoUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_get_file_info'),
      apiUrl
    );
  }

  static listBucketsUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_list_buckets'),
      apiUrl
    );
  }

  static listFileNamesUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_list_file_names'),
      apiUrl
    );
  }

  static downloadFileByIdUrl(downloadUrl: URL): URL {
    return new URL(
      path.join(
        UrlProvider.B2API,
        UrlProvider.VERSION,
        'b2_download_file_by_id'
      ),
      downloadUrl
    );
  }

  static getUploadUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_get_upload_url'),
      apiUrl
    );
  }

  static getUploadPartUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_get_upload_part_url'),
      apiUrl
    );
  }

  static startLargeFileUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_start_large_file'),
      apiUrl
    );
  }

  static copyPartUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_copy_part'),
      apiUrl
    );
  }

  static listUnfinishedLargeFilesUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_list_unfinished_large_files'),
      apiUrl,
    );
  }

  static listPartsUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_list_parts'),
      apiUrl,
    );
  }

  static finishLargeFileUrl(apiUrl: URL): URL {
    return new URL(
      path.join(UrlProvider.B2API, UrlProvider.VERSION, 'b2_finish_large_file'),
      apiUrl,
    )
  }
}
