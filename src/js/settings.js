function saveSettings() {
    const rootDirectory = document.getElementById('rootDirectory').value;
    localStorage.setItem('rootDirectory', rootDirectory);
    
    // Save ChatGPT API key
    const apiKey = document.getElementById('chatgptApiKey').value;
    localStorage.setItem('chatgptApiKey', apiKey);
    
    alert('Settings saved successfully!');
}

function loadSettings() {
    const rootDirectory = localStorage.getItem('rootDirectory') || '';
    document.getElementById('rootDirectory').value = rootDirectory;
    
    // Load ChatGPT API key
    const apiKey = localStorage.getItem('chatgptApiKey') || '';
    document.getElementById('chatgptApiKey').value = apiKey;
}

document.addEventListener('DOMContentLoaded', function() {
    // Create settings form if it doesn't exist yet
    if (!document.getElementById('settingsForm')) {
        const content = document.querySelector('.content');
        
        if (content) {
            // Create the settings container
            const settingsContainer = document.createElement('div');
            settingsContainer.className = 'settings-container';
            
            // Create the settings form
            const form = document.createElement('form');
            form.id = 'settingsForm';
            form.innerHTML = `
                <h2>Knowledge Base Settings</h2>
                <div class="form-group">
                    <label for="rootDirectory">Root Directory:</label>
                    <input type="text" id="rootDirectory" class="form-control" placeholder="Enter root directory path">
                    <small class="form-text">Full path to your knowledge base files</small>
                </div>
                
                <div class="form-group">
                    <label for="chatgptApiKey">ChatGPT API Key:</label>
                    <input type="password" id="chatgptApiKey" class="form-control" placeholder="Enter your ChatGPT API key">
                    <small class="form-text">Used for AI-powered summarization and features</small>
                </div>
                
                <button type="button" id="saveSettingsBtn" class="btn btn-primary">Save Settings</button>
            `;
            
            settingsContainer.appendChild(form);
            content.appendChild(settingsContainer);
            
            // Add event listener for save button
            document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
            
            // Style the settings form
            const style = document.createElement('style');
            style.textContent = `
                .settings-container {
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: bold;
                }
                
                .form-control {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 16px;
                }
                
                .form-text {
                    font-size: 14px;
                    color: #666;
                    margin-top: 5px;
                    display: block;
                }
                
                .btn-primary {
                    background-color: #4285f4;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                
                .btn-primary:hover {
                    background-color: #3367d6;
                }
            `;
            document.head.appendChild(style);
            
            // Load existing settings
            loadSettings();
        }
    }
}); 