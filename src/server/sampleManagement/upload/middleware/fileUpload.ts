import * as path from 'path';
import * as fs from 'fs';
import * as rootDir from 'app-root-dir';
import * as multer from 'multer';
import { logger } from './../../../../aspects';

const uploadDir = 'uploads/';

const uploadPath = path.join(rootDir.get(), uploadDir);
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '.' + file.originalname);
    }
});

const multerUpload = multer({ //multer settings
    storage: storage
}).single('myPostName');

export {
    multerUpload
}