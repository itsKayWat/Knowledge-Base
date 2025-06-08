// Admin and Team Management pages for Knowledge Base
// These functions display the admin dashboard and team management pages

// Create a global object to export functions
const membershipPages = {};

// Function to show the Admin Dashboard
function showAdminPage() {
    if (!contentContainer || !contentTitle) {
        console.error("Content container or title element not found");
        return;
    }
    
    // Set page title
    contentTitle.textContent = "Admin Dashboard";
    
    // Clear main content
    contentContainer.innerHTML = '';
    
    // Create admin content
    const adminContent = document.createElement('div');
    adminContent.className = 'admin-content';
    adminContent.style.padding = '20px 0';
    
    // Admin Header
    const adminHeader = document.createElement('div');
    adminHeader.style.marginBottom = '30px';
    
    const adminTitle = document.createElement('h2');
    adminTitle.textContent = 'Admin Dashboard';
    adminTitle.style.fontSize = '24px';
    adminTitle.style.fontWeight = '500';
    adminTitle.style.marginBottom = '10px';
    
    const adminSubtitle = document.createElement('p');
    adminSubtitle.textContent = 'Manage your knowledge base, users, and subscription settings';
    adminSubtitle.style.color = 'var(--text-secondary)';
    adminSubtitle.style.fontSize = '15px';
    
    adminHeader.appendChild(adminTitle);
    adminHeader.appendChild(adminSubtitle);
    
    // Stats Overview section
    const statsSection = document.createElement('div');
    statsSection.className = 'admin-stats-section';
    statsSection.style.display = 'grid';
    statsSection.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
    statsSection.style.gap = '20px';
    statsSection.style.marginBottom = '30px';
    
    // Create stat cards
    const userStats = createAdminStatCard('Active Users', '24', 'users');
    const bookStats = createAdminStatCard('Total Books', '8', 'books');
    const articleStats = createAdminStatCard('Published Articles', '47', 'articles');
    const viewStats = createAdminStatCard('Monthly Views', '1,254', 'views');
    
    statsSection.appendChild(userStats);
    statsSection.appendChild(bookStats);
    statsSection.appendChild(articleStats);
    statsSection.appendChild(viewStats);
    
    // User Management section
    const userSection = document.createElement('div');
    userSection.className = 'admin-section';
    userSection.style.backgroundColor = 'var(--card-color)';
    userSection.style.borderRadius = 'var(--border-radius)';
    userSection.style.padding = '20px';
    userSection.style.marginBottom = '30px';
    userSection.style.border = '1px solid var(--border-color)';
    
    const userHeader = document.createElement('div');
    userHeader.style.display = 'flex';
    userHeader.style.justifyContent = 'space-between';
    userHeader.style.alignItems = 'center';
    userHeader.style.marginBottom = '20px';
    
    const userTitle = document.createElement('h3');
    userTitle.textContent = 'User Management';
    userTitle.style.fontSize = '18px';
    userTitle.style.fontWeight = '500';
    
    const addUserBtn = document.createElement('button');
    addUserBtn.className = 'btn btn-primary';
    addUserBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        Add User
    `;
    addUserBtn.style.display = 'flex';
    addUserBtn.style.alignItems = 'center';
    
    // Add event listener for the Add User button
    addUserBtn.addEventListener('click', function() {
        showNotification('User management coming soon!', 'info');
    });
    
    userHeader.appendChild(userTitle);
    userHeader.appendChild(addUserBtn);
    
    // User table
    const userTable = document.createElement('table');
    userTable.style.width = '100%';
    userTable.style.borderCollapse = 'collapse';
    
    // Table header
    const tableHeader = document.createElement('thead');
    tableHeader.innerHTML = `
        <tr>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">User</th>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Role</th>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Status</th>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Last Active</th>
            <th style="text-align: right; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Actions</th>
        </tr>
    `;
    
    // Table body with sample users
    const tableBody = document.createElement('tbody');
    
    // Sample users
    const users = [
        { name: 'John Smith', email: 'john@example.com', role: 'Admin', status: 'Active', lastActive: '2 hours ago' },
        { name: 'Jane Doe', email: 'jane@example.com', role: 'Editor', status: 'Active', lastActive: '1 day ago' },
        { name: 'Robert Johnson', email: 'robert@example.com', role: 'Viewer', status: 'Pending', lastActive: 'Never' },
        { name: 'Emma Wilson', email: 'emma@example.com', role: 'Editor', status: 'Active', lastActive: '3 days ago' }
    ];
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Status color
        let statusColor = 'var(--success-green)';
        let statusBg = 'rgba(80, 200, 120, 0.1)';
        
        if (user.status === 'Pending') {
            statusColor = 'var(--accent-color)';
            statusBg = 'rgba(255, 151, 68, 0.1)';
        }
        
        row.innerHTML = `
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background-color: var(--hover-color); display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 500; color: var(--text-color);">
                        ${user.name.charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight: 500;">${user.name}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">${user.email}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${user.role}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; background-color: ${statusBg}; color: ${statusColor};">${user.status}</span>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${user.lastActive}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color); text-align: right;">
                <button class="tree-action-btn" title="Edit User">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                </button>
                <button class="tree-action-btn" title="Manage Permissions">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    userTable.appendChild(tableHeader);
    userTable.appendChild(tableBody);
    
    userSection.appendChild(userHeader);
    userSection.appendChild(userTable);
    
    // Subscription Management section
    const subscriptionSection = document.createElement('div');
    subscriptionSection.className = 'admin-section';
    subscriptionSection.style.backgroundColor = 'var(--card-color)';
    subscriptionSection.style.borderRadius = 'var(--border-radius)';
    subscriptionSection.style.padding = '20px';
    subscriptionSection.style.marginBottom = '30px';
    subscriptionSection.style.border = '1px solid var(--border-color)';
    
    const subHeader = document.createElement('div');
    subHeader.style.display = 'flex';
    subHeader.style.justifyContent = 'space-between';
    subHeader.style.alignItems = 'center';
    subHeader.style.marginBottom = '20px';
    
    const subTitle = document.createElement('h3');
    subTitle.textContent = 'Subscription Management';
    subTitle.style.fontSize = '18px';
    subTitle.style.fontWeight = '500';
    
    const upgradeBtn = document.createElement('button');
    upgradeBtn.className = 'btn btn-primary';
    upgradeBtn.textContent = 'Upgrade Plan';
    
    // Add event listener for the Upgrade Plan button
    upgradeBtn.addEventListener('click', function() {
        showNotification('Plan upgrade coming soon!', 'info');
    });
    
    subHeader.appendChild(subTitle);
    subHeader.appendChild(upgradeBtn);
    
    // Current plan info
    const planInfo = document.createElement('div');
    planInfo.style.backgroundColor = 'rgba(100, 197, 255, 0.05)';
    planInfo.style.borderRadius = 'var(--border-radius)';
    planInfo.style.padding = '20px';
    planInfo.style.marginBottom = '20px';
    planInfo.style.border = '1px solid rgba(100, 197, 255, 0.2)';
    
    planInfo.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div>
                <div style="font-weight: 500; font-size: 16px; margin-bottom: 5px;">Current Plan: <span style="color: var(--primary-color);">Free Plan</span></div>
                <div style="color: var(--text-secondary); font-size: 14px;">2 of 2 books used</div>
            </div>
            <div style="background-color: var(--primary-color); color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500;">
                Active
            </div>
        </div>
        <div style="background-color: var(--card-color); height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 10px;">
            <div style="background-color: var(--primary-color); width: 100%; height: 100%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary);">
            <span>Renews on June 1, 2025</span>
            <span>2/2 books</span>
        </div>
    `;
    
    subscriptionSection.appendChild(subHeader);
    subscriptionSection.appendChild(planInfo);
    
    // Access Requests section - NEW SECTION
    const accessRequestsSection = document.createElement('div');
    accessRequestsSection.className = 'admin-section';
    accessRequestsSection.style.backgroundColor = 'var(--card-color)';
    accessRequestsSection.style.borderRadius = 'var(--border-radius)';
    accessRequestsSection.style.padding = '20px';
    accessRequestsSection.style.marginBottom = '30px';
    accessRequestsSection.style.border = '1px solid var(--border-color)';
    
    const accessHeader = document.createElement('div');
    accessHeader.style.display = 'flex';
    accessHeader.style.justifyContent = 'space-between';
    accessHeader.style.alignItems = 'center';
    accessHeader.style.marginBottom = '20px';
    
    const accessTitle = document.createElement('h3');
    accessTitle.textContent = 'Access Requests';
    accessTitle.style.fontSize = '18px';
    accessTitle.style.fontWeight = '500';
    
    const requestsBadge = document.createElement('span');
    requestsBadge.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
    requestsBadge.style.color = '#ff4444';
    requestsBadge.style.padding = '3px 10px';
    requestsBadge.style.borderRadius = '12px';
    requestsBadge.style.fontSize = '12px';
    requestsBadge.style.fontWeight = '500';
    requestsBadge.textContent = '3 Pending';
    
    accessHeader.appendChild(accessTitle);
    accessHeader.appendChild(requestsBadge);
    
    // Access requests table
    const requestsTable = document.createElement('table');
    requestsTable.style.width = '100%';
    requestsTable.style.borderCollapse = 'collapse';
    
    // Table header
    const requestsTableHeader = document.createElement('thead');
    requestsTableHeader.innerHTML = `
        <tr>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">User</th>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Page</th>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Requested</th>
            <th style="text-align: right; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Actions</th>
        </tr>
    `;
    
    // Table body with sample access requests
    const requestsTableBody = document.createElement('tbody');
    
    // Sample access requests
    const accessRequests = [
        { user: { name: 'Michael Brown', email: 'michael@example.com' }, page: 'Product Roadmap (Private)', requested: '2 hours ago' },
        { user: { name: 'Sarah Johnson', email: 'sarah@example.com' }, page: 'Financial Reports Q1 (Private)', requested: '1 day ago' },
        { user: { name: 'Chris Williams', email: 'chris@example.com' }, page: 'HR Policies (Private)', requested: '3 days ago' }
    ];
    
    accessRequests.forEach(request => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background-color: var(--hover-color); display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 500; color: var(--text-color);">
                        ${request.user.name.charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight: 500;">${request.user.name}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">${request.user.email}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${request.page}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${request.requested}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color); text-align: right;">
                <button class="btn btn-outline approve-btn" style="margin-right: 8px; padding: 5px 10px; font-size: 13px; background-color: rgba(80, 200, 120, 0.1); border-color: rgba(80, 200, 120, 0.3); color: var(--success-green);">
                    Approve
                </button>
                <button class="btn btn-outline deny-btn" style="padding: 5px 10px; font-size: 13px; background-color: rgba(255, 68, 68, 0.1); border-color: rgba(255, 68, 68, 0.3); color: #ff4444;">
                    Deny
                </button>
            </td>
        `;
        
        // Add event listeners for approve/deny buttons
        const approveBtn = row.querySelector('.approve-btn');
        const denyBtn = row.querySelector('.deny-btn');
        
        if (approveBtn) {
            approveBtn.addEventListener('click', function() {
                showNotification(`Access granted to ${request.user.name}`, 'success');
                row.style.display = 'none'; // Hide row after approval
                
                // Update the badge count
                const count = parseInt(requestsBadge.textContent.split(' ')[0]) - 1;
                requestsBadge.textContent = count + ' Pending';
                
                if (count === 0) {
                    // Show empty state if no more requests
                    requestsTableBody.innerHTML = `
                        <tr>
                            <td colspan="4" style="text-align: center; padding: 30px; color: var(--text-secondary);">
                                No pending access requests
                            </td>
                        </tr>
                    `;
                    requestsBadge.style.display = 'none';
                }
            });
        }
        
        if (denyBtn) {
            denyBtn.addEventListener('click', function() {
                showNotification(`Access denied for ${request.user.name}`, 'error');
                row.style.display = 'none'; // Hide row after denial
                
                // Update the badge count
                const count = parseInt(requestsBadge.textContent.split(' ')[0]) - 1;
                requestsBadge.textContent = count + ' Pending';
                
                if (count === 0) {
                    // Show empty state if no more requests
                    requestsTableBody.innerHTML = `
                        <tr>
                            <td colspan="4" style="text-align: center; padding: 30px; color: var(--text-secondary);">
                                No pending access requests
                            </td>
                        </tr>
                    `;
                    requestsBadge.style.display = 'none';
                }
            });
        }
        
        requestsTableBody.appendChild(row);
    });
    
    requestsTable.appendChild(requestsTableHeader);
    requestsTable.appendChild(requestsTableBody);
    
    accessRequestsSection.appendChild(accessHeader);
    accessRequestsSection.appendChild(requestsTable);
    
    // Shared Links Tracking section - NEW SECTION
    const sharedLinksSection = document.createElement('div');
    sharedLinksSection.className = 'admin-section';
    sharedLinksSection.style.backgroundColor = 'var(--card-color)';
    sharedLinksSection.style.borderRadius = 'var(--border-radius)';
    sharedLinksSection.style.padding = '20px';
    sharedLinksSection.style.marginBottom = '30px';
    sharedLinksSection.style.border = '1px solid var(--border-color)';
    
    const linksHeader = document.createElement('div');
    linksHeader.style.display = 'flex';
    linksHeader.style.justifyContent = 'space-between';
    linksHeader.style.alignItems = 'center';
    linksHeader.style.marginBottom = '20px';
    
    const linksTitle = document.createElement('h3');
    linksTitle.textContent = 'Shared Links';
    linksTitle.style.fontSize = '18px';
    linksTitle.style.fontWeight = '500';
    
    const activeLinksCount = document.createElement('span');
    activeLinksCount.style.backgroundColor = 'rgba(100, 197, 255, 0.1)';
    activeLinksCount.style.color = 'var(--primary-color)';
    activeLinksCount.style.padding = '3px 10px';
    activeLinksCount.style.borderRadius = '12px';
    activeLinksCount.style.fontSize = '12px';
    activeLinksCount.style.fontWeight = '500';
    activeLinksCount.textContent = '5 Active';
    
    linksHeader.appendChild(linksTitle);
    linksHeader.appendChild(activeLinksCount);
    
    // Shared links table
    const linksTable = document.createElement('table');
    linksTable.style.width = '100%';
    linksTable.style.borderCollapse = 'collapse';
    
    // Table header
    const linksTableHeader = document.createElement('thead');
    linksTableHeader.innerHTML = `
        <tr>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Shared By</th>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Page</th>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Link</th>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Shared On</th>
            <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Views</th>
            <th style="text-align: right; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Actions</th>
        </tr>
    `;
    
    // Table body with sample shared links
    const linksTableBody = document.createElement('tbody');
    
    // Sample shared links
    const sharedLinks = [
        { 
            user: { name: 'John Smith', email: 'john@example.com' }, 
            page: 'Getting Started Guide', 
            link: 'kb.app/s/abc123', 
            sharedOn: '2 days ago',
            views: 24
        },
        { 
            user: { name: 'Jane Doe', email: 'jane@example.com' }, 
            page: 'Product Features', 
            link: 'kb.app/s/def456', 
            sharedOn: '1 week ago',
            views: 56
        },
        { 
            user: { name: 'Robert Johnson', email: 'robert@example.com' }, 
            page: 'API Documentation', 
            link: 'kb.app/s/ghi789', 
            sharedOn: '3 weeks ago',
            views: 132
        },
        { 
            user: { name: 'Emma Wilson', email: 'emma@example.com' }, 
            page: 'Onboarding Process', 
            link: 'kb.app/s/jkl012', 
            sharedOn: '1 month ago',
            views: 87
        },
        { 
            user: { name: 'Michael Brown', email: 'michael@example.com' }, 
            page: 'Troubleshooting Guide', 
            link: 'kb.app/s/mno345', 
            sharedOn: '2 months ago',
            views: 215
        }
    ];
    
    sharedLinks.forEach(link => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background-color: var(--hover-color); display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 500; color: var(--text-color);">
                        ${link.user.name.charAt(0)}
                    </div>
                    <div>
                        <div style="font-weight: 500;">${link.user.name}</div>
                        <div style="font-size: 13px; color: var(--text-secondary);">${link.user.email}</div>
                    </div>
                </div>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${link.page}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                <span style="font-family: monospace; background-color: rgba(255, 255, 255, 0.05); padding: 3px 8px; border-radius: 4px;">${link.link}</span>
            </td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${link.sharedOn}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">${link.views}</td>
            <td style="padding: 15px; border-bottom: 1px solid var(--border-color); text-align: right;">
                <button class="btn btn-outline copy-link-btn" style="margin-right: 8px; padding: 5px 10px; font-size: 13px; background-color: rgba(100, 197, 255, 0.1); border-color: rgba(100, 197, 255, 0.3); color: var(--primary-color);">
                    Copy
                </button>
                <button class="btn btn-outline deactivate-link-btn" style="padding: 5px 10px; font-size: 13px; background-color: rgba(255, 68, 68, 0.1); border-color: rgba(255, 68, 68, 0.3); color: #ff4444;">
                    Deactivate
                </button>
            </td>
        `;
        
        // Add event listeners for copy/deactivate buttons
        const copyBtn = row.querySelector('.copy-link-btn');
        const deactivateBtn = row.querySelector('.deactivate-link-btn');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                // Simulate copying to clipboard
                navigator.clipboard.writeText(`https://${link.link}`).then(() => {
                    showNotification('Link copied to clipboard', 'success');
                });
            });
        }
        
        if (deactivateBtn) {
            deactivateBtn.addEventListener('click', function() {
                showNotification(`Link to "${link.page}" has been deactivated`, 'info');
                
                // Update button state
                deactivateBtn.textContent = 'Deactivated';
                deactivateBtn.disabled = true;
                deactivateBtn.style.opacity = '0.5';
                deactivateBtn.style.cursor = 'not-allowed';
                
                // Add a "reactivate" button
                const reactivateBtn = document.createElement('button');
                reactivateBtn.className = 'btn btn-outline reactivate-link-btn';
                reactivateBtn.style.padding = '5px 10px';
                reactivateBtn.style.fontSize = '13px';
                reactivateBtn.style.backgroundColor = 'rgba(80, 200, 120, 0.1)';
                reactivateBtn.style.borderColor = 'rgba(80, 200, 120, 0.3)';
                reactivateBtn.style.color = 'var(--success-green)';
                reactivateBtn.style.marginRight = '8px';
                reactivateBtn.textContent = 'Reactivate';
                
                reactivateBtn.addEventListener('click', function() {
                    showNotification(`Link to "${link.page}" has been reactivated`, 'success');
                    
                    // Restore the deactivate button
                    deactivateBtn.textContent = 'Deactivate';
                    deactivateBtn.disabled = false;
                    deactivateBtn.style.opacity = '1';
                    deactivateBtn.style.cursor = 'pointer';
                    
                    // Remove the reactivate button
                    reactivateBtn.remove();
                });
                
                // Insert the reactivate button before the deactivate button
                deactivateBtn.parentNode.insertBefore(reactivateBtn, deactivateBtn);
                
                // Update the active links count
                const count = parseInt(activeLinksCount.textContent.split(' ')[0]) - 1;
                activeLinksCount.textContent = count + ' Active';
            });
        }
        
        linksTableBody.appendChild(row);
    });
    
    linksTable.appendChild(linksTableHeader);
    linksTable.appendChild(linksTableBody);
    
    sharedLinksSection.appendChild(linksHeader);
    sharedLinksSection.appendChild(linksTable);
    
    // Assemble the admin content
    adminContent.appendChild(adminHeader);
    adminContent.appendChild(statsSection);
    adminContent.appendChild(userSection);
    adminContent.appendChild(subscriptionSection);
    
    // Add the new section to admin content
    adminContent.appendChild(accessRequestsSection);
    
    // Add the shared links section to admin content
    adminContent.appendChild(sharedLinksSection);
    
    // Add content to main container
    contentContainer.appendChild(adminContent);
}

