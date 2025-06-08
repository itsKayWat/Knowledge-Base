// Book filtering functionality
let selectedFilterCategory = 'getting-started';
let bookFilters = new Map();

// Initialize the filters with empty arrays
function initializeFilters() {
    bookFilters.set('all-books', []);  // Will contain all books
    bookFilters.set('work', []);
    bookFilters.set('personal', []);
    bookFilters.set('social-media', []);
    bookFilters.set('developer', []);
    bookFilters.set('getting-started', []);
    
    // Assign all demo books to the 'getting-started' filter by default
    if (books && books.size > 0) {
        const allBooks = Array.from(books.values());
        bookFilters.get('all-books').push(...allBooks);
        bookFilters.get('getting-started').push(...allBooks);
    }
}

// Filter books based on the selected category
function filterBooksByCategory(filterCategory) {
    selectedFilterCategory = filterCategory;
    updateBooksSidebarWithFilters(); // Update the sidebar to show only books from the selected filter
    
    // Update filter counts in the UI
    updateFilterCounts();
    
    // Save the selected filter to localStorage
    localStorage.setItem('selectedFilterCategory', selectedFilterCategory);
    
    // Check if we're on the Analytics page and refresh it
    const analyticsIcon = document.querySelector('.icon-link[title="Analytics"]');
    if (analyticsIcon && analyticsIcon.classList.contains('active')) {
        // We're on the analytics page, refresh it
        showAnalyticsPage();
    }
    
    // Ensure all category expand icons are in the correct state (collapsed by default)
    // This fixes the issue where arrows appear expanded when content is collapsed
    setTimeout(() => {
        const categoryRows = document.querySelectorAll('.category-row, .folder-row');
        categoryRows.forEach(row => {
            const expandIcon = row.querySelector('.expand-icon');
            if (expandIcon) {
                // Check if the content is actually expanded
                const isExpanded = checkIfExpanded(row);
                
                // Set the appropriate class based on the actual expanded state
                if (isExpanded) {
                    expandIcon.classList.add('open');
                } else {
                    expandIcon.classList.remove('open');
                }
            }
        });
    }, 50); // Small delay to ensure DOM is updated
}

// Helper function to check if a category/folder row is actually expanded
function checkIfExpanded(row) {
    // Get the indent level of this row
    const indentLevel = parseInt(row.getAttribute('data-indent') || '0');
    
    // Check the next row to see if it's a child and if it's visible
    let nextRow = row.nextElementSibling;
    if (!nextRow) return false;
    
    const nextIndentLevel = parseInt(nextRow.getAttribute('data-indent') || '0');
    
    // If the next row has a higher indent level and is visible, then this row is expanded
    return nextIndentLevel > indentLevel && nextRow.style.display !== 'none';
}

// Update the filter item counts in the sidebar
function updateFilterCounts() {
    const filterItems = document.querySelectorAll('.sidebar .filter-item');
    filterItems.forEach(item => {
        const filterName = item.getAttribute('data-filter');
        if (filterName && bookFilters.has(filterName)) {
            const count = filterName === 'all-books' ? books.size : bookFilters.get(filterName).length;
            const countElement = item.querySelector('.filter-count');
            if (countElement) {
                countElement.textContent = count;
            }
        }
    });
}

