// Upload File Modal
function showUploadFileModal(parentId = null) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.zIndex = '1000';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.justifyContent = 'center';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = 'var(--card-color)';
    modalContent.style.borderRadius = 'var(--border-radius)';
    modalContent.style.padding = '20px';
    modalContent.style.width = '550px'; // Made wider
    modalContent.style.maxWidth = '90%';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.position = 'relative';
    
    // Create modal title
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'Upload File';
    modalTitle.style.marginTop = '0';
    modalTitle.style.marginBottom = '20px';
    modalTitle.style.fontSize = '24px';
    modalTitle.style.fontWeight = '500';
    modalTitle.style.display = 'flex';
    modalTitle.style.justifyContent = 'space-between';
    modalTitle.style.alignItems = 'center';
    
    // Add close button to title
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = 'var(--text-secondary)';
    closeButton.onclick = () => document.body.removeChild(modalOverlay);
    modalTitle.appendChild(closeButton);
    
    // Create form
    const form = document.createElement('form');
    form.onsubmit = (e) => {
        e.preventDefault();
        
        const selectedCategoryId = document.getElementById('parentCategory').value;
        const fileInput = document.getElementById('fileInput');
        
        // If no file is selected, show an error
        if (!fileInput.files || fileInput.files.length === 0) {
            showNotification('Please select a file to upload', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            // Get selected icon
            const selectedIconBtn = document.querySelector('.icon-select-btn.active');
            const selectedIcon = selectedIconBtn ? selectedIconBtn.getAttribute('data-icon') : 'file';
            
            // Get privacy setting
            const isPrivate = document.getElementById('filePrivate').checked;
            
            // Get pinned status
            const isPinned = document.getElementById('filePinned').checked;
            
            // Get upload type
            const uploadType = document.getElementById('uploadAsFile').checked ? 'file' : 'article';
            
            // Create the file object
            const fileId = 'file-' + Date.now();
            let newFile = {
                id: fileId,
                name: file.name,
                type: uploadType,
                fileType: file.type,
                size: file.size,
                content: event.target.result, // Base64 content for localStorage
                parentId: selectedCategoryId,
                bookId: selectedBookId,
                icon: selectedIcon,
                isPrivate: isPrivate,
                isPinned: isPinned,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Save the file to the physical storage system
            if (window.FileStorageSystem) {
                const storageBasePath = 'src/storage';
                // Save the file to disk and update the file object with the storage path
                newFile = window.FileStorageSystem.saveFileToStorage(newFile, storageBasePath);
                
                // For larger files, remove the content from the object stored in localStorage to save space
                // Only for files over 1MB, keep a reference to the file path instead
                if (file.size > 1024 * 1024) {
                    const contentPreview = event.target.result.substring(0, 100) + '...'; // Just keep a small preview
                    newFile.content = contentPreview;
                    newFile.contentStoredExternally = true; // Flag that the full content is on disk
                }
            } else {
                console.warn('FileStorageSystem not available. File will only be stored in localStorage.');
            }
            
            // Make sure the book has a categories map
            if (!bookCategories.has(selectedBookId)) {
                bookCategories.set(selectedBookId, new Map());
            }
            
            // Add file to bookCategories
            bookCategories.get(selectedBookId).set(fileId, newFile);
            
            // Save data
            saveData();
            
            // Close the modal
            document.body.removeChild(modalOverlay);
            
            // Refresh the view
            showMyBooksPage();
            
            // Show notification
            showNotification('File uploaded successfully!');
        };
        
        reader.onerror = function() {
            showNotification('Error reading file', 'error');
        };
        
        // Read the file as a data URL
        reader.readAsDataURL(file);
    };
    
    // Name input
    const nameGroup = document.createElement('div');
    nameGroup.style.marginBottom = '15px';
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name (optional)';
    nameLabel.style.display = 'block';
    nameLabel.style.marginBottom = '6px';
    nameLabel.style.color = 'var(--text-secondary)';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Enter a name for this file or article';
    nameInput.style.width = '100%';
    nameInput.style.padding = '10px';
    nameInput.style.borderRadius = 'var(--border-radius)';
    nameInput.style.border = '1px solid var(--border-color)';
    nameInput.style.backgroundColor = 'transparent';
    nameInput.style.color = 'var(--text-color)';
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);

    // Upload as radio - Two columns layout
    const typeGroup = document.createElement('div');
    typeGroup.style.marginBottom = '15px';
    typeGroup.style.display = 'flex';
    typeGroup.style.flexDirection = 'column';
    
    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Upload as';
    typeLabel.style.display = 'block';
    typeLabel.style.marginBottom = '6px';
    typeLabel.style.color = 'var(--text-secondary)';
    
    const radioContainer = document.createElement('div');
    radioContainer.style.display = 'flex';
    radioContainer.style.gap = '15px';
    
    const radioFile = document.createElement('input');
    radioFile.type = 'radio';
    radioFile.name = 'uploadType';
    radioFile.value = 'file';
    radioFile.id = 'uploadAsFile';
    radioFile.checked = true;
    
    const radioFileLabel = document.createElement('label');
    radioFileLabel.textContent = 'File';
    radioFileLabel.htmlFor = 'uploadAsFile';
    radioFileLabel.style.marginLeft = '6px';
    
    const fileRadioWrapper = document.createElement('div');
    fileRadioWrapper.appendChild(radioFile);
    fileRadioWrapper.appendChild(radioFileLabel);
    
    const radioArticle = document.createElement('input');
    radioArticle.type = 'radio';
    radioArticle.name = 'uploadType';
    radioArticle.value = 'article';
    radioArticle.id = 'uploadAsArticle';
    
    const radioArticleLabel = document.createElement('label');
    radioArticleLabel.textContent = 'Article';
    radioArticleLabel.htmlFor = 'uploadAsArticle';
    radioArticleLabel.style.marginLeft = '6px';
    
    const articleRadioWrapper = document.createElement('div');
    articleRadioWrapper.appendChild(radioArticle);
    articleRadioWrapper.appendChild(radioArticleLabel);
    
    radioContainer.appendChild(fileRadioWrapper);
    radioContainer.appendChild(articleRadioWrapper);
    
    typeGroup.appendChild(typeLabel);
    typeGroup.appendChild(radioContainer);
    
    // Parent Category Field
    const categoryGroup = document.createElement('div');
    categoryGroup.style.marginBottom = '20px';
    
    const categoryLabel = document.createElement('label');
    categoryLabel.htmlFor = 'parentCategory';
    categoryLabel.textContent = 'Parent Category *';
    categoryLabel.style.display = 'block';
    categoryLabel.style.marginBottom = '8px';
    categoryLabel.style.fontWeight = '500';
    
    // Custom select for categories only
    const categorySelect = document.createElement('select');
    categorySelect.id = 'parentCategory';
    categorySelect.style.width = '100%';
    categorySelect.style.padding = '10px';
    categorySelect.style.borderRadius = 'var(--border-radius)';
    categorySelect.style.border = '1px solid var(--border-color)';
    categorySelect.style.backgroundColor = 'var(--background-color)';
    categorySelect.style.color = 'var(--text-color)';
    categorySelect.required = true;
    
    // Populate categories for this book
    let categories = [];
    if (selectedBookId && bookCategories.has(selectedBookId)) {
        categories = Array.from(bookCategories.get(selectedBookId).values()).filter(item => item.type === 'category');
        categories.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (categories.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No categories available';
        categorySelect.appendChild(opt);
    } else {
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            categorySelect.appendChild(opt);
        });
    }
    
    // Add create new category option
    const createCatOpt = document.createElement('option');
    createCatOpt.value = '__create_new__';
    createCatOpt.textContent = '+ Create new category...';
    categorySelect.appendChild(createCatOpt);
    
    // Inline new category input
    const newCatInputWrapper = document.createElement('div');
    newCatInputWrapper.style.display = 'none';
    newCatInputWrapper.style.marginTop = '10px';
    const newCatInput = document.createElement('input');
    newCatInput.type = 'text';
    newCatInput.placeholder = 'New category name';
    newCatInput.style.width = '100%';
    newCatInput.style.padding = '10px';
    newCatInput.style.borderRadius = 'var(--border-radius)';
    newCatInput.style.border = '1px solid var(--border-color)';
    newCatInput.style.backgroundColor = 'var(--card-color)';
    newCatInput.style.color = 'var(--text-color)';
    newCatInputWrapper.appendChild(newCatInput);
    
    // Icon choices for new category
    const iconRow = document.createElement('div');
    iconRow.style.display = 'flex';
    iconRow.style.gap = '8px';
    iconRow.style.margin = '10px 0';
    
    // Use the same icons as in the main icon selector but smaller
    const categoryIcons = [
        { name: 'file', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>` },
        { name: 'folder', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>` },
        { name: 'book', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>` },
        { name: 'star', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>` }
    ];
    
    let selectedCategoryIcon = categoryIcons[0].name;
    categoryIcons.forEach(icon => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'category-icon-btn';
        btn.setAttribute('data-icon', icon.name);
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.width = '32px';
        btn.style.height = '32px';
        btn.style.borderRadius = '4px';
        btn.style.border = '1px solid var(--border-color)';
        btn.style.backgroundColor = icon.name === selectedCategoryIcon ? 'var(--button-blue)' : 'transparent';
        btn.style.color = icon.name === selectedCategoryIcon ? 'white' : 'var(--text-color)';
        btn.style.cursor = 'pointer';
        btn.innerHTML = icon.svg;
        
        btn.addEventListener('click', function() {
            // Update selected icon
            selectedCategoryIcon = icon.name;
            document.querySelectorAll('.category-icon-btn').forEach(b => {
                b.style.backgroundColor = 'transparent';
                b.style.color = 'var(--text-color)';
            });
            btn.style.backgroundColor = 'var(--button-blue)';
            btn.style.color = 'white';
        });
        
        iconRow.appendChild(btn);
    });
    
    newCatInputWrapper.appendChild(iconRow);
    
    // Add create button for new category
    const createCategoryBtn = document.createElement('button');
    createCategoryBtn.type = 'button';
    createCategoryBtn.textContent = 'Create Category';
    createCategoryBtn.style.backgroundColor = 'var(--button-blue)';
    createCategoryBtn.style.color = 'white';
    createCategoryBtn.style.border = 'none';
    createCategoryBtn.style.borderRadius = 'var(--border-radius)';
    createCategoryBtn.style.padding = '8px 16px';
    createCategoryBtn.style.cursor = 'pointer';
    createCategoryBtn.style.marginTop = '10px';
    
    createCategoryBtn.addEventListener('click', function() {
        const newCategoryName = newCatInput.value.trim();
        if (newCategoryName) {
            // Create the new category
            const newCategoryId = 'category-' + Date.now();
            const newCategory = {
                id: newCategoryId,
                name: newCategoryName,
                type: 'category',
                icon: selectedCategoryIcon,
                parentId: null,
                bookId: selectedBookId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Make sure the book has a categories map
            if (!bookCategories.has(selectedBookId)) {
                bookCategories.set(selectedBookId, new Map());
            }
            
            // Add category to bookCategories
            bookCategories.get(selectedBookId).set(newCategoryId, newCategory);
            
            // Save data
            saveData();
            
            // Add the new category to the dropdown
            const opt = document.createElement('option');
            opt.value = newCategoryId;
            opt.textContent = newCategoryName;
            
            // Insert before the 'Create new' option
            categorySelect.insertBefore(opt, createCatOpt);
            
            // Select the new category
            categorySelect.value = newCategoryId;
            
            // Hide the new category input
            newCatInputWrapper.style.display = 'none';
            
            // Show notification
            showNotification('Category created successfully!');
        } else {
            // Show error
            showNotification('Please enter a category name', 'error');
        }
    });
    
    newCatInputWrapper.appendChild(createCategoryBtn);
    
    // Event listener for category select
    categorySelect.addEventListener('change', function() {
        if (this.value === '__create_new__') {
            newCatInputWrapper.style.display = 'block';
        } else {
            newCatInputWrapper.style.display = 'none';
        }
    });
    
    categoryGroup.appendChild(categoryLabel);
    categoryGroup.appendChild(categorySelect);
    categoryGroup.appendChild(newCatInputWrapper);
    
    // File Input Field
    const fileGroup = document.createElement('div');
    fileGroup.style.marginBottom = '20px';
    
    const fileLabel = document.createElement('label');
    fileLabel.htmlFor = 'fileInput';
    fileLabel.textContent = 'Select File *';
    fileLabel.style.display = 'block';
    fileLabel.style.marginBottom = '8px';
    fileLabel.style.fontWeight = '500';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileInput';
    fileInput.style.width = '100%';
    fileInput.style.padding = '10px';
    fileInput.style.borderRadius = 'var(--border-radius)';
    fileInput.style.border = '1px solid var(--border-color)';
    fileInput.style.backgroundColor = 'var(--background-color)';
    fileInput.style.color = 'var(--text-color)';
    fileInput.required = true;
    
    fileGroup.appendChild(fileLabel);
    fileGroup.appendChild(fileInput);
    
    // Icon group - Add proper SVG icons instead of emojis
    const iconGroup = document.createElement('div');
    iconGroup.style.marginBottom = '20px';
    
    const iconLabel = document.createElement('div');
    iconLabel.textContent = 'File Icon';
    iconLabel.style.display = 'block';
    iconLabel.style.marginBottom = '8px';
    iconLabel.style.fontWeight = '500';
    
    const iconButtons = document.createElement('div');
    iconButtons.style.display = 'flex';
    iconButtons.style.gap = '10px';
    iconButtons.style.flexWrap = 'wrap';
    
    // File icon (default)
    const fileIconBtn = document.createElement('button');
    fileIconBtn.type = 'button';
    fileIconBtn.className = 'icon-select-btn active';
    fileIconBtn.setAttribute('data-icon', 'file');
    fileIconBtn.style.display = 'flex';
    fileIconBtn.style.alignItems = 'center';
    fileIconBtn.style.justifyContent = 'center';
    fileIconBtn.style.width = '40px';
    fileIconBtn.style.height = '40px';
    fileIconBtn.style.borderRadius = '4px';
    fileIconBtn.style.border = '1px solid var(--border-color)';
    fileIconBtn.style.backgroundColor = 'transparent';
    fileIconBtn.style.cursor = 'pointer';
    fileIconBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
    `;
    
    // Document icon
    const docIconBtn = document.createElement('button');
    docIconBtn.type = 'button';
    docIconBtn.className = 'icon-select-btn';
    docIconBtn.setAttribute('data-icon', 'document');
    docIconBtn.style.display = 'flex';
    docIconBtn.style.alignItems = 'center';
    docIconBtn.style.justifyContent = 'center';
    docIconBtn.style.width = '40px';
    docIconBtn.style.height = '40px';
    docIconBtn.style.borderRadius = '4px';
    docIconBtn.style.border = '1px solid var(--border-color)';
    docIconBtn.style.backgroundColor = 'transparent';
    docIconBtn.style.cursor = 'pointer';
    docIconBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
    `;
    
    // Image icon
    const imageIconBtn = document.createElement('button');
    imageIconBtn.type = 'button';
    imageIconBtn.className = 'icon-select-btn';
    imageIconBtn.setAttribute('data-icon', 'image');
    imageIconBtn.style.display = 'flex';
    imageIconBtn.style.alignItems = 'center';
    imageIconBtn.style.justifyContent = 'center';
    imageIconBtn.style.width = '40px';
    imageIconBtn.style.height = '40px';
    imageIconBtn.style.borderRadius = '4px';
    imageIconBtn.style.border = '1px solid var(--border-color)';
    imageIconBtn.style.backgroundColor = 'transparent';
    imageIconBtn.style.cursor = 'pointer';
    imageIconBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
    `;
    
    // Star icon
    const starIconBtn = document.createElement('button');
    starIconBtn.type = 'button';
    starIconBtn.className = 'icon-select-btn';
    starIconBtn.setAttribute('data-icon', 'star');
    starIconBtn.style.display = 'flex';
    starIconBtn.style.alignItems = 'center';
    starIconBtn.style.justifyContent = 'center';
    starIconBtn.style.width = '40px';
    starIconBtn.style.height = '40px';
    starIconBtn.style.borderRadius = '4px';
    starIconBtn.style.border = '1px solid var(--border-color)';
    starIconBtn.style.backgroundColor = 'transparent';
    starIconBtn.style.cursor = 'pointer';
    starIconBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    `;
    
    // Folder icon
    const folderIconBtn = document.createElement('button');
    folderIconBtn.type = 'button';
    folderIconBtn.className = 'icon-select-btn';
    folderIconBtn.setAttribute('data-icon', 'folder');
    folderIconBtn.style.display = 'flex';
    folderIconBtn.style.alignItems = 'center';
    folderIconBtn.style.justifyContent = 'center';
    folderIconBtn.style.width = '40px';
    folderIconBtn.style.height = '40px';
    folderIconBtn.style.borderRadius = '4px';
    folderIconBtn.style.border = '1px solid var(--border-color)';
    folderIconBtn.style.backgroundColor = 'transparent';
    folderIconBtn.style.cursor = 'pointer';
    folderIconBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
    `;
    
    // Book icon
    const bookIconBtn = document.createElement('button');
    bookIconBtn.type = 'button';
    bookIconBtn.className = 'icon-select-btn';
    bookIconBtn.setAttribute('data-icon', 'book');
    bookIconBtn.style.display = 'flex';
    bookIconBtn.style.alignItems = 'center';
    bookIconBtn.style.justifyContent = 'center';
    bookIconBtn.style.width = '40px';
    bookIconBtn.style.height = '40px';
    bookIconBtn.style.borderRadius = '4px';
    bookIconBtn.style.border = '1px solid var(--border-color)';
    bookIconBtn.style.backgroundColor = 'transparent';
    bookIconBtn.style.cursor = 'pointer';
    bookIconBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
    `;
    
    // Add icon buttons to container
    iconButtons.appendChild(fileIconBtn);
    iconButtons.appendChild(docIconBtn);
    iconButtons.appendChild(imageIconBtn);
    iconButtons.appendChild(starIconBtn);
    iconButtons.appendChild(folderIconBtn);
    iconButtons.appendChild(bookIconBtn);
    
    // Add click event to icon buttons
    const allIconButtons = [fileIconBtn, docIconBtn, imageIconBtn, starIconBtn, folderIconBtn, bookIconBtn];
    allIconButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            allIconButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
        });
    });
    
    iconGroup.appendChild(iconLabel);
    iconGroup.appendChild(iconButtons);
    
    // Privacy and visibility options
    const optionsGroup = document.createElement('div');
    optionsGroup.style.marginBottom = '20px';
    optionsGroup.style.display = 'flex';
    optionsGroup.style.gap = '20px';
    
    // Private option
    const privateOption = document.createElement('div');
    privateOption.style.display = 'flex';
    privateOption.style.alignItems = 'center';
    privateOption.style.gap = '8px';
    
    const privateCheckbox = document.createElement('input');
    privateCheckbox.type = 'checkbox';
    privateCheckbox.id = 'filePrivate';
    privateCheckbox.style.width = '16px';
    privateCheckbox.style.height = '16px';
    
    const privateLabel = document.createElement('label');
    privateLabel.htmlFor = 'filePrivate';
    privateLabel.textContent = 'Private';
    privateLabel.style.fontSize = '14px';
    privateLabel.style.cursor = 'pointer';
    
    privateOption.appendChild(privateCheckbox);
    privateOption.appendChild(privateLabel);
    
    // Pinned option
    const pinnedOption = document.createElement('div');
    pinnedOption.style.display = 'flex';
    pinnedOption.style.alignItems = 'center';
    pinnedOption.style.gap = '8px';
    
    const pinnedCheckbox = document.createElement('input');
    pinnedCheckbox.type = 'checkbox';
    pinnedCheckbox.id = 'filePinned';
    pinnedCheckbox.style.width = '16px';
    pinnedCheckbox.style.height = '16px';
    
    const pinnedLabel = document.createElement('label');
    pinnedLabel.htmlFor = 'filePinned';
    pinnedLabel.textContent = 'Pinned';
    pinnedLabel.style.fontSize = '14px';
    pinnedLabel.style.cursor = 'pointer';
    pinnedLabel.title = 'Pin this file to the top of its parent category or folder';
    
    pinnedOption.appendChild(pinnedCheckbox);
    pinnedOption.appendChild(pinnedLabel);
    
    // Add options to group
    optionsGroup.appendChild(privateOption);
    optionsGroup.appendChild(pinnedOption);
    
    // Form actions
    const formActions = document.createElement('div');
    formActions.style.display = 'flex';
    formActions.style.justifyContent = 'flex-end';
    formActions.style.gap = '10px';
    formActions.style.marginTop = '20px';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.padding = '10px 20px';
    cancelBtn.style.borderRadius = 'var(--border-radius)';
    cancelBtn.style.border = '1px solid var(--border-color)';
    cancelBtn.style.backgroundColor = 'transparent';
    cancelBtn.style.color = 'var(--text-color)';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => document.body.removeChild(modalOverlay);
    
    const uploadBtn = document.createElement('button');
    uploadBtn.type = 'submit';
    uploadBtn.textContent = 'Upload File';
    uploadBtn.style.padding = '10px 20px';
    uploadBtn.style.borderRadius = 'var(--border-radius)';
    uploadBtn.style.border = 'none';
    uploadBtn.style.backgroundColor = 'var(--button-blue)';
    uploadBtn.style.color = 'white';
    uploadBtn.style.cursor = 'pointer';
    
    formActions.appendChild(cancelBtn);
    formActions.appendChild(uploadBtn);
    
    // Assemble the form
    form.appendChild(nameGroup);
    form.appendChild(typeGroup);
    form.appendChild(categoryGroup);
    form.appendChild(fileGroup);
    form.appendChild(iconGroup);
    form.appendChild(optionsGroup);
    form.appendChild(formActions);
    
    // Assemble the modal
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(form);
    modalOverlay.appendChild(modalContent);
    
    // Add modal to the body
    document.body.appendChild(modalOverlay);
}

// Add this to your existing code
document.addEventListener('DOMContentLoaded', function() {
    // ... other event listeners
    
    // Replace the existing addNewFile function call with showUploadFileModal
    const existingAddFileButtons = document.querySelectorAll('.add-file-btn, [data-action="add-file"]');
    existingAddFileButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showUploadFileModal();
        });
    });
});
