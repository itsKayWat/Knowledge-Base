    // Handle if button is passed as event or element
    if (button.target) {
        button = button.target.closest('.tree-action-btn[data-action="more"]') || button.target;
    }
    
    // Get the parent row
    const row = button.closest('tr');
    if (!row) return;
    
    const itemId = row.getAttribute('data-category-id');
    if (!itemId) return;
    
    // Check if this is a file, category, folder, or article
    const isFile = row.classList.contains('file-row');
    const isCategory = row.classList.contains('category-row');
    const isFolder = row.classList.contains('folder-row');
    const isArticle = row.classList.contains('article-row');
    
    // Remove any existing dropdown
    const existingDropdown = document.querySelector('.more-options-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'more-options-dropdown custom-dropdown-content';
    
    // Position the dropdown near the button
    const buttonRect = button.getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.top = (buttonRect.bottom + 5) + 'px';
    dropdown.style.left = (buttonRect.left) + 'px';
    dropdown.style.border = '1px solid var(--border-color)';
    dropdown.style.zIndex = '1000';
    
    // Common options for all item types
    dropdown.innerHTML = `
        <div class="dropdown-item custom-dropdown-item" data-action="edit">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
            Edit
                    </div>
        <div class="dropdown-item custom-dropdown-item" data-action="duplicate">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Duplicate
                </div>
        <div class="dropdown-item custom-dropdown-item" data-action="delete">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Delete
            </div>
        `;
        
    // Append the dropdown to the document body
    document.body.appendChild(dropdown);
    
    // Add event listeners to dropdown items
    const dropdownItems = dropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            switch (action) {
                case 'edit':
                    editItem(itemId, row);
                    break;
                case 'duplicate':
                    duplicateItem(itemId, row);
                    break;
                case 'delete':
                    deleteItem(itemId, row);
                    break;
            }
            
            // Remove dropdown after selection
            dropdown.remove();
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && e.target !== button && !e.target.closest('.tree-action-btn[data-action="more"]')) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// Setup search inputs and action buttons
function setupSearchAndButtonListeners() {
    // Search functionality
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(searchInput => {
        // Check if this input already has a listener
        if (!searchInput.hasSearchListener) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            filterContent(query);
        });
            searchInput.hasSearchListener = true;
    }
    });
    
    // Add content button
    const addContentBtn = document.querySelector('.btn-add');
    if (addContentBtn && !addContentBtn.hasClickListener) {
        addContentBtn.addEventListener('click', function(event) {
            showAddNewMenu(this);
        });
        addContentBtn.hasClickListener = true;
    }
    
    // URL Copy Button
    const copyUrlBtn = document.getElementById('copy-url-button');
    if (copyUrlBtn && !copyUrlBtn.hasClickListener) {
        copyUrlBtn.addEventListener('click', function() {
            const url = document.getElementById('kb-current-url').textContent;
            navigator.clipboard.writeText(url).then(() => {
                showNotification('URL copied to clipboard', 'success');
            });
        });
        copyUrlBtn.hasClickListener = true;
    }
} 

