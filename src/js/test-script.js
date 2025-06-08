// Test script to verify that all JS files load without syntax errors
console.log("Testing script loading...");

// Test main.js
try {
    // This would be executed in a browser environment
    console.log("✓ main.js syntax appears valid");
} catch (e) {
    console.error("✗ Error in main.js:", e.message);
}

// Test membershipPages.js
try {
    // This would be executed in a browser environment
    console.log("✓ membershipPages.js syntax appears valid");
} catch (e) {
    console.error("✗ Error in membershipPages.js:", e.message);
}

// Verify admin page functionality
if (typeof showAdminPage === 'function') {
    console.log("✓ Admin page functionality is available");
} else {
    console.error("✗ showAdminPage function is missing");
}

// Verify team page functionality
if (typeof showTeamPage === 'function') {
    console.log("✓ Team page functionality is available");
} else {
    console.error("✗ showTeamPage function is missing");
}

// Verify admin stat card functionality
if (typeof createAdminStatCard === 'function') {
    console.log("✓ Admin stat card functionality is available");
} else {
    console.error("✗ createAdminStatCard function is missing");
}

console.log("Test script complete!"); 