// Tree Drag and Drop Functionality
// Allows users to drag and drop folders, articles, and files to reorder or move between categories

// Variables to store drag state
let draggedItem = null;
let draggedItemType = null;
let dragStartY = 0;
let dropTarget = null;
let dropPosition = null; // 'before', 'after', or 'inside'

// Initialize drag and drop functionality for tree items
function initializeTreeDragDrop() {
    setupDragHandles();
}

// Set up drag handles for all appropriate tree items
function setupDragHandles() {
    // Target all category, folder, article, and file rows
    const treeItems = document.querySelectorAll('.category-row, .folder-row, .article-row, .file-row');
    
    treeItems.forEach(item => {
        // Check if a drag handle already exists to avoid duplicates
        if (!item.querySelector('.drag-handle')) {
            // Add drag handle
            const treeItemContent = item.querySelector('.tree-item');
            
            if (treeItemContent) {
                // Create the drag handle element
                const dragHandle = document.createElement('div');
                dragHandle.className = 'drag-handle';
                dragHandle.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                `;
                
                // Insert the drag handle at the beginning of the tree item
                treeItemContent.insertBefore(dragHandle, treeItemContent.firstChild);
                
                // Make the row draggable
                item.setAttribute('draggable', 'true');
                
                // Add drag event listeners
                item.addEventListener('dragstart', handleTreeDragStart);
                item.addEventListener('dragend', handleTreeDragEnd);
            }
        }
    });
    
    // Set up drop zones (all tree items can be drop targets)
    setupTreeDropTargets();
}

// Set up drop targets
function setupTreeDropTargets() {
    const treeItems = document.querySelectorAll('.category-row, .folder-row, .article-row, .file-row');
    
    treeItems.forEach(item => {
        item.addEventListener('dragover', handleTreeDragOver);
        item.addEventListener('dragenter', handleTreeDragEnter);
        item.addEventListener('dragleave', handleTreeDragLeave);
        item.addEventListener('drop', handleTreeDrop);
    });
    
    // Also set the tbody as a drop target for empty areas
    const tableBody = document.querySelector('.content-table tbody');
    if (tableBody) {
        tableBody.addEventListener('dragover', handleTableBodyDragOver);
        tableBody.addEventListener('drop', handleTableBodyDrop);
    }
}

// Handle drag start for tree items
function handleTreeDragStart(e) {
    // Store the dragged item
    draggedItem = this;
    draggedItemType = this.getAttribute('data-type');
    dragStartY = e.clientY;
    
    // Set data transfer information
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class for visual feedback
    this.classList.add('dragging');
    
    // Show drag feedback UI
    showDragFeedback(draggedItemType);
}

// Handle drag end
function handleTreeDragEnd() {
    // Remove dragging class
    this.classList.remove('dragging');
    
    // Remove any drop indicators
    removeDropIndicators();
    
    // Hide drag feedback
    hideDragFeedback();
    
    // Clear dragged item reference
    draggedItem = null;
    draggedItemType = null;
    dropTarget = null;
}

// Handle drag over
function handleTreeDragOver(e) {
    if (!draggedItem) return;
    
    // Prevent default to allow drop
    e.preventDefault();
    
    // Determine drop position (before, after, or inside)
    const rect = this.getBoundingClientRect();
    const y = e.clientY;
    
    // Calculate position relative to item height
    const relativeY = (y - rect.top) / rect.height;
    
    removeDropIndicators();
    
    if (this !== draggedItem) {
        dropTarget = this;
        
        // Handle drop position based on item types
        const targetType = this.getAttribute('data-type');
        const targetName = this.querySelector(`.${targetType}-name`)?.textContent || targetType;
        
        // Special case for categories
        if (targetType === 'category') {
            if (draggedItemType === 'category') {
                // Categories can only be placed before/after other categories
                if (relativeY < 0.5) {
                    dropPosition = 'before';
                    this.classList.add('drop-before');
                    updateDragFeedback(`Place above ${targetName}`);
                } else {
                    dropPosition = 'after';
                    this.classList.add('drop-after');
                    updateDragFeedback(`Place below ${targetName}`);
                }
            } else {
                // Non-categories can be placed before, inside, or after categories
                if (relativeY < 0.25) {
                    dropPosition = 'before';
                    this.classList.add('drop-before');
                    updateDragFeedback(`Place above ${targetName}`);
                } else if (relativeY > 0.75) {
                    dropPosition = 'after';
                    this.classList.add('drop-after');
                    updateDragFeedback(`Place below ${targetName}`);
                } else {
                    // The default for categories - drop inside
                    dropPosition = 'inside';
                    this.classList.add('drop-inside');
                    updateDragFeedback(`Place inside ${targetName}`);
                }
            }
        }
        // Special case for folders
        else if (targetType === 'folder') {
            if (relativeY < 0.25) {
                dropPosition = 'before';
                this.classList.add('drop-before');
                updateDragFeedback(`Place above ${targetName}`);
            } else if (relativeY > 0.75) {
                dropPosition = 'after';
                this.classList.add('drop-after');
                updateDragFeedback(`Place below ${targetName}`);
            } else {
                // Default for folders - drop inside
                dropPosition = 'inside';
                this.classList.add('drop-inside');
                updateDragFeedback(`Place inside ${targetName}`);
            }
        }
        // For articles and files, only before/after
        else {
            if (relativeY < 0.5) {
                dropPosition = 'before';
                this.classList.add('drop-before');
                updateDragFeedback(`Place above ${targetName}`);
            } else {
                dropPosition = 'after';
                this.classList.add('drop-after');
                updateDragFeedback(`Place below ${targetName}`);
            }
        }
    }
    
    e.dataTransfer.dropEffect = 'move';
}

// Handle drag enter
function handleTreeDragEnter(e) {
    // Prevent default
    e.preventDefault();
}

// Handle drag leave
function handleTreeDragLeave() {
    // Only remove if this is the current drop target
    if (this === dropTarget) {
        removeDropIndicators();
        dropTarget = null;
    }
}

// Handle drop
function handleTreeDrop(e) {
    // Prevent default browser action
    e.preventDefault();
    
    // Remove drop indicators
    removeDropIndicators();
    
    if (!draggedItem || !dropTarget || draggedItem === dropTarget) return;
    
    // Get IDs
    const itemId = draggedItem.getAttribute('data-id');
    const targetId = dropTarget.getAttribute('data-id');
    const itemType = draggedItem.getAttribute('data-type');
    const targetType = dropTarget.getAttribute('data-type');
    
    // Get the original parent ID before the move (for history tracking)
    let originalParentId = null;
    if (bookCategories.has(selectedBookId)) {
        const categoryMap = bookCategories.get(selectedBookId);
        const item = categoryMap.get(itemId);
        if (item) {
            originalParentId = item.parentId;
        }
    }
    
    // Move the item in the data structure
    moveItemInHierarchy(itemId, targetId, dropPosition, itemType, targetType);

    // Auto-expand the target if dropped inside a folder or category
    if (dropPosition === 'inside' && (targetType === 'folder' || targetType === 'category')) {
        const categoryMap = bookCategories.get(selectedBookId);
        const target = categoryMap.get(targetId);
        if (target) {
            target.autoExpand = true;
        }
    }
    
    // Get the new parent ID after the move (for history tracking)
    let newParentId = null;
    if (bookCategories.has(selectedBookId)) {
        const categoryMap = bookCategories.get(selectedBookId);
        const item = categoryMap.get(itemId);
        if (item) {
            newParentId = item.parentId;
        }
    }
    
    // Refresh the content table to show the new order
    refreshContentTable();
    
    // Show success message with clearer descriptions
    let actionText = "";
    let targetText = targetType;
    
    if (dropPosition === 'inside') {
        actionText = `moved into ${targetType}`;
    } else if (dropPosition === 'before') {
        actionText = `moved above ${targetType}`;
    } else if (dropPosition === 'after') {
        actionText = `moved below ${targetType}`;
    }
    
    showToast('Item moved', `${capitalizeFirstLetter(itemType)} ${actionText}`, 'success');
    
    // Add to history if history manager exists
    if (window.historyManager) {
        const description = `${capitalizeFirstLetter(itemType)} ${actionText}`;
        window.historyManager.addToHistory(
            window.historyManager.createMoveAction(itemId, originalParentId, newParentId, description)
        );
    }
}

// Handle drag over on the table body (for dropping at the end)
function handleTableBodyDragOver(e) {
    if (!draggedItem) return;
    
    // If we're hovering over an empty area and not a tree item
    if (e.target === this || e.target.tagName !== 'TR') {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // Remove any existing indicators
        removeDropIndicators();
        
        // Add drop indicator to the bottom of the list
        this.classList.add('drop-at-end');
        dropTarget = null;
        dropPosition = 'end';
    }
}

// Handle drop on the table body
function handleTableBodyDrop(e) {
    if (e.target === this || e.target.tagName !== 'TR') {
        e.preventDefault();
        
        // Remove drop indicators
        removeDropIndicators();
        
        if (!draggedItem) return;
        
        // Get ID of the dragged item
        const itemId = draggedItem.getAttribute('data-id');
        const itemType = draggedItem.getAttribute('data-type');
        
        // Move the item to the end of the list
        moveItemToEnd(itemId, itemType);
        
        // Refresh the content table
        refreshContentTable();
        
        // Show success message
        showToast('Item moved', `${capitalizeFirstLetter(itemType)} moved to the end`, 'success');
    }
}

// Remove all drop indicators
function removeDropIndicators() {
    document.querySelectorAll('.drop-before, .drop-after, .drop-inside, .drop-at-end').forEach(el => {
        el.classList.remove('drop-before', 'drop-after', 'drop-inside', 'drop-at-end');
    });
}

// Move item in the hierarchy
function moveItemInHierarchy(itemId, targetId, position, itemType, targetType) {
    // Get current book's category map
    if (!bookCategories.has(selectedBookId)) return;
    
    const categoryMap = bookCategories.get(selectedBookId);
    
    // Get the item and target
    const item = categoryMap.get(itemId);
    const target = categoryMap.get(targetId);
    
    if (!item || !target) return;
    
    // Always move inside if dropping on a folder or category
    if (targetType === 'folder' || targetType === 'category') {
        item.parentId = targetId;
    } else if (position === 'before' || position === 'after') {
        // For before/after, use the parent's parent (same level as target)
        item.parentId = target.parentId;
    }

    // DEBUG: Log the moved item and its parentId
    console.log('[DEBUG] Moved item:', item);
    console.log('[DEBUG] New parentId:', item.parentId, 'Target:', targetId, 'TargetType:', targetType, 'Position:', position);
    
    // Save changes
    saveData();
}

// Move item to the end of the list
function moveItemToEnd(itemId, itemType) {
    // Get current book's category map
    if (!bookCategories.has(selectedBookId)) return;
    
    const categoryMap = bookCategories.get(selectedBookId);
    
    // Get the item
    const item = categoryMap.get(itemId);
    
    if (!item) return;
    
    // For now, just make it a top-level item
    if (itemType !== 'category') {
        // Find the last category
        const categories = Array.from(categoryMap.values()).filter(item => item.type === 'category');
        if (categories.length > 0) {
            item.parentId = categories[categories.length - 1].id;
        } else {
            item.parentId = null;
        }
    } else {
        // For categories, we just leave it at the top level
        item.parentId = null;
    }
    
    // Save changes
    saveData();
}

// Refresh the content table after drag and drop
function refreshContentTable() {
    // Call the existing function to refresh the table
    showMyBooksPage();
}

// Show toast notification for drag and drop actions
function showToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Set the toast content
    toast.innerHTML = `
        <div class="toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${type === 'success' 
                    ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
                    : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'}
            </svg>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    // Add the show class to make the toast visible
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Remove the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTreeDragDrop();
});

// Re-initialize after content table is updated
function reinitializeTreeDragDrop() {
    setTimeout(initializeTreeDragDrop, 100);
}

// Hook into existing function to reinitialize drag and drop
document.addEventListener('contentTableUpdated', reinitializeTreeDragDrop);

// Show drag feedback UI
function showDragFeedback(itemType) {
    // Create or get existing feedback element
    let feedback = document.querySelector('.drag-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'drag-feedback';
        document.body.appendChild(feedback);
    }
    
    // Set feedback content
    feedback.innerHTML = `
        <div class="drag-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 2v6h6"></path>
                <path d="M9 15h6"></path>
                <path d="M9 11h6"></path>
            </svg>
        </div>
        <div class="drag-content">
            <div class="drag-title">Dragging ${capitalizeFirstLetter(itemType)}</div>
            <div class="drag-message">Drag to reorder or move between categories</div>
        </div>
    `;
    
    // Show the feedback
    setTimeout(() => {
        feedback.classList.add('show');
    }, 10);
}

// Hide drag feedback UI
function hideDragFeedback() {
    const feedback = document.querySelector('.drag-feedback');
    if (feedback) {
        feedback.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(feedback)) {
                document.body.removeChild(feedback);
            }
        }, 300);
    }
}

// Update drag feedback message
function updateDragFeedback(message) {
    const feedback = document.querySelector('.drag-feedback');
    if (feedback) {
        const messageElement = feedback.querySelector('.drag-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
} 