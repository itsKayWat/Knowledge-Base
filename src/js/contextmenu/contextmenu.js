// Context Menu Module
// This module handles right-click context menus for the Knowledge Base app

// Reference to the main app variables
let appBooks;
let appBookCategories;
let appSelectedBookId;
let appSaveData;
let appUpdateBooksSidebar;
let appShowMyBooksPage;
let appShowNotification;
let appEditItem;
let appDeleteItem;

// Initialize the context menu system
function initContextMenu(deps) {
    // Store references to dependencies
    appBooks = deps.books;
    appBookCategories = deps.bookCategories;
    appSelectedBookId = deps.selectedBookId;
    appSaveData = deps.saveData;
    appUpdateBooksSidebar = deps.updateBooksSidebar;
    appShowMyBooksPage = deps.showMyBooksPage;
    appShowNotification = deps.showNotification;
    appEditItem = deps.editItem;
    appDeleteItem = deps.deleteItem;
    
    // Setup global listeners
    document.addEventListener('click', hideContextMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideContextMenu();
    });
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
            separator: true
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
            action: () => appEditItem(itemId, row)
        },
        {
            label: `Clone ${capitalizeFirstLetter(itemType)}`,
            icon: 'copy',
            action: () => cloneItem(itemId, row)
        },
        {
            separator: true
        },
        {
            label: `Delete ${capitalizeFirstLetter(itemType)}`,
            icon: 'trash',
            action: () => appDeleteItem(itemId, row)
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

// Show the context menu at the cursor position
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
    menuItems.forEach(item => {
        if (item.separator) {
            const separator = document.createElement('div');
            separator.style.height = '1px';
            separator.style.backgroundColor = 'var(--border-color)';
            separator.style.margin = '4px 0';
            contextMenu.appendChild(separator);
            return;
        }
        
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
    });
    
    // Add to DOM
    document.body.appendChild(contextMenu);
    
    // Position menu at cursor
    positionContextMenu(event, contextMenu);
}

// Position the context menu at the cursor position
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

// Hide the context menu
function hideContextMenu() {
    const existingMenu = document.getElementById('kb-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
}

// Get SVG icon for context menu
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

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to edit a book
function editBook(bookId) {
    if (!appBooks.has(bookId)) {
        appShowNotification('Book not found', 'error');
        return;
    }
    
    const book = appBooks.get(bookId);
    
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
            appShowNotification('Please enter a book name', 'error');
            return;
        }
        
        // Update book
        book.name = bookName;
        book.description = bookDescription;
        book.updatedAt = new Date().toISOString();
        
        // Save data
        appSaveData();
        
        // Update UI
        appUpdateBooksSidebar();
        appShowMyBooksPage();
        appShowNotification('Book updated successfully!');
        
        // Remove modal
        modal.remove();
    });
    
    // Focus the input field
    setTimeout(() => {
        document.getElementById('book-name-input').focus();
    }, 100);
}

// Function to clone a book
function cloneBook(bookId) {
    if (!appBooks.has(bookId)) {
        appShowNotification('Book not found', 'error');
        return;
    }
    
    const originalBook = appBooks.get(bookId);
    const newBookId = 'book-' + Date.now();
    
    // Clone book properties
    const newBook = {
        id: newBookId,
        name: `${originalBook.name} (Copy)`,
        description: originalBook.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to books
    appBooks.set(newBookId, newBook);
    
    // Clone categories, folders, articles, files
    if (appBookCategories.has(bookId)) {
        // Create new categories map for the book
        const newCategories = new Map();
        const originalCategories = appBookCategories.get(bookId);
        
        // Create ID mapping to maintain parent-child relationships
        const idMapping = new Map();
        
        // First phase: clone everything with new IDs
        originalCategories.forEach((item, oldId) => {
            const newId = `${item.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            idMapping.set(oldId, newId);
            
            // Clone item
            const newItem = {
                ...item,
                id: newId,
                bookId: newBookId
            };
            
            newCategories.set(newId, newItem);
        });
        
        // Second phase: update parent references
        newCategories.forEach(item => {
            if (item.parentId && idMapping.has(item.parentId)) {
                item.parentId = idMapping.get(item.parentId);
            }
        });
        
        // Add to bookCategories
        appBookCategories.set(newBookId, newCategories);
    } else {
        // No categories to clone, initialize empty map
        appBookCategories.set(newBookId, new Map());
    }
    
    // Save data
    appSaveData();
    
    // Update UI
    appUpdateBooksSidebar();
    appShowNotification('Book cloned successfully!');
}

// Function to delete a book
function deleteBook(bookId) {
    if (!appBooks.has(bookId)) {
        appShowNotification('Book not found', 'error');
        return;
    }
    
    const book = appBooks.get(bookId);
    
    // Create confirmation modal
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
        appBooks.delete(bookId);
        
        // Delete associated categories
        appBookCategories.delete(bookId);
        
        // If the deleted book was selected, clear selection
        if (appSelectedBookId === bookId) {
            appSelectedBookId = null;
            localStorage.removeItem('selectedBookId');
            
            // If there are other books, select the first one
            if (appBooks.size > 0) {
                const firstBookId = appBooks.keys().next().value;
                appSelectedBookId = firstBookId;
                localStorage.setItem('selectedBookId', firstBookId);
            }
        }
        
        // Save data
        appSaveData();
        
        // Update UI
        appUpdateBooksSidebar();
        appShowMyBooksPage();
        appShowNotification('Book deleted successfully');
        
        // Remove modal
        modal.remove();
    });
}

// Function to clone any content item (category, folder, article, file)
function cloneItem(itemId, row) {
    if (!appSelectedBookId || !itemId) {
        appShowNotification('Cannot clone item: no book or item selected', 'error');
        return;
    }
    
    const categories = appBookCategories.get(appSelectedBookId);
    if (!categories || !categories.has(itemId)) {
        appShowNotification('Item not found', 'error');
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
    appSaveData();
    
    // Refresh the view
    appShowMyBooksPage();
    
    // Show notification
    appShowNotification(`${capitalizeFirstLetter(itemType)} cloned successfully!`);
}

// Export the initialization function
window.KBContextMenu = {
    init: initContextMenu
}; 