const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Helper function to zip a directory
function zipDirectory(sourceDir, outPath, zipRootFolderName) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(outPath);

    return new Promise((resolve, reject) => {
        archive
            .directory(sourceDir, zipRootFolderName)
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

// Helper function to zip a single file into a folder structure
function zipFileIntoFolder(sourceFile, outPath, zipRootFolderName) {
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = fs.createWriteStream(outPath);
    const fileName = path.basename(sourceFile);

    return new Promise((resolve, reject) => {
        archive
            .file(sourceFile, { name: `${zipRootFolderName}/${fileName}` })
            .on('error', err => reject(err))
            .pipe(stream);

        stream.on('close', () => resolve());
        archive.finalize();
    });
}

async function createZips() {
    try {
        console.log('Creating WordPress ZIPs...');

        // 1. Create Plugin ZIP
        // Source: wordpress_plugin/roulotte-pro-core.php
        // Destination: roulotte-manager-pro.zip
        // Structure inside zip: roulotte-manager-pro/roulotte-pro-core.php
        await zipFileIntoFolder(
            path.join(__dirname, '../wordpress_plugin/roulotte-pro-core.php'),
            path.join(__dirname, '../roulotte-manager-pro.zip'),
            'roulotte-manager-pro'
        );
        console.log('✅ Created roulotte-manager-pro.zip');

        // 2. Create Theme ZIP
        // Source: wordpress_theme/
        // Destination: roulotte-pro-theme.zip
        // Structure inside zip: roulotte-pro-theme/*
        await zipDirectory(
            path.join(__dirname, '../wordpress_theme'),
            path.join(__dirname, '../roulotte-pro-theme.zip'),
            'roulotte-pro-theme'
        );
        console.log('✅ Created roulotte-pro-theme.zip');

    } catch (error) {
        console.error('❌ Error creating ZIPs:', error);
    }
}

createZips();
