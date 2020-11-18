export const FILE_MIME_TYPES = {
  //jpg/jpeg, png, bmp
  images: ['image/jpeg', 'image/png', 'image/bmp'],
  //doc, docx,
  word: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  //xls, xlsx
  excel: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  //rar, zip/zip
  archive: ['application/x-rar-compressed', 'application/zip', 'application/x-zip-compressed'],
  //txt, pdf
  other: ['text/plain', 'application/pdf']
};

export const ALLOWED_FILE_TYPE = [...FILE_MIME_TYPES.images, ...FILE_MIME_TYPES.word, ...FILE_MIME_TYPES.archive, ...FILE_MIME_TYPES.excel, ...FILE_MIME_TYPES.other];
export const ALLOWED_FILE_EXTENTIONS = ['jpg', 'jpeg', 'png', 'bmp', 'doc', 'docx', 'xls', 'xlsx', 'rar', 'zip', 'txt', 'pdf'];
export const IMAGE_UPLOADER_QUERY_LIMIT: number = 10;
export const UPLOAD_IMAGE_MAX_WIDTH: number = 1920;
export const UPLOAD_IMAGE_MAX_HEIGHT: number = 1080;
export const UPLOAD_IMAGE_COMPRESS_RATIO: number = 0.7;

export const MAX_FILE_SIZE = {
  bytes: 1024 * 1024 * 10,
  megabytes: 10
};
