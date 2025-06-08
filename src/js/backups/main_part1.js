// Global variables
let books = new Map();
let bookCategories = new Map();
let selectedBookId = null;
let contentContainer = null;
let contentTitle = null;

// When DOM is loaded 
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing Knowledge Base...");
    
    // Set references to important DOM elements
    contentContainer = document.querySelector('.main-content');
    contentTitle = document.querySelector('.selected-workspace-name');
    
    // Initialize the extension
    init();
});

// Initialize the extension
function init() {
    console.log("Initializing Knowledge Base...");
    
    try {
        // First, inject tree styles
        console.log("Injecting tree styles...");
        injectTreeStyles();
        
        // Load existing data first - this will be overwritten if createDemoDataIfNeeded
        // determines we need demo data, but otherwise preserves user data
        console.log("Loading existing data...");
        loadData();
        
        // Create demo data if needed - this function checks if demo data exists
        console.log("Checking for demo data...");
        createDemoDataIfNeeded();
        
        // Setup event listeners
        console.log("Setting up event listeners...");
        setupEventListeners();
        
        // Update sidebar with books
        console.log("Updating books sidebar...");
        updateBooksSidebar();
        
        // Show My Books page initially
        console.log("Showing My Books page...");
        if (contentContainer) {
            showMyBooksPage();
            console.log("My Books page displayed.");
        } else {
            console.error("Content container not found!");
        }
        
        console.log("Initialization complete!");
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

// Setup all event listeners
function setupEventListeners() {
    console.log("Setting up event listeners");
    
    // Setup search functionality
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(searchInput => {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            filterContent(query);
        });
    });
    
    // Setup filter tabs
    const filterItems = document.querySelectorAll('.filter-item');
    filterItems.forEach(item => {
        item.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active class
            document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filter
            filterByType(filter);
        });
    });

    // Add content button in main content
    const addContentBtn = document.querySelector('.btn-add');
    if (addContentBtn) {
        addContentBtn.addEventListener('click', function(event) {
            showAddNewMenu(this);
            event.stopPropagation();
        });
    }

    // URL Copy Button
    const copyUrlBtn = document.getElementById('copy-url-button');
    if (copyUrlBtn) {
        copyUrlBtn.addEventListener('click', function() {
            const url = document.getElementById('kb-current-url').textContent;
            navigator.clipboard.writeText(url).then(() => {
                showNotification('URL copied to clipboard', 'success');
            });
        });
    }
    
    // Setup context menu for books in sidebar
    setupContextMenuListeners();
}

// Setup context menu listeners for books and content items
function setupContextMenuListeners() {
    // Handle context menu closing
    document.addEventListener('click', hideContextMenu);
    window.addEventListener('scroll', hideContextMenu);
    window.addEventListener('resize', hideContextMenu);
    
    // Setup context menu for books in sidebar
    const booksList = document.querySelector('.books-list');
    if (booksList) {
        booksList.addEventListener('contextmenu', handleBookContextMenu);
    }
    
    // Setup context menu for content items
    const contentTable = document.querySelector('.content-table tbody');
    if (contentTable) {
        contentTable.addEventListener('contextmenu', handleContentContextMenu);
    }
}

// Handle context menu for books
function handleBookContextMenu(event) {
    const bookItem = event.target.closest('.book-item');
    if (!bookItem) return; // Not clicking on a book item
    
    event.preventDefault(); // Prevent default context menu
    
    const bookId = bookItem.getAttribute('data-book-id');
    if (!bookId) return;
    
    // Create and show context menu for books
    showContextMenu(event, [
        {
            label: 'Edit Book',
            icon: 'edit',
            action: () => editBook(bookId)
        },
        {
            label: 'Clone Book',
            icon: 'copy',
            action: () => cloneBook(bookId)
        },
        {
            label: 'Delete Book',
            icon: 'trash',
            action: () => deleteBook(bookId)
        }
    ]);
}

// Handle context menu for content items
function handleContentContextMenu(event) {
    const row = event.target.closest('tr');
    if (!row) return; // Not clicking on a row
    
    event.preventDefault(); // Prevent default context menu
    
    const itemId = row.getAttribute('data-id');
    if (!itemId) return;
    
    // Determine item type based on row class
    const itemType = getItemTypeFromRow(row);
    
    // Create context menu items based on type
    const menuItems = [
        {
            label: `Edit ${capitalizeFirstLetter(itemType)}`,
            icon: 'edit',
            action: () => editItem(itemId, row)
        },
        {
            label: `Clone ${capitalizeFirstLetter(itemType)}`,
            icon: 'copy',
            action: () => cloneItem(itemId, row)
        },
        {
            label: `Delete ${capitalizeFirstLetter(itemType)}`,
            icon: 'trash',
            action: () => deleteItem(itemId, row)
        }
    ];
    
    showContextMenu(event, menuItems);
}

// Determine item type from row class
function getItemTypeFromRow(row) {
    if (row.classList.contains('category-row')) return 'category';
    if (row.classList.contains('folder-row')) return 'folder';
    if (row.classList.contains('article-row')) return 'article';
    if (row.classList.contains('file-row')) return 'file';
    return 'item';
}

// Function to create and show context menu
function showContextMenu(event, menuItems) {
    // Remove any existing context menu
    hideContextMenu();
    
    // Create context menu element
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.style.position = 'fixed';
    contextMenu.style.zIndex = '1000';
    contextMenu.style.backgroundColor = 'var(--card-color)';
    contextMenu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    contextMenu.style.borderRadius = '8px';
    contextMenu.style.border = '1px solid var(--border-color)';
    contextMenu.style.padding = '6px 0';
    contextMenu.style.minWidth = '180px';
    contextMenu.id = 'kb-context-menu';
    
    // Add menu items
    menuItems.forEach((item, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        menuItem.style.padding = '8px 12px';
        menuItem.style.cursor = 'pointer';
        menuItem.style.display = 'flex';
        menuItem.style.alignItems = 'center';
        menuItem.style.gap = '8px';
        menuItem.style.fontSize = '14px';
        menuItem.style.color = 'var(--text-color)';
        menuItem.style.transition = 'background-color 0.2s';
        
        // Icon
        const icon = getIconForAction(item.icon);
        
        // Label
        menuItem.innerHTML = `${icon} ${item.label}`;
        
        // Hover effect
        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.backgroundColor = 'var(--hover-color)';
        });
        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.backgroundColor = 'transparent';
        });
        
        // Click handler
        menuItem.addEventListener('click', () => {
            item.action();
            hideContextMenu();
        });
        
        contextMenu.appendChild(menuItem);
        
        // Add separator if specified or between delete and other actions
        if (item.separator || (index < menuItems.length - 1 && menuItems[index + 1].icon === 'trash')) {
            const separator = document.createElement('div');
            separator.style.height = '1px';
            separator.style.backgroundColor = 'var(--border-color)';
            separator.style.margin = '4px 0';
            contextMenu.appendChild(separator);
        }
    });
    
    // Add to DOM
    document.body.appendChild(contextMenu);
    
    // Position menu at cursor
    positionContextMenu(event, contextMenu);
}

