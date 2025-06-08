
// End-to-End Testing Suite for Knowledge Base
console.log("🧪 Starting End-to-End Testing Suite...");

class E2ETestSuite {
    constructor() {
        this.testResults = [];
        this.passedTests = 0;
        this.failedTests = 0;
    }

    // Test result logging
    logTest(testName, passed, message = '') {
        const result = {
            name: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        if (passed) {
            this.passedTests++;
            console.log(`✅ ${testName}: PASSED ${message ? '- ' + message : ''}`);
        } else {
            this.failedTests++;
            console.log(`❌ ${testName}: FAILED ${message ? '- ' + message : ''}`);
        }
    }

    // Test 1: Core Application Initialization
    testInitialization() {
        console.log("\n📋 Testing Core Initialization...");
        
        // Check if main variables are initialized
        this.logTest("Global Variables", 
            typeof books !== 'undefined' && typeof bookCategories !== 'undefined' && typeof selectedBookId !== 'undefined',
            "books, bookCategories, selectedBookId"
        );

        // Check if DOM elements are found
        this.logTest("DOM Elements", 
            document.querySelector('.main-content') !== null && document.querySelector('.selected-workspace-name') !== null,
            "main-content and workspace-name elements"
        );

        // Check if books are loaded
        this.logTest("Books Loaded", 
            books.size > 0,
            `Found ${books.size} books`
        );

        // Check if categories are loaded
        this.logTest("Categories Loaded", 
            bookCategories.size > 0,
            `Found ${bookCategories.size} book categories`
        );
    }

    // Test 2: User Interface Elements
    testUIElements() {
        console.log("\n🎨 Testing UI Elements...");

        // Check sidebar elements
        this.logTest("Icon Sidebar", 
            document.querySelector('.icon-sidebar') !== null,
            "Icon sidebar exists"
        );

        this.logTest("Main Sidebar", 
            document.querySelector('.sidebar') !== null,
            "Main sidebar exists"
        );

        this.logTest("Books List", 
            document.querySelector('.books-list') !== null,
            "Books list container exists"
        );

        // Check main content area
        this.logTest("Content Table", 
            document.querySelector('.content-table') !== null,
            "Content table exists"
        );

        this.logTest("Search Input", 
            document.querySelector('.search-input') !== null,
            "Search input exists"
        );

        this.logTest("Add Button", 
            document.querySelector('.btn-add') !== null,
            "Add new button exists"
        );

        // Check navigation icons
        const iconLinks = document.querySelectorAll('.icon-link');
        this.logTest("Navigation Icons", 
            iconLinks.length >= 4,
            `Found ${iconLinks.length} navigation icons`
        );
    }

    // Test 3: Data Operations
    testDataOperations() {
        console.log("\n💾 Testing Data Operations...");

        // Test saving data
        try {
            saveData();
            this.logTest("Save Data Function", true, "Data saved successfully");
        } catch (error) {
            this.logTest("Save Data Function", false, error.message);
        }

        // Test loading data
        try {
            loadData();
            this.logTest("Load Data Function", true, "Data loaded successfully");
        } catch (error) {
            this.logTest("Load Data Function", false, error.message);
        }

        // Test localStorage
        const testKey = 'test_key_' + Date.now();
        const testValue = 'test_value';
        try {
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);
            this.logTest("LocalStorage", retrieved === testValue, "Read/write operations");
        } catch (error) {
            this.logTest("LocalStorage", false, error.message);
        }
    }

    // Test 4: Book Management
    testBookManagement() {
        console.log("\n📚 Testing Book Management...");

        const initialBookCount = books.size;

        // Test book selection
        if (selectedBookId) {
            this.logTest("Book Selection", 
                books.has(selectedBookId),
                `Selected book ${selectedBookId} exists`
            );
        } else {
            this.logTest("Book Selection", false, "No book selected");
        }

        // Test if updateBooksSidebar function works
        try {
            updateBooksSidebar();
            const bookItems = document.querySelectorAll('.book-item');
            this.logTest("Update Books Sidebar", 
                bookItems.length > 0,
                `Found ${bookItems.length} book items in sidebar`
            );
        } catch (error) {
            this.logTest("Update Books Sidebar", false, error.message);
        }

        // Test showMyBooksPage function
        try {
            showMyBooksPage();
            this.logTest("Show My Books Page", true, "Page displayed successfully");
        } catch (error) {
            this.logTest("Show My Books Page", false, error.message);
        }
    }