// Show modal for adding books to a filter
function showAddBooksToFilterModal(filterCategory) {
    // Prevent event propagation to avoid activating the filter
    event.stopPropagation();
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    // Get filter display name
    let filterDisplayName = '';
    const filterElement = document.querySelector(`.filter-item[data-filter="${filterCategory}"]`);
    if (filterElement) {
        filterDisplayName = filterElement.querySelector('.nav-title').textContent;
    }
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `
        <h3>Add Books to "${filterDisplayName}" Filter</h3>
        <button class="modal-close">✕</button>
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Get all books
    const allBooks = Array.from(books.values());
    // Get books already in this filter
    const filterBooks = bookFilters.get(filterCategory) || [];
    const filterBookIds = filterBooks.map(book => book.id);
    
    if (allBooks.length === 0) {
        modalContent.innerHTML = '<p>No books available to add.</p>';
    } else {
        // Create book list
        const booksList = document.createElement('div');
        booksList.className = 'filter-books-list';
        
        allBooks.forEach(book => {
            const isInFilter = filterBookIds.includes(book.id);
            
            const bookItem = document.createElement('div');
            bookItem.className = 'filter-book-item';
            bookItem.innerHTML = `
                <label class="book-checkbox">
                    <input type="checkbox" data-book-id="${book.id}" ${isInFilter ? 'checked' : ''}>
                    <span class="book-title">${book.name}</span>
                </label>
            `;
            
            booksList.appendChild(bookItem);
        });
        
        modalContent.appendChild(booksList);
    }
    
    // Create modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    
    const applyButton = document.createElement('button');
    applyButton.className = 'btn btn-primary';
    applyButton.textContent = 'Apply';
    applyButton.addEventListener('click', () => {
        // Get all checked books
        const checkedBooks = Array.from(modalContent.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.getAttribute('data-book-id'));
        
        // Clear current filter books
        bookFilters.set(filterCategory, []);
        
        // Add checked books to filter
        checkedBooks.forEach(bookId => {
            const book = books.get(bookId);
            if (book) {
                bookFilters.get(filterCategory).push(book);
            }
        });
        
        // Save filters to storage
        saveFiltersToStorage();
        
        // Update filter counts
        updateFilterCounts();
        
        // Update books sidebar if we're currently viewing this filter
        if (selectedFilterCategory === filterCategory) {
            updateBooksSidebarWithFilters();
        }
        
        // Close modal
        document.body.removeChild(modalOverlay);
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-outline';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(applyButton);
    
    // Assemble modal
    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalContent);
    modalContainer.appendChild(modalFooter);
    
    modalOverlay.appendChild(modalContainer);
    
    // Add close button event listener
    modalHeader.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    // Add modal to body
    document.body.appendChild(modalOverlay);
}

// Function to add a book to a filter category
function addBookToFilter(bookId, filterCategory) {
    if (!bookId || !filterCategory || !bookFilters.has(filterCategory)) return;
    
    const book = books.get(bookId);
    if (!book) return;
    
    // Add book to the filter if it's not already there
    const filterBooks = bookFilters.get(filterCategory);
    if (!filterBooks.some(b => b.id === bookId)) {
        filterBooks.push(book);
    }
    
    // Save filters to localStorage
    saveFiltersToStorage();
    
    // Update filter counts
    updateFilterCounts();
}

// Function to remove a book from a filter category
function removeBookFromFilter(bookId, filterCategory) {
    if (!bookId || !filterCategory || !bookFilters.has(filterCategory)) return;
    
    // Remove book from the filter
    const filterBooks = bookFilters.get(filterCategory);
    const index = filterBooks.findIndex(b => b.id === bookId);
    if (index !== -1) {
        filterBooks.splice(index, 1);
    }
    
    // Save filters to localStorage
    saveFiltersToStorage();
    
    // Update filter counts
    updateFilterCounts();
}

// Save filters to localStorage
function saveFiltersToStorage() {
    const filtersObject = {};
    bookFilters.forEach((books, filter) => {
        filtersObject[filter] = books.map(book => book.id);
    });
    
    localStorage.setItem('kb_filters', JSON.stringify(filtersObject));
}

// Load filters from localStorage
function loadFiltersFromStorage() {
    const savedFilters = localStorage.getItem('kb_filters');
    if (!savedFilters) return;
    
    try {
        const filtersObject = JSON.parse(savedFilters);
        
        // Initialize filters if needed
        if (!bookFilters.size) {
            initializeFilters();
        }
        
        // Populate filters from saved data
        Object.keys(filtersObject).forEach(filter => {
            if (bookFilters.has(filter)) {
                const bookIds = filtersObject[filter];
                const filterBooks = [];
                
                bookIds.forEach(bookId => {
                    const book = books.get(bookId);
                    if (book) {
                        filterBooks.push(book);
                    }
                });
                
                bookFilters.set(filter, filterBooks);
            }
        });
        
    } catch (error) {
        console.error('Error loading filters:', error);
        // Reset filters
        initializeFilters();
    }
}

// Create a new filter
function createNewFilter() {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.innerHTML = `
        <h3>Create New Filter</h3>
        <button class="modal-close">✕</button>
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Create filter name input
    const inputContainer = document.createElement('div');
    inputContainer.style.marginBottom = '20px';
    inputContainer.innerHTML = `
        <label style="display: block; margin-bottom: 8px; color: var(--text-color);">Filter Name</label>
        <input type="text" id="new-filter-name" placeholder="Enter filter name" style="width: 100%; padding: 10px; border-radius: var(--border-radius); background-color: var(--card-color); color: var(--text-color); border: 1px solid var(--border-color);">
        <div id="filter-name-error" style="color: #ff4444; font-size: 13px; margin-top: 5px; display: none;">A filter with this name already exists.</div>
    `;
    
    modalContent.appendChild(inputContainer);
    
    // Create filter icon selection (optional)
    const iconSelectionContainer = document.createElement('div');
    iconSelectionContainer.innerHTML = `
        <label style="display: block; margin-bottom: 8px; color: var(--text-color);">Choose an Icon (Optional)</label>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="icon-select-btn active" data-icon="filter" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 4px; border: 1px solid var(--border-color); background-color: transparent; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path>
                    <polyline points="8 10 12 14 16 10"></polyline>
                </svg>
            </button>
            <button class="icon-select-btn" data-icon="star" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 4px; border: 1px solid var(--border-color); background-color: transparent; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            </button>
            <button class="icon-select-btn" data-icon="tag" style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 4px; border: 1px solid var(--border-color); background-color: transparent; cursor: pointer;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
            </button>
        </div>
    `;
    
    modalContent.appendChild(iconSelectionContainer);
    
    // Create modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    
    const createButton = document.createElement('button');
    createButton.className = 'btn btn-primary';
    createButton.textContent = 'Create Filter';
    createButton.addEventListener('click', () => {
        const filterNameInput = document.getElementById('new-filter-name');
        const filterName = filterNameInput.value.trim();
        
        if (!filterName) {
            filterNameInput.style.borderColor = '#ff4444';
            return;
        }
        
        // Create a slugified version for the data-filter attribute
        const filterId = filterName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        // Check if this filter already exists
        if (bookFilters.has(filterId)) {
            document.getElementById('filter-name-error').style.display = 'block';
            filterNameInput.style.borderColor = '#ff4444';
            return;
        }
        
        // Get selected icon
        const selectedIconBtn = modalContent.querySelector('.icon-select-btn.active');
        const selectedIcon = selectedIconBtn ? selectedIconBtn.getAttribute('data-icon') : 'filter';
        
        // Add new filter to the Map
        bookFilters.set(filterId, []);
        
        // Save to localStorage
        saveFiltersToStorage();
        
        // Create filter UI element
        addFilterToSidebar(filterId, filterName, selectedIcon);
        
        // Close modal
        document.body.removeChild(modalOverlay);
    });
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-outline';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    modalFooter.appendChild(cancelButton);
    modalFooter.appendChild(createButton);
    
    // Assemble modal
    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalContent);
    modalContainer.appendChild(modalFooter);
    
    modalOverlay.appendChild(modalContainer);
    
    // Add event listeners
    
    // Close button
    modalHeader.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
    
    // Icon selection buttons
    const iconButtons = modalContent.querySelectorAll('.icon-select-btn');
    iconButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            iconButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
        });
    });
    
    // Input validation
    const filterNameInput = modalContent.querySelector('#new-filter-name');
    filterNameInput.addEventListener('input', () => {
        // Reset error state
        filterNameInput.style.borderColor = 'var(--border-color)';
        document.getElementById('filter-name-error').style.display = 'none';
    });
    
    // Add modal to body
    document.body.appendChild(modalOverlay);
    
    // Focus on input
    setTimeout(() => {
        filterNameInput.focus();
    }, 100);
}

