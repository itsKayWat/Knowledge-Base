// Store books and categories in maps for easy access
const books = new Map();
const bookCategories = new Map();
let selectedBookId = null;

// Load saved data when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load saved books and categories from Chrome storage
        const result = await chrome.storage.sync.get(['books', 'categories']);
        if (result.books) {
            result.books.forEach(book => books.set(book.id, book));
        }
        if (result.categories) {
            result.categories.forEach(category => bookCategories.set(category.id, category));
        }

        // Initialize UI
        loadBooks();
        setupEventListeners();
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data', 'error');
    }
});

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(searchInput => {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            filterContent(query);
        });
    });

    // Add content button
    const addContentBtn = document.querySelector('.btn-add');
    if (addContentBtn) {
        addContentBtn.addEventListener('click', showAddContentMenu);
    }

    // Filter items in sidebar
    document.querySelectorAll('.sidebar .filter-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar .filter-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const type = item.getAttribute('data-filter');
            filterByType(type);
        });
    });

    // Topbar navigation filters
    document.querySelectorAll('.topbar-nav .topbar-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.topbar-nav .topbar-icon').forEach(i => i.classList.remove('active'));
            icon.classList.add('active');
            const filter = icon.getAttribute('data-filter');
            filterByType(filter);
        });
    });

    // Category expand/collapse
    document.querySelectorAll('.expandable-control').forEach(control => {
        control.addEventListener('click', (e) => {
            const icon = control.querySelector('.expand-icon');
            icon.classList.toggle('open');
            const categoryId = control.closest('tr').dataset.categoryId;
            toggleCategoryVisibility(categoryId);
        });
    });

    // Menu item actions
    document.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.menu-item');
        if (menuItem) {
            const action = menuItem.dataset.action;
            handleMenuAction(action);
            // Close the menu after action
            const menu = document.querySelector('.add-content-menu');
            if (menu) menu.remove();
        }
    });
}

// Handle menu actions
async function handleMenuAction(action) {
    try {
        switch (action) {
            case 'new-book':
                await addNewBook();
                break;
            case 'new-category':
                await addNewCategory();
                break;
        }
    } catch (error) {
        console.error('Error handling menu action:', error);
        showNotification('Error performing action', 'error');
    }
}

// Handle topbar navigation
function handleTopbarNavigation(view) {
    // Implement view switching logic here
    console.log('Switching to view:', view);
}

// Toggle category visibility
function toggleCategoryVisibility(categoryId) {
    const books = document.querySelectorAll(`tr[data-category="${categoryId}"]`);
    const icon = document.querySelector(`tr[data-category-id="${categoryId}"] .expand-icon`);
    const isExpanded = icon.classList.contains('open');
    
    books.forEach(book => {
        book.style.display = isExpanded ? 'table-row' : 'none';
    });
}

// Filter content by search query
function filterContent(query) {
    const rows = document.querySelectorAll('.content-table tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? 'table-row' : 'none';
    });
}

// Filter content by type
function filterByType(type) {
    const rows = document.querySelectorAll('.content-table tbody tr');
    rows.forEach(row => {
        if (type === 'all') {
            row.style.display = '';
        } else if (type === 'published' || type === 'draft') {
            const statusTag = row.querySelector('.status-tag');
            if (statusTag) {
                row.style.display = statusTag.textContent.toLowerCase() === type ? '' : 'none';
            }
        }
    });
}

