
import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles("./src/app");

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Fixed: ${file}`);
    } catch (err) {
        console.error(`Error fixing ${file}:`, err);
    }
});