// Position the context menu
function positionContextMenu(event, contextMenu) {
    const x = event.clientX;
    const y = event.clientY;
    
    // Get viewport and menu dimensions
    const menuWidth = contextMenu.offsetWidth;
    const menuHeight = contextMenu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Position the menu, adjusting if it would go off-screen
    if (x + menuWidth > windowWidth) {
        contextMenu.style.left = (x - menuWidth) + 'px';
    } else {
        contextMenu.style.left = x + 'px';
    }
    
    if (y + menuHeight > windowHeight) {
        contextMenu.style.top = (y - menuHeight) + 'px';
    } else {
        contextMenu.style.top = y + 'px';
    }
}

// Function to hide context menu
function hideContextMenu() {
    const existingMenu = document.getElementById('kb-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to get icon SVG for context menu
function getIconForAction(iconName) {
    const icons = {
        edit: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>`,
        copy: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>`,
        trash: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>`
    };
    
    return icons[iconName] || '';
}

// Function to clone a book
function cloneBook(bookId) {
    if (!books.has(bookId)) {
        showNotification('Book not found', 'error');
        return;
    }
    
    const originalBook = books.get(bookId);
    const newBookId = 'book-' + Date.now();
    
    // Clone book properties
    const newBook = {
        id: newBookId,
        name: `${originalBook.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to books
    books.set(newBookId, newBook);
    
    // Check if the original book has categories
    if (bookCategories.has(bookId)) {
        const originalCategories = bookCategories.get(bookId);
        const newCategories = new Map();
        
        // Create a mapping of old IDs to new IDs for relationships
        const idMapping = new Map();
        
        // First pass: create new items with new IDs
        originalCategories.forEach((item, oldId) => {
            const newId = `${item.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            idMapping.set(oldId, newId);
            
            // Clone the item with new ID
            const newItem = { ...item, id: newId, bookId: newBookId };
            newCategories.set(newId, newItem);
        });
        
        // Second pass: update parent/child relationships
        newCategories.forEach(item => {
            if (item.parentId && idMapping.has(item.parentId)) {
                item.parentId = idMapping.get(item.parentId);
            }
        });
        
        // Add to bookCategories
        bookCategories.set(newBookId, newCategories);
    } else {
        // Initialize empty categories for the new book
        bookCategories.set(newBookId, new Map());
    }
    
    // Save data
    saveData();
    
    // Update UI
    updateBooksSidebar();
    showNotification('Book cloned successfully!');
}

// Function to edit book name
function editBook(bookId) {
    if (!books.has(bookId)) {
        showNotification('Book not found', 'error');
        return;
    }
    
    const book = books.get(bookId);
    
    // Create modal for book editing
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '1000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    // Modal content
    modal.innerHTML = `
        <div style="background-color: var(--card-color); border-radius: 8px; width: 500px; max-width: 90%; padding: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
            <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 20px;">Edit Book</h2>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-size: 14px;">Book Name</label>
                <input type="text" id="book-name-input" value="${book.name}" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); background-color: rgba(255, 255, 255, 0.05); color: var(--text-color);">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-size: 14px;">Description (optional)</label>
                <textarea id="book-description-input" placeholder="Enter book description" rows="4" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); background-color: rgba(255, 255, 255, 0.05); color: var(--text-color); resize: vertical;">${book.description || ''}</textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="cancel-book-edit" class="btn btn-outline">Cancel</button>
                <button id="save-book-edit" class="btn btn-primary">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancel-book-edit').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('save-book-edit').addEventListener('click', () => {
        const bookName = document.getElementById('book-name-input').value.trim();
        const bookDescription = document.getElementById('book-description-input').value.trim();
        
        if (bookName === '') {
            showNotification('Please enter a book name', 'error');
            return;
        }
        
        // Update book
        book.name = bookName;
        book.description = bookDescription;
        book.updatedAt = new Date().toISOString();
        
        // Save data
        saveData();
        
        // Update UI
        updateBooksSidebar();
        showMyBooksPage();
        showNotification('Book updated successfully!');
        
        // Remove modal
        modal.remove();
    });
    
    // Focus the input field
    setTimeout(() => {
        document.getElementById('book-name-input').focus();
    }, 100);
}

// Function to delete a book
function deleteBook(bookId) {
    if (!books.has(bookId)) {
        showNotification('Book not found', 'error');
        return;
    }
    
    const book = books.get(bookId);
    
    // Create a confirmation modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '1000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    // Modal content
    modal.innerHTML = `
        <div style="background-color: var(--card-color); border-radius: 8px; width: 500px; max-width: 90%; padding: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
            <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 20px;">Delete Book</h2>
            <p style="margin-bottom: 20px;">Are you sure you want to delete "${book.name}"? This action cannot be undone.</p>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="cancel-delete" class="btn btn-outline">Cancel</button>
                <button id="confirm-delete" class="btn btn-primary" style="background-color: #f44336;">Delete</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancel-delete').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('confirm-delete').addEventListener('click', () => {
        // Delete from books map
        books.delete(bookId);
        
        // Delete associated categories
        bookCategories.delete(bookId);
        
        // If the deleted book was selected, clear selection
        if (selectedBookId === bookId) {
            selectedBookId = null;
            localStorage.removeItem('selectedBookId');
            
            // If there are other books, select the first one
            if (books.size > 0) {
                selectedBookId = books.keys().next().value;
                localStorage.setItem('selectedBookId', selectedBookId);
            }
        }
        
        // Save data
        saveData();
        
        // Update UI
        updateBooksSidebar();
        showMyBooksPage();
        showNotification('Book deleted successfully');
        
        // Remove modal
        modal.remove();
    });
}

// Function to clone any content item (category, folder, article, file)
function cloneItem(itemId, row) {
    if (!selectedBookId || !itemId) {
        showNotification('Cannot clone item: no book or item selected', 'error');
        return;
    }
    
    const categories = bookCategories.get(selectedBookId);
    if (!categories || !categories.has(itemId)) {
        showNotification('Item not found', 'error');
        return;
    }
    
    const originalItem = categories.get(itemId);
    const itemType = originalItem.type;
    
    // Create new ID for the cloned item
    const newId = `${itemType}-${Date.now()}`;
    
    // Clone the item with a new ID
    const newItem = {
        ...originalItem,
        id: newId,
        name: `${originalItem.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to categories
    categories.set(newId, newItem);
    
    // Save data
    saveData();
    
    // Refresh the view
    showMyBooksPage();
    
    // Show notification
    showNotification(`${capitalizeFirstLetter(itemType)} cloned successfully!`);
}

// Function to load data from localStorage
function loadData() {
    console.log('Loading data from localStorage...');
    
    try {
        // Load books
        const storedBooks = localStorage.getItem('kb_books');
        if (storedBooks) {
            console.log('Found stored books data');
            const parsedBooks = JSON.parse(storedBooks);
            console.log('Parsed books data:', parsedBooks);
            
            // Convert to Map based on the structure of the data
            if (Array.isArray(parsedBooks)) {
                // If books is a regular array of objects
                books = new Map();
                parsedBooks.forEach(book => {
                    if (book && book.id) {
                        books.set(book.id, book);
                    }
                });
                console.log('Converted books array to Map with size:', books.size);
            } else if (Array.isArray(Object.entries(parsedBooks)[0])) {
                // If books is an array of key-value pairs
                books = new Map(parsedBooks);
                console.log('Created books Map directly from key-value pairs, size:', books.size);
            } else {
                // If books is an object
                books = new Map();
                Object.entries(parsedBooks).forEach(([key, value]) => {
                    books.set(key, value);
                });
                console.log('Converted books object to Map with size:', books.size);
            }
        } else {
            console.log('No stored books found, initializing empty Map');
            books = new Map();
        }
        
        // Load categories, articles, folders and files
        const storedCategories = localStorage.getItem('kb_categories');
        if (storedCategories) {
            console.log('Found stored categories data');
            const parsedCategories = JSON.parse(storedCategories);
            console.log('Parsed categories data type:', Array.isArray(parsedCategories) ? 'Array' : typeof parsedCategories);
            
            // Convert the nested structure back to Maps
            bookCategories = new Map();
            
            try {
                // Handle both formats: array of entries and nested object
                if (Array.isArray(parsedCategories)) {
                    parsedCategories.forEach(entry => {
                        if (Array.isArray(entry) && entry.length === 2) {
                            const [bookId, categoryEntries] = entry;
                            const categoryMap = new Map();
                            
                            if (Array.isArray(categoryEntries)) {
                                categoryEntries.forEach(catEntry => {
                                    if (Array.isArray(catEntry) && catEntry.length === 2) {
                                        categoryMap.set(catEntry[0], catEntry[1]);
                                    } else if (catEntry && catEntry.id) {
                                        categoryMap.set(catEntry.id, catEntry);
                                    }
                                });
                            }
                            
                            bookCategories.set(bookId, categoryMap);
                        }
                    });
                } else if (typeof parsedCategories === 'object') {
                    Object.entries(parsedCategories).forEach(([bookId, categories]) => {
                        const categoryMap = new Map();
                        
                        if (typeof categories === 'object') {
                            Object.entries(categories).forEach(([catId, catData]) => {
                                categoryMap.set(catId, catData);
                            });
                        }
                        
                        bookCategories.set(bookId, categoryMap);
                    });
                }
                console.log('Converted categories data to nested Maps with size:', bookCategories.size);
            } catch (err) {
                console.error('Error parsing category structure:', err);
                bookCategories = new Map();
            }
        } else {
            console.log('No stored categories found, initializing empty Map');
            bookCategories = new Map();
        }
        
        // Load selected book ID
        selectedBookId = localStorage.getItem('selectedBookId');
        console.log('Selected book ID:', selectedBookId);
        
        // If no data was loaded, create demo data
        if (books.size === 0) {
            console.log('No books found, creating demo data...');
            createDemoData();
        }
        
        console.log('Data loaded successfully');
    } catch (error) {
        console.error('Error loading data:', error);
        // If there's an error, reset the data
        books = new Map();
        bookCategories = new Map();
        // Create emergency demo data
        createDemoData();
    }
}

// Function to save data to localStorage
function saveData() {
    try {
        // Save books - convert to array of values
        localStorage.setItem('kb_books', JSON.stringify(Array.from(books.values())));
        
        // Save categories - convert Map of Maps to serializable format
        const serializedCategories = Array.from(bookCategories.entries()).map(([bookId, catMap]) => {
            return [bookId, Array.from(catMap.entries())];
        });
        localStorage.setItem('kb_categories', JSON.stringify(serializedCategories));
        
        // Save selected book ID
        if (selectedBookId) {
            localStorage.setItem('selectedBookId', selectedBookId);
        }
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Failed to save data. Please try again.', 'error');
    }
}

// Function to create demo data
function createDemoData() {
    // Create demo books
    const guideBookId = 'book-demo-guide';
    const projectBookId = 'book-demo-project';
    
    books.set(guideBookId, {
        id: guideBookId,
        name: 'Knowledge Base Guide',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    books.set(projectBookId, {
        id: projectBookId,
        name: 'Project Documentation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // Create categories, folders, articles for Guide book
    const guideCategories = new Map();
    
    // Add "My Knowledge base" category as the main category
    const myKbId = 'category-demo-my-kb';
    guideCategories.set(myKbId, {
        id: myKbId,
        name: 'My Knowledge base',
        type: 'category',
        bookId: guideBookId,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoExpand: true
    });
    
    // Getting Started Category
    const gettingStartedId = 'category-demo-getting-started';
    guideCategories.set(gettingStartedId, {
        id: gettingStartedId,
        name: 'Getting Started',
        type: 'category',
        bookId: guideBookId,
        parentId: myKbId, // Make it a subcategory of My Knowledge base
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoExpand: true
    });
    
    // Welcome article
    const welcomeArticleId = 'article-demo-welcome';
    guideCategories.set(welcomeArticleId, {
        id: welcomeArticleId,
        name: 'See what KnowledgeBase can do for you',
        type: 'article',
        parentId: gettingStartedId,
        bookId: guideBookId,
        status: 'published',
        content: `<h1>Welcome to Knowledge Base!</h1>
                  <p>This is your personal knowledge management tool. Here you can organize all your notes, documents, and resources in one place.</p>
                  <p>Get started by exploring the demo content or creating your own books and categories.</p>`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // How to Use article
    const howToUseId = 'article-demo-how-to-use';
    guideCategories.set(howToUseId, {
        id: howToUseId,
        name: 'Step 1: Create & publish articles',
        type: 'article',
        parentId: gettingStartedId,
        bookId: guideBookId,
        status: 'published',
        content: `<h1>How to Use Knowledge Base</h1>
                  <p>Knowledge Base is organized into a hierarchy of:</p>
                  <ul>
                    <li><strong>Books</strong>: Top-level collections</li>
                    <li><strong>Categories</strong>: Major sections within a book</li>
                    <li><strong>Folders</strong>: Organizational units for related content</li>
                    <li><strong>Articles</strong>: Individual documents with rich text</li>
                    <li><strong>Files</strong>: Uploaded resources like PDFs, images, etc.</li>
                  </ul>
                  <p>Use the sidebar to navigate between books, and the "Add new" button to create content.</p>`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // General Category 
    const generalId = 'category-demo-general';
    guideCategories.set(generalId, {
        id: generalId,
        name: 'General',
        type: 'category',
        bookId: guideBookId,
        parentId: myKbId, // Make it a subcategory of My Knowledge base
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // FAQ Category
    const faqId = 'category-demo-faq';
    guideCategories.set(faqId, {
        id: faqId,
        name: 'FAQ',
        type: 'category',
        bookId: guideBookId,
        parentId: myKbId, // Make it a subcategory of My Knowledge base
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // Create an FAQ article
    const faqArticleId = 'article-demo-faq-article';
    guideCategories.set(faqArticleId, {
        id: faqArticleId,
        name: 'FAQ',
        type: 'article',
        parentId: faqId,
        bookId: guideBookId,
        status: 'published',
        content: `<h1>Frequently Asked Questions</h1>
                  <p>This is a sample FAQ article. Add your own questions and answers here.</p>`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // Create categories for Project book
    const projectCategories = new Map();
    
    // Overview Category
    const overviewId = 'category-demo-overview';
    projectCategories.set(overviewId, {
        id: overviewId,
        name: 'Project Overview',
        type: 'category',
        bookId: projectBookId,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        autoExpand: true
    });
    
    // Project Description article
    const projectDescId = 'article-demo-project-desc';
    projectCategories.set(projectDescId, {
        id: projectDescId,
        name: 'Project Description',
        type: 'article',
        parentId: overviewId,
        bookId: projectBookId,
        status: 'published',
        content: `<h1>Project Description</h1>
                  <p>This is a sample project documentation book. In a real project, you would describe your project goals, scope, and timeline here.</p>`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // Technical Specs Category
    const techSpecsId = 'category-demo-tech-specs';
    projectCategories.set(techSpecsId, {
        id: techSpecsId,
        name: 'Technical Specifications',
        type: 'category',
        bookId: projectBookId,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // Architecture folder
    const architectureId = 'folder-demo-architecture';
    projectCategories.set(architectureId, {
        id: architectureId,
        name: 'Architecture',
        type: 'folder',
        parentId: techSpecsId,
        bookId: projectBookId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // System Design article
    const systemDesignId = 'article-demo-system-design';
    projectCategories.set(systemDesignId, {
        id: systemDesignId,
        name: 'System Design',
        type: 'article',
        parentId: architectureId,
        bookId: projectBookId,
        status: 'draft',
        content: `<h1>System Design</h1>
                  <p>This document would contain technical details about the system architecture, components, and their interactions.</p>
                  <p><em>Note: This article is in draft status. It needs to be reviewed before publishing.</em></p>`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });
    
    // Add categories to bookCategories map
    bookCategories.set(guideBookId, guideCategories);
    bookCategories.set(projectBookId, projectCategories);
    
    // Set selected book
    selectedBookId = guideBookId;
    localStorage.setItem('selectedBookId', guideBookId);
    
    // Save all data
    saveData();
    
    // Mark demo content as created
    localStorage.setItem('demoContentCreated', 'true');
}

// Function to add a new book
function addNewBook() {
    console.log('addNewBook function called');
    
    // Create modal for book creation
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '1000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    // Modal content
    modal.innerHTML = `
        <div style="background-color: var(--card-color); border-radius: 8px; width: 500px; max-width: 90%; padding: 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);">
            <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 20px;">New Book</h2>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-size: 14px;">Book Name</label>
                <input type="text" id="book-name-input" placeholder="Enter book name" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); background-color: rgba(255, 255, 255, 0.05); color: var(--text-color);">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-size: 14px;">Description (optional)</label>
                <textarea id="book-description-input" placeholder="Enter book description" rows="4" style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); background-color: rgba(255, 255, 255, 0.05); color: var(--text-color); resize: vertical;"></textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button id="cancel-book" class="btn btn-outline">Cancel</button>
                <button id="create-book" class="btn btn-primary">Create Book</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('cancel-book').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('create-book').addEventListener('click', () => {
        const bookName = document.getElementById('book-name-input').value.trim();
        const bookDescription = document.getElementById('book-description-input').value.trim();
        
        if (bookName === '') {
            showNotification('Please enter a book name', 'error');
            return;
        }
        
        const bookId = 'book-' + Date.now();
        console.log('Generated new book ID:', bookId);
        
        const newBook = {
            id: bookId,
            name: bookName,
            description: bookDescription,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Add book to books map
        console.log('Adding book to books map...');
        books.set(bookId, newBook);
        console.log('Books map after adding:', [...books.entries()]);
        
        // Initialize empty categories for this book
        console.log('Initializing empty categories for book...');
        bookCategories.set(bookId, new Map());
        
        // Save data
        console.log('Saving data...');
        saveData();
        
        // Select the new book
        console.log('Selecting new book...');
        selectBook(bookId);
        
        // Show notification
        console.log('Showing success notification...');
        showNotification('Book created successfully!');
        
        // Update the sidebar with the new book
        console.log('Updating books sidebar...');
        updateBooksSidebar();
        
        console.log('addNewBook function completed successfully');
        
        // Remove modal
        modal.remove();
    });
    
    // Focus the input field
    setTimeout(() => {
        document.getElementById('book-name-input').focus();
    }, 100);
}

// Function to add a new category
function addNewCategory(bookId = selectedBookId) {
    if (!bookId) {
        showNotification('Please select a book first', 'error');
        return;
    }
    
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
    modalContent.style.width = '500px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflowY = 'auto';
    modalContent.style.position = 'relative';
    
    // Create modal title
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = 'New Category';
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
        const categoryName = document.getElementById('categoryName').value;
        const description = document.getElementById('categoryDescription').value;
        const isPrivate = document.getElementById('categoryPrivate').checked;
        const isPinned = document.getElementById('categoryPinned').checked;
        const iconType = document.querySelector('.icon-select-btn.active')?.getAttribute('data-icon') || 'folder';
        
        // Create the category
        const categoryId = 'category-' + Date.now();
        const newCategory = {
            id: categoryId,
            name: categoryName || 'New Category',
            description: description || '',
            type: 'category',
            bookId: bookId,
            parentId: null,
            isPrivate: isPrivate,
            isPinned: isPinned,
            iconType: iconType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Make sure the book has a categories map
        if (!bookCategories.has(bookId)) {
            bookCategories.set(bookId, new Map());
        }
        
        // Add category to bookCategories
        bookCategories.get(bookId).set(categoryId, newCategory);
        
        // Save data
        saveData();
        
        // Refresh the view
        showMyBooksPage();
        
        // Show notification
        showNotification('Category created successfully!');
        
        // Close the modal
        document.body.removeChild(modalOverlay);
    };
    
    // Category Name Field
    const nameGroup = document.createElement('div');
    nameGroup.style.marginBottom = '20px';
    
    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'categoryName';
    nameLabel.textContent = 'Category Name *';
    nameLabel.style.display = 'block';
    nameLabel.style.marginBottom = '8px';
    nameLabel.style.fontWeight = '500';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'categoryName';
    nameInput.placeholder = 'Enter category name';
    nameInput.style.width = '100%';
    nameInput.style.padding = '10px';
    nameInput.style.borderRadius = 'var(--border-radius)';
    nameInput.style.border = '1px solid var(--border-color)';
    nameInput.style.backgroundColor = 'var(--background-color)';
    nameInput.style.color = 'var(--text-color)';
    nameInput.required = true;
    
    const nameHelp = document.createElement('div');
    nameHelp.textContent = 'Choose a clear and descriptive name';
    nameHelp.style.fontSize = '12px';
    nameHelp.style.color = 'var(--text-secondary)';
    nameHelp.style.marginTop = '5px';
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    nameGroup.appendChild(nameHelp);
    
    // Parent Book Field
    const bookGroup = document.createElement('div');
    bookGroup.style.marginBottom = '20px';
    
    const bookLabel = document.createElement('label');
    bookLabel.htmlFor = 'parentBook';
    bookLabel.textContent = 'Parent Book *';
    bookLabel.style.display = 'block';
    bookLabel.style.marginBottom = '8px';
    bookLabel.style.fontWeight = '500';
    
    const bookSelect = document.createElement('select');
    bookSelect.id = 'parentBook';
    bookSelect.style.width = '100%';
    bookSelect.style.padding = '10px';
    bookSelect.style.borderRadius = 'var(--border-radius)';
    bookSelect.style.border = '1px solid var(--border-color)';
    bookSelect.style.backgroundColor = 'var(--background-color)';
    bookSelect.style.color = 'var(--text-color)';
    bookSelect.disabled = true; // Since we're already passing the book ID
    
    // Add the current book as selected option
    const bookOption = document.createElement('option');
    bookOption.value = bookId;
    bookOption.textContent = books.get(bookId)?.name || 'Selected Book';
    bookOption.selected = true;
    bookSelect.appendChild(bookOption);
    
    bookGroup.appendChild(bookLabel);
    bookGroup.appendChild(bookSelect);
    
    // Description Field
    const descGroup = document.createElement('div');
    descGroup.style.marginBottom = '20px';
    
    const descLabel = document.createElement('label');
    descLabel.htmlFor = 'categoryDescription';
    descLabel.textContent = 'Description';
    descLabel.style.display = 'block';
    descLabel.style.marginBottom = '8px';
    descLabel.style.fontWeight = '500';
    
    const descTextarea = document.createElement('textarea');
    descTextarea.id = 'categoryDescription';
    descTextarea.placeholder = 'Enter category description';
    descTextarea.style.width = '100%';
    descTextarea.style.padding = '10px';
    descTextarea.style.borderRadius = 'var(--border-radius)';
    descTextarea.style.border = '1px solid var(--border-color)';
    descTextarea.style.backgroundColor = 'var(--background-color)';
    descTextarea.style.color = 'var(--text-color)';
    descTextarea.style.minHeight = '100px';
    descTextarea.style.resize = 'vertical';
    
    const descHelp = document.createElement('div');
    descHelp.textContent = 'Provide a brief description of what this category contains';
    descHelp.style.fontSize = '12px';
    descHelp.style.color = 'var(--text-secondary)';
    descHelp.style.marginTop = '5px';
    
    descGroup.appendChild(descLabel);
    descGroup.appendChild(descTextarea);
    descGroup.appendChild(descHelp);
    
    // Category Icon Field
    const iconGroup = document.createElement('div');
    iconGroup.style.marginBottom = '20px';
    
    const iconLabel = document.createElement('div');
    iconLabel.textContent = 'Category Icon';
    iconLabel.style.display = 'block';
    iconLabel.style.marginBottom = '8px';
    iconLabel.style.fontWeight = '500';
    
    const iconButtons = document.createElement('div');
    iconButtons.style.display = 'flex';
    iconButtons.style.gap = '10px';
    
    // Icon options
    const icons = [
        { name: 'folder', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>' },
        { name: 'file', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>' },
        { name: 'code', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' },
        { name: 'settings', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' },
        { name: 'users', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
        { name: 'code-bracket', svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' }
    ];
    
    icons.forEach(icon => {
        const iconBtn = document.createElement('button');
        iconBtn.type = 'button';
        iconBtn.className = 'icon-select-btn';
        iconBtn.setAttribute('data-icon', icon.name);
        iconBtn.innerHTML = icon.svg;
        iconBtn.style.width = '48px';
        iconBtn.style.height = '48px';
        iconBtn.style.display = 'flex';
        iconBtn.style.alignItems = 'center';
        iconBtn.style.justifyContent = 'center';
        iconBtn.style.border = '1px solid var(--border-color)';
        iconBtn.style.borderRadius = 'var(--border-radius)';
        iconBtn.style.backgroundColor = 'transparent';
        iconBtn.style.cursor = 'pointer';
        iconBtn.style.color = 'var(--text-color)';
        
        // Set the first icon (folder) as active by default
        if (icon.name === 'folder') {
            iconBtn.classList.add('active');
            iconBtn.style.backgroundColor = 'rgba(100, 197, 255, 0.1)';
            iconBtn.style.borderColor = 'var(--primary-color)';
            iconBtn.style.color = 'var(--primary-color)';
        }
        
        iconBtn.onclick = function() {
            // Remove active class from all buttons
            document.querySelectorAll('.icon-select-btn').forEach(btn => {
                btn.classList.remove('active');
                btn.style.backgroundColor = 'transparent';
                btn.style.borderColor = 'var(--border-color)';
                btn.style.color = 'var(--text-color)';
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            this.style.backgroundColor = 'rgba(100, 197, 255, 0.1)';
            this.style.borderColor = 'var(--primary-color)';
            this.style.color = 'var(--primary-color)';
        };
        
        iconButtons.appendChild(iconBtn);
    });
    
    iconGroup.appendChild(iconLabel);
    iconGroup.appendChild(iconButtons);
    
    // Advanced Settings
    const advancedGroup = document.createElement('div');
    advancedGroup.style.marginBottom = '20px';
    
    const advancedTitle = document.createElement('div');
    advancedTitle.textContent = 'Advanced Settings';
    advancedTitle.style.fontWeight = '500';
    advancedTitle.style.marginBottom = '15px';
    
    // Private checkbox
    const privateGroup = document.createElement('div');
    privateGroup.style.display = 'flex';
    privateGroup.style.alignItems = 'center';
    privateGroup.style.marginBottom = '10px';
    
    const privateCheck = document.createElement('input');
    privateCheck.type = 'checkbox';
    privateCheck.id = 'categoryPrivate';
    privateCheck.style.marginRight = '10px';
    
    const privateLabel = document.createElement('label');
    privateLabel.htmlFor = 'categoryPrivate';
    privateLabel.textContent = 'Make this category private';
    
    privateGroup.appendChild(privateCheck);
    privateGroup.appendChild(privateLabel);
    
    // Pin checkbox
    const pinGroup = document.createElement('div');
    pinGroup.style.display = 'flex';
    pinGroup.style.alignItems = 'center';
    
    const pinCheck = document.createElement('input');
    pinCheck.type = 'checkbox';
    pinCheck.id = 'categoryPinned';
    pinCheck.style.marginRight = '10px';
    
    const pinLabel = document.createElement('label');
    pinLabel.htmlFor = 'categoryPinned';
    pinLabel.textContent = 'Pin this category to the top';
    
    pinGroup.appendChild(pinCheck);
    pinGroup.appendChild(pinLabel);
    
    advancedGroup.appendChild(advancedTitle);
    advancedGroup.appendChild(privateGroup);
    advancedGroup.appendChild(pinGroup);
    
    // Form actions
    const formActions = document.createElement('div');
    formActions.style.display = 'flex';
    formActions.style.justifyContent = 'flex-end';
    formActions.style.gap = '10px';
    formActions.style.marginTop = '30px';
    
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
    
    const createBtn = document.createElement('button');
    createBtn.type = 'submit';
    createBtn.textContent = 'Create Category';
    createBtn.style.padding = '10px 20px';
    createBtn.style.borderRadius = 'var(--border-radius)';
    createBtn.style.border = 'none';
    createBtn.style.backgroundColor = 'var(--button-blue)';
    createBtn.style.color = 'white';
    createBtn.style.cursor = 'pointer';
    
    formActions.appendChild(cancelBtn);
    formActions.appendChild(createBtn);
    
    // Assemble the form
    form.appendChild(nameGroup);
    form.appendChild(bookGroup);
    form.appendChild(descGroup);
    form.appendChild(iconGroup);
    form.appendChild(advancedGroup);
    form.appendChild(formActions);
    
    // Assemble the modal
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(form);
    modalOverlay.appendChild(modalContent);
    
    // Add modal to the body
    document.body.appendChild(modalOverlay);
    
    // Focus the name input
    nameInput.focus();
}

// Function to add a new folder
function addNewFolder(parentId = null) {
    if (!selectedBookId) {
        showNotification('Please select a book first', 'error');
        return;
    }
    
    // Check if there's at least one category in the book
    if (bookCategories.has(selectedBookId)) {
        const categories = Array.from(bookCategories.get(selectedBookId).values());
        const hasCategory = categories.some(item => item.type === 'category');
        
        if (!hasCategory && !parentId) {
            showNotification('Please create a category first before adding a folder', 'error');
            return;
        }
    } else {
        showNotification('Please create a category first before adding a folder', 'error');
        return;
    }
    
    // If parentId is null but we need a parent, try to find the first category
    if (!parentId) {
        const categories = Array.from(bookCategories.get(selectedBookId).values());
        const firstCategory = categories.find(item => item.type === 'category');
        if (firstCategory) {
            parentId = firstCategory.id;
        }
    }
    
    const folderId = 'folder-' + Date.now();
    const newFolder = {
        id: folderId,
        name: 'New Folder',
        type: 'folder',
        parentId: parentId,
        bookId: selectedBookId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Make sure the book has a categories map
    if (!bookCategories.has(selectedBookId)) {
        bookCategories.set(selectedBookId, new Map());
    }
    
    // Add folder to bookCategories
    bookCategories.get(selectedBookId).set(folderId, newFolder);
    
    // Save data
    saveData();
    
    // Refresh the view
    showMyBooksPage();
    
    // Show notification
    showNotification('Folder created successfully!');
}

// Function to add a new article
function addNewArticle(parentId = null) {
    if (!selectedBookId) {
        showNotification('Please select a book first', 'error');
        return;
    }
    
    // Check if there's at least one category in the book
    if (bookCategories.has(selectedBookId)) {
        const categories = Array.from(bookCategories.get(selectedBookId).values());
        const hasCategory = categories.some(item => item.type === 'category');
        
        if (!hasCategory && !parentId) {
            showNotification('Please create a category first before adding an article', 'error');
            return;
        }
    } else {
        showNotification('Please create a category first before adding an article', 'error');
        return;
    }
    
    // If parentId is null but we need a parent, try to find the first category
    if (!parentId) {
        const categories = Array.from(bookCategories.get(selectedBookId).values());
        const firstCategory = categories.find(item => item.type === 'category');
        if (firstCategory) {
            parentId = firstCategory.id;
        }
    }
    
    const articleId = 'article-' + Date.now();
    const newArticle = {
        id: articleId,
        name: 'New Article',
        type: 'article',
        parentId: parentId,
        bookId: selectedBookId,
        status: 'draft',
        content: '<p>Start writing your article here...</p>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Make sure the book has a categories map
    if (!bookCategories.has(selectedBookId)) {
        bookCategories.set(selectedBookId, new Map());
    }
    
    // Add article to bookCategories
    bookCategories.get(selectedBookId).set(articleId, newArticle);
    
    // Save data
    saveData();
    
    // Refresh the view
    showMyBooksPage();
    
    // Open the article editor for the new article
    const editor = document.getElementById('articleEditor');
    if (editor) {
        editor.classList.add('active');
        editor.setAttribute('data-article-id', articleId);
        
        // Set the title in the editor
        const titleInput = editor.querySelector('#articleTitleInput');
        if (titleInput) {
            titleInput.value = newArticle.name;
        }
        
        // Set the content in the editor
        const editorContent = editor.querySelector('.editor-content');
        if (editorContent) {
            editorContent.innerHTML = newArticle.content;
        }
        
        // Set correct status button
        const statusOptions = editor.querySelectorAll('.status-option');
        statusOptions.forEach(option => {
            option.classList.remove('active');
            if (option.classList.contains(newArticle.status)) {
                option.classList.add('active');
            }
        });
    }
    
    // Show notification
    showNotification('Article created successfully!');
}

// Function to add a new file
function addNewFile(parentId = null) {
    if (!selectedBookId) {
        showNotification('Please select a book first', 'error');
        return;
    }
    
    // Check if there's at least one category in the book
    if (bookCategories.has(selectedBookId)) {
        const categories = Array.from(bookCategories.get(selectedBookId).values());
        const hasCategory = categories.some(item => item.type === 'category');
        
        if (!hasCategory && !parentId) {
            showNotification('Please create a category first before adding a file', 'error');
            return;
        }
    } else {
        showNotification('Please create a category first before adding a file', 'error');
        return;
    }
    
    // If parentId is null but we need a parent, try to find the first category
    if (!parentId) {
        const categories = Array.from(bookCategories.get(selectedBookId).values());
        const firstCategory = categories.find(item => item.type === 'category');
        if (firstCategory) {
            parentId = firstCategory.id;
        }
    }
    
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Trigger file selection dialog
    fileInput.click();
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            const selectedFile = fileInput.files[0];
            
            // Create file object
            const fileId = 'file-' + Date.now();
            const newFile = {
                id: fileId,
                name: selectedFile.name,
                type: 'file',
                fileType: selectedFile.type,
                fileSize: selectedFile.size,
                parentId: parentId,
                bookId: selectedBookId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // In a real implementation, you'd upload the file to a server or store it as base64
            // For this demo, we'll just store the file metadata
            
            // Make sure the book has a categories map
            if (!bookCategories.has(selectedBookId)) {
                bookCategories.set(selectedBookId, new Map());
            }
            
            // Store file
            bookCategories.get(selectedBookId).set(fileId, newFile);
            
            // Save data
            saveData();
            
            // Refresh the view
            showMyBooksPage();
            
            // Show notification
            showNotification(`File "${selectedFile.name}" uploaded successfully!`);
        }
        
        // Clean up
        document.body.removeChild(fileInput);
    });
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to update books in the sidebar
function updateBooksSidebar() {
    const booksList = document.querySelector('.books-list');
    if (!booksList) {
        console.error('Books list container not found!');
        return;
    }
    
    console.log('Updating books sidebar...');
    
    // Clear existing books
    booksList.innerHTML = '';

    try {
        // Handle both Map and Array structures
        let booksArray = [];
        
        if (books instanceof Map) {
            console.log('Books is a Map with size:', books.size);
            booksArray = Array.from(books.values());
        } else if (Array.isArray(books)) {
            console.log('Books is an Array with length:', books.length);
            // If it's an array of [key, value] pairs (from Map.entries())
            if (books.length > 0 && Array.isArray(books[0]) && books[0].length === 2) {
                booksArray = books.map(entry => entry[1]);
            } else {
                booksArray = books;
            }
        } else {
            console.log('Books is neither Map nor Array:', typeof books);
            // If it's some other object, try to convert it
            booksArray = Object.values(books || {});
        }
        
        console.log('Processed books for display:', booksArray);
        
        // Add all books to the sidebar
        if (booksArray.length > 0) {
            booksArray.forEach(book => {
                // Skip if book or book.id is undefined
                if (!book || !book.id) {
                    console.warn('Skipping invalid book entry:', book);
                    return;
                }
                
                const bookItem = document.createElement('div');
                bookItem.className = 'book-item';
                bookItem.setAttribute('data-book-id', book.id);
                
                if (book.id === selectedBookId) {
                    bookItem.classList.add('active');
                }
                
                bookItem.innerHTML = `
                    <div class="book-sidebar-content">
                        <span class="book-icon-small">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                        </span>
                        <span class="book-title-small">${book.name}</span>
                    </div>
                `;
                
                booksList.appendChild(bookItem);
                
                // Add click event to select book
                bookItem.addEventListener('click', function() {
                    console.log('Book clicked:', book.id);
                    selectBook(book.id);
                });
            });
        } else {
            console.log('No books found');
            booksList.innerHTML = '<div class="no-books" style="padding: 10px 20px; color: var(--text-secondary); font-size: 14px;">No books yet</div>';
        }
    } catch (error) {
        console.error('Error updating books sidebar:', error);
        booksList.innerHTML = '<div class="error-state" style="padding: 10px 20px; color: #ff4444; font-size: 14px;">Error loading books</div>';
    }
}

// Load saved data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Initialize UI
        loadStoredData();
        setupEventListeners();
        console.log("DOM fully loaded, setting up event listeners");
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data', 'error');
    }
});

// Modified loadStoredData function to replace loadBooks references
function loadStoredData() {
    try {
        // Load all data
        loadData();
        
        // Update the sidebar with loaded books
        updateBooksSidebar();
        
        console.log("Data loaded successfully");
    } catch (error) {
        console.error("Error loading from localStorage:", error);
    }
}

// Function to show "Add new" menu dropdown
function showAddNewMenu(button) {
    console.log('showAddNewMenu called', button);
    
    // Handle if button is passed as event
    if (button.target) {
        button = button.target.closest('.btn-add') || button.target;
    }
    
    // Remove any existing dropdown
    const existingDropdown = document.querySelector('.add-new-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'add-new-dropdown custom-dropdown-content';
    
    // Position the dropdown below the button
    const buttonRect = button.getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.top = (buttonRect.bottom + 5) + 'px';
    dropdown.style.right = (window.innerWidth - buttonRect.right) + 'px'; // Position to the right side of the button
    dropdown.style.left = 'auto'; // Clear left position
    dropdown.style.border = '1px solid var(--border-color)';
    dropdown.style.zIndex = '1000';
    
    // Check if the selected book has any categories
    let hasCategoriesInBook = false;
    if (selectedBookId && bookCategories.has(selectedBookId)) {
        const categories = Array.from(bookCategories.get(selectedBookId).values());
        hasCategoriesInBook = categories.some(item => item.type === 'category');
    }
    
    // Create dropdown items manually to ensure proper event binding
    const createDropdownItem = (action, icon, text, isDisabled = false) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item custom-dropdown-item';
        if (isDisabled) {
            item.className += ' disabled';
            item.style.opacity = '0.5';
            item.style.cursor = 'not-allowed';
            item.title = `Please create a category first before adding a ${action}`;
        } else {
            item.setAttribute('data-action', action);
        }
        item.innerHTML = icon + ' ' + text;
        
        if (!isDisabled) {
            item.addEventListener('click', function() {
                console.log(`Dropdown item clicked: ${action}`);
                switch (action) {
                    case 'book':
                        addNewBook();
                        break;
                    case 'category':
                        addNewCategory();
                        break;
                    case 'folder':
                        addNewFolder();
                        break;
                    case 'article':
                        addNewArticle();
                        break;
                    case 'file':
                        addNewFile();
                        break;
                }
                dropdown.remove();
            });
        }
        
        return item;
    };
    
    // Book item
    dropdown.appendChild(
        createDropdownItem(
            'book',
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>`,
            'New Book'
        )
    );
    
    // Category item
    dropdown.appendChild(
        createDropdownItem(
            'category',
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
            </svg>`,
            'New Category'
        )
    );
    
    // Folder item - disabled if no categories exist
    dropdown.appendChild(
        createDropdownItem(
            'folder',
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-9a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2z"></path>
            </svg>`,
            'New Folder',
            !hasCategoriesInBook
        )
    );
    
    // Article item - disabled if no categories exist
    dropdown.appendChild(
        createDropdownItem(
            'article',
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>`,
            'New Article',
            !hasCategoriesInBook
        )
    );
    
    // File item - disabled if no categories exist
    dropdown.appendChild(
        createDropdownItem(
            'file',
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>`,
            'Upload File',
            !hasCategoriesInBook
        )
    );
    
    // Append the dropdown to the document body
    document.body.appendChild(dropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && e.target !== button && !e.target.closest('.btn-add')) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// Function to show "Add content" menu dropdown
function showAddContentMenu(button) {
    // Handle if button is passed as event or element
    if (button.target) {
        button = button.target.closest('.tree-action-btn[data-action="add"]') || button.target;
    }
    
    // Get the parent row
    const row = button.closest('tr');
    if (!row) return;
    
    const parentId = row.getAttribute('data-category-id');
    if (!parentId) return;
    
    // Get the parent's indent level
    const parentIndentLevel = parseInt(row.getAttribute('data-indent') || '0');
    
    // Remove any existing dropdown
    const existingDropdown = document.querySelector('.add-content-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'add-content-dropdown custom-dropdown-content';
    
    // Position the dropdown near the button
    const buttonRect = button.getBoundingClientRect();
    dropdown.style.position = 'absolute';
    dropdown.style.top = (buttonRect.bottom + 5) + 'px';
    dropdown.style.left = (buttonRect.left) + 'px';
    dropdown.style.border = '1px solid var(--border-color)';
    dropdown.style.zIndex = '1000';
    
    // Create dropdown items manually to ensure proper event binding
    const createDropdownItem = (action, icon, text) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item custom-dropdown-item';
        item.setAttribute('data-action', action);
        item.innerHTML = icon + ' ' + text;
        
        item.addEventListener('click', function() {
            switch (action) {
                case 'folder':
                    addNewFolder(parentId);
                    break;
                case 'article':
                    addNewArticle(parentId);
                    break;
                case 'file':
                    addNewFile(parentId);
                    break;
            }
            
            // Remove dropdown after selection
            dropdown.remove();
        });
        
        return item;
    };
    
    // Folder item
    dropdown.appendChild(
        createDropdownItem(
            'folder',
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-9a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2z"></path>
            </svg>`,
            'New Folder'
        )
    );
    
    // Article item
    dropdown.appendChild(
        createDropdownItem(
            'article',
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>`,
            'New Article'
        )
    );
    
    // File item
    dropdown.appendChild(
        createDropdownItem(
            'file',
            `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>`,
            'Upload File'
        )
    );
    
    // Append the dropdown to the document body
    document.body.appendChild(dropdown);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && e.target !== button && !e.target.closest('.tree-action-btn[data-action="add"]')) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// Function to show more options menu
function showMoreOptionsMenu(button) {
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

// Edit item function
function editItem(id, row) {
    console.log("Editing item", id);
    
    const itemType = row.classList.contains('folder-row') ? 'folder' : 'category';
    const nameElement = row.querySelector('.category-name');
    const currentName = nameElement.textContent;
    
    // Create modal for editing
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.width = '400px';
    modalContent.style.backgroundColor = 'var(--card-color)';
    modalContent.style.borderRadius = '8px';
    modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    modalContent.style.padding = '20px';
    modalContent.style.color = 'var(--text-color)';
    
    const modalHeader = document.createElement('div');
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.marginBottom = '20px';
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = `Edit ${itemType === 'folder' ? 'Folder' : 'Category'}`;
    modalTitle.style.margin = '0';
    
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '24px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = 'var(--text-color)';
    closeBtn.onclick = () => modal.remove();
    
    const editContent = document.createElement('div');
    editContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 500;">Name</label>
            <input type="text" id="itemName" value="${currentName}" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background-color: rgba(255, 255, 255, 0.05); color: var(--text-color);">
        </div>
        
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn btn-outline" style="padding: 8px 16px;">Cancel</button>
            <button type="button" class="btn btn-primary" style="padding: 8px 16px;">Save Changes</button>
        </div>
    `;
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(editContent);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Add event listeners to buttons in the modal
    const cancelBtn = modalContent.querySelector('.btn-outline');
    const saveBtn = modalContent.querySelector('.btn-primary');
    const nameInput = modalContent.querySelector('#itemName');
    
    cancelBtn.addEventListener('click', () => modal.remove());
    saveBtn.addEventListener('click', () => {
        if (nameInput.value.trim() === '') {
            showNotification('Please enter a name', 'error');
            return;
        }
        
        const newName = nameInput.value.trim();
        
        // Update UI
        nameElement.textContent = newName;
        
        // Update data structure
        if (selectedBookId && bookCategories.has(selectedBookId)) {
            const item = bookCategories.get(selectedBookId).get(id);
            if (item) {
                item.name = newName;
                item.updatedAt = new Date().toISOString();
                
                // Save data
                saveData();
                
                showNotification(`${itemType === 'folder' ? 'Folder' : 'Category'} updated successfully`, 'success');
            }
        }
        
        modal.remove();
    });
}

// Duplicate item function
function duplicateItem(id, row) {
    console.log("Duplicating item", id);
    
    if (!selectedBookId || !bookCategories.has(selectedBookId)) {
        showNotification('Cannot duplicate: Book not found', 'error');
        return;
    }
    
    const original = bookCategories.get(selectedBookId).get(id);
    if (!original) {
        showNotification('Cannot duplicate: Item not found', 'error');
        return;
    }
    
    // Create new ID for the duplicate
    const newId = `${original.type || 'category'}-${Date.now()}`;
    
    // Create duplicate object
    const duplicate = {
        ...original,
        id: newId,
        name: `${original.name} (copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to data structure
    bookCategories.get(selectedBookId).set(newId, duplicate);
    
    // Save data
    saveData();
    
    // Insert into UI
    const contentTable = document.querySelector('.content-table tbody');
    const newRow = row.cloneNode(true);
    newRow.setAttribute('data-category-id', newId);
    
    // Update name in the new row
    const nameElement = newRow.querySelector('.category-name');
    nameElement.textContent = duplicate.name;
    
    // Update date in the new row
    const dateCell = newRow.querySelector('td:nth-child(3)');
    dateCell.textContent = new Date().toLocaleDateString();
    
    // Insert after the original
    row.insertAdjacentElement('afterend', newRow);
    
    // Attach event listeners
    attachTreeEventListeners(newRow);
    
    showNotification('Item duplicated successfully', 'success');
}

// Delete item function
function deleteItem(id, row) {
    console.log("Deleting item", id);
    
    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'delete-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';
    
    const modalContent = document.createElement('div');
    modalContent.style.width = '400px';
    modalContent.style.backgroundColor = 'var(--card-color)';
    modalContent.style.borderRadius = '8px';
    modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    modalContent.style.padding = '20px';
    modalContent.style.color = 'var(--text-color)';
    
    modalContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 15px;">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h2 style="margin: 0; margin-bottom: 10px;">Confirm Deletion</h2>
            <p style="color: var(--text-secondary); margin: 0 0 15px 0;">Are you sure you want to delete this item? This action cannot be undone.</p>
        </div>
        <div style="display: flex; justify-content: center; gap: 10px;">
            <button type="button" class="btn btn-outline" style="padding: 8px 16px; flex: 1;">Cancel</button>
            <button type="button" class="btn btn-primary" style="padding: 8px 16px; background-color: #ff4444; flex: 1;">Delete</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.appendChild(modalContent);
    
    // Add event listeners
    const cancelBtn = modalContent.querySelector('.btn-outline');
    const deleteBtn = modalContent.querySelector('.btn-primary');
    
    cancelBtn.addEventListener('click', () => modal.remove());
    deleteBtn.addEventListener('click', () => {
        // Get indent level of the row being deleted
        const indentLevel = parseInt(row.getAttribute('data-indent') || '0');
        
        // Remove item from data structure
        if (selectedBookId && bookCategories.has(selectedBookId)) {
            bookCategories.get(selectedBookId).delete(id);
            
            // Save data
            saveData();
        }
        
        // Remove row from UI
        let next = row.nextElementSibling;
        row.remove();
        
        // Remove children if they exist
        while (next) {
            const nextIndent = parseInt(next.getAttribute('data-indent') || '0');
            if (nextIndent <= indentLevel) {
                break;
            }
            
            const temp = next.nextElementSibling;
            next.remove();
            next = temp;
        }
        
        showNotification('Item deleted successfully', 'success');
        modal.remove();
    });
}

// Function to select a book
function selectBook(bookId) {
    if (!bookId) return;
    
    // Set the current selected book
    selectedBookId = bookId;
    
    // Save to localStorage
    localStorage.setItem('selectedBookId', bookId);
    
    // Update UI
    const bookItems = document.querySelectorAll('.book-item');
    bookItems.forEach(book => {
        book.classList.remove('active');
        if (book.getAttribute('data-book-id') === bookId) {
            book.classList.add('active');
        }
    });
    
    // Show My Books page with the selected book
    showMyBooksPage();
}

// Function for saving an article
function saveArticle(articleId, title, content, status) {
    if (!selectedBookId || !articleId) return;
    
            const categories = bookCategories.get(selectedBookId);
            if (!categories) return;
            
            const article = categories.get(articleId);
            if (!article) return;
            
            // Update article data
            article.name = title;
            article.content = content;
            article.status = status;
            article.updatedAt = new Date().toISOString();
            
    // Update in the map
    categories.set(articleId, article);
    
    // Save to localStorage
            saveData();
            
    // Show notification
    showNotification('Article saved successfully!');
    
    // Close editor
    const editor = document.getElementById('articleEditor');
    if (editor) {
        editor.classList.remove('active');
    }
    
    // Refresh the view
    showMyBooksPage();
}

// Function to create demo data if needed
function createDemoDataIfNeeded() {
    console.log('Checking if demo data is needed...');
    
    // Check if we have existing data
    const storedBooks = localStorage.getItem('kb_books');
    const demoCreated = localStorage.getItem('demoContentCreated');
    
    if (!storedBooks || books.size === 0 || demoCreated !== 'true') {
        console.log('No existing data found or demo not created yet, creating demo data...');
        
        // Clear existing data to ensure a clean demo setup
        localStorage.removeItem('kb_books');
        localStorage.removeItem('kb_categories');
        localStorage.removeItem('selectedBookId');
        
        // Reset in-memory data
        books = new Map();
        bookCategories = new Map();
        selectedBookId = null;
        
        // Create demo data
        createDemoData();
        
        // Mark demo content as created
        localStorage.setItem('demoContentCreated', 'true');
        
        // Show welcome notification
        showNotification('Welcome to Knowledge Base! Demo content has been created for you.', 'success');
    } else {
        console.log('Demo data already exists, skipping creation.');
    }
}

// Function to show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Filter content based on search query
function filterContent(query) {
    const rows = document.querySelectorAll('.content-table tbody tr');
    
    rows.forEach(row => {
        if (!query) {
            row.style.display = ''; // Show all rows when query is empty
            return;
        }
        
        const title = row.querySelector('.category-name')?.textContent.toLowerCase() || '';
        if (title.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Filter content by type (all, published, draft)