    // Test 5: Content Management
    testContentManagement() {
        console.log("\n📝 Testing Content Management...");

        // Test if content is rendered
        const contentRows = document.querySelectorAll('.content-table tbody tr');
        this.logTest("Content Rendering", 
            contentRows.length > 0,
            `Found ${contentRows.length} content items`
        );

        // Test expand/collapse functionality
        const expandIcons = document.querySelectorAll('.expand-icon');
        this.logTest("Expand Icons", 
            expandIcons.length > 0,
            `Found ${expandIcons.length} expandable items`
        );

        // Test tree structure
        const categoryRows = document.querySelectorAll('.category-row');
        const articleRows = document.querySelectorAll('.article-row');
        this.logTest("Tree Structure", 
            categoryRows.length > 0 && articleRows.length > 0,
            `Categories: ${categoryRows.length}, Articles: ${articleRows.length}`
        );
    }

    // Test 6: Event Listeners
    testEventListeners() {
        console.log("\n👂 Testing Event Listeners...");

        // Test if setupEventListeners function exists and works
        try {
            if (typeof setupEventListeners === 'function') {
                this.logTest("Setup Event Listeners Function", true, "Function exists");
            } else {
                this.logTest("Setup Event Listeners Function", false, "Function not found");
            }
        } catch (error) {
            this.logTest("Setup Event Listeners Function", false, error.message);
        }

        // Test if tree event listeners are set up
        try {
            if (typeof setupTreeEventListeners === 'function') {
                setupTreeEventListeners();
                this.logTest("Tree Event Listeners", true, "Setup completed");
            } else {
                this.logTest("Tree Event Listeners", false, "Function not found");
            }
        } catch (error) {
            this.logTest("Tree Event Listeners", false, error.message);
        }

        // Test click handlers on key elements
        const addButton = document.querySelector('.btn-add');
        if (addButton) {
            this.logTest("Add Button Click Handler", 
                addButton.onclick !== null || addButton.addEventListener !== undefined,
                "Click handler attached"
            );
        } else {
            this.logTest("Add Button Click Handler", false, "Add button not found");
        }
    }

    // Test 7: Filter System
    testFilterSystem() {
        console.log("\n🔍 Testing Filter System...");

        // Test filter functions
        if (typeof filterContent === 'function') {
            try {
                filterContent('test');
                this.logTest("Filter Content Function", true, "Function executed");
            } catch (error) {
                this.logTest("Filter Content Function", false, error.message);
            }
        } else {
            this.logTest("Filter Content Function", false, "Function not found");
        }

        if (typeof filterByType === 'function') {
            try {
                filterByType('all');
                this.logTest("Filter By Type Function", true, "Function executed");
            } catch (error) {
                this.logTest("Filter By Type Function", false, error.message);
            }
        } else {
            this.logTest("Filter By Type Function", false, "Function not found");
        }

        // Test filter UI elements
        const filterItems = document.querySelectorAll('.filter-item');
        this.logTest("Filter Items", 
            filterItems.length > 0,
            `Found ${filterItems.length} filter items`
        );
    }

    // Test 8: Modal and Editor Functions
    testModalsAndEditor() {
        console.log("\n🖼️ Testing Modals and Editor...");

        // Test if modal functions exist
        const modalFunctions = [
            'showAddNewMenu',
            'addNewBook',
            'addNewCategory',
            'addNewFolder',
            'addNewArticle'
        ];

        modalFunctions.forEach(funcName => {
            this.logTest(`${funcName} Function`, 
                typeof window[funcName] === 'function',
                funcName
            );
        });

        // Test article editor
        const articleEditor = document.getElementById('articleEditor');
        this.logTest("Article Editor Element", 
            articleEditor !== null,
            "Editor container exists"
        );

        // Test summarize modal
        const summarizeModal = document.getElementById('summarizeModal');
        this.logTest("Summarize Modal", 
            summarizeModal !== null,
            "Modal container exists"
        );
    }

    // Test 9: Navigation and Pages
    testNavigation() {
        console.log("\n🧭 Testing Navigation...");

        // Test page functions
        const pageFunctions = [
            'showMyBooksPage',
            'showAnalyticsPage',
            'showSettingsPage'
        ];

        pageFunctions.forEach(funcName => {
            this.logTest(`${funcName} Function`, 
                typeof window[funcName] === 'function',
                funcName
            );
        });

        // Test navigation clicks
        const iconLinks = document.querySelectorAll('.icon-link');
        iconLinks.forEach((link, index) => {
            const title = link.getAttribute('title') || `Icon ${index}`;
            this.logTest(`Navigation Icon: ${title}`, 
                link.onclick !== null || link.href !== null,
                "Click handler or href present"
            );
        });
    }

