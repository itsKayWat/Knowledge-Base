// Drag and Drop Filter Functionality

// Track the dragged book element
let draggedBook = null;

// Initialize drag and drop functionality
function initializeDragAndDrop() {
    // Make books draggable
    makeBooksDraggable();
    
    // Set up filter targets
    setupFilterDropTargets();
}

// Make book items draggable
function makeBooksDraggable() {
    const bookItems = document.querySelectorAll('.book-item');
    
    bookItems.forEach(book => {
        // Set draggable attribute
        book.setAttribute('draggable', 'true');
        
        // Add drag start event
        book.addEventListener('dragstart', handleDragStart);
        
        // Add drag end event
        book.addEventListener('dragend', handleDragEnd);
    });
}

// Set up filter items as drop targets
function setupFilterDropTargets() {
    const filterItems = document.querySelectorAll('.filter-item');
    
    filterItems.forEach(filter => {
        // Skip the 'All Books' filter as it contains all books by default
        if (filter.getAttribute('data-filter') === 'all-books') {
            return;
        }
        
        // Add drag over event
        filter.addEventListener('dragover', handleDragOver);
        
        // Add drag enter event
        filter.addEventListener('dragenter', handleDragEnter);
        
        // Add drag leave event
        filter.addEventListener('dragleave', handleDragLeave);
        
        // Add drop event
        filter.addEventListener('drop', handleDrop);
    });
}

// Handle drag start
function handleDragStart(e) {
    // Store reference to the dragged book
    draggedBook = this;
    
    // Add dragging class for visual feedback
    this.classList.add('dragging');
    
    // Set data to transfer (book ID)
    e.dataTransfer.setData('text/plain', this.getAttribute('data-book-id'));
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    
    // Set custom drag image if needed
    // const dragImage = document.createElement('div');
    // dragImage.textContent = this.querySelector('.book-title-small').textContent;
    // dragImage.style.cssText = 'position: absolute; top: -1000px; background: var(--card-color); padding: 10px; border-radius: 4px; color: var(--text-color);';
    // document.body.appendChild(dragImage);
    // e.dataTransfer.setDragImage(dragImage, 0, 0);
}

// Handle drag end
function handleDragEnd() {
    // Remove dragging class
    this.classList.remove('dragging');
    
    // Clear reference to dragged book
    draggedBook = null;
    
    // Remove drag-over class from all filters
    document.querySelectorAll('.filter-item').forEach(filter => {
        filter.classList.remove('drag-over');
    });
}

// Handle drag over
function handleDragOver(e) {
    // Prevent default to allow drop
    e.preventDefault();
    
    // Set drop effect
    e.dataTransfer.dropEffect = 'move';
}

// Handle drag enter
function handleDragEnter(e) {
    // Prevent default
    e.preventDefault();
    
    // Add drag-over class for visual feedback
    this.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave() {
    // Remove drag-over class
    this.classList.remove('drag-over');
}

// Handle drop
function handleDrop(e) {
    // Prevent default browser action
    e.preventDefault();
    
    // Remove drag-over class
    this.classList.remove('drag-over');
    
    // Get book ID from transfer data
    const bookId = e.dataTransfer.getData('text/plain');
    
    // Get filter category
    const filterCategory = this.getAttribute('data-filter');
    
    // If this is the all-books filter or not a valid filter, do nothing
    if (!filterCategory || filterCategory === 'all-books') {
        return;
    }
    
    // Add book to filter
    addBookToFilter(bookId, filterCategory);
    
    // Show success message
    showDropSuccessMessage(filterCategory);
}

// Show success message when a book is dropped onto a filter
function showDropSuccessMessage(filterCategory) {
    // Get filter display name
    let filterDisplayName = '';
    const filterElement = document.querySelector(`.filter-item[data-filter="${filterCategory}"]`);
    if (filterElement) {
        filterDisplayName = filterElement.querySelector('.nav-title').textContent;
    }
    
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        </div>
        <div class="toast-content">
            <div class="toast-title">Book added to filter</div>
            <div class="toast-message">Successfully added to "${filterDisplayName}" filter</div>
        </div>
    `;
    
    // Add toast to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove toast after delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add event listener to setup drag and drop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize drag and drop
    initializeDragAndDrop();
    
    // Re-initialize when books are updated
    // This is for when books are dynamically added to the DOM
    document.addEventListener('booksUpdated', () => {
        initializeDragAndDrop();
    });
});

// Re-initialize drag and drop when books are updated in the sidebar
function reinitializeDragDrop() {
    // Initialize drag and drop
    initializeDragAndDrop();
}

// Extend updateBooksSidebarWithFilters to trigger reinitializeDragDrop
const originalUpdateBooksSidebar = updateBooksSidebarWithFilters;
updateBooksSidebarWithFilters = function() {
    originalUpdateBooksSidebar.apply(this, arguments);
    
    // Reinitialize drag and drop
    setTimeout(reinitializeDragDrop, 100);
}; 