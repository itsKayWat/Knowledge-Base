// Verification script moved from inline to external file to comply with CSP
document.addEventListener('DOMContentLoaded', function() {
    console.log("Verification script running!");
    
    // Check if main.js functions are available
    if (typeof init === 'undefined') {
        console.error("CRITICAL ERROR: main.js is not loaded properly! The init function is missing.");
        alert("Error: The JavaScript file (main.js) could not be loaded. Please check the console for details.");
    }
    
    // Check for books in the sidebar
    setTimeout(function() {
        const booksList = document.querySelector('.books-list');
        if (booksList && booksList.childNodes.length === 0) {
            console.warn("No books found in the sidebar after 2 seconds.");
        }
    }, 2000);
}); 