import * as path from 'path';
import * as fs from 'fs';
import * as rootDir from 'app-root-dir';
import * as multer from 'multer';

const uploadDir = 'uploads/';

const uploadPath = path.join(rootDir.get(), uploadDir);
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({ // multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.' + file.originalname);
    }
});

const uploadToDisk = multer({ // multer settings
    storage: storage
}).single('myPostName');

const uploadToMemory = multer({ // multer settings
    storage: multer.memoryStorage()
}).single('myMemoryXSLX');

export {
    uploadToDisk,
    uploadToMemory
};
