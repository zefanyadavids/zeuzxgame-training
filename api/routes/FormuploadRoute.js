module.exports = {
    'get /api/v1/formuploads/downloadFromAmazonS3': 'FormuploadController.downloadFromAmazonS3',
    'post /api/v1/formuploads/uploadFormAttachment': 'FormuploadController.uploadFormAttachment',
    'post /api/v1/formuploads/downloadFormAttachment': 'FormuploadController.downloadFormAttachment',
    'post /api/v1/formuploads/deleteFormUploadedFile': 'FormuploadController.deleteFormUploadedFile',
    'get /api/v1/formuploads/getFilePath': 'FormuploadController.getFilePath',
    'post /api/v1/formuploads/generateUUID': 'FormuploadController.generateUUID'
};