// Add a filter to the sidebar UI
function addFilterToSidebar(filterId, filterName, iconType = 'filter') {
    const filtersList = document.querySelector('.sidebar .filter-item[data-action="create-filter"]');
    if (!filtersList) return;
    
    // Get the appropriate icon SVG based on iconType
    let iconSvg = '';
    
    switch(iconType) {
        case 'star':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>`;
            break;
        case 'tag':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
            </svg>`;
            break;
        default: // filter icon (default)
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 10px;">
                <path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path>
                <polyline points="8 10 12 14 16 10"></polyline>
            </svg>`;
    }
    
    const newFilter = document.createElement('div');
    newFilter.className = 'filter-item';
    newFilter.setAttribute('data-filter', filterId);
    newFilter.innerHTML = `
        <span class="add-to-filter" title="Add books to this filter">+</span>
        ${iconSvg}
        <span class="nav-title">${filterName}</span>
        <span class="filter-count" style="margin-left: auto;">0</span>
    `;
    
    // Add click event listener to filter
    newFilter.addEventListener('click', function(e) {
        // Check if the click was on the add button
        if (e.target.classList.contains('add-to-filter')) {
            return; // The add button has its own event listener
        }
        
        // Update active class
        document.querySelectorAll('.sidebar .filter-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        // Apply filter
        filterBooksByCategory(filterId);
    });
    
    // Add click event listener to the add button
    const addButton = newFilter.querySelector('.add-to-filter');
    if (addButton) {
        addButton.addEventListener('click', function(e) {
            showAddBooksToFilterModal(filterId);
        });
    }
    
    // Insert before the 'Create Filter' item
    filtersList.parentNode.insertBefore(newFilter, filtersList);
}

// Initialize the filtering system
function initializeFilterSystem() {
    // Initialize filters
    initializeFilters();
    
    // Load saved filters
    loadFiltersFromStorage();
    
    // Set up event listeners for filter items
    const filterItems = document.querySelectorAll('.sidebar .filter-item');
    filterItems.forEach(item => {
        // Skip the 'Create Filter' item
        if (item.getAttribute('data-action') === 'create-filter') {
            item.addEventListener('click', createNewFilter);
            return;
        }
        
        // Add click event listener to filter
        item.addEventListener('click', function(e) {
            // Check if the click was on the add button
            if (e.target.classList.contains('add-to-filter')) {
                return; // The add button has its own event listener
            }
            
            const filter = this.getAttribute('data-filter');
            
            // Update active class
            document.querySelectorAll('.sidebar .filter-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filter
            filterBooksByCategory(filter);
        });
        
        // Add click event listener to the add button
        const addButton = item.querySelector('.add-to-filter');
        if (addButton) {
            const filter = item.getAttribute('data-filter');
            addButton.addEventListener('click', function(e) {
                showAddBooksToFilterModal(filter);
            });
        }
    });
    
    // Load the saved selected filter if any
    const savedFilter = localStorage.getItem('selectedFilterCategory');
    if (savedFilter && bookFilters.has(savedFilter)) {
        selectedFilterCategory = savedFilter;
        
        // Update active class in UI
        const filterItem = document.querySelector(`.sidebar .filter-item[data-filter="${savedFilter}"]`);
        if (filterItem) {
            document.querySelectorAll('.sidebar .filter-item').forEach(i => i.classList.remove('active'));
            filterItem.classList.add('active');
        }
    }
    
    // Update filter counts
    updateFilterCounts();
    
    // Initialize correct expand icon states after a short delay to ensure DOM is ready
    setTimeout(() => {
        const categoryRows = document.querySelectorAll('.category-row, .folder-row');
        categoryRows.forEach(row => {
            const expandIcon = row.querySelector('.expand-icon');
            if (expandIcon) {
                // Check if the content is actually expanded
                const isExpanded = checkIfExpanded(row);
                
                // Set the appropriate class based on the actual expanded state
                if (isExpanded) {
                    expandIcon.classList.add('open');
                } else {
                    expandIcon.classList.remove('open');
                }
            }
        });
    }, 100);
}

// Override updateBooksSidebar to respect filters
function updateBooksSidebarWithFilters() {
    const booksList = document.querySelector('.books-list');
    if (!booksList) {
        console.error('Books list container not found!');
        return;
    }
    
    // Clear existing books
    booksList.innerHTML = '';
    
    try {
        // Get the books to display based on the selected filter
        let booksToShow = [];
        
        if (selectedFilterCategory === 'all-books') {
            // Show all books
            booksToShow = Array.from(books.values());
        } else if (bookFilters.has(selectedFilterCategory)) {
            // Show only books in the selected filter
            booksToShow = bookFilters.get(selectedFilterCategory);
        }
        
        // Add filtered books to the sidebar
        if (booksToShow.length > 0) {
            booksToShow.forEach(book => {
                // Skip if book or book.id is undefined
                if (!book || !book.id) {
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
                bookItem.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const bookId = this.getAttribute('data-book-id');
                    
                    if (bookId) {
                        // Update UI first
                        document.querySelectorAll('.book-item').forEach(b => b.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Call selectBook
                        selectBook(bookId);
                    }
                });
            });
        } else {
            booksList.innerHTML = '<div class="no-books" style="padding: 10px 20px; color: var(--text-secondary); font-size: 14px;">No books in this filter</div>';
        }
    } catch (error) {
        console.error('Error updating books sidebar:', error);
        booksList.innerHTML = '<div class="error-state" style="padding: 10px 20px; color: #ff4444; font-size: 14px;">Error loading books</div>';
    }
}