// Show add content menu
function showAddContentMenu(event) {
    const existingMenu = document.querySelector('.add-content-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const menu = document.createElement('div');
    menu.className = 'add-content-menu';
    menu.innerHTML = `
        <div class="menu-item" data-action="new-book">
            <i class="fas fa-book menu-icon"></i>
            New Book
        </div>
        <div class="menu-item" data-action="new-category">
            <i class="fas fa-folder menu-icon"></i>
            New Category
        </div>
    `;

    // Position menu below button
    const rect = event.target.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.left}px`;

    document.body.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !event.target.contains(e.target)) {
            menu.remove();
        }
    }, { once: true });
}

// Add a new book
async function addNewBook() {
    try {
        const book = {
            id: Date.now().toString(),
            title: 'New Book',
            author: '',
            status: 'Draft',
            categoryId: null,
            lastModified: new Date().toISOString()
        };

        books.set(book.id, book);
        await saveBooks();
        loadBooks();
        showNotification('Book created successfully', 'success');
    } catch (error) {
        console.error('Error adding new book:', error);
        showNotification('Error creating book', 'error');
    }
}

// Add a new category
async function addNewCategory() {
    try {
        const category = {
            id: Date.now().toString(),
            name: 'New Category',
            parentId: null
        };

        bookCategories.set(category.id, category);
        await saveCategories();
        loadBooks();
        showNotification('Category created successfully', 'success');
    } catch (error) {
        console.error('Error adding new category:', error);
        showNotification('Error creating category', 'error');
    }
}

// Save books to Chrome storage
async function saveBooks() {
    try {
        await chrome.storage.sync.set({
            books: Array.from(books.values())
        });
    } catch (error) {
        console.error('Error saving books:', error);
        throw error;
    }
}

// Save categories to Chrome storage
async function saveCategories() {
    try {
        await chrome.storage.sync.set({
            categories: Array.from(bookCategories.values())
        });
    } catch (error) {
        console.error('Error saving categories:', error);
        throw error;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
}

// Load books and categories
function loadBooks() {
    const contentTable = document.querySelector('.content-table tbody');
    if (!contentTable) return;

    contentTable.innerHTML = '';
    
    // First add categories
    bookCategories.forEach(category => {
        const row = createCategoryRow(category);
        contentTable.appendChild(row);
        
        // Add books in this category
        const categoryBooks = Array.from(books.values())
            .filter(book => book.categoryId === category.id);
            
        categoryBooks.forEach(book => {
            const bookRow = createBookRow(book);
            contentTable.appendChild(bookRow);
        });
    });

    // Update book list in sidebar
    updateBookList();
}

// Create a category row
function createCategoryRow(category) {
    const row = document.createElement('tr');
    row.className = 'category-row';
    row.dataset.categoryId = category.id;

    const categoryBooks = Array.from(books.values())
        .filter(book => book.categoryId === category.id);

    row.innerHTML = `
        <td>
            <div class="category-icon">
                <div class="expandable-control">
                    <i class="fas fa-chevron-right expand-icon"></i>
                </div>
                <i class="fas fa-folder folder-icon"></i>
                <div class="category-info">
                    <span class="category-name">${category.name}</span>
                    <span class="article-count">${categoryBooks.length} articles</span>
                </div>
            </div>
        </td>
        <td></td>
        <td>
            <span class="status-tag draft">Draft</span>
        </td>
        <td>${new Date().toLocaleDateString()}</td>
    `;

    // Add expand/collapse functionality
    const expandControl = row.querySelector('.expandable-control');
    if (expandControl) {
        expandControl.addEventListener('click', () => {
            const icon = expandControl.querySelector('.expand-icon');
            icon.classList.toggle('open');
            toggleCategoryVisibility(category.id);
        });
    }

    return row;
}

// Create a book row
function createBookRow(book) {
    const row = document.createElement('tr');
    row.dataset.bookId = book.id;
    row.dataset.category = book.categoryId;
    row.dataset.type = 'book';
    
    row.innerHTML = `
        <td>
            <div class="book-container">
                <div class="book-header">
                    <div class="book-icon">
                        <i class="fas fa-book"></i>
                    </div>
                    <span class="book-title">${book.title}</span>
                    <div class="book-actions">
                        <button class="tree-action-btn edit-btn">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="tree-action-btn delete-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </td>
        <td>${book.author || ''}</td>
        <td>
            <span class="status-tag ${book.status.toLowerCase()}">${book.status}</span>
        </td>
        <td>${new Date(book.lastModified).toLocaleDateString()}</td>
    `;

    // Add event listeners for book actions
    const editBtn = row.querySelector('.edit-btn');
    const deleteBtn = row.querySelector('.delete-btn');

    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editBook(book.id);
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteBook(book.id);
        });
    }

    // Initially hide books (they will be shown when category is expanded)
    row.style.display = 'none';

    return row;
}

// Edit book
async function editBook(bookId) {
    const book = books.get(bookId);
    if (!book) return;

    // Implement edit functionality
    console.log('Editing book:', book);
    // You can implement a modal or form to edit the book here
}

// Delete book
async function deleteBook(bookId) {
    try {
        books.delete(bookId);
        await saveBooks();
        loadBooks();
        showNotification('Book deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting book:', error);
        showNotification('Error deleting book', 'error');
    }
}

// Update book list in sidebar
function updateBookList() {
    const bookList = document.querySelector('.book-list');
    if (!bookList) return;

    bookList.innerHTML = '';
    books.forEach((book, id) => {
        const bookItem = document.createElement('a');
        bookItem.href = '#';
        bookItem.className = 'filter-item' + (id === selectedBookId ? ' active' : '');
        bookItem.innerHTML = `
            <i class="fas fa-book"></i>
            ${book.title}
        `;
        bookItem.addEventListener('click', (e) => {
            e.preventDefault();
            selectBook(id);
        });
        bookList.appendChild(bookItem);
    });
}

// Select a book
function selectBook(bookId) {
    selectedBookId = bookId;
    document.querySelectorAll('.book-list .filter-item').forEach(item => {
        item.classList.remove('active');
    });
    const selectedItem = document.querySelector(`.book-list .filter-item[data-book-id="${bookId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
} 