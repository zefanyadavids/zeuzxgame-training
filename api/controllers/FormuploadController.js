/**
 * FormuploadController
 *
 * @description :: Server-side logic for managing formuploads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');
var PATH = require('path');
var AWS = require('aws-sdk');
const uuid = require('uuid/v4')
const flatry = require('flatry');

const { Controller } = require('sails-ember-rest');

let isEmpty = (value) => {
    if (value === null || value === undefined || value === '') {
        return true;
    }
    else {
        return false;
    }
};

var FormuploadController = new Controller({
    deleteSingleFile: function(filePath, callback) {
        fs.unlink('./assets'+filePath, function(err){
            if (err) {
                console.log('Error deleteSingleFile()');
                console.log(err);

                if (callback) {
                    callback(err);
                }
                else {
                    return 'Error deleteSingleFile()';
                }
            }
            else {
                console.log('Success deleteSingleFile()');

                if (callback) {
                    callback();
                }
                else {
                    return true;
                }
            }
        });
    },
    deleteDirectory: function(pathToDir, callback) {
        /*You can learn from this https://gist.github.com/liangzan/807712 */
        /*open the directory*/
        fs.readdir('./assets'+pathToDir, function(err, files){
            if (err) {
                console.log('Error deleteDirectory() - directory does not exists');
                console.log(err);
                if (callback) {
                    callback(err);
                }
                else {
                    return 'Error deleteDirectory() - directory does not exists';
                }
            }
            else {
                /*loop each file inside the directory, then delete it*/
                async.forEachSeries(files, function(file, callback){
                    /*remove the file*/
                    FormuploadController.deleteSingleFile(pathToDir+'/'+file, callback);

                }, function(err3){
                    console.log(err3);
                    fs.rmdir('./assets'+pathToDir, function(err3){
                        if (err3) {
                            console.log('error on deleting ./assets'+pathToDir);
                            console.log(err3);
                            if (callback) {
                                callback(err3);
                            }
                            else {
                                return 'Error deleteDirectory()';
                            }
                        }
                        else {
                            console.log('Success deleteDirectory()');
                            if (callback) {
                                callback();
                            }
                            else {
                                return true;
                            }
                        }
                    });
                });
            }
        });
    },

    /*Amazon S3 section*/
    deleteFromAmazonS3: function(key, callback) {
        AWS.config.loadFromPath('config/aws-config.json');
        var s3 = new AWS.S3();

        var s3Params = {Bucket: sails.config.S3BucketName, Key: key};

        s3.deleteObject(s3Params, function(err, data) {
            if (err) {
                console.log('Error s3.deleteObject()');
                console.log(err);
                if (callback) {
                    callback(err);
                }
                else {
                    return true;
                }
            }
            else {
                console.log('Success s3.deleteObject()');
                console.log(data);
                if (callback) {
                    callback();
                }
                else {
                    return true;
                }
            }
        });
    },
    uploadToAmazonS3: function(keyPath, bodyFile, callback) {
        AWS.config.loadFromPath('config/aws-config.json');
        var s3 = new AWS.S3();

        var s3Params = {Bucket: sails.config.S3BucketName, Key: keyPath, Body: bodyFile};

        s3.putObject(s3Params, function(err, data) {
            callback(err, data);
        });
    },
    downloadFromAmazonS3: function(req, res) {
        if (req.param('fd')) {
            AWS.config.loadFromPath('config/aws-config.json');
            console.log('FETCH FROM S3');
            var s3 = new AWS.S3();

            var s3Params = {
                Bucket: sails.config.S3BucketName,
                Key: req.param('fd')
            };

            s3.getObject(s3Params, function(err2, res2) {
                if (err2) {
                    console.log('Error s3.getObject()');
                    console.log(err2);
                    res.status(500).send('File not found');
                }
                else {
                    res.send(res2.Body);
                }
            });
        }
        else {
            console.log('Error downloadFromAmazonS3() - fd is null');
            res.status(500).send('Error downloadFromAmazonS3() - fd is null');
        }
    },

    uploadFormAttachment: async function(req, res){
        console.log('uploadFormAttachment');
        console.log(req.body);

        let path = req.body.path;
        let name = req.body.name;
        let doDelete = req.body.doDelete;
        let oldFilePath = req.body.oldFilePath;
        let stringifiedRecord = req.body.record;
        let UUID = req.body.UUID;
        let contentType = req.body['Content-Type'];

        let objRecord;

        try {
            objRecord = JSON.stringify(stringifiedRecord);
        }
        catch(err) {
            objRecord = {};
        }

        /*
            Upload the file into Disk first
            If amazonS3 enabled, then upload the file to S3 and then delete the file from the Disk
        */
        /*https://github.com/balderdashy/skipper/issues/23*/
        if (req._fileparser.upstreams.length === 0) {
            res.status(500).send('Please provide the file!');
        }
        else if (path === undefined || path === null || path === '') {
            res.status(500).send('Please provide file path!');
        }
        else if (name === undefined || name === null || name === '') {
            res.status(500).send('Please provide the file name!');
        }
        else {
            var file = req.file('file');

            if (doDelete && doDelete === "true") {
                let destroyCriteria = {UUID, filePath: oldFilePath};
                await Uploadedfile.destroy( destroyCriteria );
                sails.log(`Successfully delete Uploadedfile Record with criteria: `);
                sails.log(`${JSON.stringify(destroyCriteria)}`);
            }

            file.upload({
                dirname: '../../assets' + path,
                saveAs: name
            }, async function(err, uploadedFiles) {
                if (err){
                    console.log('Error upload file to Disk');
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    console.log('Success uploaded to Disk');
                    console.log(uploadedFiles[0].fd);

                    console.log("create the uploadedfile");

                    // how to get the uploaded file size?
                    
                    if (doDelete && doDelete === "false") {
                        if (oldFilePath) {
                            let oldFileNameArr = oldFilePath.split("/");
                            let oldFileName = oldFileNameArr[ oldFileNameArr.length-1 ];
                            if ( name === oldFileName) {
                                // update the current record
                                // criteria = {UUID, filePath}
                                let updateCriteria = {
                                    UUID,
                                    filePath: path
                                }
                                Uploadedfile.update(updateCriteria).set({
                                    size: 10
                                });
                            }
                        }
                        else {
                            let objUploadedfile = {
                                UUID,
                                filePath: `${path}/${name}`,
                                fileType: contentType,
                                name
                            };
                            let [err, newUp] = await flatry( Uploadedfile.create(objUploadedfile) );

                            if (err) {
                                sails.log.error("ada error bosQ");
                                console.log(err);
                                console.log(err.message);
                                return res.sendStatus(500);
                            }

                            console.log("success");
                            console.log(newUp);
                        }
                    }
                    else {
                        let objUploadedfile = {
                            UUID,
                            filePath: `${path}/${name}`,
                            fileType: contentType,
                            name
                        };
                        let [err, newUp] = await flatry( Uploadedfile.create(objUploadedfile) );

                        if (err) {
                            sails.log.error("ada error bosQ");
                            console.log(err);
                            console.log(err.message);
                            return res.sendStatus(500);
                        }

                        console.log("success");
                        console.log(newUp);
                    }
                    

                    var tempName = uploadedFiles[0].fd.split('/');

                    if (doDelete === 'true') {
                        FormuploadController.deleteSingleFile(oldFilePath, function(err) {
                            if (err) {
                                if (sails.config.useAmazonS3) {
                                    console.log('The Old File does not exist on the Disk, delete from S3');
                                    FormuploadController.deleteFromAmazonS3(oldFilePath);
                                }
                                else {
                                    console.log('Error delete the old File, File Path : '+oldFilePath);
                                }
                            }
                            else {
                                console.log('Success delete oldFilePath - '+oldFilePath);
                            }
                        });
                    }
                    else {
                        /*Additional Check which re-upload the file (edit) and the condition are:
                            - the old file is located on the Disk
                            - the new file uploded to S3
                            - the file name from both, old and new file, are the same
                        */
                        if ( (path + '/' + tempName[tempName.length-1]) === oldFilePath && sails.config.useAmazonS3 ) {
                            FormuploadController.deleteDirectory(path);
                        }
                    }

                    if (sails.config.useAmazonS3) {
                        var tempBuffer = fs.createReadStream(uploadedFiles[0].fd);

                        FormuploadController.uploadToAmazonS3(path+'/'+tempName[tempName.length-1], tempBuffer, function(err2, data) {
                            if (err2) {
                                console.log('Error s3.putObject()');
                                console.log(err2);
                                res.status(500).send(err2);
                            }
                            else {
                                console.log('Success s3.putObject()');
                                console.log(data);

                                FormuploadController.deleteDirectory(path);
                                return res.status(200).json({
                                    path: uploadedFiles[0].fd,
                                    fileName: tempName[tempName.length-1]
                                });
                            }
                        });
                    }
                    else {
                        return res.status(200).json({
                            path: uploadedFiles[0].fd,
                            fileName: tempName[tempName.length-1]
                        });
                    }
                }
            });
        }
    },
    downloadFormAttachment: function(req, res){
        console.log(req.param('fd'));

        /*
            Use fs.stat first, 
            if exist, return
            else
                check useAmazonS3
                if useAmazonS3 call amazonS3
                else return null
        */
        if (req.param('fd') !== null && req.param('fd') !== 'null' && req.param('fd')) {
            fs.stat('./assets'+req.param('fd'), function(err, stat) {
                var tempName = req.param('fd').split('/');

                if (err) {
                    if (sails.config.useAmazonS3) {
                        AWS.config.loadFromPath('config/aws-config.json');
                        console.log('FETCH FROM S3');
                        var s3 = new AWS.S3();

                        var s3Params = {
                            Bucket: sails.config.S3BucketName,
                            Key: req.param('fd')
                        };

                        s3.getObject(s3Params, function(err2, res2) {
                            if (err2) {
                                console.log('Error s3.getObject()');
                                console.log(err2);
                                res.status(500).send('File not found');
                            }
                            else {

                                res.attachment(tempName[tempName.length-1]);
                                res.send(res2.Body);
                            }
                        });
                    }
                    else {
                        console.log('Error downloadFormAttachment()');
                        console.log(err);
                        let message;
                        if (err.code === "ENOENT") {
                            message = {errorMessage: `File doesn't exist`};
                        }
                        else {
                            message = err;
                        }
                        res.status(500).json(message);
                    }
                }
                else {
                    console.log('FETCH FROM DISK');
                    res.download(PATH.resolve( PATH.join(__dirname, '/../../assets'+req.param('fd')) ), tempName[tempName.length-1] );
                }
            });
        }
        else {
            console.log('Error downloadFormAttachment() - fd is null');
            res.status(500).send('Error downloadFormAttachment() - fd is null');
        }
    },
    deleteFormUploadedFile: function(req, res){
        var path = req.body.deletePath.substring(0, req.body.deletePath.lastIndexOf('/'));

        /*
            call deleteDirectory()
            create callback to delete from amazonS3
        */

        if (req.body.fromExternal === 'true') {
            if (sails.config.useAmazonS3) {
                FormuploadController.deleteFromAmazonS3(req.body.deletePath, function(err) {
                    if (err) {
                        res.status(500).send(err);
                    }
                    else {
                        res.sendStatus(200);
                    }
                });	
            }
            else {
                res.sendStatus(200);
            }
        }
        else {
            FormuploadController.deleteDirectory(path, function(err) {
                if (err) {
                    if (sails.config.useAmazonS3) {
                        FormuploadController.deleteFromAmazonS3(req.body.deletePath, function(err) {
                            if (err) {
                                res.status(500).send(err);
                            }
                            else {
                                res.sendStatus(200);
                            }
                        });					
                    }
                    else {
                        console.log('Error deleteFormUploadedFile()');
                        console.log(err);
                        res.status(500).send(err);
                    }
                }
                else {
                    res.sendStatus(200);
                }
            });
        }
    },

    /**
     * Get the filePath from UUID on Form Upload component
     * @param {*} req - Request Object
     * Use req.allParams() because this is a 'GET' API. Accepted query params consist of:
     * @property UUID {string} - UUID that generate when Upload File using UI-player
     * @param {*} res - Response Object
     */
    async getFilePath(req, res) {
        let {UUID} = req.allParams();

        if (isEmpty(UUID)) {
            return res.status(400).json({errorMessage: 'Please provide corrent Data'});
        }

        let err, formUploadedFiles;

        [err, formUploadedFiles] = await flatry( Formuploadedfile.find({UUID}) );

        if (err) {
            sails.log.error(`Error when fetching Uploaded Files. Error: ${err.message}`);
            return res.status(400).send(err.message);
        }

        let arrFilePath = [];

        formUploadedFiles.forEach(uploadedFile => {
            if ( uploadedFile.filePath && uploadedFile.fileType ) {
                arrFilePath.push({
                    filePath: uploadedFile.filePath,
                    fileType: uploadedFile.fileType
                });
            }
        });

        res.status(200).send(arrFilePath);
    },

    async generateUUID(req, res) {
        let UUID, err, foundUUID, generatedUUID;
        let generatingUUID = true;

        while(generatingUUID) {
            UUID = uuid();
            [err, foundUUID] = await flatry(UploadedfileUUID.find({ UUID }));
            if (err) {
                return res.status(500).send(err);
            }
            if (foundUUID.length == 0) {
                generatingUUID = false;
            }
        }
        [err, generatedUUID] = await flatry(UploadedfileUUID.create({ UUID }));
        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).send(UUID);
    }
});

module.exports = FormuploadController;
