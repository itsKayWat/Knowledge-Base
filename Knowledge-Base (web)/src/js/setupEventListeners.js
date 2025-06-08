// Event listener setup functions for Knowledge Base application

// Set up event listeners for the tree view
function setupTreeEventListeners() {
    console.log("Setting up tree event listeners");
    
    // Delegate to the drag & drop initialization if available
    if (typeof initializeTreeDragDrop === 'function') {
        initializeTreeDragDrop();
    } else {
        console.warn('Tree drag and drop initialization function not found');
    }
    
    // Set up event delegation for expand/collapse
    setupExpandCollapseListeners();
    
    // Listen for content table updates to re-attach listeners
    document.removeEventListener('contentTableUpdated', onContentTableUpdated);
    document.addEventListener('contentTableUpdated', onContentTableUpdated);
    
    console.log("Tree event listeners initialized and listening for content updates");
}

// Function to handle content table updates
function onContentTableUpdated() {
    console.log("Content table updated, refreshing tree event listeners");
    setupExpandCollapseListeners();
}

// Setup the expand/collapse functionality with event delegation
function setupExpandCollapseListeners() {
    // Use event delegation for expand/collapse
    // Attach the event listener to the content container which is always in the DOM
    const contentContainer = document.querySelector('.main-content');
    
    if (!contentContainer) {
        console.warn("Main content container not found, cannot set up expand/collapse listeners");
        return;
    }
    
    // Remove existing event listener to prevent duplicates
    contentContainer.removeEventListener('click', handleExpandCollapseClick);
    
    // Add new event listener with delegation pattern
    contentContainer.addEventListener('click', handleExpandCollapseClick);
    
    // Ensure expand icons have proper initial state
    const expandIcons = document.querySelectorAll('.expand-icon');
    expandIcons.forEach(icon => {
        const row = icon.closest('.category-row, .folder-row');
        if (row && row.getAttribute('data-has-children') === 'true') {
            // Make sure icon is visible
            icon.style.visibility = 'visible';
            
            // Check if we should auto-expand
            if (row.getAttribute('data-indent') === '0') {
                icon.classList.add('open');
                
                // Make children visible
                const indentLevel = parseInt(row.getAttribute('data-indent') || '0');
                let next = row.nextElementSibling;
                
                while (next) {
                    const nextIndent = parseInt(next.getAttribute('data-indent') || '0');
                    if (nextIndent <= indentLevel) break;
                    
                    next.style.display = '';
                    next = next.nextElementSibling;
                }
            }
        }
    });
    
    console.log("Expand/collapse handlers attached to main content container");
}

// Handler function for expand/collapse clicks using event delegation
function handleExpandCollapseClick(e) {
    console.log("Click event on content container:", e.target);
    
    // Find the closest expand icon if that's what was clicked
    const expandIcon = e.target.closest('.expand-icon');
    
    if (!expandIcon) {
        // Click wasn't on an expand icon, ignore it
        return;
    }
    
    console.log("Expand/collapse icon clicked:", expandIcon);
    
    // Find the parent row
    const row = expandIcon.closest('.category-row, .folder-row');
    
    if (!row) {
        // Not a valid row
        console.warn("Could not find parent row for expand icon");
        return;
    }
    
    console.log("Parent row found:", row);
    
    // Toggle the 'open' class
    expandIcon.classList.toggle('open');
    
    // Get the indent level of this row
    const indentLevel = parseInt(row.getAttribute('data-indent') || '0');
    
    // Get all rows after this one
    let nextRow = row.nextElementSibling;
    const isExpanded = expandIcon.classList.contains('open');
    
    console.log(`${isExpanded ? 'Expanding' : 'Collapsing'} item at indent level ${indentLevel}`);
    
    // Toggle visibility of child rows
    while (nextRow) {
        // Get the indent level of the next row
        const nextIndentLevel = parseInt(nextRow.getAttribute('data-indent') || '0');
        
        // If the next row has a higher indent level, it's a child
        if (nextIndentLevel > indentLevel) {
            // Toggle visibility
            nextRow.style.display = isExpanded ? '' : 'none';
            console.log(`Set row display to ${isExpanded ? 'visible' : 'none'}:`, nextRow);
        } else {
            // If we've reached a row with the same or lower indent level, we're done
            break;
        }
        
        // Move to the next row
        nextRow = nextRow.nextElementSibling;
    }
    
    // Stop event propagation
    e.stopPropagation();
}

// Set up navigation event listeners
function setupNavEventListeners() {
    console.log("Setting up navigation event listeners");
    
    // Navigation tabs (All, Published, Draft)
    const navTabs = document.querySelectorAll('.topbar-nav .topbar-icon');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active state
            navTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Get filter type from data attribute
            const filterType = this.getAttribute('data-filter');
            
            // Apply filter if the function exists
            if (typeof filterByType === 'function') {
                filterByType(filterType);
            }
        });
    });
    
    // Search input
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Apply search filter if the function exists
            if (typeof filterContent === 'function') {
                filterContent(this.value);
            }
        });
    });
}

// Set up sidebar-specific event listeners
function setupSidebarEventListeners() {
    console.log("Setting up sidebar event listeners");
    
    // Books list event listeners
    const bookItems = document.querySelectorAll('.book-item');
    bookItems.forEach(book => {
        book.addEventListener('click', function() {
            const bookId = this.getAttribute('data-book-id');
            
            // Update UI
            document.querySelectorAll('.book-item').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Select book if function exists
            if (typeof selectBook === 'function' && bookId) {
                selectBook(bookId);
            }
        });
    });
    
    // Hamburger menu toggle for sidebar collapse
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            const appContainer = document.querySelector('.app-container');
            
            if (sidebar && appContainer) {
                sidebar.classList.toggle('collapsed');
                appContainer.classList.toggle('sidebar-collapsed');
            }
        });
    }
} 