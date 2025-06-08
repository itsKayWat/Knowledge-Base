// File Storage System
// This module handles the physical storage of files in the file system

/**
 * FileStorageSystem - Handles file storage and retrieval
 * with support for the following naming convention:
 * - 1F = 1st filter - F=Filter
 * - 1B = 1st book - B=Book
 * - 1C = 1st category - C=Category
 * - 1FO = 1st folder - FO=Folder
 * - 1A = 1st article - A=Article
 * - 1FI = 1st file - FI=File
 */
const FileStorageSystem = (function() {
    // Base storage path
    const BASE_STORAGE_PATH = 'storage';

    // Item type identifiers
    const TYPE_IDENTIFIERS = {
        FILTER: 'F',
        BOOK: 'B',
        CATEGORY: 'C',
        FOLDER: 'FO',
        ARTICLE: 'A',
        FILE: 'FI'
    };

    /**
     * Identifies the type of an item based on its ID
     * @param {string} id - The item ID (e.g., '1B', '2C', '3FI')
     * @returns {string|null} - The type or null if not identified
     */
    function identifyItemType(id) {
        if (!id) return null;

        // Check for each type pattern
        if (id.match(/^\d+F$/i)) return 'filter';
        if (id.match(/^\d+B$/i)) return 'book';
        if (id.match(/^\d+C$/i)) return 'category';
        if (id.match(/^\d+FO$/i)) return 'folder';
        if (id.match(/^\d+A$/i)) return 'article';
        if (id.match(/^\d+FI$/i) || id.match(/^\d+FI-/)) return 'file';

        return null;
    }

    /**
     * Creates a new ID following the naming convention
     * @param {string} type - The item type (filter, book, category, folder, article, file)
     * @param {number} index - The numerical index
     * @returns {string} - The formatted ID
     */
    function createItemId(type, index) {
        if (!type || typeof index !== 'number') {
            console.error('Invalid parameters for createItemId');
            return null;
        }

        // Get the type identifier
        let typeId = '';
        switch (type.toLowerCase()) {
            case 'filter': typeId = TYPE_IDENTIFIERS.FILTER; break;
            case 'book': typeId = TYPE_IDENTIFIERS.BOOK; break;
            case 'category': typeId = TYPE_IDENTIFIERS.CATEGORY; break;
            case 'folder': typeId = TYPE_IDENTIFIERS.FOLDER; break;
            case 'article': typeId = TYPE_IDENTIFIERS.ARTICLE; break;
            case 'file': typeId = TYPE_IDENTIFIERS.FILE; break;
            default:
                console.error(`Unknown item type: ${type}`);
                return null;
        }

        return `${index}${typeId}`;
    }

    /**
     * Ensures the directory structure exists for a given path
     * @param {string} path - The path to ensure exists
     * @returns {boolean} - Whether the operation succeeded
     */
    function ensureDirectoryExists(path) {
        try {
            // In a browser extension environment with FileSystem API
            // Implementation would create directories recursively
            // For now we're simulating this - in production would use FileSystem API
            console.log(`Ensuring directory exists: ${path}`);
            return true;
        } catch (error) {
            console.error('Error creating directory structure:', error);
            return false;
        }
    }

    /**
     * Sanitizes a file name to be safe for file system use
     * @param {string} fileName - The file name to sanitize
     * @returns {string} - The sanitized file name
     */
    function sanitizeFileName(fileName) {
        return fileName.replace(/[/\\?%*:|"<>]/g, '-');
    }

    /**
     * Generates a storage path for a file based on its hierarchy following the naming convention:
     * 1F = 1st file - F=Filter
     * 1B= 1st book - B=Book
     * 1C= 1st Category - C=Category
     * 1FO= 1st Folder - FO=Folder
     * 1A= 1st Article - A=Article
     * 1FI= 1st File - FI=File
     * 
     * @param {Object} fileData - The file data object
     * @param {string} basePath - The base storage path
     * @returns {string} - The generated storage path
     */
    function generateStoragePath(fileData, basePath = BASE_STORAGE_PATH) {
        // Start with the base storage path
        let path = basePath;

        // Add book ID folder - format should already be in the proper format (e.g., 1B for first book)
        // But we'll ensure it follows the convention
        const bookId = fileData.bookId;
        if (bookId) {
            // Validate the bookId follows our convention
            if (!bookId.match(/^\d+B$/)) {
                console.warn(`Book ID ${bookId} doesn't follow the naming convention (e.g., 1B). Using as-is.`);
            }
            path += `/${bookId}`;
        }

        // If there's a parent category/folder, add that
        if (fileData.parentId) {
            // Check the type of parent (category or folder) and use appropriate convention
            let parentType = '';
            if (fileData.parentType === 'category') {
                // For categories, use the C suffix (e.g., 1C)
                parentType = 'C';
            } else if (fileData.parentType === 'folder') {
                // For folders, use the FO suffix (e.g., 1FO)
                parentType = 'FO';
            }

            // Get the index from the parentId if it exists
            let parentIndex = '';
            const matches = fileData.parentId.match(/^(\d+)/);
            if (matches && matches.length > 1) {
                parentIndex = matches[1];
            }

            // Check if the parent is pinned
            const isPinned = fileData.parentIsPinned || false;
            const pinnedSuffix = isPinned ? '-P' : '';

            // If we have both index and type, ensure the parent ID follows our convention
            if (parentIndex && parentType) {
                // Check if the parentId follows our convention
                if (!fileData.parentId.match(new RegExp(`^${parentIndex}${parentType}${isPinned ? '-P' : ''}$`))) {
                    console.warn(`Parent ID ${fileData.parentId} doesn't follow the naming convention. Using format: ${parentIndex}${parentType}${pinnedSuffix}`);
                    path += `/${parentIndex}${parentType}${pinnedSuffix}`;
                } else {
                    path += `/${fileData.parentId}`;
                }
            } else {
                // Just use the parentId as-is
                path += `/${fileData.parentId}`;
            }
        }

        // Add the file with proper FI prefix
        // Extract file index from ID if it exists
        let fileIndex = '';
        if (fileData.id) {
            const matches = fileData.id.match(/^(\d+)/);
            if (matches && matches.length > 1) {
                fileIndex = matches[1];
            }
        }

        // Generate file name with proper prefix if needed
        const sanitizedName = sanitizeFileName(fileData.name);

        // If this is a user uploaded file (not a system file)
        if (!fileData.isSystemFile) {
            // Use the FI suffix for regular files with -P for pinned items
            if (fileIndex) {
                // Add the -P suffix for pinned items directly after the type identifier
                if (fileData.isPinned) {
                    path += `/${fileIndex}FI-P-${sanitizedName}`;
                } else {
                    path += `/${fileIndex}FI-${sanitizedName}`;
                }
            } else {
                // If no index found, generate a new one based on timestamp
                const newIndex = Math.floor(Date.now() / 1000) % 10000;
                if (fileData.isPinned) {
                    path += `/${newIndex}FI-P-${sanitizedName}`;
                } else {
                    path += `/${newIndex}FI-${sanitizedName}`;
                }
            }
        } else {
            // For system files, just use the name directly
            path += `/${sanitizedName}`;
        }

        return path;
    }

    /**
     * Saves a file to the file system
     * @param {Object} fileData - The file data object
     * @param {string} basePath - The base storage path
     * @returns {Object} - Updated file object with storage path
     */
    function saveFileToStorage(fileData, basePath = BASE_STORAGE_PATH) {
        try {
            // Generate storage path based on hierarchy
            const storagePath = generateStoragePath(fileData, basePath);

            // Ensure the directory structure exists
            const dirPath = storagePath.substring(0, storagePath.lastIndexOf('/'));
            ensureDirectoryExists(dirPath);

            // In a full implementation, we would write the file to disk here
            // For now, we're adding the storagePath to the file object
            console.log(`Saving file to: ${storagePath}`);

            // Update the file object with the storage path
            return {
                ...fileData,
                storagePath: storagePath
            };
        } catch (error) {
            console.error('Error saving file to storage:', error);
            return fileData;
        }
    }

    /**
     * Retrieves a file from storage
     * @param {string} filePath - The path to the file
     * @returns {Promise<ArrayBuffer>} - The file data
     */
    async function getFileFromStorage(filePath) {
        try {
            // In a full implementation, we would read the file from disk here
            // For now, return a placeholder
            console.log(`Getting file from: ${filePath}`);
            return null;
        } catch (error) {
            console.error('Error getting file from storage:', error);
            return null;
        }
    }

    /**
     * Exports all files to a backup archive
     * @param {Array} fileManifest - Array of file metadata objects
     * @returns {Promise<Blob>} - A blob containing the exported files
     */
    async function exportFilesToArchive(fileManifest) {
        try {
            console.log(`Exporting ${fileManifest.length} files to archive...`);

            // In a full implementation with FileSystem API, this would:
            // 1. Create a zip file
            // 2. Add each file from the manifest to the zip
            // 3. Return the zip blob

            // For now, we're just logging the operation
            fileManifest.forEach(file => {
                console.log(`Would export: ${file.storagePath}`);
            });

            return new Blob(['Exported files archive'], { type: 'application/zip' });
        } catch (error) {
            console.error('Error exporting files:', error);
            throw error;
        }
    }

    /**
     * Restores files from a backup archive
     * @param {Array} fileManifest - Array of file metadata objects
     * @param {Blob} archiveBlob - The archive blob containing the files
     * @returns {Promise<Array>} - Array of restored file paths
     */
    async function restoreFilesFromArchive(fileManifest, archiveBlob) {
        try {
            console.log(`Restoring ${fileManifest.length} files from archive...`);

            // In a full implementation with FileSystem API, this would:
            // 1. Extract the zip file
            // 2. Write each file to the correct location
            // 3. Return the array of restored paths

            // For now, we're just logging the operation
            const restoredPaths = [];
            fileManifest.forEach(file => {
                const path = generateStoragePath(file);
                console.log(`Would restore file to: ${path}`);
                restoredPaths.push(path);
            });

            return restoredPaths;
        } catch (error) {
            console.error('Error restoring files:', error);
            throw error;
        }
    }

    /**
     * Creates a directory structure based on the naming convention
     * @param {string} type - The type of directory (book, category, folder)
     * @param {string} name - The name of the directory
     * @param {number} index - The numerical index
     * @param {boolean} isPinned - Whether this directory is pinned
     * @param {string} parentPath - The parent path (optional)
     * @returns {string} - The path of the created directory
     */
    function createDirectory(type, name, index, isPinned = false, parentPath = BASE_STORAGE_PATH) {
        try {
            // Create ID based on type and index
            const dirId = createItemId(type, index);
            if (!dirId) return null;

            // Add the -P suffix for pinned items
            const pinnedSuffix = isPinned ? '-P' : '';

            // Create the full path following the convention: 1B-P-name for pinned or 1B-name for regular
            const path = `${parentPath}/${dirId}${pinnedSuffix}-${sanitizeFileName(name)}`;

            // Ensure the directory exists
            ensureDirectoryExists(path);

            return path;
        } catch (error) {
            console.error('Error creating directory:', error);
            return null;
        }
    }

    // Public API
    return {
        // Core file operations
        saveFileToStorage: saveFileToStorage,
        getFileFromStorage: getFileFromStorage,
        generateStoragePath: generateStoragePath,

        // Directory operations
        ensureDirectoryExists: ensureDirectoryExists,
        createDirectory: createDirectory,

        // ID and path utilities
        createItemId: createItemId,
        identifyItemType: identifyItemType,
        sanitizeFileName: sanitizeFileName,

        // Backup and restore
        exportFilesToArchive: exportFilesToArchive,
        restoreFilesFromArchive: restoreFilesFromArchive,

        // Constants
        TYPE_IDENTIFIERS: TYPE_IDENTIFIERS,
        BASE_STORAGE_PATH: BASE_STORAGE_PATH
    };
})();

// Make the FileStorageSystem available globally
window.FileStorageSystem = FileStorageSystem;

/**
 * Builds the complete storage path structure based on the bookCategories data
 * @param {Map} bookCategories - The book categories data
 * @param {string} basePath - The base storage path
 * @returns {Object} - A mapping of item IDs to storage paths
 */
function buildStorageStructure(bookCategories, basePath = 'storage') {
    const storageMap = {};

    // Iterate through all books
    bookCategories.forEach((categories, bookId) => {
        const bookPath = `${basePath}/${bookId}`;
        storageMap[bookId] = bookPath;

        // Iterate through all categories/folders/files in the book
        categories.forEach((item, itemId) => {
            let itemPath;
            if (item.parentId) {
                // If item has a parent, it goes in the parent's folder
                itemPath = `${storageMap[item.parentId]}/${sanitizeFileName(item.name)}`;
            } else {
                // Otherwise it's directly in the book folder
                itemPath = `${bookPath}/${sanitizeFileName(item.name)}`;
            }

            storageMap[itemId] = itemPath;
        });
    });

    return storageMap;
}

/**
 * Exports the entire knowledge base to a zip file
 * @param {Map} bookCategories - The book categories data
 * @param {string} basePath - The base storage path
 * @returns {Promise<Blob>} - The zip file as a blob
 */
async function exportToZip(bookCategories, basePath = 'storage') {
    try {
        // In a full implementation, we would create a zip file with the entire structure
        console.log('Exporting to ZIP...');

        // Return placeholder for now
        return new Blob(['Placeholder ZIP content'], { type: 'application/zip' });
    } catch (error) {
        console.error('Error exporting to ZIP:', error);
        return null;
    }
}

/**
 * Imports a knowledge base from a zip file
 * @param {File} zipFile - The zip file to import
 * @param {string} basePath - The base storage path
 * @returns {Promise<Object>} - The imported data structure
 */
async function importFromZip(zipFile, basePath = 'storage') {
    try {
        // In a full implementation, we would extract the zip file
        console.log('Importing from ZIP...');

        // Return placeholder for now
        return {
            bookCategories: new Map()
        };
    } catch (error) {
        console.error('Error importing from ZIP:', error);
        return null;
    }
}

// The FileStorageSystem functions are already exported via the return statement in the IIFE
// We just need to make it globally available
window.FileStorageSystem = FileStorageSystem;