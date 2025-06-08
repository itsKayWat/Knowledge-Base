class PreviewViewer {
    constructor() {
        this.modal = null;
        this.currentFile = null;
        this.fileType = null;
        this.init();
    }

    init() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = 'preview-modal';
        this.modal.style.display = 'none';
        this.modal.innerHTML = `
            <div class="preview-modal-content">
                <div class="preview-header">
                    <div class="preview-title"></div>
                    <div class="preview-controls">
                        <button class="preview-close-btn">&times;</button>
                    </div>
                </div>
                <div class="preview-body">
                    <div class="preview-container"></div>
                </div>
                <div class="preview-footer">
                    <div class="preview-actions">
                        <button class="preview-download-btn">Download</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to document
        document.body.appendChild(this.modal);

        // Bind event listeners
        this.modal.querySelector('.preview-close-btn').addEventListener('click', () => this.close());
        this.modal.querySelector('.preview-download-btn').addEventListener('click', () => this.downloadFile());
        
        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        // Add styles
        this.addStyles();
    }

    addStyles() {
        const styles = `
            .preview-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .preview-modal-content {
                background: var(--card-color);
                width: 90%;
                height: 90%;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 16px rgba(0,0,0,0.4);
                border: 1px solid var(--border-color);
            }

            .preview-header {
                padding: 16px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--card-color);
            }

            .preview-title {
                font-size: 18px;
                font-weight: 500;
                color: var(--text-color);
            }

            .preview-controls button {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                padding: 4px 8px;
                color: var(--text-color);
                transition: color 0.2s;
            }
            .preview-controls button:hover {
                color: var(--primary-color);
            }

            .preview-body {
                flex: 1;
                overflow: auto;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                background: var(--card-color);
            }

            .preview-container {
                max-width: 100%;
                max-height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .preview-container img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 6px;
                background: var(--background-color);
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }

            .preview-container iframe {
                width: 100%;
                height: 100%;
                border: none;
                background: var(--background-color);
                border-radius: 6px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }

            .preview-footer {
                padding: 16px;
                border-top: 1px solid var(--border-color);
                display: flex;
                justify-content: flex-end;
                background: var(--card-color);
            }

            .preview-actions button {
                padding: 8px 16px;
                background: var(--button-blue);
                color: #fff;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
                transition: background 0.2s, color 0.2s;
            }

            .preview-actions button:hover {
                background: var(--primary-dark);
            }

            .preview-unsupported, .preview-error {
                color: var(--text-secondary);
                font-size: 16px;
                text-align: center;
                padding: 40px;
            }
            
            /* Archive Explorer Styles */
            .archive-explorer-container {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background: var(--card-color);
                border-radius: 6px;
                overflow: hidden;
            }
            
            .archive-breadcrumb {
                padding: 12px 16px;
                border-bottom: 1px solid var(--border-color);
                background: var(--card-color);
                font-size: 14px;
            }
            
            .breadcrumb-item {
                color: var(--text-secondary);
                cursor: pointer;
            }
            
            .breadcrumb-item:hover {
                color: var(--primary-color);
                text-decoration: underline;
            }
            
            .breadcrumb-item.active {
                color: var(--text-primary);
                font-weight: 500;
                cursor: default;
            }
            
            .archive-file-list {
                flex: 1;
                padding: 12px;
                overflow-y: auto;
                position: relative;
            }
            
            .archive-item {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                margin-bottom: 4px;
                transition: background-color 0.2s;
            }
            
            .archive-item:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }
            
            .archive-item-icon {
                margin-right: 12px;
                color: var(--text-secondary);
            }
            
            .archive-item.folder .archive-item-icon {
                color: #FF9800;
            }
            
            .archive-item-name {
                flex: 1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .archive-item-action {
                background-color: var(--button-blue);
                color: white;
                border: none;
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .archive-item:hover .archive-item-action {
                opacity: 1;
            }
            
            /* File preview within archive */
            .archive-file-preview {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 10;
            }
            
            .archive-preview-close {
                position: absolute;
                top: 15px;
                right: 15px;
                font-size: 28px;
                color: white;
                cursor: pointer;
                z-index: 11;
            }
            
            .archive-preview-content {
                max-width: 90%;
                max-height: 80%;
                overflow: auto;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .archive-preview-content img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            
            .archive-preview-content iframe {
                width: 100%;
                height: 80vh;
                border: none;
                background: white;
            }
            
            .archive-download-btn {
                margin-top: 20px;
                padding: 8px 16px;
                background: var(--button-blue);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            
            .archive-preview-generic {
                text-align: center;
                color: white;
            }
            
            .archive-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: var(--text-secondary);
            }
            
            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                border-top-color: var(--button-blue);
                animation: spin 1s ease-in-out infinite;
                margin-bottom: 10px;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .archive-error {
                color: #ff5252;
                text-align: center;
                padding: 20px;
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    async open(fileData) {
        this.currentFile = fileData;
        this.fileType = this.getFileType(fileData.name);
        
        // Set title
        this.modal.querySelector('.preview-title').textContent = fileData.name;
        
        // Clear previous content
        const container = this.modal.querySelector('.preview-container');
        container.innerHTML = '';

        // Load content based on file type
        try {
            switch (this.fileType) {
                case 'image':
                    await this.loadImage(fileData);
                    break;
                case 'pdf':
                    await this.loadPDF(fileData);
                    break;
                case 'archive':
                    await this.loadArchive(fileData);
                    break;
                default:
                    container.innerHTML = '<div class="preview-unsupported">This file type is not supported for preview</div>';
            }

            this.modal.style.display = 'flex';
        } catch (error) {
            console.error('Error loading preview:', error);
            container.innerHTML = '<div class="preview-error">Error loading preview</div>';
        }
    }

    async loadImage(fileData) {
        const container = this.modal.querySelector('.preview-container');
        const img = document.createElement('img');
        img.src = fileData.url;
        img.alt = fileData.name;
        container.appendChild(img);
    }

    async loadPDF(fileData) {
        const container = this.modal.querySelector('.preview-container');
        const iframe = document.createElement('iframe');
        iframe.src = fileData.url;
        container.appendChild(iframe);
    }

    getFileType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const pdfTypes = ['pdf'];
        const archiveTypes = ['zip', 'rar', '7z']; // Added archive types

        if (imageTypes.includes(extension)) return 'image';
        if (pdfTypes.includes(extension)) return 'pdf';
        if (archiveTypes.includes(extension)) return 'archive';
        return 'unsupported';
    }

    close() {
        this.modal.style.display = 'none';
        this.currentFile = null;
        this.fileType = null;
    }

    async loadArchive(fileData) {
        if (typeof JSZip === 'undefined') {
            // Load JSZip library dynamically if it's not already available
            await this.loadJSZip();
        }
        
        const container = this.modal.querySelector('.preview-container');
        container.classList.add('archive-explorer');
        
        // Create file explorer UI for ZIP
        const explorerContainer = document.createElement('div');
        explorerContainer.className = 'archive-explorer-container';
        
        // Add a loading indicator
        explorerContainer.innerHTML = `
            <div class="archive-loading">
                <div class="spinner"></div>
                <p>Loading archive contents...</p>
            </div>
        `;
        container.appendChild(explorerContainer);
        
        try {
            // Fetch the ZIP file content
            let zipContent;
            if (fileData.url) {
                const response = await fetch(fileData.url);
                zipContent = await response.arrayBuffer();
            } else if (fileData.content) {
                // Try to extract from data URL if it exists
                const dataUrlMatch = fileData.content.match(/^data:.*;base64,(.*)$/);
                if (dataUrlMatch) {
                    const base64Content = dataUrlMatch[1];
                    const binaryString = atob(base64Content);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    zipContent = bytes.buffer;
                }
            }
            
            if (!zipContent) {
                throw new Error('Could not load ZIP file content');
            }
            
            // Load the ZIP file using JSZip
            const zip = await JSZip.loadAsync(zipContent);
            
            // Create file explorer view
            explorerContainer.innerHTML = '';
            
            // Create breadcrumb navigation
            const breadcrumb = document.createElement('div');
            breadcrumb.className = 'archive-breadcrumb';
            breadcrumb.innerHTML = `<span class="breadcrumb-item active">Root</span>`;
            explorerContainer.appendChild(breadcrumb);
            
            // Create file list
            const fileList = document.createElement('div');
            fileList.className = 'archive-file-list';
            explorerContainer.appendChild(fileList);
            
            // Current path in the ZIP
            let currentPath = '';
            
            // Function to navigate to a path in the ZIP
            const navigateTo = async (path) => {
                currentPath = path;
                
                // Update breadcrumb
                const parts = path === '' ? [] : path.split('/');
                parts.unshift('Root'); // Add root as first item
                
                breadcrumb.innerHTML = parts.map((part, index) => {
                    const isLast = index === parts.length - 1;
                    const pathUpToHere = index === 0 ? '' : parts.slice(1, index + 1).join('/');
                    const classes = isLast ? 'breadcrumb-item active' : 'breadcrumb-item';
                    return `<span class="${classes}" data-path="${pathUpToHere}">${part}</span>`;
                }).join(' / ');
                
                // Get files and folders in the current path
                const items = [];
                
                // Process each file in the ZIP
                zip.forEach((relativePath, zipEntry) => {
                    // Skip directories directly (we'll infer them from file paths)
                    if (zipEntry.dir) return;
                    
                    // Check if this file belongs to the current path
                    if (currentPath === '') {
                        // Root level - only include files/folders that aren't nested
                        const parts = relativePath.split('/');
                        if (parts.length === 1 || (parts.length > 1 && !parts[0].trim())) {
                            // Direct child of root
                            const fileName = parts[parts.length - 1];
                            items.push({
                                name: fileName,
                                isFolder: false,
                                fullPath: relativePath,
                                entry: zipEntry
                            });
                        } else if (parts.length > 1) {
                            // This is a file in a subdirectory, add the top-level folder if it's not there yet
                            const folderName = parts[0];
                            if (!items.some(item => item.name === folderName && item.isFolder)) {
                                items.push({
                                    name: folderName,
                                    isFolder: true,
                                    fullPath: folderName + '/',
                                    entry: null
                                });
                            }
                        }
                    } else {
                        // Inside a subfolder
                        if (relativePath.startsWith(currentPath)) {
                            // Remove the current path prefix
                            const subPath = relativePath.substring(currentPath.length);
                            const parts = subPath.split('/');
                            
                            if (parts.length === 1) {
                                // Direct file in this folder
                                items.push({
                                    name: parts[0],
                                    isFolder: false,
                                    fullPath: relativePath,
                                    entry: zipEntry
                                });
                            } else if (parts.length > 1 && parts[0].trim() !== '') {
                                // This is a file in a subfolder, add the folder if it's not there yet
                                const folderName = parts[0];
                                if (!items.some(item => item.name === folderName && item.isFolder)) {
                                    items.push({
                                        name: folderName,
                                        isFolder: true,
                                        fullPath: currentPath + folderName + '/',
                                        entry: null
                                    });
                                }
                            }
                        }
                    }
                });
                
                // Sort items (folders first, then alphabetically)
                items.sort((a, b) => {
                    if (a.isFolder !== b.isFolder) {
                        return a.isFolder ? -1 : 1;
                    }
                    return a.name.localeCompare(b.name);
                });
                
                // Render items
                fileList.innerHTML = items.map(item => {
                    const icon = item.isFolder ? 
                        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-9a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2z"></path>
                        </svg>` : 
                        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>`;
                    
                    const fileExtClass = item.isFolder ? 'folder' : 'file-' + (item.name.split('.').pop().toLowerCase() || 'unknown');
                    const actionButton = item.isFolder ? '' : `<button class="archive-item-action" data-path="${item.fullPath}">Preview</button>`;
                    
                    return `
                        <div class="archive-item ${item.isFolder ? 'folder' : 'file'} ${fileExtClass}" data-path="${item.fullPath}">
                            <div class="archive-item-icon">${icon}</div>
                            <div class="archive-item-name">${item.name}</div>
                            ${actionButton}
                        </div>
                    `;
                }).join('');
                
                // Add event listeners for navigation and file preview
                const folderItems = fileList.querySelectorAll('.archive-item.folder');
                folderItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const path = item.getAttribute('data-path');
                        navigateTo(path);
                    });
                });
                
                const breadcrumbItems = breadcrumb.querySelectorAll('.breadcrumb-item');
                breadcrumbItems.forEach(item => {
                    if (!item.classList.contains('active')) {
                        item.addEventListener('click', () => {
                            const path = item.getAttribute('data-path');
                            navigateTo(path);
                        });
                    }
                });
                
                const previewButtons = fileList.querySelectorAll('.archive-item-action');
                previewButtons.forEach(button => {
                    button.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const path = button.getAttribute('data-path');
                        const fileItem = items.find(item => item.fullPath === path);
                        
                        if (fileItem && fileItem.entry) {
                            // Get file content
                            const content = await fileItem.entry.async('blob');
                            const url = URL.createObjectURL(content);
                            
                            // Determine file type for preview
                            const fileName = fileItem.name;
                            const extension = fileName.split('.').pop().toLowerCase();
                            
                            // Create a preview dialog
                            const previewDialog = document.createElement('div');
                            previewDialog.className = 'archive-file-preview';
                            
                            // Close button
                            const closeBtn = document.createElement('div');
                            closeBtn.className = 'archive-preview-close';
                            closeBtn.innerHTML = '&times;';
                            closeBtn.addEventListener('click', () => {
                                previewDialog.remove();
                                URL.revokeObjectURL(url);
                            });
                            
                            // Preview content
                            const previewContent = document.createElement('div');
                            previewContent.className = 'archive-preview-content';
                            
                            // Download button
                            const downloadBtn = document.createElement('button');
                            downloadBtn.className = 'archive-download-btn';
                            downloadBtn.textContent = 'Download';
                            downloadBtn.addEventListener('click', () => {
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = fileName;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                            });
                            
                            // File content preview based on type
                            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
                                // Image preview
                                const img = document.createElement('img');
                                img.src = url;
                                img.alt = fileName;
                                previewContent.appendChild(img);
                            } else if (['pdf'].includes(extension)) {
                                // PDF preview
                                const iframe = document.createElement('iframe');
                                iframe.src = url;
                                previewContent.appendChild(iframe);
                            } else {
                                // Generic file icon and info
                                previewContent.innerHTML = `
                                    <div class="archive-preview-generic">
                                        <div class="archive-preview-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                                <polyline points="13 2 13 9 20 9"></polyline>
                                            </svg>
                                        </div>
                                        <div class="archive-preview-info">
                                            <h3>${fileName}</h3>
                                            <p>This file type cannot be previewed directly.</p>
                                        </div>
                                    </div>
                                `;
                            }
                            
                            previewDialog.appendChild(closeBtn);
                            previewDialog.appendChild(previewContent);
                            previewDialog.appendChild(downloadBtn);
                            
                            fileList.appendChild(previewDialog);
                        }
                    });
                });
            };
            
            // Start navigation at root
            await navigateTo('');
            
        } catch (error) {
            console.error('Error loading ZIP file:', error);
            explorerContainer.innerHTML = `
                <div class="archive-error">
                    <p>Error loading archive: ${error.message}</p>
                </div>
            `;
        }
    }
    
    async loadJSZip() {
        return new Promise((resolve, reject) => {
            if (typeof JSZip !== 'undefined') {
                resolve();
                return;
            }
            
            // Use the local JSZip library instead of loading from CDN
            const script = document.createElement('script');
            script.src = 'js/jszip.min.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => {
                console.error('Failed to load local JSZip library, falling back to CDN');
                // Fallback to CDN if local file fails to load
                const cdnScript = document.createElement('script');
                cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
                cdnScript.async = true;
                cdnScript.onload = () => resolve();
                cdnScript.onerror = () => reject(new Error('Failed to load JSZip library'));
                document.head.appendChild(cdnScript);
            };
            document.head.appendChild(script);
        });
    }
    
    async downloadFile() {
        if (!this.currentFile) return;
        
        try {
            const response = await fetch(this.currentFile.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.currentFile.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    }
}

// Export the PreviewViewer class
window.PreviewViewer = PreviewViewer;