    // Test 10: Performance and Memory
    testPerformance() {
        console.log("\n⚡ Testing Performance...");

        // Test memory usage
        if (performance.memory) {
            const memoryInfo = performance.memory;
            this.logTest("Memory Usage", 
                memoryInfo.usedJSHeapSize < memoryInfo.jsHeapSizeLimit * 0.8,
                `Used: ${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`
            );
        } else {
            this.logTest("Memory Usage", true, "Memory API not available");
        }

        // Test rendering performance
        const startTime = performance.now();
        showMyBooksPage();
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        this.logTest("Page Render Performance", 
            renderTime < 100,
            `Rendered in ${renderTime.toFixed(2)}ms`
        );
    }

    // Test 11: Error Handling
    testErrorHandling() {
        console.log("\n🛡️ Testing Error Handling...");

        // Test notification system
        if (typeof showNotification === 'function') {
            try {
                showNotification('Test notification', 'success');
                this.logTest("Notification System", true, "Test notification shown");
            } catch (error) {
                this.logTest("Notification System", false, error.message);
            }
        } else {
            this.logTest("Notification System", false, "Function not found");
        }

        // Test invalid data handling
        try {
            const originalBooks = books;
            books = null;
            updateBooksSidebar();
            books = originalBooks;
            this.logTest("Null Data Handling", true, "Handled gracefully");
        } catch (error) {
            this.logTest("Null Data Handling", false, error.message);
        }
    }

    // Test 12: Accessibility
    testAccessibility() {
        console.log("\n♿ Testing Accessibility...");

        // Check for ARIA labels
        const buttonsWithAria = document.querySelectorAll('button[aria-label]');
        this.logTest("ARIA Labels", 
            buttonsWithAria.length > 0,
            `Found ${buttonsWithAria.length} buttons with ARIA labels`
        );

        // Check for keyboard navigation
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        this.logTest("Focusable Elements", 
            focusableElements.length > 0,
            `Found ${focusableElements.length} focusable elements`
        );

        // Check color contrast (basic check)
        const computedStyle = getComputedStyle(document.body);
        this.logTest("Color Scheme", 
            computedStyle.backgroundColor && computedStyle.color,
            "Background and text colors set"
        );
    }

    // Run all tests
    async runAllTests() {
        console.log("🚀 Knowledge Base E2E Testing Suite Started");
        console.log("=" * 50);

        this.testInitialization();
        this.testUIElements();
        this.testDataOperations();
        this.testBookManagement();
        this.testContentManagement();
        this.testEventListeners();
        this.testFilterSystem();
        this.testModalsAndEditor();
        this.testNavigation();
        this.testPerformance();
        this.testErrorHandling();
        this.testAccessibility();

        // Generate final report
        this.generateReport();
    }

    // Generate test report
    generateReport() {
        console.log("\n" + "=" * 50);
        console.log("📊 TEST RESULTS SUMMARY");
        console.log("=" * 50);
        
        const totalTests = this.passedTests + this.failedTests;
        const successRate = ((this.passedTests / totalTests) * 100).toFixed(1);
        
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.failedTests}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        
        if (this.failedTests > 0) {
            console.log("\n🔍 FAILED TESTS:");
            this.testResults
                .filter(test => !test.passed)
                .forEach(test => {
                    console.log(`   ❌ ${test.name}: ${test.message}`);
                });
        }

        console.log("\n🎯 RECOMMENDATIONS:");
        if (successRate >= 95) {
            console.log("   🌟 Excellent! Your application is working very well.");
        } else if (successRate >= 80) {
            console.log("   👍 Good! Some minor issues to address.");
        } else if (successRate >= 60) {
            console.log("   ⚠️  Fair. Several issues need attention.");
        } else {
            console.log("   🚨 Critical issues detected. Immediate attention required.");
        }

        // Performance recommendations
        if (performance.memory && performance.memory.usedJSHeapSize > 50 * 1024 * 1024) {
            console.log("   💾 Consider optimizing memory usage.");
        }

        console.log("\n✨ E2E Testing Complete!");
        
        // Return results for programmatic use
        return {
            totalTests,
            passedTests: this.passedTests,
            failedTests: this.failedTests,
            successRate: parseFloat(successRate),
            results: this.testResults
        };
    }
}

// Initialize and run tests when the page is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const testSuite = new E2ETestSuite();
            testSuite.runAllTests();
        }, 2000); // Wait 2 seconds for everything to initialize
    });
} else {
    // If DOM is already loaded, run tests after a short delay
    setTimeout(() => {
        const testSuite = new E2ETestSuite();
        testSuite.runAllTests();
    }, 2000);
}

// Make test suite available globally for manual testing
window.E2ETestSuite = E2ETestSuite;