// Function to create demo content when the extension first launches
function createDemoContent() {
    console.log("Creating demo content for first launch");
    
    // Check if demo content has already been created
    if (localStorage.getItem('demoContentCreated')) {
        return; // Demo content already exists, don't recreate
    }
    
    // Create sample books
    const bookId1 = 'book-demo-1';
    const bookId2 = 'book-demo-2';
    
    // Add sample books
    const books = new Map([
        [bookId1, {
            id: bookId1,
            name: 'Knowledge Base Guide',
            description: 'Learn how to use the Knowledge Base extension',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }],
        [bookId2, {
            id: bookId2,
            name: 'Project Documentation',
            description: 'Sample project documentation structure',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }]
    ]);
    
    // Store books
    localStorage.setItem('books', JSON.stringify([...books]));
    
    // Create categories, folders, articles for Book 1 (Knowledge Base Guide)
    const book1Categories = new Map();
    
    // Getting Started Category
    const gettingStartedId = 'category-demo-1';
    book1Categories.set(gettingStartedId, {
        id: gettingStartedId,
        name: 'Getting Started',
        type: 'category',
        bookId: bookId1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // Welcome Article
    const welcomeArticleId = 'article-demo-1';
    book1Categories.set(welcomeArticleId, {
        id: welcomeArticleId,
        name: 'Welcome to Knowledge Base',
        type: 'article',
        parentId: gettingStartedId,
        bookId: bookId1,
        content: 'Welcome to Knowledge Base! This tool helps you organize and manage your information efficiently. You can create books, categories, folders, articles, and upload files.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
    });
    
    // How-to Guide Article
    const howToArticleId = 'article-demo-2';
    book1Categories.set(howToArticleId, {
        id: howToArticleId,
        name: 'How to Use Knowledge Base',
        type: 'article',
        parentId: gettingStartedId,
        bookId: bookId1,
        content: 'Knowledge Base is structured hierarchically:\n\n1. Books are your main collections\n2. Books contain Categories for broad topics\n3. Categories contain Folders, Articles or Files\n4. Folders can contain more Folders, Articles or Files\n\nTo add new content, click the "Add new" button and select what you want to create.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
    });
    
    // FAQ Category
    const faqCategoryId = 'category-demo-2';
    book1Categories.set(faqCategoryId, {
        id: faqCategoryId,
        name: 'FAQ',
        type: 'category',
        bookId: bookId1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // FAQ Article 1
    const faqArticleId1 = 'article-demo-3';
    book1Categories.set(faqArticleId1, {
        id: faqArticleId1,
        name: 'How do I create a new book?',
        type: 'article',
        parentId: faqCategoryId,
        bookId: bookId1,
        content: 'To create a new book, click the "Add new" button and select "Book". Enter the book name and optional description, then click Create.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
    });
    
    // FAQ Article 2
    const faqArticleId2 = 'article-demo-4';
    book1Categories.set(faqArticleId2, {
        id: faqArticleId2,
        name: 'How do I organize my content?',
        type: 'article',
        parentId: faqCategoryId,
        bookId: bookId1,
        content: 'Best practice is to create categories for broad topics, folders for subtopics, and articles for specific content. You can rearrange items by dragging and dropping them in the tree view.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
    });
    
    // Create categories, folders, articles for Book 2 (Project Documentation)
    const book2Categories = new Map();
    
    // Overview Category
    const overviewCategoryId = 'category-demo-3';
    book2Categories.set(overviewCategoryId, {
        id: overviewCategoryId,
        name: 'Project Overview',
        type: 'category',
        bookId: bookId2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // Overview Article
    const overviewArticleId = 'article-demo-5';
    book2Categories.set(overviewArticleId, {
        id: overviewArticleId,
        name: 'Project Introduction',
        type: 'article',
        parentId: overviewCategoryId,
        bookId: bookId2,
        content: 'This is a sample project documentation structure. You can use this as a template for your own projects.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
    });
    
    // Technical Specs Category
    const techSpecsCategoryId = 'category-demo-4';
    book2Categories.set(techSpecsCategoryId, {
        id: techSpecsCategoryId,
        name: 'Technical Specifications',
        type: 'category',
        bookId: bookId2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // API Folder
    const apiFolderId = 'folder-demo-1';
    book2Categories.set(apiFolderId, {
        id: apiFolderId,
        name: 'API Documentation',
        type: 'folder',
        parentId: techSpecsCategoryId,
        bookId: bookId2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // API Article
    const apiArticleId = 'article-demo-6';
    book2Categories.set(apiArticleId, {
        id: apiArticleId,
        name: 'REST API Overview',
        type: 'article',
        parentId: apiFolderId,
        bookId: bookId2,
        content: 'This is a sample API documentation article. You can document your API endpoints, parameters, and responses here.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'published'
    });
    
    // Store all categories
    bookCategories.set(bookId1, book1Categories);
    bookCategories.set(bookId2, book2Categories);
    
    // Save data to localStorage
    saveData();
    
    // Mark demo content as created
    localStorage.setItem('demoContentCreated', 'true');
    
    // Set initial selected book
    selectedBookId = bookId1;
    localStorage.setItem('selectedBookId', selectedBookId);
    
    console.log("Demo content created successfully");
}

// Function to inject custom styles for the tree view
function injectTreeStyles() {
    // Check if styles have already been added
    if (document.getElementById('tree-view-styles')) {
        return;
    }
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.id = 'tree-view-styles';
    
    // Add styles
    styleElement.textContent = `
        /* Tree View Styles */
        .content-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-top: 16px;
        }
        
        .content-table thead th {
            color: var(--text-secondary);
            font-weight: 500;
            text-align: left;
            padding: 8px 16px;
            border-bottom: 1px solid var(--border-color);
            font-size: 13px;
        }
        
        .content-table tbody tr {
            cursor: pointer;
            transition: background-color 0.15s ease;
        }
        
        .content-table tbody tr:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
        
        .content-table tbody td {
            padding: 8px 16px;
            border-bottom: 1px solid var(--border-color);
            color: var(--text-primary);
            font-size: 14px;
        }
        
        .tree-item {
            display: flex;
            align-items: center;
            gap: 8px;
            position: relative;
            min-height: 42px;
        }
        
        .expand-icon {
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 18px;
            height: 18px;
            font-size: 9px;
            transition: transform 0.15s ease;
            color: var(--text-secondary);
        }
        
        .expand-icon.open {
            transform: rotate(90deg);
        }
        
        .category-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
        }
        
        .category-name {
            font-size: 14px;
            color: var(--text-primary);
        }
        
        .book-row .category-name {
            font-weight: 600;
            font-size: 15px;
        }
        
        .tree-actions {
            margin-left: auto;
            display: none;
            gap: 4px;
        }
        
        .tree-item:hover .tree-actions {
            display: flex;
        }
        
        .action-button {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }
        
        .action-button:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: var(--text-primary);
        }
        
        .status-tag {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 4px 8px;
            font-size: 12px;
            border-radius: 4px;
            text-transform: capitalize;
        }
        
        .status-tag.draft {
            background-color: rgba(255, 193, 7, 0.1);
            color: #ffc107;
        }
        
        .status-tag.published {
            background-color: rgba(40, 167, 69, 0.1);
            color: #28a745;
        }
        
        .article-count {
            font-size: 12px;
            color: var(--text-tertiary);
            margin-left: 8px;
        }
        
        .performance-stats {
            display: flex;
            gap: 16px;
        }
        
        .performance-stats span {
            font-size: 13px;
            color: var(--text-secondary);
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
        }
        
        .empty-state p {
            font-size: 15px;
            color: var(--text-secondary);
            margin: 0;
        }
    `;
    
    // Add to document head
    document.head.appendChild(styleElement);
}

// Function to create the content table structure
function createContentTable() {
    if (!contentContainer) {
        console.error("Content container not found. Cannot create content table.");
        return null;
    }

    // Create search and actions
    const searchActions = document.createElement('div');
    searchActions.className = 'search-actions';
    searchActions.innerHTML = `
        <div>
            <input type="text" class="search-input" placeholder="Find content...">
        </div>
        <div class="actions">
            <button type="button" class="btn btn-outline">Import</button>
            <button type="button" class="btn btn-primary btn-add">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5l0 14"></path>
                    <path d="M5 12l14 0"></path>
                </svg>
                Add new
            </button>
        </div>
    `;
    contentContainer.appendChild(searchActions);

    // Create content table structure
    const contentTable = document.createElement('table');
    contentTable.className = 'content-table';
    contentTable.innerHTML = `
        <thead>
            <tr>
                <th style="width: 50%">Title</th>
                <th>Status</th>
                <th>Last updated</th>
                <th>Performance</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    contentContainer.appendChild(contentTable);
    
    // Add event listener to the new "Add new" button
    const addNewButton = searchActions.querySelector('.btn-add');
    if (addNewButton) {
        addNewButton.addEventListener('click', function(event) {
            showAddNewMenu(this);
            event.stopPropagation(); // Prevent event from bubbling up
        });
    }
    
    return contentTable;
}

function showMyBooksPage() {
    if (!contentContainer || !contentTitle) {
        console.error("Content container or title element not found");
        return;
    }
    
    // Set title based on selected book
    if (selectedBookId && books.has(selectedBookId)) {
        const selectedBook = books.get(selectedBookId);
        contentTitle.textContent = selectedBook.name;
    } else {
        contentTitle.textContent = "My books";
    }
    
    // Create content table
    const contentTable = document.createElement('table');
    contentTable.className = 'content-table';
    contentTable.innerHTML = `
        <thead>
            <tr>
                <th style="width: 50%">Title</th>
                <th>Status</th>
                <th>Last updated</th>
                <th>Performance</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;
    
    // Clear main content
    contentContainer.innerHTML = '';
    
    // Add the URL info and search bar sections back
    const urlWrapper = document.createElement('div');
    urlWrapper.className = 'kb-url-wrapper';
    urlWrapper.innerHTML = `
        <div class="url-container">
            <svg class="url-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m7.272 13.783.561.07V11.5h-.5a.837.837 0 0 1-.833-.833v-.874l-.146-.147L5.207 8.5h4.126c.09 0 .167.076.167.167v2.5h1.167c.373 0 .68.237.79.58l.263.82.582-.636A5.805 5.805 0 0 0 13.833 8a5.836 5.836 0 0 0-3.645-5.403l-.688-.28v1.016a.837.837 0 0 1-.833.834H6.833V6c0 .09-.076.167-.166.167H4.833v1.959L3.16 6.453l-.642-.643-.2.887A5.91 5.91 0 0 0 2.168 8a5.826 5.826 0 0 0 5.105 5.783ZM1.833 8A6.17 6.17 0 0 1 8 1.833 6.17 6.17 0 0 1 14.167 8 6.17 6.17 0 0 1 8 14.167 6.17 6.17 0 0 1 1.833 8Z" fill="#0066FF" stroke="#0066FF"/>
            </svg>
            <span class="url-text" id="kb-current-url">article-link</span>
            <button aria-label="Copy Help Center Link" class="round-button" id="copy-url-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.667 1.5h-.5v9.333h-.334V2c0-.457.377-.833.834-.833h7.5V1.5h-7.5Zm1.84 3.167c0-.46.372-.834.826-.834h4.46L13.5 7.54V14a.837.837 0 0 1-.833.833h-7.34A.832.832 0 0 1 4.5 14l.007-9.333ZM4.833 14v.5h8.334v-7H9.833V4.167h-5V14Z" fill="#62626D" stroke="#62626D"/>
                </svg>
            </button>
        </div>
        <div class="toggle-container">
            <div class="switch-wrapper">
                <button type="button" role="switch" aria-checked="true" class="ant-switch ant-switch-checked">
                    <div class="ant-switch-handle"></div>
                </button>
            </div>
        </div>
    `;
    
    const searchActions = document.createElement('div');
    searchActions.className = 'search-actions';
    searchActions.innerHTML = `
        <div>
            <input type="text" class="search-input" placeholder="Find content...">
        </div>
        <div class="actions">
            <button type="button" class="btn btn-outline">Import</button>
            <button type="button" class="btn btn-primary btn-add" id="addNewBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 5l0 14"></path>
                    <path d="M5 12l14 0"></path>
                </svg>
                Add new
            </button>
        </div>
    `;
    
    // Add workspace wrapper (title and status)
    const workspaceWrapper = document.createElement('div');
    workspaceWrapper.className = 'workspace-wrapper';
    workspaceWrapper.innerHTML = `
        <div class="workspace-select">
            <div class="selected-workspace">
                <span class="selected-workspace-name">${contentTitle.textContent}</span>
            </div>
            <div class="workspace-status">
                <span class="status-dot"></span>
                <span>Live / Publicly available</span>
            </div>
        </div>
    `;
    
    contentContainer.appendChild(workspaceWrapper);
    contentContainer.appendChild(urlWrapper);
    contentContainer.appendChild(searchActions);
    contentContainer.appendChild(contentTable);
    
    // Get categories for selected book
    if (selectedBookId && bookCategories.has(selectedBookId)) {
        const categories = bookCategories.get(selectedBookId);
        const tableBody = contentTable.querySelector('tbody');
        
        // First render top-level categories
        const topLevelCategories = Array.from(categories.values()).filter(item => 
            !item.parentId && item.type === 'category'
        );
        
        for (const category of topLevelCategories) {
            const row = renderTreeItem(category, 0);
            tableBody.appendChild(row);
        }
        
        // Then render items without parents that aren't categories
        const orphanedItems = Array.from(categories.values()).filter(item => 
            !item.parentId && item.type !== 'category'
        );
        
        for (const item of orphanedItems) {
            const row = renderTreeItem(item, 0);
            tableBody.appendChild(row);
        }
    } else if (books.size > 0) {
        // No book selected, show empty state with message
        const tableBody = contentTable.querySelector('tbody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <p>Select a book from the sidebar to view its contents</p>
                </td>
            </tr>
        `;
    } else {
        // No books at all, show empty state with message
        const tableBody = contentTable.querySelector('tbody');
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <p>You don't have any books yet. Click "Add new" to create your first book.</p>
                </td>
            </tr>
        `;
    }
    
    // Add event listener to the "Add new" button
    const addNewBtn = contentContainer.querySelector('#addNewBtn');
    if (addNewBtn) {
        addNewBtn.addEventListener('click', function() {
            showAddNewMenu(this);
        });
    }
    
    // Rest of the function remains the same...
    
    function renderTreeItem(item, indentLevel = 0) {
        // Existing renderTreeItem function...
        const row = document.createElement('tr');
        row.className = `${item.type}-row`;
        row.setAttribute('data-id', item.id);
        row.setAttribute('data-indent', indentLevel);
        row.setAttribute('data-type', item.type);
        
        const dateOptions = { month: 'numeric', day: 'numeric', year: 'numeric' };
        const formattedDate = item.updatedAt 
            ? new Date(item.updatedAt).toLocaleDateString(undefined, dateOptions) 
            : '';
            
        let expandButton = '';
        let treeActions = `
            <div class="tree-actions">
                <button class="tree-action-btn edit-btn" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="tree-action-btn duplicate-btn" title="Duplicate">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="tree-action-btn delete-btn" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
        
        // For categories and folders, add expand/collapse button
        if (item.type === 'category' || item.type === 'folder') {
            expandButton = `
                <div class="expandable-control">
                    <div class="expand-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </div>
            `;
        }
        
        let icon = '';
        
        // Set icon based on item type
        switch(item.type) {
            case 'category':
                icon = `
                    <span class="category-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
                        </svg>
                    </span>
                `;
                break;
            case 'folder':
                icon = `
                    <span class="folder-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-9a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2z"></path>
                        </svg>
                    </span>
                `;
                break;
            case 'article':
                icon = `
                    <span class="article-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </span>
                `;
                break;
            case 'file':
                icon = `
                    <span class="file-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                    </span>
                `;
                break;
        }
        
        // For articles, show status tag
        let status = '';
        if (item.type === 'article') {
            status = `
                <span class="status-tag ${item.status || 'draft'}">${item.status || 'Draft'}</span>
            `;
        }
        
        // Show performance stats for articles only
        let performance = '';
        if (item.type === 'article') {
            performance = `
                <div class="performance-stats">
                    <span>Views: ${Math.floor(Math.random() * 100)}</span>
                    <span>Reactions: ${Math.floor(Math.random() * 10)}</span>
                </div>
            `;
        }
        
        row.innerHTML = `
            <td class="tree-item" data-indent="${indentLevel}">
                ${expandButton}
                ${icon}
                <span class="${item.type}-name">${item.name}</span>
                ${treeActions}
            </td>
            <td>${status}</td>
            <td>${formattedDate}</td>
            <td>${performance}</td>
        `;
        
        // Add event listener to expand/collapse for categories and folders
        if (item.type === 'category' || item.type === 'folder') {
            const expandIcon = row.querySelector('.expand-icon');
            if (expandIcon) {
                expandIcon.addEventListener('click', function(e) {
                    e.stopPropagation();
                    this.classList.toggle('open');
                    
                    const row = this.closest('tr');
                    const itemId = row.getAttribute('data-id');
                    
                    // Find next rows with higher indent level
                    let next = row.nextElementSibling;
                    let isVisible = this.classList.contains('open');
                    
                    while (next) {
                        if (parseInt(next.getAttribute('data-indent') || '0') <= parseInt(row.getAttribute('data-indent') || '0')) {
                            break;
                        }
                        
                        next.style.display = isVisible ? '' : 'none';
                        next = next.nextElementSibling;
                    }
                });
                
                // Auto-expand if specified
                if (item.autoExpand) {
                    expandIcon.classList.add('open');
                }
            }
        }
        
        // Add click events for edit, duplicate, delete buttons
        const editBtn = row.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                editItem(item.id, row);
            });
        }
        
        const duplicateBtn = row.querySelector('.duplicate-btn');
        if (duplicateBtn) {
            duplicateBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                duplicateItem(item.id, row);
            });
        }
        
        const deleteBtn = row.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteItem(item.id, row);
            });
        }
        
        // If this item has children, recursively render them
        if ((item.type === 'category' || item.type === 'folder') && bookCategories.has(selectedBookId)) {
            const categoryMap = bookCategories.get(selectedBookId);
            const children = Array.from(categoryMap.values()).filter(child => child.parentId === item.id);
            
            // Sort children: categories first, then folders, then articles, then files
            children.sort((a, b) => {
                const typeOrder = { 'category': 1, 'folder': 2, 'article': 3, 'file': 4 };
                if (typeOrder[a.type] !== typeOrder[b.type]) {
                    return typeOrder[a.type] - typeOrder[b.type];
                }
                return a.name.localeCompare(b.name);
            });
            
            row.setAttribute('data-has-children', children.length > 0 ? 'true' : 'false');
            
            // If the item is not set to auto-expand, hide its children initially
            const isHidden = item.autoExpand ? false : true;
            
            for (const child of children) {
                const childRow = renderTreeItem(child, indentLevel + 1);
                if (isHidden) {
                    childRow.style.display = 'none';
                }
            }
        }
        
        return row;
    }
} 
