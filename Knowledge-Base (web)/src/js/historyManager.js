// History Manager - Handles undo/redo functionality
class HistoryManager {
    constructor() {
        this.history = []; // Stack of actions that can be undone
        this.redoStack = []; // Stack of undone actions that can be redone
        this.maxHistorySize = 50; // Limit the history size to prevent memory issues
        this.isPerformingUndoRedo = false; // Flag to prevent recursive undo/redo
        
        // Initialize UI elements
        this.undoBtn = document.getElementById('undo-btn');
        this.redoBtn = document.getElementById('redo-btn');
        
        // Add event listeners to buttons
        if (this.undoBtn) {
            this.undoBtn.addEventListener('click', () => this.undo());
        }
        
        if (this.redoBtn) {
            this.redoBtn.addEventListener('click', () => this.redo());
        }
        
        // Update button states initially
        this.updateButtonStates();
    }
    
    // Add an action to the history
    addToHistory(action) {
        // Don't record actions that happen during undo/redo
        if (this.isPerformingUndoRedo) return;
        
        // Add the action to history
        this.history.push(action);
        
        // Clear the redo stack when a new action is performed
        this.redoStack = [];
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift(); // Remove oldest entry
        }
        
        // Update button states
        this.updateButtonStates();
        
        // Show a small notification
        this.showActionNotification(action.description);
    }
    
    // Undo the most recent action
    undo() {
        if (this.history.length === 0) return;
        
        // Get the most recent action
        const action = this.history.pop();
        
        // Set flag to prevent recording the undo itself
        this.isPerformingUndoRedo = true;
        
        // Execute the undo function
        try {
            action.undo();
            
            // Add to redo stack
            this.redoStack.push(action);
            
            // Show toast notification
            this.showActionNotification(`Undid: ${action.description}`);
        } catch (error) {
            console.error('Error during undo:', error);
            this.showActionNotification('Failed to undo action', 'error');
        } finally {
            // Reset flag
            this.isPerformingUndoRedo = false;
        }
        
        // Update button states
        this.updateButtonStates();
    }
    
    // Redo a previously undone action
    redo() {
        if (this.redoStack.length === 0) return;
        
        // Get the most recent undone action
        const action = this.redoStack.pop();
        
        // Set flag to prevent recording the redo itself
        this.isPerformingUndoRedo = true;
        
        // Execute the redo function
        try {
            action.redo();
            
            // Add back to history
            this.history.push(action);
            
            // Show toast notification
            this.showActionNotification(`Redid: ${action.description}`);
        } catch (error) {
            console.error('Error during redo:', error);
            this.showActionNotification('Failed to redo action', 'error');
        } finally {
            // Reset flag
            this.isPerformingUndoRedo = false;
        }
        
        // Update button states
        this.updateButtonStates();
    }
    
    // Update the enabled/disabled state of the undo/redo buttons
    updateButtonStates() {
        if (this.undoBtn) {
            this.undoBtn.disabled = this.history.length === 0;
        }
        
        if (this.redoBtn) {
            this.redoBtn.disabled = this.redoStack.length === 0;
        }
    }
    
    // Clear all history (e.g., when switching books)
    clearHistory() {
        this.history = [];
        this.redoStack = [];
        this.updateButtonStates();
    }
    
    // Show a small notification for the action
    showActionNotification(message, type = 'info') {
        // Use the existing toast notification system if available
        if (typeof showToast === 'function') {
            showToast('History Action', message, type);
        } else {
            console.log(`History action: ${message}`);
        }
    }
    
    // Create action objects for common operations
    
    // Create action for moving an item
    createMoveAction(itemId, oldParentId, newParentId, description) {
        return {
            description: description || `Moved item ${itemId}`,
            undo: () => {
                // Get item from current book categories
                if (!bookCategories.has(selectedBookId)) return;
                const categoryMap = bookCategories.get(selectedBookId);
                const item = categoryMap.get(itemId);
                
                if (item) {
                    // Restore old parent
                    item.parentId = oldParentId;
                    saveData();
                    refreshContentTable();
                }
            },
            redo: () => {
                // Get item from current book categories
                if (!bookCategories.has(selectedBookId)) return;
                const categoryMap = bookCategories.get(selectedBookId);
                const item = categoryMap.get(itemId);
                
                if (item) {
                    // Set new parent
                    item.parentId = newParentId;
                    saveData();
                    refreshContentTable();
                }
            }
        };
    }
    
    // Create action for creating an item
    createAddItemAction(itemId, itemType, description) {
        // Store a copy of the original item
        let itemCopy = null;
        
        if (bookCategories.has(selectedBookId)) {
            const categoryMap = bookCategories.get(selectedBookId);
            const item = categoryMap.get(itemId);
            if (item) {
                itemCopy = JSON.parse(JSON.stringify(item));
            }
        }
        
        return {
            description: description || `Created new ${itemType}`,
            undo: () => {
                // Remove the item
                if (!bookCategories.has(selectedBookId)) return;
                const categoryMap = bookCategories.get(selectedBookId);
                categoryMap.delete(itemId);
                saveData();
                refreshContentTable();
            },
            redo: () => {
                // Restore the item
                if (!itemCopy || !bookCategories.has(selectedBookId)) return;
                const categoryMap = bookCategories.get(selectedBookId);
                categoryMap.set(itemId, itemCopy);
                saveData();
                refreshContentTable();
            }
        };
    }
    
    // Create action for deleting an item
    createDeleteItemAction(itemId, itemType, description) {
        // Store a copy of the original item before deletion
        let itemCopy = null;
        
        if (bookCategories.has(selectedBookId)) {
            const categoryMap = bookCategories.get(selectedBookId);
            const item = categoryMap.get(itemId);
            if (item) {
                itemCopy = JSON.parse(JSON.stringify(item));
            }
        }
        
        return {
            description: description || `Deleted ${itemType}`,
            undo: () => {
                // Restore the deleted item
                if (!itemCopy || !bookCategories.has(selectedBookId)) return;
                const categoryMap = bookCategories.get(selectedBookId);
                categoryMap.set(itemId, itemCopy);
                saveData();
                refreshContentTable();
            },
            redo: () => {
                // Delete the item again
                if (!bookCategories.has(selectedBookId)) return;
                const categoryMap = bookCategories.get(selectedBookId);
                categoryMap.delete(itemId);
                saveData();
                refreshContentTable();
            }
        };
    }
    
    // Create action for renaming an item
    createRenameAction(itemId, oldName, newName, description) {
        return {
            description: description || `Renamed item to ${newName}`,
            undo: () => {
                // Restore old name
                if (!bookCategories.has(selectedBookId)) return;
                const categoryMap = bookCategories.get(selectedBookId);
                const item = categoryMap.get(itemId);
                
                if (item) {
                    item.name = oldName;
                    saveData();
                    refreshContentTable();
                }
            },
            redo: () => {
                // Set new name
                if (!bookCategories.has(selectedBookId)) return;
                const categoryMap = bookCategories.get(selectedBookId);
                const item = categoryMap.get(itemId);
                
                if (item) {
                    item.name = newName;
                    saveData();
                    refreshContentTable();
                }
            }
        };
    }
    
    // Create action for adding a filter
    createAddFilterAction(filterId, description) {
        return {
            description: description || `Created new filter`,
            undo: () => {
                // Remove the filter
                if (bookFilters.has(filterId)) {
                    bookFilters.delete(filterId);
                    
                    // Also remove from UI
                    const filterElement = document.querySelector(`.filter-item[data-filter="${filterId}"]`);
                    if (filterElement) {
                        filterElement.remove();
                    }
                    
                    // Save changes
                    saveFiltersToStorage();
                }
            },
            redo: () => {
                // We can't easily restore the filter without knowing its name
                // This would typically be handled by the original code that created the filter
                showToast('History Action', 'Please create the filter again', 'info');
            }
        };
    }
}

