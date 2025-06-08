
// Manual Testing Helper Functions
console.log("🔧 Manual Testing Helpers Loaded");

// Global testing utilities
window.testHelpers = {
    // Test book creation
    testCreateBook: function() {
        console.log("🧪 Testing book creation...");
        try {
            addNewBook();
            console.log("✅ Book creation modal opened successfully");
            return true;
        } catch (error) {
            console.error("❌ Book creation failed:", error);
            return false;
        }
    },

    // Test category creation
    testCreateCategory: function() {
        console.log("🧪 Testing category creation...");
        try {
            addNewCategory();
            console.log("✅ Category creation modal opened successfully");
            return true;
        } catch (error) {
            console.error("❌ Category creation failed:", error);
            return false;
        }
    },

    // Test article creation
    testCreateArticle: function() {
        console.log("🧪 Testing article creation...");
        try {
            addNewArticle();
            console.log("✅ Article creation modal opened successfully");
            return true;
        } catch (error) {
            console.error("❌ Article creation failed:", error);
            return false;
        }
    },

    // Test search functionality
    testSearch: function(query = "test") {
        console.log("🧪 Testing search functionality...");
        try {
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.value = query;
                searchInput.dispatchEvent(new Event('input'));
                console.log("✅ Search executed successfully");
                return true;
            } else {
                console.error("❌ Search input not found");
                return false;
            }
        } catch (error) {
            console.error("❌ Search test failed:", error);
            return false;
        }
    },

    // Test filter functionality
    testFilters: function() {
        console.log("🧪 Testing filter functionality...");
        try {
            filterByType('published');
            filterByType('draft');
            filterByType('all');
            console.log("✅ Filter functions executed successfully");
            return true;
        } catch (error) {
            console.error("❌ Filter test failed:", error);
            return false;
        }
    },

    // Test expand/collapse
    testExpandCollapse: function() {
        console.log("🧪 Testing expand/collapse functionality...");
        try {
            const expandIcon = document.querySelector('.expand-icon');
            if (expandIcon) {
                expandIcon.click();
                console.log("✅ Expand/collapse triggered successfully");
                return true;
            } else {
                console.log("ℹ️ No expandable items found");
                return true;
            }
        } catch (error) {
            console.error("❌ Expand/collapse test failed:", error);
            return false;
        }
    },

    // Test navigation
    testNavigation: function() {
        console.log("🧪 Testing navigation...");
        try {
            showAnalyticsPage();
            setTimeout(() => {
                showMyBooksPage();
                console.log("✅ Navigation between pages working");
            }, 1000);
            return true;
        } catch (error) {
            console.error("❌ Navigation test failed:", error);
            return false;
        }
    },

    // Test data persistence
    testDataPersistence: function() {
        console.log("🧪 Testing data persistence...");
        try {
            const testData = { test: 'data', timestamp: Date.now() };
            localStorage.setItem('test_persistence', JSON.stringify(testData));
            
            const retrieved = JSON.parse(localStorage.getItem('test_persistence'));
            localStorage.removeItem('test_persistence');
            
            if (retrieved && retrieved.test === 'data') {
                console.log("✅ Data persistence working");
                return true;
            } else {
                console.error("❌ Data persistence failed");
                return false;
            }
        } catch (error) {
            console.error("❌ Data persistence test failed:", error);
            return false;
        }
    },

    // Run all manual tests
    runAllManualTests: function() {
        console.log("🚀 Running all manual tests...");
        const tests = [
            this.testCreateBook,
            this.testCreateCategory,
            this.testCreateArticle,
            this.testSearch,
            this.testFilters,
            this.testExpandCollapse,
            this.testNavigation,
            this.testDataPersistence
        ];

        let passed = 0;
        let total = tests.length;

        tests.forEach((test, index) => {
            setTimeout(() => {
                try {
                    if (test()) passed++;
                } catch (error) {
                    console.error(`Test ${index + 1} failed:`, error);
                }

                if (index === total - 1) {
                    console.log(`\n📊 Manual Tests Complete: ${passed}/${total} passed`);
                }
            }, index * 1000);
        });
    },

    // Quick health check
    healthCheck: function() {
        console.log("🏥 Performing health check...");
        const checks = {
            'Books loaded': books && books.size > 0,
            'Categories loaded': bookCategories && bookCategories.size > 0,
            'Selected book': selectedBookId !== null,
            'Main content': document.querySelector('.main-content') !== null,
            'Sidebar': document.querySelector('.sidebar') !== null,
            'Content table': document.querySelector('.content-table') !== null
        };

        Object.entries(checks).forEach(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}`);
        });

        const healthScore = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100;
        console.log(`\n🎯 Health Score: ${healthScore.toFixed(1)}%`);
        
        return healthScore;
    }
};

// Auto-run health check
setTimeout(() => {
    console.log("\n" + "=".repeat(50));
    console.log("🏥 AUTO HEALTH CHECK");
    console.log("=".repeat(50));
    window.testHelpers.healthCheck();
}, 3000);

// Instructions for manual testing
console.log(`
🔧 MANUAL TESTING COMMANDS:
   testHelpers.healthCheck()        - Quick health check
   testHelpers.testCreateBook()     - Test book creation
   testHelpers.testCreateCategory() - Test category creation  
   testHelpers.testCreateArticle()  - Test article creation
   testHelpers.testSearch()         - Test search functionality
   testHelpers.testFilters()        - Test filter system
   testHelpers.testNavigation()     - Test page navigation
   testHelpers.runAllManualTests()  - Run all manual tests
`);
