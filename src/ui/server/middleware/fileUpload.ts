import * as multer from 'multer';

const uploadToMemory = multer({
    // multer settings
    storage: multer.memoryStorage()
}).single('xslx');

export { uploadToMemory };
