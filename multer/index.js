const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs').promises;
const multer = require('multer');
const createHttpError = require('http-errors');

const uploadDir = path.join(process.cwd(), 'uploads');
const storeImage = path.join(process.cwd(), 'images');

const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})

const upload = multer({
    storage
});

app.post('/upload', upload.single('picture'), async (req, res, next) => {
    const { description } = req.body;
    const { path: temporaryName, originalname, filename } = req.file;
    const fileName = path.join(storeImage, filename);

    console.log('temporary name ', temporaryName)
    console.log('original name: ', originalname);
    console.log('fileName: ', fileName);


    try {
        await fs.rename(temporaryName, fileName);
    } catch (err) {
        await fs.unlink(temporaryName);
        return next(err);
    }
   
    res.json({
        description,
        message: 'Plik załadowany pomyślnie',
        status: 200,
    })
})

app.use((req, res, next) => {
    next(createHttpError(404));
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ message: err.message, status: err.status });
});

const isAccessible = path => {
    return fs
        .access(path)
        .then(() => true)
        .catch(() => false);
};

const createFolderIsNotExist = async folder => {
    if (!(await isAccessible(folder))) {
        await fs.mkdir(folder);
    }
};

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    createFolderIsNotExist(uploadDir);
    createFolderIsNotExist(storeImage);
    console.log(`Server running. Use on port:${PORT}`);
});