// Create global history manager instance
const historyManager = new HistoryManager();

// Hook into existing functions to track actions

// Original functions to override for tracking
const originalMoveItemInHierarchy = window.moveItemInHierarchy;
const originalDeleteItem = window.deleteItem;

// Override functions to track history
if (typeof moveItemInHierarchy === 'function') {
    window.moveItemInHierarchy = function(itemId, targetId, position, itemType, targetType) {
        // Get the original parent before the move
        let originalParentId = null;
        
        if (bookCategories.has(selectedBookId)) {
            const categoryMap = bookCategories.get(selectedBookId);
            const item = categoryMap.get(itemId);
            if (item) {
                originalParentId = item.parentId;
            }
        }
        
        // Call the original function
        originalMoveItemInHierarchy(itemId, targetId, position, itemType, targetType);
        
        // Get the new parent after the move
        let newParentId = null;
        
        if (bookCategories.has(selectedBookId)) {
            const categoryMap = bookCategories.get(selectedBookId);
            const item = categoryMap.get(itemId);
            if (item) {
                newParentId = item.parentId;
            }
        }
        
        // Create a description based on the operation
        let description = '';
        
        if (position === 'inside') {
            description = `Moved ${itemType} inside ${targetType}`;
        } else if (position === 'before') {
            description = `Moved ${itemType} before ${targetType}`;
        } else if (position === 'after') {
            description = `Moved ${itemType} after ${targetType}`;
        } else {
            description = `Moved ${itemType}`;
        }
        
        // Add to history
        historyManager.addToHistory(
            historyManager.createMoveAction(itemId, originalParentId, newParentId, description)
        );
    };
}

// Document initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('History Manager initialized');
    
    // Detect keyboard shortcuts for undo/redo
    document.addEventListener('keydown', (e) => {
        // Check if Ctrl/Cmd + Z (Undo)
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            historyManager.undo();
        }
        
        // Check if Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y (Redo)
        if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
            e.preventDefault();
            historyManager.redo();
        }
    });
}); 