// Helper function to create admin stat cards
function createAdminStatCard(title, value, type) {
    const card = document.createElement('div');
    card.style.backgroundColor = 'var(--card-color)';
    card.style.borderRadius = 'var(--border-radius)';
    card.style.padding = '20px';
    card.style.border = '1px solid var(--border-color)';
    
    // Choose icon based on type
    let iconSvg = '';
    let iconColor = '';
    
    switch(type) {
        case 'users':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>`;
            iconColor = '#3b82f6';
            break;
        case 'books':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>`;
            iconColor = '#8b5cf6';
            break;
        case 'articles':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
            </svg>`;
            iconColor = '#ec4899';
            break;
        case 'views':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>`;
            iconColor = '#10b981';
            break;
    }
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
            <div style="color: ${iconColor};">${iconSvg}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                12%
            </div>
        </div>
        <div style="font-size: 28px; font-weight: 600; margin-bottom: 5px;">${value}</div>
        <div style="color: var(--text-secondary); font-size: 14px;">${title}</div>
    `;
    
    return card;
}

// Function to show Team Management page
function showTeamPage() {
    if (!contentContainer || !contentTitle) {
        console.error("Content container or title element not found");
        return;
    }
    
    // Set page title
    contentTitle.textContent = "Team Management";
    
    // Clear main content
    contentContainer.innerHTML = '';
    
    // Create team management content
    const teamContent = document.createElement('div');
    teamContent.className = 'team-content';
    teamContent.style.padding = '20px 0';
    
    // Team Header
    const teamHeader = document.createElement('div');
    teamHeader.style.marginBottom = '30px';
    
    const teamTitle = document.createElement('h2');
    teamTitle.textContent = 'Team Management';
    teamTitle.style.fontSize = '24px';
    teamTitle.style.fontWeight = '500';
    teamTitle.style.marginBottom = '10px';
    
    const teamSubtitle = document.createElement('p');
    teamSubtitle.textContent = 'Invite, manage team members and set permissions';
    teamSubtitle.style.color = 'var(--text-secondary)';
    teamSubtitle.style.fontSize = '15px';
    
    teamHeader.appendChild(teamTitle);
    teamHeader.appendChild(teamSubtitle);
    
    // Team Overview section
    const overviewSection = document.createElement('div');
    overviewSection.className = 'team-overview-section';
    overviewSection.style.display = 'flex';
    overviewSection.style.gap = '20px';
    overviewSection.style.marginBottom = '30px';
    
    // Team Members counter
    const membersCounter = document.createElement('div');
    membersCounter.style.flex = '1';
    membersCounter.style.backgroundColor = 'var(--card-color)';
    membersCounter.style.borderRadius = 'var(--border-radius)';
    membersCounter.style.padding = '20px';
    membersCounter.style.border = '1px solid var(--border-color)';
    membersCounter.style.display = 'flex';
    membersCounter.style.alignItems = 'center';
    membersCounter.style.justifyContent = 'space-between';
    
    membersCounter.innerHTML = `
        <div>
            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 5px;">Team Members</div>
            <div style="font-size: 24px; font-weight: 600;">4 / 10</div>
        </div>
        <div style="color: #3b82f6;">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        </div>
    `;
    
    // Team Plan info
    const planInfo = document.createElement('div');
    planInfo.style.flex = '1';
    planInfo.style.backgroundColor = 'var(--card-color)';
    planInfo.style.borderRadius = 'var(--border-radius)';
    planInfo.style.padding = '20px';
    planInfo.style.border = '1px solid var(--border-color)';
    planInfo.style.display = 'flex';
    planInfo.style.alignItems = 'center';
    planInfo.style.justifyContent = 'space-between';
    
    planInfo.innerHTML = `
        <div>
            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 5px;">Current Plan</div>
            <div style="font-size: 24px; font-weight: 600;">Team Plan</div>
        </div>
        <div style="padding: 8px 16px; background-color: rgba(139, 92, 246, 0.1); color: #8b5cf6; border-radius: 30px; font-weight: 500; font-size: 14px;">
            Upgrade
        </div>
    `;
    
    overviewSection.appendChild(membersCounter);
    overviewSection.appendChild(planInfo);
    
    // Team Members Management section
    const membersSection = document.createElement('div');
    membersSection.className = 'team-section';
    membersSection.style.backgroundColor = 'var(--card-color)';
    membersSection.style.borderRadius = 'var(--border-radius)';
    membersSection.style.padding = '20px';
    membersSection.style.marginBottom = '30px';
    membersSection.style.border = '1px solid var(--border-color)';
    
    const membersHeader = document.createElement('div');
    membersHeader.style.display = 'flex';
    membersHeader.style.justifyContent = 'space-between';
    membersHeader.style.alignItems = 'center';
    membersHeader.style.marginBottom = '20px';
    
    const membersTitle = document.createElement('h3');
    membersTitle.textContent = 'Team Members';
    membersTitle.style.fontSize = '18px';
    membersTitle.style.fontWeight = '500';
    
    const inviteBtn = document.createElement('button');
    inviteBtn.className = 'btn btn-primary';
    inviteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="8.5" cy="7" r="4"></circle>
            <line x1="20" y1="8" x2="20" y2="14"></line>
            <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        Invite Member
    `;
    inviteBtn.style.display = 'flex';
    inviteBtn.style.alignItems = 'center';
    
    // Add event listener for the Invite Member button
    inviteBtn.addEventListener('click', function() {
        showNotification('Team invitations coming soon!', 'info');
    });
    
    membersHeader.appendChild(membersTitle);
    membersHeader.appendChild(inviteBtn);
    
    // Add members list placeholder
    const membersList = document.createElement('div');
    membersList.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Member</th>
                    <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Role</th>
                    <th style="text-align: left; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Access</th>
                    <th style="text-align: right; padding: 12px 15px; border-bottom: 1px solid var(--border-color); font-weight: 500; color: var(--text-secondary);">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: center;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: var(--hover-color); display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 500; color: var(--text-color);">J</div>
                            <div>
                                <div style="font-weight: 500;">John Smith</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">john@example.com</div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">Owner</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                        <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; background-color: rgba(59, 130, 246, 0.1); color: #8b5cf6;">All Access</span>
                    </td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color); text-align: right;">
                        <button class="tree-action-btn" title="Manage">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; align-items: center;">
                            <div style="width: 36px; height: 36px; border-radius: 50%; background-color: var(--hover-color); display: flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: 500; color: var(--text-color);">J</div>
                            <div>
                                <div style="font-weight: 500;">Jane Doe</div>
                                <div style="font-size: 13px; color: var(--text-secondary);">jane@example.com</div>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">Admin</td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color);">
                        <span style="display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; background-color: rgba(59, 130, 246, 0.1); color: #3b82f6;">Full Access</span>
                    </td>
                    <td style="padding: 15px; border-bottom: 1px solid var(--border-color); text-align: right;">
                        <button class="tree-action-btn" title="Manage">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    `;
    
    membersSection.appendChild(membersHeader);
    membersSection.appendChild(membersList);
    
    // Assemble the team content
    teamContent.appendChild(teamHeader);
    teamContent.appendChild(overviewSection);
    teamContent.appendChild(membersSection);
    
    // Add content to main container
    contentContainer.appendChild(teamContent);
}

// Add functions to the membershipPages object
membershipPages.showAdminPage = showAdminPage;
membershipPages.showTeamPage = showTeamPage;
membershipPages.createAdminStatCard = createAdminStatCard; 