// Listen for installation
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === 'install') {
        // When the extension is first installed
        console.log('Knowledge Base Extension installed.');
        
        // Open the Knowledge Base on install
        chrome.tabs.create({
            url: chrome.runtime.getURL('src/index.html')
        });
    }
});

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
    // Open the index.html file in a new tab
    chrome.tabs.create({
        url: chrome.runtime.getURL('src/index.html')
    });
});

// Listen for messages from the main page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);
    
    switch (request.action) {
        case 'saveBook':
            chrome.storage.local.get(['books'], (result) => {
                const books = result.books || [];
                books.push(request.book);
                chrome.storage.local.set({ books }, () => {
                    sendResponse({ success: true });
                });
            });
            break;

        case 'saveCategory':
            chrome.storage.local.get(['categories'], (result) => {
                let categories;
                try {
                    categories = JSON.parse(result.categories || '[]');
                } catch (e) {
                    categories = [];
                }
                
                const bookCategories = new Map(categories);
                
                if (!bookCategories.has(request.bookId)) {
                    bookCategories.set(request.bookId, []);
                }
                
                bookCategories.get(request.bookId).push(request.category);
                
                chrome.storage.local.set({
                    categories: JSON.stringify(Array.from(bookCategories.entries()))
                }, () => {
                    sendResponse({ success: true });
                });
            });
            break;
            
        case 'getBooks':
            chrome.storage.local.get(['books'], (result) => {
                sendResponse({ books: result.books || [] });
            });
            break;
            
        case 'getCategories':
            chrome.storage.local.get(['categories'], (result) => {
                sendResponse({ categories: result.categories || '[]' });
            });
            break;
    }
    
    // Return true to indicate we'll respond asynchronously
    return true;
}); 