// Article and File Viewer/Editor Functionality

// Community Notes functionality
let commentsVisible = false;
const commentsData = new Map(); // Maps itemId to array of comments

// Comment structure:
// {
//   id: string,
//   author: string,
//   content: string,
//   timestamp: Date,
//   likes: number,
//   dislikes: number,
//   userVote: string ('like', 'dislike', or '')
//   isRating: boolean (true if this is a rating comment)
// }

// Add articleRatings to store user ratings for each article/file
const articleRatings = new Map(); // Maps itemId to rating data {likes: number, dislikes: number, userRating: string}

// Load comments from localStorage
function loadComments() {
    try {
        const savedComments = localStorage.getItem('kb_comments');
        if (savedComments) {
            const parsed = JSON.parse(savedComments);
            
            // Convert back from JSON to Map
            Object.keys(parsed).forEach(itemId => {
                commentsData.set(itemId, parsed[itemId]);
            });
            
            console.log("Loaded comments for", commentsData.size, "items");
        }
        
        // Also load article ratings
        loadArticleRatings();
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

// Save comments to localStorage
function saveComments() {
    try {
        // Convert Map to an object for JSON serialization
        const commentsObject = {};
        commentsData.forEach((comments, itemId) => {
            commentsObject[itemId] = comments;
        });
        
        localStorage.setItem('kb_comments', JSON.stringify(commentsObject));
        console.log("Comments saved to localStorage");
    } catch (error) {
        console.error("Error saving comments:", error);
    }
}

// Generate a unique ID for a comment
function generateCommentId() {
    return 'comment_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
}

// Toggle comments panel for the current article/file
function toggleCommentsPanel() {
    const commentsPanel = document.querySelector('.comments-panel');
    
    if (commentsPanel) {
        // Hide if it exists (toggle off)
        commentsPanel.remove();
        commentsVisible = false;
    } else {
        // Show if it doesn't exist (toggle on)
        const currentItemId = document.querySelector('.editor-content')?.getAttribute('data-item-id');
        
        if (!currentItemId) {
            alert("No article or file is currently open");
            return;
        }
        
        showCommentsPanel(currentItemId);
        commentsVisible = true;
    }
}

// Show comments panel for a specific item
function showCommentsPanel(itemId) {
    // Create comments panel
    const commentsPanel = document.createElement('div');
    commentsPanel.className = 'comments-panel';
    commentsPanel.style.position = 'fixed';
    commentsPanel.style.top = '0';
    commentsPanel.style.right = '0';
    commentsPanel.style.width = '350px';
    commentsPanel.style.height = '100vh';
    commentsPanel.style.backgroundColor = 'var(--card-color)';
    commentsPanel.style.borderLeft = '1px solid var(--border-color)';
    commentsPanel.style.zIndex = '1200';
    commentsPanel.style.display = 'flex';
    commentsPanel.style.flexDirection = 'column';
    commentsPanel.style.boxShadow = '-2px 0 10px rgba(0, 0, 0, 0.1)';
    commentsPanel.style.transition = 'transform 0.3s ease';
    
    // Create panel header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '15px 20px';
    header.style.borderBottom = '1px solid var(--border-color)';
    
    const title = document.createElement('h3');
    title.textContent = 'Community Notes';
    title.style.margin = '0';
    title.style.padding = '0';
    title.style.fontSize = '18px';
    title.style.fontWeight = '500';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = 'var(--text-secondary)';
    closeButton.style.padding = '0';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    
    closeButton.addEventListener('click', () => toggleCommentsPanel());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create comments container
    const commentsContainer = document.createElement('div');
    commentsContainer.className = 'comments-container';
    commentsContainer.style.flex = '1';
    commentsContainer.style.overflowY = 'auto';
    commentsContainer.style.padding = '15px';
    
    // Get comments for this item
    const itemComments = commentsData.get(itemId) || [];
    
    // Get current user's comment if any
    const userComment = itemComments.find(comment => comment.author === 'You');
    
    // Get rating data for this item
    const ratingData = articleRatings.get(itemId) || { likes: 0, dislikes: 0, userRating: '' };
    
    // Filter out rating comments to display separately
    const regularComments = itemComments.filter(comment => !comment.isRating);
    const ratingComments = itemComments.filter(comment => comment.isRating);
    
    // Display total likes and dislikes at the top
    const ratingStats = document.createElement('div');
    ratingStats.className = 'rating-stats';
    ratingStats.style.display = 'flex';
    ratingStats.style.justifyContent = 'space-between';
    ratingStats.style.padding = '10px 15px';
    ratingStats.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
    ratingStats.style.borderBottom = '1px solid var(--border-color)';
    ratingStats.style.fontSize = '14px';
    
    // Calculate percentage
    const totalRatings = (ratingData.likes || 0) + (ratingData.dislikes || 0);
    let likePercentage = 0;
    if (totalRatings > 0) {
        likePercentage = Math.round((ratingData.likes / totalRatings) * 100);
    }
    
    const likesDisplay = document.createElement('div');
    likesDisplay.innerHTML = `<span style="margin-right: 5px;">👍</span> ${ratingData.likes || 0}`;
    
    const dislikesDisplay = document.createElement('div');
    dislikesDisplay.innerHTML = `<span style="margin-right: 5px;">👎</span> ${ratingData.dislikes || 0}`;
    
    const percentDisplay = document.createElement('div');
    
    if (totalRatings > 0) {
        percentDisplay.textContent = `${likePercentage}% helpful`;
    } else {
        percentDisplay.textContent = 'No ratings yet';
    }
    
    ratingStats.appendChild(likesDisplay);
    ratingStats.appendChild(percentDisplay);
    ratingStats.appendChild(dislikesDisplay);
    
    // If there are rating comments, add a ratings section
    if (ratingComments.length > 0) {
        const ratingsHeader = document.createElement('div');
        ratingsHeader.textContent = 'User Ratings';
        ratingsHeader.style.fontWeight = '500';
        ratingsHeader.style.marginBottom = '10px';
        ratingsHeader.style.paddingBottom = '5px';
        ratingsHeader.style.borderBottom = '1px solid var(--border-color)';
        commentsContainer.appendChild(ratingsHeader);
        
        // Add rating comments
        ratingComments.forEach(comment => {
            const commentElement = createCommentElement(comment, itemId);
            commentsContainer.appendChild(commentElement);
        });
        
        // Add divider between ratings and regular comments
        if (regularComments.length > 0) {
            const divider = document.createElement('div');
            divider.style.height = '1px';
            divider.style.backgroundColor = 'var(--border-color)';
            divider.style.margin = '20px 0';
            commentsContainer.appendChild(divider);
            
            const discussionHeader = document.createElement('div');
            discussionHeader.textContent = 'Discussion';
            discussionHeader.style.fontWeight = '500';
            discussionHeader.style.marginBottom = '10px';
            discussionHeader.style.paddingBottom = '5px';
            discussionHeader.style.borderBottom = '1px solid var(--border-color)';
            commentsContainer.appendChild(discussionHeader);
        }
    }
    
    // If no comments (either ratings or regular), show empty state
    if (itemComments.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'comments-empty-state';
        emptyState.style.textAlign = 'center';
        emptyState.style.padding = '30px 20px';
        emptyState.style.color = 'var(--text-secondary)';
        
        const emptyIcon = document.createElement('div');
        emptyIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        `;
        emptyIcon.style.marginBottom = '15px';
        emptyIcon.style.opacity = '0.5';
        
        const emptyText = document.createElement('p');
        emptyText.textContent = 'No comments yet. Be the first to add a note!';
        emptyText.style.margin = '0';
        
        emptyState.appendChild(emptyIcon);
        emptyState.appendChild(emptyText);
        commentsContainer.appendChild(emptyState);
    } else if (regularComments.length > 0) {
        // Add regular comments
        regularComments.forEach(comment => {
            const commentElement = createCommentElement(comment, itemId);
            commentsContainer.appendChild(commentElement);
        });
    }
    
    // Create new comment form
    const commentForm = document.createElement('div');
    commentForm.className = 'new-comment-form';
    commentForm.style.padding = '15px';
    commentForm.style.borderTop = '1px solid var(--border-color)';
    
    const commentInput = document.createElement('textarea');
    commentInput.placeholder = 'Add a comment or note...';
    commentInput.style.width = '100%';
    commentInput.style.padding = '10px';
    commentInput.style.borderRadius = 'var(--border-radius)';
    commentInput.style.border = '1px solid var(--border-color)';
    commentInput.style.backgroundColor = 'transparent';
    commentInput.style.color = 'var(--text-color)';
    commentInput.style.resize = 'vertical';
    commentInput.style.minHeight = '80px';
    commentInput.style.marginBottom = '10px';
    commentInput.style.boxSizing = 'border-box';
    
    // Actions row (like/dislike buttons + submit)
    const actionsRow = document.createElement('div');
    actionsRow.style.display = 'flex';
    actionsRow.style.alignItems = 'center';
    actionsRow.style.gap = '10px';
    
    // Create rating option - Small like/dislike buttons
    const ratingOptions = document.createElement('div');
    ratingOptions.className = 'rating-options';
    ratingOptions.style.display = 'flex';
    ratingOptions.style.gap = '5px';
    ratingOptions.style.marginRight = 'auto';
    
    // Create like button
    const likeButton = document.createElement('button');
    likeButton.className = 'comment-rating-btn like-btn';
    likeButton.dataset.rating = 'like';
    likeButton.innerHTML = '👍';
    likeButton.style.display = 'flex';
    likeButton.style.alignItems = 'center';
    likeButton.style.justifyContent = 'center';
    likeButton.style.width = '36px';
    likeButton.style.height = '36px';
    likeButton.style.borderRadius = 'var(--border-radius)';
    likeButton.style.cursor = 'pointer';
    likeButton.style.background = 'none';
    likeButton.style.border = '1px solid var(--border-color)';
    likeButton.style.fontSize = '18px';
    likeButton.title = 'I like this content';
    
    // Create dislike button
    const dislikeButton = document.createElement('button');
    dislikeButton.className = 'comment-rating-btn dislike-btn';
    dislikeButton.dataset.rating = 'dislike';
    dislikeButton.innerHTML = '👎';
    dislikeButton.style.display = 'flex';
    dislikeButton.style.alignItems = 'center';
    dislikeButton.style.justifyContent = 'center';
    dislikeButton.style.width = '36px';
    dislikeButton.style.height = '36px';
    dislikeButton.style.borderRadius = 'var(--border-radius)';
    dislikeButton.style.cursor = 'pointer';
    dislikeButton.style.background = 'none';
    dislikeButton.style.border = '1px solid var(--border-color)';
    dislikeButton.style.fontSize = '18px';
    dislikeButton.title = 'I dislike this content';
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.className = 'submit-comment-btn';
    submitButton.textContent = userComment ? 'Edit Comment' : 'Post Comment';
    submitButton.style.padding = '8px 16px';
    submitButton.style.backgroundColor = 'var(--button-blue)';
    submitButton.style.color = 'white';
    submitButton.style.border = 'none';
    submitButton.style.borderRadius = 'var(--border-radius)';
    submitButton.style.cursor = 'pointer';
    submitButton.style.fontWeight = '500';
    submitButton.style.flexGrow = '1';
    
    // Variable to track the selected rating
    let selectedRating = userComment?.ratingType || null;
    
    // If user already has a rating, highlight the appropriate button
    if (selectedRating === 'like') {
        likeButton.style.backgroundColor = 'rgba(100, 197, 255, 0.1)';
        likeButton.style.borderColor = 'var(--primary-color)';
        likeButton.style.color = 'var(--primary-color)';
    } else if (selectedRating === 'dislike') {
        dislikeButton.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
        dislikeButton.style.borderColor = '#ff4444';
        dislikeButton.style.color = '#ff4444';
    }
    
    // Add click listeners to rating buttons
    likeButton.addEventListener('click', () => {
        if (selectedRating === 'like') {
            // Deselect
            selectedRating = null;
            likeButton.style.backgroundColor = 'transparent';
            likeButton.style.borderColor = 'var(--border-color)';
            likeButton.style.color = 'inherit';
        } else {
            // Select like
            selectedRating = 'like';
            likeButton.style.backgroundColor = 'rgba(100, 197, 255, 0.1)';
            likeButton.style.borderColor = 'var(--primary-color)';
            likeButton.style.color = 'var(--primary-color)';
            
            // Deselect dislike
            dislikeButton.style.backgroundColor = 'transparent';
            dislikeButton.style.borderColor = 'var(--border-color)';
            dislikeButton.style.color = 'inherit';
        }
    });
    
    dislikeButton.addEventListener('click', () => {
        if (selectedRating === 'dislike') {
            // Deselect
            selectedRating = null;
            dislikeButton.style.backgroundColor = 'transparent';
            dislikeButton.style.borderColor = 'var(--border-color)';
            dislikeButton.style.color = 'inherit';
        } else {
            // Select dislike
            selectedRating = 'dislike';
            dislikeButton.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
            dislikeButton.style.borderColor = '#ff4444';
            dislikeButton.style.color = '#ff4444';
            
            // Deselect like
            likeButton.style.backgroundColor = 'transparent';
            likeButton.style.borderColor = 'var(--border-color)';
            likeButton.style.color = 'inherit';
        }
    });
    
    // Pre-fill the form if user is editing their comment
    if (userComment) {
        commentInput.value = userComment.content;
    }
    
    // Submit button click handler
    submitButton.addEventListener('click', () => {
        const content = commentInput.value.trim();
        if (!content) {
            alert('Please enter a comment before posting.');
            return;
        }
        
        if (!selectedRating) {
            alert('Please select whether you like or dislike this content.');
            return;
        }
        
        // Check if in reply mode
        if (commentForm.dataset.replyMode === 'true') {
            // Handle reply
            const replyToCommentId = commentForm.dataset.replyToCommentId;
            const parentComment = itemComments.find(comment => comment.id === replyToCommentId);
            
            if (!parentComment) {
                alert('The comment you are replying to cannot be found.');
                return;
            }
            
            // Create reply comment
            const replyComment = {
                id: generateCommentId(),
                author: 'You',
                content: content,
                timestamp: new Date(),
                likes: 0,
                dislikes: 0,
                userVote: '',
                isRating: false,
                isReply: true,
                parentCommentId: replyToCommentId
            };
            
            // Add to comments data
            if (!commentsData.has(itemId)) {
                commentsData.set(itemId, []);
            }
            commentsData.get(itemId).push(replyComment);
            
            // Save comments
            saveComments();
            
            // Reset form
            resetCommentForm(commentForm, submitButton, ratingOptions, commentInput);
            
            // Show notification
            alert('Your reply has been posted.');
            
            // Refresh comments panel
            toggleCommentsPanel(); // Close
            toggleCommentsPanel(); // Open again with fresh data
            
            return;
        }
        
        // Original behavior for non-reply comments
        if (userComment) {
            // Update existing comment
            userComment.content = content;
            userComment.ratingType = selectedRating;
            userComment.timestamp = new Date(); // Update timestamp
            
            // Update the ratings count
            updateRatingCounts(itemId, userComment.ratingType, userComment.ratingType);
            
            // Save the updated comments
            saveComments();
            
            // Show a notification
            alert('Your comment has been updated.');
        } else {
            // Create new comment
            const newComment = {
                id: generateCommentId(),
                author: 'You', // In a real app, would be the current user
                content: content,
                timestamp: new Date(),
                likes: 0,
                dislikes: 0,
                userVote: '',
                isRating: true,
                ratingType: selectedRating
            };
            
            // Add to comments data
            if (!commentsData.has(itemId)) {
                commentsData.set(itemId, []);
            }
            commentsData.get(itemId).push(newComment);
            
            // Update the ratings count
            updateRatingCounts(itemId, null, selectedRating);
            
            // Save comments
            saveComments();
            
            // Update the submit button to "Edit Comment"
            submitButton.textContent = 'Edit Comment';
        }
        
        // Refresh the panel to show the updated comments
        toggleCommentsPanel(); // Close
        toggleCommentsPanel(); // Open again with fresh data
    });
    
    // Assemble the actions row
    ratingOptions.appendChild(likeButton);
    ratingOptions.appendChild(dislikeButton);
    actionsRow.appendChild(ratingOptions);
    actionsRow.appendChild(submitButton);
    
    commentForm.appendChild(commentInput);
    commentForm.appendChild(actionsRow);
    
    // Assemble panel
    commentsPanel.appendChild(header);
    commentsPanel.appendChild(ratingStats);
    commentsPanel.appendChild(commentsContainer);
    commentsPanel.appendChild(commentForm);
    
    // Add to document
    document.body.appendChild(commentsPanel);
}

// Function to update rating counts when a user changes their rating
function updateRatingCounts(itemId, oldRating, newRating) {
    // Get or create rating data
    let ratingData = articleRatings.get(itemId);
    if (!ratingData) {
        ratingData = { likes: 0, dislikes: 0, userRating: '' };
        articleRatings.set(itemId, ratingData);
    }
    
    // Handle old rating (reduce count)
    if (oldRating === 'like') {
        ratingData.likes = Math.max(0, ratingData.likes - 1);
    } else if (oldRating === 'dislike') {
        ratingData.dislikes = Math.max(0, ratingData.dislikes - 1);
    }
    
    // Handle new rating (increase count)
    if (newRating === 'like') {
        ratingData.likes++;
        ratingData.userRating = 'like';
    } else if (newRating === 'dislike') {
        ratingData.dislikes++;
        ratingData.userRating = 'dislike';
    } else {
        ratingData.userRating = '';
    }
    
    // Save the updated ratings
    saveArticleRatings();
}

// Modify the comment element creation to better handle rating comments
function createCommentElement(comment, itemId) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';
    commentElement.dataset.commentId = comment.id;
    commentElement.style.marginBottom = '15px';
    commentElement.style.padding = '12px';
    commentElement.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
    commentElement.style.borderRadius = 'var(--border-radius)';
    commentElement.style.border = '1px solid var(--border-color)';
    
    // For rating comments, add a special border color and indicator
    if (comment.isRating) {
        commentElement.style.borderLeft = comment.ratingType === 'like' 
            ? '4px solid var(--primary-color)' 
            : '4px solid #ff4444';
    }
    
    // For reply comments, add indentation and visual indicator
    if (comment.isReply) {
        commentElement.style.marginLeft = '20px';
        commentElement.style.borderLeft = '2px solid var(--border-color)';
        commentElement.style.position = 'relative';
        
        // Add a vertical line to connect to parent comment
        const replyConnector = document.createElement('div');
        replyConnector.style.position = 'absolute';
        replyConnector.style.left = '-10px';
        replyConnector.style.top = '0';
        replyConnector.style.width = '8px';
        replyConnector.style.height = '50%';
        replyConnector.style.borderLeft = '2px solid var(--border-color)';
        replyConnector.style.borderBottom = '2px solid var(--border-color)';
        replyConnector.style.borderBottomLeftRadius = '5px';
        commentElement.appendChild(replyConnector);
    }
    
    const commentHeader = document.createElement('div');
    commentHeader.style.display = 'flex';
    commentHeader.style.justifyContent = 'space-between';
    commentHeader.style.alignItems = 'center';
    commentHeader.style.marginBottom = '8px';
    
    const authorElement = document.createElement('div');
    authorElement.style.fontWeight = '500';
    
    // For rating comments, add the rating type emoji
    if (comment.isRating) {
        authorElement.innerHTML = `${comment.author} <span style="margin-left: 5px;">${comment.ratingType === 'like' ? '👍' : '👎'}</span>`;
    } else if (comment.isReply) {
        // For replies, add "Replying to" text
        const parentCommentId = comment.parentCommentId;
        const parentAuthor = getCommentAuthorById(itemId, parentCommentId) || 'Unknown';
        authorElement.innerHTML = `${comment.author} <span style="color: var(--text-secondary); font-size: 12px; font-weight: normal; margin-left: 5px;">Replying to ${parentAuthor}</span>`;
    } else {
        authorElement.textContent = comment.author;
    }
    
    const timeElement = document.createElement('div');
    timeElement.style.fontSize = '12px';
    timeElement.style.color = 'var(--text-secondary)';
    timeElement.textContent = formatCommentDate(comment.timestamp);
    
    commentHeader.appendChild(authorElement);
    commentHeader.appendChild(timeElement);
    
    const commentContent = document.createElement('div');
    commentContent.className = 'comment-content';
    commentContent.style.marginBottom = '10px';
    commentContent.style.lineHeight = '1.5';
    commentContent.style.wordBreak = 'break-word';
    commentContent.textContent = comment.content;
    
    const commentFooter = document.createElement('div');
    commentFooter.style.display = 'flex';
    commentFooter.style.alignItems = 'center';
    commentFooter.style.gap = '15px';
    
    // Like button
    const likeButton = document.createElement('button');
    likeButton.className = 'comment-like-btn';
    likeButton.dataset.action = 'like';
    likeButton.style.display = 'flex';
    likeButton.style.alignItems = 'center';
    likeButton.style.gap = '5px';
    likeButton.style.background = 'none';
    likeButton.style.border = 'none';
    likeButton.style.padding = '3px 8px';
    likeButton.style.borderRadius = '4px';
    likeButton.style.cursor = 'pointer';
    likeButton.style.color = comment.userVote === 'like' ? 'var(--primary-color)' : 'var(--text-secondary)';
    likeButton.style.fontWeight = comment.userVote === 'like' ? '500' : 'normal';
    
    likeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 10v12"></path>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
        </svg>
        <span>${comment.likes}</span>
    `;
    
    // Dislike button
    const dislikeButton = document.createElement('button');
    dislikeButton.className = 'comment-dislike-btn';
    dislikeButton.dataset.action = 'dislike';
    dislikeButton.style.display = 'flex';
    dislikeButton.style.alignItems = 'center';
    dislikeButton.style.gap = '5px';
    dislikeButton.style.background = 'none';
    dislikeButton.style.border = 'none';
    dislikeButton.style.padding = '3px 8px';
    dislikeButton.style.borderRadius = '4px';
    dislikeButton.style.cursor = 'pointer';
    dislikeButton.style.color = comment.userVote === 'dislike' ? '#ff4444' : 'var(--text-secondary)';
    dislikeButton.style.fontWeight = comment.userVote === 'dislike' ? '500' : 'normal';
    
    dislikeButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 14V2"></path>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
        </svg>
        <span>${comment.dislikes}</span>
    `;
    
    // Reply button
    const replyButton = document.createElement('button');
    replyButton.className = 'comment-reply-btn';
    replyButton.style.display = 'flex';
    replyButton.style.alignItems = 'center';
    replyButton.style.gap = '5px';
    replyButton.style.background = 'none';
    replyButton.style.border = 'none';
    replyButton.style.padding = '3px 8px';
    replyButton.style.borderRadius = '4px';
    replyButton.style.cursor = 'pointer';
    replyButton.style.color = 'var(--text-secondary)';
    replyButton.style.marginLeft = 'auto';
    
    replyButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 10 20 15 15 20"></polyline>
            <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
        </svg>
        <span>Reply</span>
    `;
    
    // Add action buttons if the current user is the comment author
    if (comment.author === 'You') {
        // Delete button for all comment types
        const deleteButton = document.createElement('button');
        deleteButton.className = 'comment-delete-btn';
        deleteButton.style.display = 'flex';
        deleteButton.style.alignItems = 'center';
        deleteButton.style.gap = '5px';
        deleteButton.style.background = 'none';
        deleteButton.style.border = 'none';
        deleteButton.style.padding = '3px 8px';
        deleteButton.style.borderRadius = '4px';
        deleteButton.style.cursor = 'pointer';
        deleteButton.style.color = '#ff4444';
        
        deleteButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
        `;
        
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this comment?')) {
                deleteComment(comment.id, itemId);
            }
        });
        
        // Edit button for reply comments only
        if (comment.isReply) {
            const editButton = document.createElement('button');
            editButton.className = 'comment-edit-btn';
            editButton.style.display = 'flex';
            editButton.style.alignItems = 'center';
            editButton.style.gap = '5px';
            editButton.style.background = 'none';
            editButton.style.border = 'none';
            editButton.style.padding = '3px 8px';
            editButton.style.borderRadius = '4px';
            editButton.style.cursor = 'pointer';
            editButton.style.color = 'var(--text-secondary)';
            
            editButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            `;
            
            editButton.addEventListener('click', () => {
                editReplyComment(comment, itemId);
            });
            
            // Add edit button before delete button
            commentFooter.appendChild(editButton);
        }
        
        commentFooter.appendChild(deleteButton);
    }
    
    // Add event listeners for like/dislike buttons
    likeButton.addEventListener('click', () => handleCommentVote(comment, itemId, 'like'));
    dislikeButton.addEventListener('click', () => handleCommentVote(comment, itemId, 'dislike'));
    
    replyButton.addEventListener('click', () => {
        // Find the comment form and elements
        const commentForm = document.querySelector('.new-comment-form');
        const commentInput = commentForm.querySelector('textarea');
        const submitButton = commentForm.querySelector('.submit-comment-btn');
        const ratingOptions = commentForm.querySelector('.rating-options');
        const likeButton = ratingOptions.querySelector('.like-btn');
        const dislikeButton = ratingOptions.querySelector('.dislike-btn');
        
        if (commentForm) {
            // Switch the form to reply mode
            commentForm.dataset.replyMode = 'true';
            commentForm.dataset.replyToCommentId = comment.id;
            
            // Set placeholder and pre-fill with @author
            commentInput.placeholder = `Reply to ${comment.author}...`;
            commentInput.value = `@${comment.author} `;
            commentInput.focus();
            
            // Change submit button text
            submitButton.textContent = 'Reply to Post';
            
            // Gray out the rating buttons
            likeButton.style.opacity = '0.3';
            likeButton.style.cursor = 'not-allowed';
            dislikeButton.style.opacity = '0.3';
            dislikeButton.style.cursor = 'not-allowed';
            
            // Disable the rating buttons
            likeButton.disabled = true;
            dislikeButton.disabled = true;
            
            // Add a cancel reply button
            if (!commentForm.querySelector('.cancel-reply-btn')) {
                const cancelButton = document.createElement('button');
                cancelButton.className = 'cancel-reply-btn';
                cancelButton.textContent = 'Cancel';
                cancelButton.style.marginRight = '10px';
                cancelButton.style.padding = '8px 16px';
                cancelButton.style.backgroundColor = 'transparent';
                cancelButton.style.color = 'var(--text-color)';
                cancelButton.style.border = '1px solid var(--border-color)';
                cancelButton.style.borderRadius = 'var(--border-radius)';
                cancelButton.style.cursor = 'pointer';
                
                cancelButton.addEventListener('click', () => {
                    resetCommentForm(commentForm, submitButton, ratingOptions, commentInput);
                });
                
                submitButton.parentNode.insertBefore(cancelButton, submitButton);
            }
        }
    });
    
    commentFooter.appendChild(likeButton);
    commentFooter.appendChild(dislikeButton);
    commentFooter.appendChild(replyButton);
    
    commentElement.appendChild(commentHeader);
    commentElement.appendChild(commentContent);
    commentElement.appendChild(commentFooter);
    
    return commentElement;
}

// Function to get a comment author by ID
function getCommentAuthorById(itemId, commentId) {
    const comments = commentsData.get(itemId) || [];
    const comment = comments.find(c => c.id === commentId);
    return comment ? comment.author : null;
}

// Function to delete a comment
function deleteComment(commentId, itemId) {
    const comments = commentsData.get(itemId) || [];
    
    // Find comment index
    const commentIndex = comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return;
    
    // Get the comment to check if it's a rating comment
    const comment = comments[commentIndex];
    
    // If it's a rating comment, update the rating counts
    if (comment.isRating) {
        updateRatingCounts(itemId, comment.ratingType, null);
    }
    
    // Also remove all replies to this comment if it's not a reply itself
    if (!comment.isReply) {
        const replyIndices = [];
        for (let i = 0; i < comments.length; i++) {
            if (comments[i].isReply && comments[i].parentCommentId === commentId) {
                replyIndices.push(i);
            }
        }
        
        // Remove replies in reverse order to avoid index shifting
        for (let i = replyIndices.length - 1; i >= 0; i--) {
            comments.splice(replyIndices[i], 1);
        }
    }
    
    // Remove the comment
    comments.splice(commentIndex, 1);
    
    // Save comments
    saveComments();
    
    // Refresh the comments panel
    toggleCommentsPanel();
    toggleCommentsPanel();
}

// Function to edit a reply comment
function editReplyComment(comment, itemId) {
    // Find the comment element
    const commentElement = document.querySelector(`.comment-item[data-comment-id="${comment.id}"]`);
    if (!commentElement) return;
    
    // Get the content element
    const contentElement = commentElement.querySelector('.comment-content');
    if (!contentElement) return;
    
    // Create an editable textarea
    const textarea = document.createElement('textarea');
    textarea.style.width = '100%';
    textarea.style.padding = '10px';
    textarea.style.borderRadius = 'var(--border-radius)';
    textarea.style.border = '1px solid var(--border-color)';
    textarea.style.backgroundColor = 'transparent';
    textarea.style.color = 'var(--text-color)';
    textarea.style.resize = 'vertical';
    textarea.style.minHeight = '80px';
    textarea.style.marginBottom = '10px';
    textarea.style.boxSizing = 'border-box';
    textarea.value = comment.content;
    
    // Create save and cancel buttons
    const actionButtons = document.createElement('div');
    actionButtons.style.display = 'flex';
    actionButtons.style.gap = '10px';
    actionButtons.style.marginBottom = '10px';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.style.padding = '6px 12px';
    saveButton.style.backgroundColor = 'var(--button-blue)';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = 'var(--border-radius)';
    saveButton.style.cursor = 'pointer';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '6px 12px';
    cancelButton.style.backgroundColor = 'transparent';
    cancelButton.style.color = 'var(--text-color)';
    cancelButton.style.border = '1px solid var(--border-color)';
    cancelButton.style.borderRadius = 'var(--border-radius)';
    cancelButton.style.cursor = 'pointer';
    
    actionButtons.appendChild(saveButton);
    actionButtons.appendChild(cancelButton);
    
    // Hide the original content
    const originalContent = contentElement.textContent;
    contentElement.textContent = '';
    
    // Add the textarea and buttons
    contentElement.appendChild(textarea);
    contentElement.appendChild(actionButtons);
    
    // Set focus to the textarea
    textarea.focus();
    
    // Save button click handler
    saveButton.addEventListener('click', () => {
        const newContent = textarea.value.trim();
        if (!newContent) {
            alert('Comment cannot be empty.');
            return;
        }
        
        // Update the comment in the data
        comment.content = newContent;
        comment.timestamp = new Date(); // Update timestamp
        
        // Save comments
        saveComments();
        
        // Restore content element
        contentElement.textContent = newContent;
        
        // Refresh comment timestamp display
        const timeElement = commentElement.querySelector('div:nth-child(1) > div:nth-child(2)');
        if (timeElement) {
            timeElement.textContent = formatCommentDate(comment.timestamp);
        }
    });
    
    // Cancel button click handler
    cancelButton.addEventListener('click', () => {
        contentElement.textContent = originalContent;
    });
}

// Add helper function to reset comment form
function resetCommentForm(commentForm, submitButton, ratingOptions, commentInput) {
    // Get the buttons if not passed
    if (!submitButton) submitButton = commentForm.querySelector('.submit-comment-btn');
    if (!ratingOptions) ratingOptions = commentForm.querySelector('.rating-options');
    if (!commentInput) commentInput = commentForm.querySelector('textarea');
    
    const likeButton = ratingOptions.querySelector('.like-btn');
    const dislikeButton = ratingOptions.querySelector('.dislike-btn');
    const cancelButton = commentForm.querySelector('.cancel-reply-btn');
    
    // Reset form mode
    commentForm.dataset.replyMode = 'false';
    delete commentForm.dataset.replyToCommentId;
    
    // Reset placeholder and clear input
    commentInput.placeholder = 'Add a comment or note...';
    commentInput.value = '';
    
    // Reset submit button text
    const userComment = getCurrentUserComment();
    submitButton.textContent = userComment ? 'Edit Comment' : 'Post Comment';
    
    // Re-enable rating buttons
    likeButton.style.opacity = '1';
    likeButton.style.cursor = 'pointer';
    dislikeButton.style.opacity = '1';
    dislikeButton.style.cursor = 'pointer';
    likeButton.disabled = false;
    dislikeButton.disabled = false;
    
    // Remove cancel button if present
    if (cancelButton) {
        cancelButton.remove();
    }
}

// Helper function to get current user's comment
function getCurrentUserComment() {
    const itemId = getCurrentItemId();
    if (!itemId) return null;
    
    const itemComments = commentsData.get(itemId) || [];
    return itemComments.find(comment => comment.author === 'You');
}

// Helper function to get current item ID
function getCurrentItemId() {
    // Look for data attributes on the editor or content
    const editor = document.querySelector('.editor-content');
    if (editor && editor.dataset.itemId) {
        return editor.dataset.itemId;
    }
    
    // If an article is currently open, we might have the item ID elsewhere
    // This is a fallback and would need to be customized based on your app structure
    return window.currentItemId || null;
}

// Format timestamp for comment
function formatCommentDate(timestamp) {
    if (!(timestamp instanceof Date)) {
        timestamp = new Date(timestamp);
    }
    
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffSec < 60) {
        return 'Just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    } else if (diffHr < 24) {
        return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
        return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
        return timestamp.toLocaleDateString();
    }
}

// Handle vote on a comment
function handleCommentVote(comment, itemId, voteType) {
    const comments = commentsData.get(itemId);
    if (!comments) return;
    
    // Find the comment in the array
    const commentIndex = comments.findIndex(c => c.id === comment.id);
    if (commentIndex === -1) return;
    
    const updatedComment = { ...comments[commentIndex] };
    
    // Update vote counts
    if (updatedComment.userVote === voteType) {
        // Clicking the same button again removes the vote
        if (voteType === 'like') {
            updatedComment.likes--;
        } else {
            updatedComment.dislikes--;
        }
        updatedComment.userVote = '';
    } else {
        // If changing vote, adjust both counters
        if (updatedComment.userVote === 'like' && voteType === 'dislike') {
            updatedComment.likes--;
            updatedComment.dislikes++;
        } else if (updatedComment.userVote === 'dislike' && voteType === 'like') {
            updatedComment.likes++;
            updatedComment.dislikes--;
        } else if (voteType === 'like') {
            updatedComment.likes++;
        } else {
            updatedComment.dislikes++;
        }
        updatedComment.userVote = voteType;
    }
    
    // Update in data
    comments[commentIndex] = updatedComment;
    
    // Save comments
    saveComments();
    
    // Update in UI
    const commentElement = document.querySelector(`.comment-item[data-comment-id="${comment.id}"]`);
    if (commentElement) {
        const likeButton = commentElement.querySelector('.comment-like-btn');
        const dislikeButton = commentElement.querySelector('.comment-dislike-btn');
        
        // Update like button
        likeButton.style.color = updatedComment.userVote === 'like' ? 'var(--primary-color)' : 'var(--text-secondary)';
        likeButton.style.fontWeight = updatedComment.userVote === 'like' ? '500' : 'normal';
        likeButton.querySelector('span').textContent = updatedComment.likes;
        
        // Update dislike button
        dislikeButton.style.color = updatedComment.userVote === 'dislike' ? '#ff4444' : 'var(--text-secondary)';
        dislikeButton.style.fontWeight = updatedComment.userVote === 'dislike' ? '500' : 'normal';
        dislikeButton.querySelector('span').textContent = updatedComment.dislikes;
    }
}

// Utility functions
function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatFileSize(bytes) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extract file extension from a file name
 * @param {string} filename - The file name
 * @returns {string} - The file extension (lowercase)
 */
function getFileExtension(filename) {
    if (!filename) return '';
    return filename.split('.').pop().toLowerCase();
}

/**
 * Creates a data URL from file content
 * @param {Object} item - The file item
 * @returns {string|null} - Data URL or null if invalid
 */
function getDataUrlFromContent(item) {
    if (!item || !item.content) return null;
    
    // If content is already a data URL, return it
    if (item.content.startsWith('data:')) {
        return item.content;
    }
    
    // Try to create a data URL based on file type
    try {
        const fileType = item.fileType || getMimeTypeFromExtension(getFileExtension(item.name));
        return `data:${fileType};base64,${item.content}`;
    } catch (error) {
        console.error('Error creating data URL:', error);
        return null;
    }
}

/**
 * Get MIME type from file extension
 * @param {string} extension - File extension
 * @returns {string} - MIME type
 */
function getMimeTypeFromExtension(extension) {
    const mimeTypes = {
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript',
        'json': 'application/json',
        'xml': 'application/xml',
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'webp': 'image/webp',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
}

/**
 * Downloads a file
 * @param {Object} item - The file item
 */
function downloadFile(item) {
    if (!item) return;
    
    try {
        // If the file is stored in the file system
        if (item.storagePath) {
            // If we're in a browser extension context
            if (chrome && chrome.runtime) {
                // Generate a URL to the file in the extension
                const fileUrl = chrome.runtime.getURL(item.storagePath);
                
                // Create a temporary anchor element
                const a = document.createElement('a');
                a.href = fileUrl;
                a.download = item.name;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            // For non-extension contexts, we would use the FileSystem API
        }
        // If the file content is in localStorage
        else if (item.content) {
            // Create a data URL from the content
            const dataUrl = getDataUrlFromContent(item);
            if (!dataUrl) {
                showNotification('Unable to download file. Invalid content.', 'error');
                return;
            }
            
            // Create a temporary anchor element
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = item.name;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        // If content is stored externally and we need to fetch it
        else if (item.contentStoredExternally && window.FileStorageSystem) {
            window.FileStorageSystem.getFileFromStorage(item.storagePath)
                .then(fileData => {
                    if (!fileData) {
                        showNotification('Unable to download file. Could not retrieve file data.', 'error');
                        return;
                    }
                    
                    // Create a Blob from the file data
                    const blob = new Blob([fileData], { type: item.fileType || getMimeTypeFromExtension(getFileExtension(item.name)) });
                    const url = URL.createObjectURL(blob);
                    
                    // Create a temporary anchor element
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = item.name;
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    
                    // Clean up the URL object
                    setTimeout(() => URL.revokeObjectURL(url), 100);
                })
                .catch(error => {
                    console.error('Error downloading file:', error);
                    showNotification('Error downloading file. Please try again.', 'error');
                });
        }
        else {
            showNotification('Unable to download file. File not found.', 'error');
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        showNotification('Error downloading file. Please try again.', 'error');
    }
}

// Function to view article or file content
function viewArticleOrFile(id, row) {
    console.log("Viewing item:", id);
    
    // Get the item type
    const isFile = row.classList.contains('file-row');
    const itemType = isFile ? 'file' : 'article';
    
    // Find the item in the data
    let item = null;
    
    try {
        // This is a simplified approach - you'll need to adapt this
        if (typeof books !== 'undefined' && typeof selectedBookId !== 'undefined') {
            const currentBook = books.get(selectedBookId);
            if (currentBook && currentBook.contents) {
                // Recursive function to find item by ID
                function findItemById(items, id) {
                    if (!items || !Array.isArray(items)) return null;
                    
                    for (const item of items) {
                        if (item.id === id) return item;
                        
                        // If item has children, search them
                        if (item.children && Array.isArray(item.children)) {
                            const found = findItemById(item.children, id);
                            if (found) return found;
                        }
                        
                        // If item has items, search them too (alternative structure)
                        if (item.items && Array.isArray(item.items)) {
                            const found = findItemById(item.items, id);
                            if (found) return found;
                        }
                    }
                    
                    return null;
                }
                
                item = findItemById(currentBook.contents, id);
            }
        }
    } catch (error) {
        console.error("Error finding item:", error);
    }
    
    if (!item) {
        console.warn(`Item with ID ${id} not found`);
        // Fallback: Create a basic item object with data from the row
        item = {
            id: id,
            type: itemType,
            name: row.querySelector(`.${itemType}-name`)?.textContent || "Untitled",
            content: ""
        };
    }
    
    // Check if we're dealing with a file
    if (isFile || item.type === 'file') {
        // For files, open a file preview instead of the article editor
        openFilePreview(item, id, row);
        return;
    }
    
    // For articles, continue with the article editor
    const articleEditor = document.getElementById('articleEditor');
    if (!articleEditor) {
        console.error("Article editor not found in the DOM");
        return;
    }
    
    // Show the editor
    articleEditor.classList.add('active');
    
    // Set title
    const titleInput = document.getElementById('articleTitleInput');
    if (titleInput) {
        titleInput.value = item.title || item.name || "Untitled";
    }
    
    // Get editor content container
    const editorContent = document.querySelector('.editor-content');
    if (!editorContent) {
        console.error("Editor content container not found");
        return;
    }
    
    // Important: Store the item ID and type in the editor content
    // This allows us to reference it when saving
    editorContent.setAttribute('data-item-id', id);
    editorContent.setAttribute('data-item-type', 'article');
    
    // Handle article content (HTML)
    handleArticleContent(item, editorContent);
    
    // Set status
    const publishedOption = document.querySelector('.status-option.published');
    const draftOption = document.querySelector('.status-option.draft');
    
    if (publishedOption && draftOption) {
        const status = item.status || 'draft';
        
        if (status === 'published') {
            publishedOption.classList.add('active');
            draftOption.classList.remove('active');
        } else {
            draftOption.classList.add('active');
            publishedOption.classList.remove('active');
        }
    }
    
    // Close any open comments panel
    const existingCommentsPanel = document.querySelector('.comments-panel');
    if (existingCommentsPanel) {
        existingCommentsPanel.remove();
        commentsVisible = false;
    }
}

// Function to open a file preview for files instead of the article editor
function openFilePreview(item, id, row) {
    console.log("Opening file preview for:", item.name);
    
    // Close article editor if it's open
    const articleEditor = document.getElementById('articleEditor');
    if (articleEditor && articleEditor.classList.contains('active')) {
        articleEditor.classList.remove('active');
    }
    
    // Use the existing PreviewViewer class to display the file
    if (typeof window.PreviewViewer === 'undefined') {
        console.error('PreviewViewer is not available');
        return;
    }
    
    // If we don't have a preview viewer instance yet, create one
    if (!window.previewViewerInstance) {
        window.previewViewerInstance = new window.PreviewViewer();
    }
    
    // Prepare the file data for the PreviewViewer
    const fileData = {
        name: item.name,
        url: item.contentUrl || item.content, // Try to use contentUrl, fall back to content
        id: id,
        type: item.type,
        item: item // Pass the entire item for reference
    };
    
    // Add a file type badge to the preview viewer's title element (after it opens)
    window.previewViewerInstance.open(fileData).then(() => {
        // Add the file tag after the preview is opened
        const titleElement = window.previewViewerInstance.modal.querySelector('.preview-title');
        if (titleElement) {
            // Create file tag
            const fileTag = document.createElement('span');
            fileTag.className = 'status-tag file';
            fileTag.textContent = 'File';
            fileTag.style.marginLeft = '10px';
            fileTag.style.fontSize = '12px';
            fileTag.style.fontWeight = 'bold';
            fileTag.style.padding = '3px 8px';
            fileTag.style.borderRadius = '4px';
            fileTag.style.backgroundColor = '#4CAF50';
            fileTag.style.color = 'white';
            
            // Insert after the title
            titleElement.parentNode.insertBefore(fileTag, titleElement.nextSibling);
        }
        
        // Add convert to article button
        const previewControls = window.previewViewerInstance.modal.querySelector('.preview-controls');
        if (previewControls) {
            // Check if the button already exists
            if (!previewControls.querySelector('.convert-to-article-btn')) {
                const convertBtn = document.createElement('button');
                convertBtn.className = 'convert-to-article-btn';
                convertBtn.textContent = 'Convert to Article';
                convertBtn.style.marginRight = '10px';
                convertBtn.style.padding = '5px 10px';
                convertBtn.style.border = 'none';
                convertBtn.style.borderRadius = '4px';
                convertBtn.style.backgroundColor = 'var(--button-blue)';
                convertBtn.style.color = 'white';
                convertBtn.style.cursor = 'pointer';
                convertBtn.style.fontSize = '14px';
                
                // Insert before the close button
                const closeBtn = previewControls.querySelector('.preview-close-btn');
                if (closeBtn) {
                    previewControls.insertBefore(convertBtn, closeBtn);
                } else {
                    previewControls.appendChild(convertBtn);
                }
                
                // Add event listener for convert button
                convertBtn.addEventListener('click', () => {
                    // Close the preview
                    window.previewViewerInstance.close();
                    
                    // Change the item type to article and open in article editor
                    item.type = 'article';
                    
                    // Now call viewArticleOrFile again, it will open as an article
                    const articleEditor = document.getElementById('articleEditor');
                    if (articleEditor) {
                        articleEditor.classList.add('active');
                        
                        // Set title
                        const titleInput = document.getElementById('articleTitleInput');
                        if (titleInput) {
                            titleInput.value = item.title || item.name || "Untitled";
                        }
                        
                        // Get editor content container
                        const editorContent = document.querySelector('.editor-content');
                        if (editorContent) {
                            // Store the item ID and type
                            editorContent.setAttribute('data-item-id', id);
                            editorContent.setAttribute('data-item-type', 'article');
                            
                            // Set empty content or convert file content to article format
                            handleArticleContent(item, editorContent);
                            
                            // Update the data in storage to reflect type change
                            if (selectedBookId && bookCategories.has(selectedBookId)) {
                                const categories = bookCategories.get(selectedBookId);
                                if (categories.has(id)) {
                                    const updatedItem = categories.get(id);
                                    updatedItem.type = 'article';
                                    categories.set(id, updatedItem);
                                    saveData();
                                }
                            }
                        }
                    }
                });
            }
        }
    });
}

// Helper function to handle article content
function handleArticleContent(item, editorContent) {
    // For articles, set the content and make it editable
    if (editorContent) {
        editorContent.setAttribute('contenteditable', 'true');
        editorContent.innerHTML = item.content || '<p>Start writing your article here...</p>';
    }
    
    // Show appropriate editor controls
    document.querySelectorAll('.toolbar-button').forEach(btn => {
        btn.style.display = 'flex';
    });
}

// Helper function to handle file content
function handleFileContent(item, editorContent) {
    if (editorContent) {
        editorContent.setAttribute('contenteditable', 'false');
        
        // Get file extension from name
        const fileExtension = getFileExtension(item.name);
        
        // Check if file is stored externally in the storage system
        const fileUrl = item.storagePath ? 
            chrome.runtime.getURL(item.storagePath) : 
            (item.contentStoredExternally ? null : getDataUrlFromContent(item));
            
        // Add download button for all file types
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-file-btn';
        downloadBtn.textContent = 'Download File';
        downloadBtn.style.padding = '10px 20px';
        downloadBtn.style.marginBottom = '20px';
        downloadBtn.style.backgroundColor = 'var(--button-blue)';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = 'var(--border-radius)';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.display = 'block';
        
        // Handle download functionality
        downloadBtn.addEventListener('click', function() {
            downloadFile(item);
        });
        
        // Display the file information first
        const fileInfoDiv = document.createElement('div');
        fileInfoDiv.className = 'file-info';
        fileInfoDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>Size: ${formatFileSize(item.size)}</p>
            <p>Type: ${item.fileType || 'Unknown'}</p>
            <p>Uploaded: ${new Date(item.createdAt).toLocaleString()}</p>
        `;
        
        // Clear editor content
        editorContent.innerHTML = '';
        
        // Add file info and download button
        editorContent.appendChild(fileInfoDiv);
        editorContent.appendChild(downloadBtn);
        
        switch(fileExtension) {
            case 'txt':
                // Display text file
                editorContent.innerHTML = `
                    <div class="file-preview text-preview">
                        <pre>${item.content || 'Text content will appear here...'}</pre>
                    </div>
                    <p>You can add notes or explanation about this text file below:</p>
                    <div class="editor-notes" contenteditable="true">${item.notes || ''}</div>
                `;
                break;
                
            case 'md':
                // Display markdown file
                editorContent.innerHTML = `
                    <div class="file-preview markdown-preview">
                        <div class="markdown-content">${item.content || 'Markdown content will appear here...'}</div>
                    </div>
                    <p>You can add notes or explanation about this markdown file below:</p>
                    <div class="editor-notes" contenteditable="true">${item.notes || ''}</div>
                `;
                break;
                
            case 'pdf':
                // Display PDF file
                editorContent.innerHTML = `
                    <div class="file-preview pdf-preview">
                        <iframe src="${item.url || 'about:blank'}" width="100%" height="500px"></iframe>
                    </div>
                    <p>You can add notes or explanation about this PDF file below:</p>
                    <div class="editor-notes" contenteditable="true">${item.notes || ''}</div>
                `;
                break;
                
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'webp':
            case 'svg':
                // Display image file
                editorContent.innerHTML = `
                    <div class="file-preview image-preview">
                        <img src="${item.url || 'about:blank'}" alt="${item.name}" style="max-width: 100%; max-height: 500px;">
                    </div>
                    <p>You can add notes or explanation about this image below:</p>
                    <div class="editor-notes" contenteditable="true">${item.notes || ''}</div>
                `;
                break;
                
            case 'mp3':
            case 'wav':
            case 'ogg':
                // Display audio file
                editorContent.innerHTML = `
                    <div class="file-preview audio-preview">
                        <audio controls style="width: 100%;">
                            <source src="${item.url || ''}" type="audio/${fileExtension}">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                    <p>You can add notes or explanation about this audio file below:</p>
                    <div class="editor-notes" contenteditable="true">${item.notes || ''}</div>
                `;
                break;
                
            case 'mp4':
            case 'webm':
            case 'ogv':
                // Display video file
                editorContent.innerHTML = `
                    <div class="file-preview video-preview">
                        <video controls style="width: 100%; max-height: 500px;">
                            <source src="${item.url || ''}" type="video/${fileExtension}">
                            Your browser does not support the video element.
                        </video>
                    </div>
                    <p>You can add notes or explanation about this video below:</p>
                    <div class="editor-notes" contenteditable="true">${item.notes || ''}</div>
                `;
                break;
                
            default:
                // Generic file display
                editorContent.innerHTML = `
                    <div class="file-preview generic-preview">
                        <div class="file-icon" style="text-align: center; margin: 30px 0;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                            <p>${item.name}</p>
                            <p class="file-size">${item.size ? formatFileSize(item.size) : ''}</p>
                        </div>
                        <a href="${item.url || '#'}" class="btn btn-primary" download style="display: inline-block; margin: 10px auto; text-align: center;">Download File</a>
                    </div>
                    <p>You can add notes or explanation about this file below:</p>
                    <div class="editor-notes" contenteditable="true">${item.notes || ''}</div>
                `;
        }
        
        // Hide inappropriate editor controls for files
        document.querySelectorAll('.toolbar-button').forEach(btn => {
            const title = btn.getAttribute('title');
            // Only show certain controls for files
            if (title && (title.includes('Bold') || title.includes('Italic') || title.includes('Link') || 
                title.includes('List') || title.includes('Align'))) {
                btn.style.display = 'flex'; // Show these basic formatting controls
            } else {
                btn.style.display = 'none'; // Hide other controls
            }
        });
    }
}

// Function to save item content
function saveItemContent(id, itemType) {
    console.log("Saving content for item:", id, "of type:", itemType);
    
    if (!id) {
        console.error("No item ID provided for saving");
        alert("Error: Unable to save - no item identifier found");
        return;
    }
    
    // Get content from editor
    const editorContent = document.querySelector('.editor-content');
    const articleTitle = document.getElementById('articleTitleInput');
    
    if (!editorContent || !articleTitle) {
        console.error("Could not find editor content or title input");
        alert("Error: Unable to save - editor content not found");
        return;
    }
    
    // Get the updated content and title
    const content = editorContent.innerHTML;
    const title = articleTitle.value;
    
    // Get selected status
    const publishedOption = document.querySelector('.status-option.published');
    const status = publishedOption && publishedOption.classList.contains('active') ? 'published' : 'draft';
    
    console.log("Content to save:", {
        id: id,
        type: itemType,
        title: title,
        status: status,
        contentLength: content.length
    });
    
    try {
        // APPROACH 1: Directly update the content table without finding the item in the data structure
        // This is a more resilient approach that should work even if we can't access the books data
        
        // Update the content table to reflect the changes
        updateContentTableItem(id, title, status);
        
        // Create a direct item update that doesn't require finding the item in the hierarchy
        const itemUpdate = {
            id: id,
            title: title,
            content: content,
            status: status,
            lastUpdated: new Date().toISOString()
        };
        
        // Store this update directly in localStorage as a backup
        try {
            // Get existing updates or create new array
            const directUpdates = JSON.parse(localStorage.getItem('kb_direct_updates') || '[]');
            
            // Add this update (remove any previous updates for the same item)
            const filteredUpdates = directUpdates.filter(item => item.id !== id);
            filteredUpdates.push(itemUpdate);
            
            // Save back to localStorage
            localStorage.setItem('kb_direct_updates', JSON.stringify(filteredUpdates));
            console.log("Saved direct update to localStorage");
        } catch (storageError) {
            console.warn("Could not save direct update to localStorage:", storageError);
        }
        
        // APPROACH 2: Try to find and update the item in the books data structure
        // This is the ideal approach but might fail if the data structure isn't accessible
        
        // Attempt to access the books data from different possible locations
        let foundBooks = false;
        let foundSelectedBookId = false;
        let currentBook = null;
        
        // Check global scope
        if (typeof books !== 'undefined' && books && typeof selectedBookId !== 'undefined') {
            console.log("Found books in global scope");
            foundBooks = true;
            foundSelectedBookId = true;
            currentBook = books.get(selectedBookId);
        } 
        // Check window object
        else if (window.books && window.selectedBookId) {
            console.log("Found books in window object");
            foundBooks = true;
            foundSelectedBookId = true;
            currentBook = window.books.get(window.selectedBookId);
        }
        // Check localStorage as a last resort
        else {
            console.log("Attempting to access books from localStorage");
            try {
                const storedBooks = localStorage.getItem('kb_books');
                const storedSelectedBook = localStorage.getItem('kb_selected_book');
                
                if (storedBooks && storedSelectedBook) {
                    const parsedBooks = new Map(JSON.parse(storedBooks));
                    foundBooks = true;
                    foundSelectedBookId = true;
                    currentBook = parsedBooks.get(storedSelectedBook);
                    console.log("Retrieved books from localStorage");
                }
            } catch (localStorageError) {
                console.warn("Failed to retrieve books from localStorage:", localStorageError);
            }
        }
        
        // Log what we found
        console.log("Books found:", foundBooks);
        console.log("Selected book ID found:", foundSelectedBookId);
        console.log("Current book found:", currentBook ? true : false);
        
        // Only proceed with this approach if we found the book
        if (currentBook && currentBook.contents) {
            // Generic function to find an item by ID in a hierarchical structure
            function findItemById(items, id) {
                if (!items || !Array.isArray(items)) return null;
                
                for (const item of items) {
                    if (item.id === id) return item;
                    
                    // Check for children
                    if (item.children && Array.isArray(item.children)) {
                        const found = findItemById(item.children, id);
                        if (found) return found;
                    }
                    
                    // Check for items array (alternative structure)
                    if (item.items && Array.isArray(item.items)) {
                        const found = findItemById(item.items, id);
                        if (found) return found;
                    }
                }
                
                return null;
            }
            
            // Find the item by ID
            const item = findItemById(currentBook.contents, id);
            
            if (item) {
                console.log("Found item in book contents:", item.title);
                
                // Update item properties
                item.title = title;
                item.content = content;
                item.status = status;
                item.lastUpdated = new Date().toISOString();
                
                // Try to save data using available methods
                if (typeof saveData === 'function') {
                    saveData();
                    console.log("Saved using saveData function");
                } else if (typeof window.saveData === 'function') {
                    window.saveData();
                    console.log("Saved using window.saveData function");
                } else {
                    console.warn("saveData function not found - trying direct localStorage save");
                    
                    // Direct localStorage save attempt
                    try {
                        if (foundBooks && foundSelectedBookId) {
                            const booksToSave = typeof books !== 'undefined' ? books : window.books;
                            if (booksToSave) {
                                localStorage.setItem('kb_books', JSON.stringify(Array.from(booksToSave.entries())));
                                console.log("Directly saved books to localStorage");
                            }
                        }
                    } catch (saveError) {
                        console.error("Failed direct localStorage save:", saveError);
                    }
                }
            } else {
                console.warn(`Item with ID ${id} not found in book contents`);
            }
        } else {
            // Even if approach 2 fails, we've already succeeded with approach 1
            console.warn("Could not find current book or its contents - using fallback approach");
        }
        
        // Always show success since we at least updated the UI
        showSaveSuccessNotification();
        
        // Close the editor after a short delay
        setTimeout(() => {
            const articleEditor = document.getElementById('articleEditor');
            if (articleEditor) {
                articleEditor.classList.remove('active');
            }
        }, 1000); // 1 second delay to allow the notification to be seen
        
        return true;
    } catch (error) {
        console.error("Critical error saving content:", error);
        alert("Error saving content: " + error.message);
        return false;
    }
}

// Function to update content table item (used for direct UI updates)
function updateContentTableItem(id, newTitle, newStatus) {
    try {
        console.log("Updating content table for item:", id);
        
        // Find the item row in the content table
        const itemRow = document.querySelector(`tr[data-id="${id}"]`);
        if (!itemRow) {
            console.warn(`Row for item ${id} not found in content table`);
            return false;
        }
        
        // Update the title
        const titleCell = itemRow.querySelector('td:first-child');
        if (titleCell) {
            const articleTitle = titleCell.querySelector('.article-title');
            if (articleTitle) {
                articleTitle.textContent = newTitle;
            }
        }
        
        // Update status
        const statusCell = itemRow.querySelector('td:nth-child(2)');
        if (statusCell) {
            const statusTag = statusCell.querySelector('.status-tag');
            if (statusTag) {
                // Remove existing classes
                statusTag.classList.remove('published', 'draft');
                
                // Add new class and update text
                statusTag.classList.add(newStatus);
                statusTag.textContent = capitalizeFirstLetter(newStatus);
            }
        }
        
        // Update the last updated date
        const lastUpdatedCell = itemRow.querySelector('td:nth-child(3)');
        if (lastUpdatedCell) {
            lastUpdatedCell.textContent = 'Just now';
        }
        
        console.log("Content table updated successfully");
        return true;
    } catch (error) {
        console.error("Error updating content table:", error);
        return false;
    }
}

// Add a function to show a save success notification
function showSaveSuccessNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'kb-notification success';
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = '#1e1e1e';
    notification.style.color = 'white';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '6px';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    notification.style.zIndex = '2000';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.maxWidth = '80%';
    notification.style.borderLeft = '4px solid #3cca7e';
    
    // Create notification content
    const notificationContent = document.createElement('div');
    notificationContent.textContent = 'Article saved successfully';
    notificationContent.style.marginRight = '15px';
    
    // Add content to notification
    notification.appendChild(notificationContent);
    
    // Add notification to document
    document.body.appendChild(notification);
    
    // Remove notification after some time
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

// Initialize article viewer functions
function initializeArticleViewer() {
    // Load comments from localStorage
    loadComments();
    
    // Set up event handlers for article and file rows
    setupArticleRowClickEvents();
    
    // Add direct comment button functionality
    setTimeout(addCommentButtonFunctionality, 500);
    
    // Set up editor close button
    const closeEditorBtn = document.getElementById('closeEditor');
    if (closeEditorBtn) {
        closeEditorBtn.addEventListener('click', function() {
            const articleEditor = document.getElementById('articleEditor');
            if (articleEditor) {
                articleEditor.classList.remove('active');
            }
            
            // Also close comments panel if open
            const commentsPanel = document.querySelector('.comments-panel');
            if (commentsPanel) {
                commentsPanel.remove();
                commentsVisible = false;
            }
        });
    }
    
    // Set up status options in the editor
    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            statusOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            this.classList.add('active');
        });
    });
    
    // Add event listeners for editor sidebar icons
    setupEditorSidebarIcons();
    
    // Add a direct event listener for the comment button in case other methods fail
    document.addEventListener('click', function(e) {
        // Check if the clicked element or its parent is the comment icon
        let target = e.target;
        let maxDepth = 3; // Check up to 3 levels of parent elements
        
        while (target && maxDepth > 0) {
            // If this is an SVG element that looks like a speech bubble
            if (target.tagName === 'svg' || target.tagName === 'SVG') {
                const paths = target.querySelectorAll('path');
                for (const path of paths) {
                    const d = path.getAttribute('d');
                    if (d && (d.includes('M21 15a2') || d.includes('l-4 4V5a2'))) {
                        // This is likely our comment icon
                        console.log("Comment icon clicked via document listener");
                        e.preventDefault();
                        e.stopPropagation();
                        toggleCommentsPanel();
                        return;
                    }
                }
            }
            
            target = target.parentElement;
            maxDepth--;
        }
    });
    
    // Setup editor tabs (Settings and SEO)
    const editorTabs = document.querySelectorAll('.editor-settings-tab');
    if (editorTabs.length) {
        console.log("Setting up editor settings tabs");
        
        editorTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                editorTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Handle tab content display
                const tabText = this.textContent.trim();
                
                if (tabText === 'SEO') {
                    showSeoPanel();
                } else {
                    // Restore original settings content
                    const editorSettingsContent = document.querySelector('.editor-settings-content');
                    if (editorSettingsContent && editorSettingsContent.dataset.originalContent) {
                        editorSettingsContent.innerHTML = editorSettingsContent.dataset.originalContent;
                        
                        // Reattach event listeners for status options
                        const statusOptions = document.querySelectorAll('.status-option');
                        statusOptions.forEach(option => {
                            option.addEventListener('click', function() {
                                // Remove active class from all options
                                statusOptions.forEach(opt => opt.classList.remove('active'));
                                // Add active class to clicked option
                                this.classList.add('active');
                            });
                        });
                    }
                }
            });
        });
    }
}

// Setup event listeners for editor sidebar icons
function setupEditorSidebarIcons() {
    console.log("Setting up editor sidebar icons");
    const sidebarIcons = document.querySelectorAll('.editor-sidebar-icon');
    
    sidebarIcons.forEach(icon => {
        // Clone and replace to remove any existing event listeners
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
        
        // Add click listener
        newIcon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove active class from all icons
            sidebarIcons.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked icon
            this.classList.add('active');
            
            const title = this.getAttribute('title');
            console.log(`Editor sidebar icon clicked: ${title}`);
            
            // Handle each icon based on its title
            switch(title) {
                case "Edit content":
                    // Show the main editor content
                    document.querySelector('.editor-main').style.display = 'flex';
                    document.querySelector('.editor-main').style.flexDirection = 'column';
                    
                    // Hide any other content panels
                    const otherPanels = document.querySelectorAll('.editor-panel');
                    otherPanels.forEach(panel => panel.style.display = 'none');
                    break;
                    
                case "Analytics":
                    showEditorAnalyticsPanel();
                    break;
                    
                case "Comments":
                    toggleCommentsPanel();
                    break;
                    
                case "Summarize":
                    showSummarizeModal();
                    break;
                    
                case "Preview":
                    showEditorPreviewPanel();
                    break;
            }
        });
        
        // Add direct onclick as fallback
        newIcon.onclick = function(e) {
            const title = this.getAttribute('title');
            console.log(`Editor sidebar icon clicked (direct onclick): ${title}`);
            
            if (title === "Summarize") {
                e.preventDefault();
                e.stopPropagation();
                showSummarizeModal();
                return false;
            }
        };
    });
    
    // Add direct click handler for Summarize icon specifically
    const summarizeIcon = document.querySelector('.editor-sidebar-icon[title="Summarize"]');
    if (summarizeIcon) {
        summarizeIcon.setAttribute('onclick', 'event.preventDefault(); event.stopPropagation(); showSummarizeModal(); return false;');
        console.log("Added direct onclick attribute to Summarize icon");
    }
}

// Function to show Analytics panel in the editor
function showEditorAnalyticsPanel() {
    console.log("Showing Analytics panel");
    // Similar implementation to SEO panel but for Analytics
    alert("Analytics feature coming soon!");
}

// Function to show Preview panel in the editor
function showEditorPreviewPanel() {
    console.log("Showing Preview panel");
    // Get the editor content and title
    const editorContent = document.querySelector('.editor-content');
    const articleTitle = document.getElementById('articleTitleInput');
    if (!editorContent || !articleTitle) {
        alert("Error: Unable to preview - editor elements not found");
        return;
    }

    // Determine if this is a file or article
    const itemType = editorContent.getAttribute('data-item-type') || 'article';
    const itemId = editorContent.getAttribute('data-item-id');

    // Use the PreviewViewer modal
    if (!window.PreviewViewerInstance) {
        window.PreviewViewerInstance = new window.PreviewViewer();
    }
    const previewViewer = window.PreviewViewerInstance;

    if (itemType === 'file') {
        // Try to find the file data from books structure (if available)
        let fileData = null;
        if (typeof books !== 'undefined' && typeof selectedBookId !== 'undefined') {
            const currentBook = books.get(selectedBookId);
            if (currentBook && currentBook.contents) {
                function findItemById(items, id) {
                    if (!items || !Array.isArray(items)) return null;
                    for (const item of items) {
                        if (item.id === id) return item;
                        if (item.children && Array.isArray(item.children)) {
                            const found = findItemById(item.children, id);
                            if (found) return found;
                        }
                        if (item.items && Array.isArray(item.items)) {
                            const found = findItemById(item.items, id);
                            if (found) return found;
                        }
                    }
                    return null;
                }
                fileData = findItemById(currentBook.contents, itemId);
            }
        }
        // Fallback: try to get file info from DOM
        if (!fileData) {
            fileData = {
                name: articleTitle.value || 'Untitled',
                url: editorContent.querySelector('iframe, img, audio, video, a')?.src || editorContent.querySelector('a')?.href || '',
            };
        }
        previewViewer.open(fileData);
    } else {
        // Article preview: show title and HTML content in a modal
        previewViewer.open({
            name: articleTitle.value || 'Untitled',
            type: 'article',
            html: editorContent.innerHTML
        });
    }
}

// Function to show comprehensive SEO Tools panel
function showSeoToolsPanel() {
    console.log("Showing SEO Tools panel");
    
    // Check if panel already exists and remove it
    const existingSeoPanel = document.querySelector('.seo-tools-panel');
    if (existingSeoPanel) {
        console.log("Panel exists, removing it");
        existingSeoPanel.remove();
        return; // Toggle off if already showing
    }
    
    // Create the SEO tools panel
    const seoPanel = document.createElement('div');
    seoPanel.className = 'seo-tools-panel';
    seoPanel.style.cssText = `
        position: fixed;
        top: 0;
        left: 60px;
        width: calc(100% - 60px);
        height: 100%;
        background-color: var(--background-color);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: fadeIn 0.3s ease-in-out;
        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.2);
        border-left: 1px solid var(--border-color);
    `;
    
    // Create the header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background-color: var(--card-color);
        border-bottom: 1px solid var(--border-color);
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'SEO Tools & Analysis';
    title.style.margin = '0';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: var(--text-secondary);
    `;
    closeButton.addEventListener('click', () => {
        console.log("Closing SEO panel");
        seoPanel.remove();
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Create the main content area with two columns
    const content = document.createElement('div');
    content.style.cssText = `
        display: flex;
        flex: 1;
        overflow: hidden;
    `;
    
    // Left column - SEO Settings
    const leftColumn = document.createElement('div');
    leftColumn.style.cssText = `
        width: 60%;
        overflow-y: auto;
        padding: 20px;
        border-right: 1px solid var(--border-color);
    `;
    
    // Right column - SEO Analysis
    const rightColumn = document.createElement('div');
    rightColumn.style.cssText = `
        width: 40%;
        overflow-y: auto;
        padding: 20px;
        background-color: var(--card-color);
    `;
    
    // Assemble the panel structure
    content.appendChild(leftColumn);
    content.appendChild(rightColumn);
    
    seoPanel.appendChild(header);
    seoPanel.appendChild(content);
    
    // Add to document body
    console.log("Adding SEO panel to document body");
    document.body.appendChild(seoPanel);
    
    // Fill the content sections
    leftColumn.innerHTML = `
        <div style="margin-bottom: 30px;">
            <h3 style="font-size: 18px; margin-bottom: 15px;">SEO Settings</h3>
            
            <div style="background-color: var(--card-color); border-radius: var(--border-radius); padding: 20px; margin-bottom: 20px; border: 1px solid var(--border-color);">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Meta Title</label>
                    <input type="text" id="seo-meta-title-full" placeholder="Enter meta title" 
                            style="width: 100%; padding: 10px; border-radius: var(--border-radius); 
                            background-color: var(--background-color); color: var(--text-color); 
                            border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span style="font-size: 12px; color: var(--text-secondary);">Recommended: 50-60 characters</span>
                        <span id="meta-title-count-full" style="font-size: 12px; color: var(--text-secondary);">0/60</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Meta Description</label>
                    <textarea id="seo-meta-description-full" placeholder="Enter meta description" 
                            style="width: 100%; height: 80px; padding: 10px; border-radius: var(--border-radius); 
                            background-color: var(--background-color); color: var(--text-color); 
                            border: 1px solid var(--border-color); resize: vertical;"></textarea>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span style="font-size: 12px; color: var(--text-secondary);">Recommended: 150-160 characters</span>
                        <span id="meta-description-count-full" style="font-size: 12px; color: var(--text-secondary);">0/160</span>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">URL Slug</label>
                    <div style="display: flex; align-items: center;">
                        <span style="color: var(--text-secondary); margin-right: 5px;">kb.example.com/</span>
                        <input type="text" id="seo-url-slug-full" placeholder="enter-url-slug" 
                                style="flex: 1; padding: 10px; border-radius: var(--border-radius); 
                                background-color: var(--background-color); color: var(--text-color); 
                                border: 1px solid var(--border-color);">
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">
                        Use lowercase letters, numbers, and hyphens. Avoid spaces and special characters.
                    </div>
                </div>
            </div>
            
            <div style="background-color: var(--card-color); border-radius: var(--border-radius); padding: 20px; margin-bottom: 20px; border: 1px solid var(--border-color);">
                <h4 style="font-size: 16px; margin-top: 0; margin-bottom: 15px;">Keywords</h4>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Focus Keyword</label>
                    <input type="text" id="seo-focus-keyword-full" placeholder="Enter main keyword" 
                            style="width: 100%; padding: 10px; border-radius: var(--border-radius); 
                            background-color: var(--background-color); color: var(--text-color); 
                            border: 1px solid var(--border-color);">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">
                        The main keyword or phrase you want this article to rank for.
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Secondary Keywords</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;" id="secondary-keywords-container">
                        <div class="keyword-tag" style="background-color: rgba(100, 197, 255, 0.1); color: var(--primary-color); padding: 5px 10px; border-radius: 4px; display: flex; align-items: center;">
                            <span>knowledge base</span>
                            <button style="margin-left: 5px; background: none; border: none; color: var(--primary-color); cursor: pointer; font-size: 16px; display: flex; align-items: center;">&times;</button>
                        </div>
                        <div class="keyword-tag" style="background-color: rgba(100, 197, 255, 0.1); color: var(--primary-color); padding: 5px 10px; border-radius: 4px; display: flex; align-items: center;">
                            <span>help documentation</span>
                            <button style="margin-left: 5px; background: none; border: none; color: var(--primary-color); cursor: pointer; font-size: 16px; display: flex; align-items: center;">&times;</button>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px;">
                        <input type="text" id="new-keyword-input" placeholder="Add keyword" 
                                style="flex: 1; padding: 10px; border-radius: var(--border-radius); 
                                background-color: var(--background-color); color: var(--text-color); 
                                border: 1px solid var(--border-color);">
                        <button id="add-keyword-btn" style="background-color: var(--button-blue); color: white; border: none; border-radius: var(--border-radius); padding: 0 15px; cursor: pointer;">Add</button>
                    </div>
                </div>
            </div>
            
            <div style="background-color: var(--card-color); border-radius: var(--border-radius); padding: 20px; margin-bottom: 20px; border: 1px solid var(--border-color);">
                <h4 style="font-size: 16px; margin-top: 0; margin-bottom: 15px;">Social Media Preview</h4>
                
                <div style="margin-bottom: 20px;">
                    <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius); overflow: hidden; margin-bottom: 15px;">
                        <div style="background-color: #1877F2; height: 40px; display: flex; align-items: center; padding: 0 15px;">
                            <span style="color: white; font-weight: 500; font-size: 14px;">Facebook</span>
                        </div>
                        <div style="padding: 15px; background-color: rgba(255, 255, 255, 0.05);">
                            <div style="height: 150px; background-color: rgba(255, 255, 255, 0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 15px; color: var(--text-secondary);">
                                No image selected
                            </div>
                            <div style="font-weight: 500; font-size: 16px; margin-bottom: 5px; color: var(--link-blue);" id="social-preview-title">
                                Your Article Title Will Appear Here
                            </div>
                            <div style="font-size: 14px; color: var(--text-secondary);" id="social-preview-desc">
                                Your article description will appear here. Make sure it's compelling and informative.
                            </div>
                            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 5px;">
                                kb.example.com
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Social Media Title</label>
                    <input type="text" id="social-media-title" placeholder="Enter social media title" 
                            style="width: 100%; padding: 10px; border-radius: var(--border-radius); 
                            background-color: var(--background-color); color: var(--text-color); 
                            border: 1px solid var(--border-color);">
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">
                        A catchy title for social media (defaults to Meta Title if left empty)
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Social Media Description</label>
                    <textarea id="social-media-description" placeholder="Enter social media description" 
                            style="width: 100%; height: 60px; padding: 10px; border-radius: var(--border-radius); 
                            background-color: var(--background-color); color: var(--text-color); 
                            border: 1px solid var(--border-color); resize: vertical;"></textarea>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Featured Image</label>
                    <div style="border: 1px dashed var(--border-color); border-radius: var(--border-radius); padding: 20px; text-align: center;">
                        <div id="featured-image-preview" style="margin-bottom: 15px; height: 120px; display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
                            No image selected
                        </div>
                        <button id="upload-featured-image" style="background-color: transparent; border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 8px 15px; cursor: pointer; color: var(--text-color);">
                            Upload Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    rightColumn.innerHTML = `
        <div>
            <h3 style="font-size: 18px; margin-bottom: 15px;">SEO Analysis</h3>
            
            <div style="display: flex; align-items: center; margin-bottom: 25px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: conic-gradient(#4CAF50 0% 85%, #f5f5f5 85% 100%); display: flex; align-items: center; justify-content: center; margin-right: 20px;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background-color: var(--card-color); display: flex; align-items: center; justify-content: center; flex-direction: column;">
                        <span style="font-size: 24px; font-weight: bold; color: #4CAF50;">85</span>
                        <span style="font-size: 12px; color: var(--text-secondary);">Score</span>
                    </div>
                </div>
                <div>
                    <h4 style="margin: 0 0 5px 0; font-size: 18px; color: #4CAF50;">Good</h4>
                    <p style="margin: 0; color: var(--text-secondary);">Your article is well-optimized for search engines.</p>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom: 10px; font-size: 16px;">Keyword Analysis</h4>
                
                <div style="background-color: var(--background-color); border-radius: var(--border-radius); padding: 15px; margin-bottom: 10px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Keyword Density</span>
                        <span style="color: #4CAF50; font-weight: 500;">Good</span>
                    </div>
                    <div style="height: 6px; background-color: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; margin-bottom: 6px;">
                        <div style="width: 75%; height: 100%; background-color: #4CAF50;"></div>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
                        Focus keyword appears 7 times (2.1%) - optimal density is 1.5-2.5%.
                    </p>
                </div>
                
                <div style="background-color: var(--background-color); border-radius: var(--border-radius); padding: 15px; margin-bottom: 10px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Keyword in Title</span>
                        <span style="color: #4CAF50; font-weight: 500;">✓</span>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
                        Your focus keyword appears in the article title.
                    </p>
                </div>
                
                <div style="background-color: var(--background-color); border-radius: var(--border-radius); padding: 15px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Keyword in First Paragraph</span>
                        <span style="color: #4CAF50; font-weight: 500;">✓</span>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
                        Your focus keyword appears in the first paragraph of your content.
                    </p>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom: 10px; font-size: 16px;">Content Analysis</h4>
                
                <div style="background-color: var(--background-color); border-radius: var(--border-radius); padding: 15px; margin-bottom: 10px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Content Length</span>
                        <span style="color: #FFA500; font-weight: 500;">Improve</span>
                    </div>
                    <div style="height: 6px; background-color: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; margin-bottom: 6px;">
                        <div style="width: 45%; height: 100%; background-color: #FFA500;"></div>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
                        Your article is 523 words. Consider extending to at least 800 words for better ranking.
                    </p>
                </div>
                
                <div style="background-color: var(--background-color); border-radius: var(--border-radius); padding: 15px; margin-bottom: 10px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Readability</span>
                        <span style="color: #4CAF50; font-weight: 500;">Good</span>
                    </div>
                    <div style="height: 6px; background-color: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; margin-bottom: 6px;">
                        <div style="width: 80%; height: 100%; background-color: #4CAF50;"></div>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
                        Flesch reading score: 68.3 (8th-9th grade) - Content is easy to read.
                    </p>
                </div>
                
                <div style="background-color: var(--background-color); border-radius: var(--border-radius); padding: 15px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Headings Structure</span>
                        <span style="color: #4CAF50; font-weight: 500;">Good</span>
                    </div>
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: var(--text-secondary);">
                        Your headings structure is well-organized.
                    </p>
                    <div style="background-color: rgba(255, 255, 255, 0.03); border-radius: 4px; padding: 10px; font-family: monospace; font-size: 12px; color: var(--text-secondary);">
                        H1: Article Title (1)<br>
                        H2: Section One (1)<br>
                        H2: Section Two (1)<br>
                        H3: Subsection (2)<br>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 25px;">
                <h4 style="margin-bottom: 10px; font-size: 16px;">Link Analysis</h4>
                
                <div style="background-color: var(--background-color); border-radius: var(--border-radius); padding: 15px; margin-bottom: 10px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 500;">Internal Links</span>
                        <span style="color: #FFA500; font-weight: 500;">Improve</span>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
                        Your article contains 2 internal links. Consider adding more to improve SEO.
                    </p>
                </div>
                
                <div style="background-color: var(--background-color); border-radius: var(--border-radius); padding: 15px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 500;">External Links</span>
                        <span style="color: #FFA500; font-weight: 500;">Improve</span>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: var(--text-secondary);">
                        No external references found. Consider adding authoritative sources.
                    </p>
                </div>
            </div>
            
            <div>
                <h4 style="margin-bottom: 10px; font-size: 16px;">Recommendations</h4>
                <ul style="margin: 0; padding-left: 20px; color: var(--text-secondary);">
                    <li style="margin-bottom: 8px;">Increase your content length to at least 800 words</li>
                    <li style="margin-bottom: 8px;">Add more internal links to other relevant articles</li>
                    <li style="margin-bottom: 8px;">Include at least one external reference link</li>
                    <li>Consider adding an image with descriptive alt text</li>
                </ul>
            </div>
        </div>
    `;
    
    // Set up event listeners and interactivity
    setupSeoInteractivity();
    
    // Function to set up all the interactive elements in the SEO panel
    function setupSeoInteractivity() {
        // Meta title character counter
        const metaTitleInput = document.getElementById('seo-meta-title-full');
        const metaTitleCount = document.getElementById('meta-title-count-full');
        const socialPreviewTitle = document.getElementById('social-preview-title');
        
        if (metaTitleInput && metaTitleCount) {
            metaTitleInput.addEventListener('input', function() {
                const count = this.value.length;
                metaTitleCount.textContent = `${count}/60`;
                
                // Update social preview
                if (socialPreviewTitle) {
                    socialPreviewTitle.textContent = this.value || 'Your Article Title Will Appear Here';
                }
                
                // Color coding based on recommended length
                if (count > 60) {
                    metaTitleCount.style.color = '#ff4444'; // Too long
                } else if (count > 50) {
                    metaTitleCount.style.color = '#4CAF50'; // Good
                } else {
                    metaTitleCount.style.color = 'var(--text-secondary)'; // Default
                }
            });
        }
        
        // Meta description character counter
        const metaDescInput = document.getElementById('seo-meta-description-full');
        const metaDescCount = document.getElementById('meta-description-count-full');
        const socialPreviewDesc = document.getElementById('social-preview-desc');
        
        if (metaDescInput && metaDescCount) {
            metaDescInput.addEventListener('input', function() {
                const count = this.value.length;
                metaDescCount.textContent = `${count}/160`;
                
                // Update social preview
                if (socialPreviewDesc) {
                    socialPreviewDesc.textContent = this.value || 'Your article description will appear here. Make sure it\'s compelling and informative.';
                }
                
                // Color coding based on recommended length
                if (count > 160) {
                    metaDescCount.style.color = '#ff4444'; // Too long
                } else if (count > 150) {
                    metaDescCount.style.color = '#4CAF50'; // Good
                } else {
                    metaDescCount.style.color = 'var(--text-secondary)'; // Default
                }
            });
        }
        
        // Social media title
        const socialMediaTitle = document.getElementById('social-media-title');
        
        if (socialMediaTitle && socialPreviewTitle) {
            socialMediaTitle.addEventListener('input', function() {
                socialPreviewTitle.textContent = this.value || 
                    (metaTitleInput && metaTitleInput.value ? metaTitleInput.value : 'Your Article Title Will Appear Here');
            });
        }
        
        // Social media description
        const socialMediaDesc = document.getElementById('social-media-description');
        
        if (socialMediaDesc && socialPreviewDesc) {
            socialMediaDesc.addEventListener('input', function() {
                socialPreviewDesc.textContent = this.value || 
                    (metaDescInput && metaDescInput.value ? metaDescInput.value : 'Your article description will appear here. Make sure it\'s compelling and informative.');
            });
        }
        
        // Keyword tags removal
        document.querySelectorAll('.keyword-tag button').forEach(btn => {
            btn.addEventListener('click', function() {
                this.parentElement.remove();
            });
        });
        
        // Add new keyword
        const newKeywordInput = document.getElementById('new-keyword-input');
        const addKeywordBtn = document.getElementById('add-keyword-btn');
        const keywordsContainer = document.getElementById('secondary-keywords-container');
        
        if (newKeywordInput && addKeywordBtn && keywordsContainer) {
            addKeywordBtn.addEventListener('click', function() {
                addNewKeyword();
            });
            
            // Add on Enter key
            newKeywordInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    addNewKeyword();
                    e.preventDefault();
                }
            });
            
            function addNewKeyword() {
                const keyword = newKeywordInput.value.trim();
                if (keyword) {
                    const keywordTag = document.createElement('div');
                    keywordTag.className = 'keyword-tag';
                    keywordTag.style.cssText = 'background-color: rgba(100, 197, 255, 0.1); color: var(--primary-color); padding: 5px 10px; border-radius: 4px; display: flex; align-items: center;';
                    
                    keywordTag.innerHTML = `
                        <span>${keyword}</span>
                        <button style="margin-left: 5px; background: none; border: none; color: var(--primary-color); cursor: pointer; font-size: 16px; display: flex; align-items: center;">&times;</button>
                    `;
                    
                    keywordsContainer.appendChild(keywordTag);
                    newKeywordInput.value = '';
                    
                    // Add event listener to new remove button
                    keywordTag.querySelector('button').addEventListener('click', function() {
                        keywordTag.remove();
                    });
                }
            }
        }
        
        // Image upload button
        const uploadImageBtn = document.getElementById('upload-featured-image');
        const imagePreview = document.getElementById('featured-image-preview');
        
        if (uploadImageBtn && imagePreview) {
            uploadImageBtn.addEventListener('click', function() {
                // Create a virtual file input
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.style.display = 'none';
                
                // Append to body
                document.body.appendChild(fileInput);
                
                // Click the file input
                fileInput.click();
                
                // Handle file selection
                fileInput.addEventListener('change', function() {
                    if (this.files && this.files[0]) {
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            // Update the preview
                            imagePreview.innerHTML = `
                                <img src="${e.target.result}" style="max-width: 100%; max-height: 120px; object-fit: contain;">
                            `;
                            
                            // Update the social preview
                            const socialPreview = document.querySelector('.seo-tools-panel .facebook-preview .preview-image');
                            if (socialPreview) {
                                socialPreview.innerHTML = `
                                    <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
                                `;
                            }
                        };
                        
                        reader.readAsDataURL(this.files[0]);
                    }
                    
                    // Remove the file input
                    document.body.removeChild(fileInput);
                });
            });
        }
    }
}

// Set up click events for article and file rows
function setupArticleRowClickEvents() {
    // Use event delegation to handle clicks on all article and file rows
    document.addEventListener('click', function(e) {
        // Skip if clicked on any editor-related elements
        if (e.target.closest('.article-editor-container') || 
            e.target.closest('.editor-toolbar') || 
            e.target.closest('.toolbar-button') || 
            e.target.closest('.editor-settings')) {
            return;
        }
        
        // Skip if clicked on expand icon or expandable control
        if (e.target.closest('.expand-icon') || e.target.closest('.expandable-control')) {
            return;
        }
        
        // Find clicked element or its parent that is an article or file row
        const row = e.target.closest('.article-row, .file-row');
        
        if (row) {
            // Only proceed if we're not clicking on action buttons within the row
            if (!e.target.closest('.tree-action-btn')) {
                // Get the item ID
                const id = row.getAttribute('data-id');
                if (id) {
                    // Add selected class to the row
                    document.querySelectorAll('.article-row, .file-row').forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');
                    
                    // View the article or file
                    viewArticleOrFile(id, row);
                }
            }
        }
    });
}

// Setup editor toolbar button functionality
function setupEditorToolbarButtons() {
    const toolbar = document.querySelector('.editor-toolbar');
    if (!toolbar) {
        console.error("Editor toolbar not found");
        return;
    }
    
    // Get all toolbar buttons
    const toolbarButtons = toolbar.querySelectorAll('.toolbar-button');
    
    // Add click event listeners to each button
    toolbarButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Get the command from the button's title
            const command = getCommandFromButton(button);
            
            // Handle special cases
            const title = button.getAttribute('title');
            if (title === 'Insert link') {
                handleLinkInsertion();
            } else if (title === 'Insert image') {
                handleImageInsertion();
            } else if (title === 'Insert video') {
                handleVideoInsertion();
            } else if (title === 'Insert PDF') {
                handlePdfInsertion();
            } else if (title === 'Insert emoji') {
                handleEmojiInsertion();
            } else if (title === 'Insert table') {
                handleTableInsertion();
            } else if (command) {
                // Execute the command
                document.execCommand(command, false, null);
            }
            
            // Return focus to editor
            const editorContent = document.querySelector('.editor-content');
            if (editorContent) {
                editorContent.focus();
            }
        });
    });
    
    // FIXED: Update the comments button selector to target the speech bubble icon correctly
    // This targets the specific comment icon in the editor main section
    const commentsButton = document.querySelector('.editor-main > div[style*="display: flex"]');
    
    // If the above selector doesn't work, try these alternative selectors
    if (!commentsButton) {
        // Try to find the speech bubble icon specifically
        const allEditorIcons = document.querySelectorAll('.editor-main svg, .editor-main div svg');
        for (const icon of allEditorIcons) {
            // Check if it's a speech bubble/comment icon by looking at the path
            if (icon.querySelector('path[d*="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2"]')) {
                console.log("Found comment icon by SVG path");
                icon.parentElement.style.cursor = 'pointer';
                icon.parentElement.setAttribute('title', 'Toggle Community Notes');
                icon.parentElement.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Comment icon clicked");
                    toggleCommentsPanel();
                });
                break;
            }
        }
    } else {
        console.log("Found comment button:", commentsButton);
        commentsButton.style.cursor = 'pointer';
        commentsButton.setAttribute('title', 'Toggle Community Notes');
        
        // Add event listener for comments toggle
        commentsButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Comment button clicked");
            toggleCommentsPanel();
        });
    }
    
    // Add direct event listener to the specific element visible in the screenshot
    // This is the speech bubble icon highlighted in yellow in the screenshot
    const specificCommentIcon = document.querySelector('.editor-main div[style*="margin-bottom"] > svg');
    if (specificCommentIcon) {
        console.log("Found specific comment icon element");
        const commentButton = specificCommentIcon.parentElement;
        commentButton.style.cursor = 'pointer';
        commentButton.setAttribute('title', 'Toggle Community Notes');
        commentButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Specific comment icon clicked");
            toggleCommentsPanel();
        });
    }
    
    // Explicitly add event listener for save button
    console.log("Setting up save button click handler");
    const saveButton = document.querySelector('.action-save');
    if (saveButton) {
        // Remove any existing event listeners to prevent duplicates
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        
        newSaveButton.addEventListener('click', function(e) {
            console.log("Save button clicked");
            e.preventDefault();
            e.stopPropagation();
            
            // Get editor content
            const editorContent = document.querySelector('.editor-content');
            const articleTitle = document.getElementById('articleTitleInput');
            
            if (editorContent && articleTitle) {
                // Extract item ID and type from data attributes
                const itemId = editorContent.getAttribute('data-item-id');
                const itemType = editorContent.getAttribute('data-item-type') || 'article';
                
                console.log("Saving item:", itemId, "of type:", itemType);
                
                // Save the content
                saveItemContent(itemId, itemType);
            } else {
                console.error("Editor content or title input not found");
                alert("Error: Unable to save - editor elements not found");
            }
        });
    } else {
        console.error("Save button not found in the DOM");
    }
    
    // Add event listener for close button
    const closeButton = document.getElementById('closeEditor');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            const articleEditor = document.getElementById('articleEditor');
            if (articleEditor) {
                articleEditor.classList.remove('active');
            }
            
            // Also close comments panel if open
            const commentsPanel = document.querySelector('.comments-panel');
            if (commentsPanel) {
                commentsPanel.remove();
                commentsVisible = false;
            }
        });
    }
    
    // Add event listeners for status options
    const statusOptions = document.querySelectorAll('.status-option');
    statusOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            statusOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            this.classList.add('active');
        });
    });
    
    // Summarize button functionality - enhanced with multiple selectors and direct DOM events
    const summarizeButton = document.querySelector('.toolbar-button[title="Summarize"]');
    console.log("Looking for summarize button:", summarizeButton);
    
    if (summarizeButton) {
        // Create a new event handler with debugging
        const handleSummarizeClick = (e) => {
            console.log("Summarize button clicked");
            e.preventDefault();
            e.stopPropagation();
            showSummarizeModal();
        };
        
        // Remove any existing listeners and add new one
        const newSummarizeButton = summarizeButton.cloneNode(true);
        summarizeButton.parentNode.replaceChild(newSummarizeButton, summarizeButton);
        newSummarizeButton.addEventListener('click', handleSummarizeClick);
        
        // Add direct inline click handler as a backup
        newSummarizeButton.onclick = handleSummarizeClick;
        
        console.log("Summarize button event handlers attached");
    } else {
        // Try alternative selector
        const altSummarizeButton = document.querySelector('button.toolbar-button svg path[d*="M21 6"]')?.closest('button') || 
                                  document.querySelector('button.toolbar-button svg line[x1="15"][y1="12"]')?.closest('button');
        
        if (altSummarizeButton) {
            console.log("Found summarize button via alternative selector");
            
            // Create a new event handler with debugging
            const handleSummarizeClick = (e) => {
                console.log("Summarize button clicked (alternative)");
                e.preventDefault();
                e.stopPropagation();
                showSummarizeModal();
            };
            
            // Remove any existing listeners and add new one
            const newAltButton = altSummarizeButton.cloneNode(true);
            altSummarizeButton.parentNode.replaceChild(newAltButton, altSummarizeButton);
            newAltButton.addEventListener('click', handleSummarizeClick);
            
            // Add direct inline click handler as a backup
            newAltButton.onclick = handleSummarizeClick;
            
            console.log("Alternative summarize button event handlers attached");
        } else {
            console.error("Summarize button not found in the DOM");
        }
    }
    
    // Setup summarize modal functionality
    // Function doesn't exist yet - will be implemented later
    // setupSummarizeModal();
}

// Helper function to get the execCommand from button
function getCommandFromButton(button) {
    const title = button.getAttribute('title');
    if (!title) return null;
    
    // Map button titles to execCommand commands
    const commandMap = {
        'Bold': 'bold',
        'Italic': 'italic',
        'Underline': 'underline',
        'Strikethrough': 'strikeThrough',
        'Superscript': 'superscript',
        'Subscript': 'subscript',
        'Insert link': 'createLink',
        'Align left': 'justifyLeft',
        'Align center': 'justifyCenter',
        'List': 'insertUnorderedList',
        'Numbered list': 'insertOrderedList'
    };
    
    return commandMap[title] || null;
}

// Link insertion handler
function handleLinkInsertion() {
    const url = prompt('Enter the URL:', 'https://');
    if (url) {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString();
            
            // If text is selected, use it as link text, otherwise use the URL
            const linkText = selectedText.trim() !== '' ? selectedText : url;
            
            // Create link element
            const link = document.createElement('a');
            link.href = url;
            link.textContent = linkText;
            link.target = '_blank'; // Open in new tab
            
            // Replace selection with link
            range.deleteContents();
            range.insertNode(link);
            
            // Move caret to end of link
            range.setStartAfter(link);
            range.setEndAfter(link);
            selection.removeAllRanges();
            selection.addRange(range);
        } else {
            // No selection, just insert link
            document.execCommand('createLink', false, url);
        }
    }
}

// Image insertion handler
function handleImageInsertion() {
    // Create modal for image insertion
    createMediaInsertionModal('image', {
        title: 'Insert Image',
        urlPlaceholder: 'Enter image URL (https://...)',
        urlLabel: 'Image URL',
        acceptTypes: 'image/*',
        altTextSupport: true
    });
}

// Video insertion handler
function handleVideoInsertion() {
    // Create modal for video insertion
    createMediaInsertionModal('video', {
        title: 'Insert Video',
        urlPlaceholder: 'Enter video URL (YouTube, Vimeo, etc.)',
        urlLabel: 'Video URL',
        acceptTypes: 'video/*',
        youtubeSupport: true
    });
}

// PDF insertion handler
function handlePdfInsertion() {
    // Create modal for PDF insertion
    createMediaInsertionModal('pdf', {
        title: 'Insert PDF',
        urlPlaceholder: 'Enter PDF URL (https://...)',
        urlLabel: 'PDF URL',
        acceptTypes: '.pdf'
    });
}

// Function to create a modal for media insertion (image, video, PDF)
function createMediaInsertionModal(type, options) {
    // Remove any existing modal
    const existingModal = document.querySelector('.media-insertion-modal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal container
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay media-insertion-modal';
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.top = '0';
    modalOverlay.style.left = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.zIndex = '1500';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.width = '500px';
    modalContent.style.maxWidth = '90%';
    modalContent.style.backgroundColor = 'var(--card-color)';
    modalContent.style.borderRadius = 'var(--border-radius)';
    modalContent.style.padding = '20px';
    modalContent.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.style.display = 'flex';
    modalHeader.style.justifyContent = 'space-between';
    modalHeader.style.alignItems = 'center';
    modalHeader.style.marginBottom = '20px';
    
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = options.title || `Insert ${capitalizeFirstLetter(type)}`;
    modalTitle.style.margin = '0';
    modalTitle.style.padding = '0';
    modalTitle.style.fontSize = '18px';
    modalTitle.style.fontWeight = '500';
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = 'var(--text-secondary)';
    closeButton.onclick = () => document.body.removeChild(modalOverlay);
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Create tabs
    const tabs = document.createElement('div');
    tabs.className = 'modal-tabs';
    tabs.style.display = 'flex';
    tabs.style.borderBottom = '1px solid var(--border-color)';
    tabs.style.marginBottom = '20px';
    
    const urlTab = document.createElement('div');
    urlTab.className = 'modal-tab active';
    urlTab.textContent = 'From URL';
    urlTab.style.padding = '10px 15px';
    urlTab.style.cursor = 'pointer';
    urlTab.style.borderBottom = '2px solid var(--primary-color)';
    urlTab.style.color = 'var(--primary-color)';
    urlTab.style.fontWeight = '500';
    
    const uploadTab = document.createElement('div');
    uploadTab.className = 'modal-tab';
    uploadTab.textContent = 'Upload File';
    uploadTab.style.padding = '10px 15px';
    uploadTab.style.cursor = 'pointer';
    uploadTab.style.color = 'var(--text-secondary)';
    
    tabs.appendChild(urlTab);
    tabs.appendChild(uploadTab);
    
    // Create content areas for each tab
    const urlContent = document.createElement('div');
    urlContent.className = 'tab-content url-content';
    urlContent.style.display = 'block';
    
    const uploadContent = document.createElement('div');
    uploadContent.className = 'tab-content upload-content';
    uploadContent.style.display = 'none';
    
    // URL input content
    const urlLabel = document.createElement('label');
    urlLabel.textContent = options.urlLabel || 'URL';
    urlLabel.style.display = 'block';
    urlLabel.style.marginBottom = '8px';
    urlLabel.style.fontSize = '14px';
    
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = options.urlPlaceholder || 'Enter URL';
    urlInput.style.width = '100%';
    urlInput.style.padding = '10px';
    urlInput.style.marginBottom = '15px';
    urlInput.style.borderRadius = 'var(--border-radius)';
    urlInput.style.border = '1px solid var(--border-color)';
    urlInput.style.backgroundColor = 'transparent';
    urlInput.style.color = 'var(--text-color)';
    
    urlContent.appendChild(urlLabel);
    urlContent.appendChild(urlInput);
    
    // Add alt text input for images
    let altTextInput = null;
    if (options.altTextSupport) {
        const altLabel = document.createElement('label');
        altLabel.textContent = 'Alt Text (for accessibility)';
        altLabel.style.display = 'block';
        altLabel.style.marginBottom = '8px';
        altLabel.style.fontSize = '14px';
        
        altTextInput = document.createElement('input');
        altTextInput.type = 'text';
        altTextInput.placeholder = 'Describe the image (optional)';
        altTextInput.style.width = '100%';
        altTextInput.style.padding = '10px';
        altTextInput.style.marginBottom = '15px';
        altTextInput.style.borderRadius = 'var(--border-radius)';
        altTextInput.style.border = '1px solid var(--border-color)';
        altTextInput.style.backgroundColor = 'transparent';
        altTextInput.style.color = 'var(--text-color)';
        
        urlContent.appendChild(altLabel);
        urlContent.appendChild(altTextInput);
    }
    
    // Upload content
    const fileInputLabel = document.createElement('label');
    fileInputLabel.textContent = `Choose ${type} file`;
    fileInputLabel.style.display = 'block';
    fileInputLabel.style.marginBottom = '8px';
    fileInputLabel.style.fontSize = '14px';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = options.acceptTypes || '*/*';
    fileInput.style.width = '100%';
    fileInput.style.marginBottom = '15px';
    fileInput.style.padding = '10px 0';
    
    // File preview area
    const previewArea = document.createElement('div');
    previewArea.className = 'file-preview-area';
    previewArea.style.minHeight = '100px';
    previewArea.style.border = '1px dashed var(--border-color)';
    previewArea.style.borderRadius = 'var(--border-radius)';
    previewArea.style.marginBottom = '15px';
    previewArea.style.display = 'flex';
    previewArea.style.alignItems = 'center';
    previewArea.style.justifyContent = 'center';
    previewArea.style.padding = '15px';
    previewArea.textContent = 'Preview will appear here';
    previewArea.style.color = 'var(--text-secondary)';
    previewArea.style.fontSize = '14px';
    
    // Alt text input for uploaded images
    let uploadAltTextInput = null;
    if (options.altTextSupport) {
        const uploadAltLabel = document.createElement('label');
        uploadAltLabel.textContent = 'Alt Text (for accessibility)';
        uploadAltLabel.style.display = 'block';
        uploadAltLabel.style.marginBottom = '8px';
        uploadAltLabel.style.fontSize = '14px';
        
        uploadAltTextInput = document.createElement('input');
        uploadAltTextInput.type = 'text';
        uploadAltTextInput.placeholder = 'Describe the image (optional)';
        uploadAltTextInput.style.width = '100%';
        uploadAltTextInput.style.padding = '10px';
        uploadAltTextInput.style.marginBottom = '15px';
        uploadAltTextInput.style.borderRadius = 'var(--border-radius)';
        uploadAltTextInput.style.border = '1px solid var(--border-color)';
        uploadAltTextInput.style.backgroundColor = 'transparent';
        uploadAltTextInput.style.color = 'var(--text-color)';
        
        uploadContent.appendChild(uploadAltLabel);
        uploadContent.appendChild(uploadAltTextInput);
    }
    
    uploadContent.appendChild(fileInputLabel);
    uploadContent.appendChild(fileInput);
    uploadContent.appendChild(previewArea);
    
    // File change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Clear preview area
        previewArea.innerHTML = '';
        previewArea.style.color = 'var(--text-color)';
        
        // Create appropriate preview based on file type
        if (type === 'image' && file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.style.maxWidth = '100%';
            img.style.maxHeight = '200px';
            img.style.objectFit = 'contain';
            
            const reader = new FileReader();
            reader.onload = function(e) {
                img.src = e.target.result;
                if (uploadAltTextInput && !uploadAltTextInput.value) {
                    // Suggest filename as alt text if empty
                    uploadAltTextInput.value = file.name.replace(/\.[^/.]+$/, "");
                }
            };
            reader.readAsDataURL(file);
            
            previewArea.appendChild(img);
        } else if (type === 'video' && file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.controls = true;
            video.style.maxWidth = '100%';
            video.style.maxHeight = '200px';
            
            const reader = new FileReader();
            reader.onload = function(e) {
                video.src = e.target.result;
            };
            reader.readAsDataURL(file);
            
            previewArea.appendChild(video);
        } else if (type === 'pdf' && file.type === 'application/pdf') {
            const icon = document.createElement('div');
            icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                    <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"></path>
                    <path d="M9 9l1 0"></path>
                    <path d="M9 13l6 0"></path>
                    <path d="M9 17l6 0"></path>
                </svg>
                <p style="margin: 5px 0 0 0;">${file.name}</p>
            `;
            icon.style.textAlign = 'center';
            
            previewArea.appendChild(icon);
        } else {
            previewArea.textContent = 'Unsupported file type';
            previewArea.style.color = '#ff4444';
        }
    });
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.gap = '10px';
    buttonContainer.style.marginTop = '15px';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.padding = '8px 15px';
    cancelButton.style.borderRadius = 'var(--border-radius)';
    cancelButton.style.border = '1px solid var(--border-color)';
    cancelButton.style.backgroundColor = 'transparent';
    cancelButton.style.color = 'var(--text-color)';
    cancelButton.style.cursor = 'pointer';
    cancelButton.onclick = () => document.body.removeChild(modalOverlay);
    
    const insertButton = document.createElement('button');
    insertButton.textContent = 'Insert';
    insertButton.style.padding = '8px 15px';
    insertButton.style.borderRadius = 'var(--border-radius)';
    insertButton.style.border = 'none';
    insertButton.style.backgroundColor = 'var(--button-blue)';
    insertButton.style.color = 'white';
    insertButton.style.cursor = 'pointer';
    
    // Insert button handler
    insertButton.onclick = () => {
        const activeTab = document.querySelector('.modal-tab.active');
        const isUrlTab = activeTab === urlTab;
        
        if (isUrlTab) {
            const url = urlInput.value.trim();
            if (!url) {
                alert('Please enter a valid URL');
                return;
            }
            
            // Process based on media type
            if (type === 'image') {
                insertImageFromUrl(url, altTextInput ? altTextInput.value : '');
            } else if (type === 'video') {
                insertVideoFromUrl(url);
            } else if (type === 'pdf') {
                insertPdfFromUrl(url);
            }
        } else {
            // Upload file
            const file = fileInput.files[0];
            if (!file) {
                alert('Please select a file');
                return;
            }
            
            // Process based on media type
            if (type === 'image') {
                insertImageFromFile(file, uploadAltTextInput ? uploadAltTextInput.value : '');
            } else if (type === 'video') {
                insertVideoFromFile(file);
            } else if (type === 'pdf') {
                insertPdfFromFile(file);
            }
        }
        
        // Close modal
        document.body.removeChild(modalOverlay);
    };
    
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(insertButton);
    
    // Add tab click events
    urlTab.addEventListener('click', () => {
        urlTab.style.borderBottom = '2px solid var(--primary-color)';
        urlTab.style.color = 'var(--primary-color)';
        uploadTab.style.borderBottom = 'none';
        uploadTab.style.color = 'var(--text-secondary)';
        urlTab.classList.add('active');
        uploadTab.classList.remove('active');
        urlContent.style.display = 'block';
        uploadContent.style.display = 'none';
    });
    
    uploadTab.addEventListener('click', () => {
        uploadTab.style.borderBottom = '2px solid var(--primary-color)';
        uploadTab.style.color = 'var(--primary-color)';
        urlTab.style.borderBottom = 'none';
        urlTab.style.color = 'var(--text-secondary)';
        uploadTab.classList.add('active');
        urlTab.classList.remove('active');
        uploadContent.style.display = 'block';
        urlContent.style.display = 'none';
    });
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(tabs);
    modalContent.appendChild(urlContent);
    modalContent.appendChild(uploadContent);
    modalContent.appendChild(buttonContainer);
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Focus the URL input by default
    setTimeout(() => urlInput.focus(), 100);
}

// Function to insert image from URL
function insertImageFromUrl(url, altText) {
    if (!url) return;
        
        // Create image element
        const img = document.createElement('img');
        img.src = url;
    if (altText) img.alt = altText;
        img.style.maxWidth = '100%';
        
        // Insert at current selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            
            // Move caret after image
            range.setStartAfter(img);
            range.setEndAfter(img);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

// Function to insert image from file
function insertImageFromFile(file, altText) {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Create image element
        const img = document.createElement('img');
        img.src = e.target.result;
        if (altText) img.alt = altText;
        img.style.maxWidth = '100%';
        
        // Insert at current selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(img);
            
            // Move caret after image
            range.setStartAfter(img);
            range.setEndAfter(img);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
    reader.readAsDataURL(file);
}

// Function to insert video from URL
function insertVideoFromUrl(url) {
    if (!url) return;
    
        let embedUrl = url;
        
        // Handle YouTube URLs
        if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
            const videoId = url.includes('youtube.com/watch') 
                ? new URL(url).searchParams.get('v') 
                : url.split('/').pop().split('?')[0];
            
            if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        }
        
        // Create video container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'embedded-video';
        videoContainer.innerHTML = `
            <iframe src="${embedUrl}" title="Embedded Video" frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
        `;
        
        // Insert at current selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(videoContainer);
            
            // Move caret after video
            range.setStartAfter(videoContainer);
            range.setEndAfter(videoContainer);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

// Function to insert video from file
function insertVideoFromFile(file) {
    if (!file || !file.type.startsWith('video/')) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Create video element
        const videoContainer = document.createElement('div');
        videoContainer.className = 'embedded-video';
        
        const video = document.createElement('video');
        video.src = e.target.result;
        video.controls = true;
        video.style.width = '100%';
        video.style.height = 'auto';
        
        videoContainer.appendChild(video);
        
        // Insert at current selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(videoContainer);
            
            // Move caret after video
            range.setStartAfter(videoContainer);
            range.setEndAfter(videoContainer);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
    reader.readAsDataURL(file);
}

// Function to insert PDF from URL
function insertPdfFromUrl(url) {
    if (!url) return;
    
        // Create PDF container
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'embedded-pdf';
        pdfContainer.innerHTML = `
            <iframe src="${url}" title="Embedded PDF" width="100%" height="500px" frameborder="0"></iframe>
        `;
        
        // Insert at current selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(pdfContainer);
            
            // Move caret after PDF
            range.setStartAfter(pdfContainer);
            range.setEndAfter(pdfContainer);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }

// Function to insert PDF from file
function insertPdfFromFile(file) {
    if (!file || file.type !== 'application/pdf') return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Create PDF container
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'embedded-pdf';
        
        // Use object tag for PDFs as it's more reliable than iframe with data URLs
        const obj = document.createElement('object');
        obj.data = e.target.result;
        obj.type = 'application/pdf';
        obj.width = '100%';
        obj.height = '500px';
        obj.innerHTML = 'Your browser does not support embedded PDFs. <a href="' + e.target.result + '" target="_blank">Click here to open the PDF</a>';
        
        pdfContainer.appendChild(obj);
        
        // Insert at current selection
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(pdfContainer);
            
            // Move caret after PDF
            range.setStartAfter(pdfContainer);
            range.setEndAfter(pdfContainer);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };
    reader.readAsDataURL(file);
}

// Emoji insertion handler (simplified)
function handleEmojiInsertion() {
    // A simple set of common emojis
    const commonEmojis = ['😀', '😊', '👍', '❤️', '🎉', '✅', '⚠️', '❌', '📝', '📊', '🔍'];
    
    // Create a simple emoji picker
    let emojiHTML = '<div style="display:flex;flex-wrap:wrap;gap:10px;padding:10px;">';
    commonEmojis.forEach(emoji => {
        emojiHTML += `<span style="cursor:pointer;font-size:24px;" onclick="insertEmoji('${emoji}')">${emoji}</span>`;
    });
    emojiHTML += '</div>';
    
    // Show a simplified emoji picker (in reality, you'd want a proper UI component)
    const pickerContainer = document.createElement('div');
    pickerContainer.style.position = 'absolute';
    pickerContainer.style.zIndex = '1000';
    pickerContainer.style.backgroundColor = 'var(--card-color)';
    pickerContainer.style.border = '1px solid var(--border-color)';
    pickerContainer.style.borderRadius = 'var(--border-radius)';
    pickerContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    pickerContainer.innerHTML = emojiHTML;
    
    // Position the picker
    const toolbar = document.querySelector('.editor-toolbar');
    if (toolbar) {
        pickerContainer.style.top = (toolbar.offsetTop + toolbar.offsetHeight) + 'px';
        pickerContainer.style.left = '50%';
        pickerContainer.style.transform = 'translateX(-50%)';
    }
    
    // Add to document
    document.body.appendChild(pickerContainer);
    
    // Create a function to insert the selected emoji
    window.insertEmoji = function(emoji) {
        document.execCommand('insertText', false, emoji);
        document.body.removeChild(pickerContainer);
        delete window.insertEmoji;
    };
    
    // Close picker when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeEmojiPicker(e) {
            if (!pickerContainer.contains(e.target)) {
                if (document.body.contains(pickerContainer)) {
                    document.body.removeChild(pickerContainer);
                }
                document.removeEventListener('click', closeEmojiPicker);
                delete window.insertEmoji;
            }
        });
    }, 0);
}

// Table insertion handler
function handleTableInsertion() {
    const rows = prompt('Enter number of rows:', '3');
    const cols = prompt('Enter number of columns:', '3');
    
    if (rows && cols) {
        const numRows = parseInt(rows);
        const numCols = parseInt(cols);
        
        if (isNaN(numRows) || isNaN(numCols) || numRows <= 0 || numCols <= 0) {
            alert('Please enter valid numbers for rows and columns');
            return;
        }
        
        let tableHTML = '<table style="width:100%;border-collapse:collapse;margin:15px 0;">';
        
        // Table header
        tableHTML += '<thead><tr>';
        for (let i = 0; i < numCols; i++) {
            tableHTML += `<th style="border:1px solid var(--border-color);padding:8px;text-align:left;">Header ${i+1}</th>`;
        }
        tableHTML += '</tr></thead>';
        
        // Table body
        tableHTML += '<tbody>';
        for (let i = 0; i < numRows; i++) {
            tableHTML += '<tr>';
            for (let j = 0; j < numCols; j++) {
                tableHTML += `<td style="border:1px solid var(--border-color);padding:8px;">Cell ${i+1},${j+1}</td>`;
            }
            tableHTML += '</tr>';
        }
        tableHTML += '</tbody></table>';
        
        // Insert the table at current selection
        document.execCommand('insertHTML', false, tableHTML);
    }
}

// Add a direct function to manually add comment button functionality
// We'll call this after the document is fully loaded
function addCommentButtonFunctionality() {
    console.log("Adding direct comment button functionality");
    
    // Find the speech bubble directly
    const commentButtons = document.querySelectorAll('svg');
    
    commentButtons.forEach(svg => {
        // Check if it's a comment/speech bubble icon by examining its paths
        const paths = svg.querySelectorAll('path');
        let isSpeechBubble = false;
        
        paths.forEach(path => {
            const d = path.getAttribute('d');
            if (d && (d.includes('M21 15a2') || d.includes('l-4 4V5a2'))) {
                isSpeechBubble = true;
            }
        });
        
        if (isSpeechBubble) {
            console.log("Found speech bubble icon");
            // Get the parent element that should be clickable
            const button = svg.closest('div');
            if (button) {
                button.style.cursor = 'pointer';
                button.setAttribute('title', 'Toggle Community Notes');
                button.style.pointerEvents = 'auto';
                
                // Remove existing listeners by cloning
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Add click event
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Speech bubble icon clicked");
                    toggleCommentsPanel();
                });
            }
        }
    });
    
    // Try to find the specific comment icon from the screenshot
    const editorCommentIcon = document.querySelector('.editor-main div[style*="display: flex; align-items: center"] svg');
    if (editorCommentIcon) {
        console.log("Found editor comment icon");
        const commentButton = editorCommentIcon.parentElement;
        commentButton.style.cursor = 'pointer';
        commentButton.setAttribute('title', 'Toggle Community Notes');
        
        // Remove existing listeners
        const newCommentButton = commentButton.cloneNode(true);
        commentButton.parentNode.replaceChild(newCommentButton, commentButton);
        
        // Add new listener
        newCommentButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Editor comment icon clicked");
            toggleCommentsPanel();
        });
    }
}

// Load article ratings from localStorage
function loadArticleRatings() {
    try {
        const savedRatings = localStorage.getItem('kb_article_ratings');
        if (savedRatings) {
            const parsed = JSON.parse(savedRatings);
            
            // Convert back from JSON to Map
            Object.keys(parsed).forEach(itemId => {
                articleRatings.set(itemId, parsed[itemId]);
            });
            
            console.log("Loaded ratings for", articleRatings.size, "items");
        }
    } catch (error) {
        console.error("Error loading article ratings:", error);
    }
}

// Save article ratings to localStorage
function saveArticleRatings() {
    try {
        // Convert Map to an object for JSON serialization
        const ratingsObject = {};
        articleRatings.forEach((rating, itemId) => {
            ratingsObject[itemId] = rating;
        });
        
        localStorage.setItem('kb_article_ratings', JSON.stringify(ratingsObject));
        console.log("Article ratings saved to localStorage");
    } catch (error) {
        console.error("Error saving article ratings:", error);
    }
}

// Initialize summarize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing article viewer components");
    
    // Immediately hide the summarize modal to prevent it from showing on page load
    const summarizeModal = document.getElementById('summarizeModal');
    if (summarizeModal) {
        console.log("Hiding summarize modal on page load");
        summarizeModal.classList.remove('show');
        summarizeModal.style.display = 'none';
        summarizeModal.style.visibility = 'hidden';
        summarizeModal.style.opacity = '0';
    }
    
    // Initialize the article viewer
    initializeArticleViewer();
    
    // Set up editor toolbar buttons
    setupEditorToolbarButtons();
    
    // Initialize summarize modal
    setTimeout(function() {
        console.log("Setting up summarize modal during initialization");
        // Summarize modal functionality not implemented yet
        // setupSummarizeModal();
        
        // Add direct click handler to the summarize button for maximum compatibility
        const summarizeBtn = document.querySelector('.toolbar-button[title="Summarize"]');
        if (summarizeBtn) {
            summarizeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Summarize toolbar button clicked");
                showSummarizeModal();
            });
        }
        
        const summarizeIcon = document.querySelector('.editor-sidebar-icon[title="Summarize"]');
        if (summarizeIcon) {
            summarizeIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("Summarize sidebar icon clicked");
                showSummarizeModal();
            });
        }
    }, 1000); // Slight delay to ensure DOM is fully loaded
});

// Function to show the summarize modal
function showSummarizeModal() {
    console.log("showSummarizeModal called");
    
    // Check if we already have a modal visible
    let modal = document.getElementById('summarizeModal');
    let overlay = document.getElementById('summarizeModalOverlay');
    
    // Remove the toggle behavior - don't hide the modal if it's already visible
    // Just return if the modal is already showing
    if (modal && overlay && (modal.style.display === 'block' || modal.classList.contains('show'))) {
        console.log("Modal is already showing, not hiding it");
        return;
    }
    
    // If we already have the elements but they're hidden, show them
    if (modal && overlay) {
        console.log("Modal exists but is hidden, showing it");
        overlay.style.display = 'block';
        modal.style.display = 'block';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.classList.add('show');
        
        // Ensure animation plays again
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.animation = 'none';
            // Force reflow
            void modalContent.offsetWidth;
            // Re-apply the animation
            modalContent.style.animation = 'slideUp 0.3s ease-out forwards';
        }
        
        return;
    }
    
    // If modal doesn't exist or is broken, create a new one
    if (!modal || !overlay) {
        console.log("Modal or overlay not found, creating new ones");
        // Remove any existing broken modals first
        const oldModal = document.querySelector('.summarize-modal');
        if (oldModal) {
            oldModal.parentNode.removeChild(oldModal);
        }
        const oldOverlay = document.getElementById('summarizeModalOverlay');
        if (oldOverlay) {
            oldOverlay.parentNode.removeChild(oldOverlay);
        }
        
        // Create new modal from scratch
        createSummarizeModal();
    }
}

// Create the summarize modal from scratch
function createSummarizeModal() {
    // First create a background overlay
    const overlay = document.createElement('div');
    overlay.id = 'summarizeModalOverlay';
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); z-index: 9998; display: block;";
    document.body.appendChild(overlay);
    
    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'summarizeModal';
    modal.className = 'modal summarize-modal show';
    // Set styles but don't try to handle the background here
    modal.style.cssText = "display: block !important; visibility: visible !important; opacity: 1 !important; z-index: 9999 !important; position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;";
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    // Make it wider, position at bottom, add animation
    modalContent.style.cssText = "background-color: var(--card-color); color: var(--text-color); margin: 0 auto; padding: 0; border: 1px solid var(--border-color); width: 90%; max-width: 1000px; border-radius: var(--border-radius) var(--border-radius) 0 0; box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3); position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); pointer-events: auto; height: 70%; max-height: 600px; overflow: auto; animation: slideUp 0.3s ease-out forwards;";
    
    // Add the animation keyframes to the document
    if (!document.getElementById('modal-animations')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'modal-animations';
        styleSheet.textContent = `
            @keyframes slideUp {
                from { transform: translate(-50%, 100%); }
                to { transform: translate(-50%, 0); }
            }
            @keyframes slideDown {
                from { transform: translate(-50%, 0); }
                to { transform: translate(-50%, 100%); }
            }
        `;
        document.head.appendChild(styleSheet);
    }
    
    // Create modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.style.cssText = "padding: 15px 20px; background-color: var(--sidebar-bg); border-bottom: 1px solid var(--border-color); border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10;";
    
    const headerTitle = document.createElement('h2');
    headerTitle.textContent = 'Summarization Options';
    headerTitle.style.cssText = "margin: 0; font-size: 1.4em; color: var(--text-color);";
    
    const closeButton = document.createElement('span');
    closeButton.className = 'close-modal';
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = "color: var(--text-secondary); font-size: 28px; font-weight: bold; cursor: pointer;";
    
    modalHeader.appendChild(headerTitle);
    modalHeader.appendChild(closeButton);
    
    // Create modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.style.cssText = "padding: 20px; background-color: var(--card-color); overflow-y: auto; flex: 1; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 20px;";
    
    // Add summarize options
    const options = [
        { name: 'summary', title: 'Automatic Summarization', desc: 'Create a concise summary of the article', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="15" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>' },
        { name: 'key-points', title: 'Key Points', desc: 'Extract the main points from the article', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>' },
        { name: 'todo', title: 'To-Do List', desc: 'Generate actionable items from the content', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>' },
        { name: 'transcribe', title: 'Transcribe Audio/Video', desc: 'Convert media to text and summarize', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>' },
        { name: 'meeting', title: 'Meeting Notes', desc: 'Structure content as meeting minutes', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' }
    ];
    
    options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'summarize-option';
        optionDiv.setAttribute('data-option', option.name);
        // Make options wider for the larger modal
        optionDiv.style.cssText = "display: flex; padding: 15px; margin-bottom: 15px; border-radius: var(--border-radius); border: 1px solid var(--border-color); background-color: var(--card-color); cursor: pointer; transition: all 0.2s ease; width: calc(50% - 10px); box-sizing: border-box;";
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'summarize-option-icon';
        iconDiv.style.cssText = "margin-right: 20px; display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background-color: var(--active-bg); border-radius: 50%; color: var(--primary-color);";
        iconDiv.innerHTML = option.icon;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'summarize-option-content';
        
        const title = document.createElement('h3');
        title.style.cssText = "margin: 0 0 5px 0; font-size: 1.1em; color: var(--text-color);";
        title.textContent = option.title;
        
        const desc = document.createElement('p');
        desc.style.cssText = "margin: 0; color: var(--text-secondary); font-size: 0.9em;";
        desc.textContent = option.desc;
        
        contentDiv.appendChild(title);
        contentDiv.appendChild(desc);
        
        optionDiv.appendChild(iconDiv);
        optionDiv.appendChild(contentDiv);
        
        modalBody.appendChild(optionDiv);
    });
    
    // Create modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.style.cssText = "padding: 15px 20px; background-color: var(--sidebar-bg); border-top: 1px solid var(--border-color); border-radius: 0 0 8px 8px; display: flex; justify-content: space-between; align-items: center; position: sticky; bottom: 0; z-index: 10;";
    
    const apiToggleContainer = document.createElement('div');
    apiToggleContainer.className = 'api-toggle-container';
    apiToggleContainer.style.cssText = "display: flex; align-items: center;";
    
    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';
    switchLabel.style.cssText = "position: relative; display: inline-block; width: 50px; height: 24px; margin-right: 10px;";
    
    const switchInput = document.createElement('input');
    switchInput.id = 'useApiToggle';
    switchInput.type = 'checkbox';
    switchInput.style.cssText = "opacity: 0; width: 0; height: 0;";
    
    const sliderSpan = document.createElement('span');
    sliderSpan.className = 'slider round';
    sliderSpan.style.cssText = "position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-color); transition: .4s; border-radius: 34px;";
    sliderSpan.innerHTML = '<span style="position: absolute; content: \'\'; height: 16px; width: 16px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%;"></span>';
    
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(sliderSpan);
    
    const toggleText = document.createElement('span');
    toggleText.textContent = 'Use ChatGPT API';
    
    apiToggleContainer.appendChild(switchLabel);
    apiToggleContainer.appendChild(toggleText);
    
    const apiKeyMessage = document.createElement('div');
    apiKeyMessage.id = 'apiKeyMessage';
    apiKeyMessage.style.cssText = "color: var(--text-secondary); font-size: 0.85em;";
    apiKeyMessage.textContent = 'To use ChatGPT API, add your API key in Settings';
    
    modalFooter.appendChild(apiToggleContainer);
    modalFooter.appendChild(apiKeyMessage);
    
    // Assemble modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    
    modal.appendChild(modalContent);
    
    // Append to body
    document.body.appendChild(modal);
    
    // Setup event handlers
    setupSummarizeModalEvents(modal, overlay);
    
    console.log("Created new summarize modal with separate overlay");
    return modal;
}

// Setup event handlers for the modal
function setupSummarizeModalEvents(modal, overlay) {
    console.log("Setting up summarize modal events");
    
    // Close button click
    const closeBtn = modal.querySelector('.close-modal');
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            hideModal(modal, overlay);
        };
    }
    
    // Click outside to close
    overlay.onclick = function(e) {
        hideModal(modal, overlay);
    };
    
    // Setup option click handlers
    const options = modal.querySelectorAll('.summarize-option');
    options.forEach(option => {
        option.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const optionType = option.getAttribute('data-option');
            console.log(`Option clicked: ${optionType}`);
            
            const useApi = document.getElementById('useApiToggle')?.checked || false;
            processSummarization(optionType, useApi);
            
            hideModal(modal, overlay);
        };
    });
    
    modal.dataset.initialized = 'true';
}

// Helper function to hide the modal
function hideModal(modal, overlay) {
    if (modal) {
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            // Add slide down animation
            modalContent.style.animation = 'slideDown 0.3s ease-out forwards';
            
            // Wait for animation to finish before hiding
            setTimeout(() => {
                modal.classList.remove('show');
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.style.opacity = '0';
                
                // Also remove the overlay
                if (overlay) {
                    overlay.style.display = 'none';
                } else {
                    const existingOverlay = document.getElementById('summarizeModalOverlay');
                    if (existingOverlay) {
                        existingOverlay.style.display = 'none';
                    }
                }
            }, 280);
        } else {
            // Fall back to immediate hiding if content not found
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            
            // Also remove the overlay
            if (overlay) {
                overlay.style.display = 'none';
            } else {
                const existingOverlay = document.getElementById('summarizeModalOverlay');
                if (existingOverlay) {
                    existingOverlay.style.display = 'none';
                }
            }
        }
    } else {
        // Just hide the overlay if modal not found
        if (overlay) {
            overlay.style.display = 'none';
        } else {
            const existingOverlay = document.getElementById('summarizeModalOverlay');
            if (existingOverlay) {
                existingOverlay.style.display = 'none';
            }
        }
    }
}

// Process the summarization based on selected option
function processSummarization(optionType, useApi) {
    // Get the current article content
    const editorContent = document.querySelector('.editor-content');
    if (!editorContent) return;
    
    const content = editorContent.innerHTML;
    
    console.log(`Processing summarization: ${optionType} (API: ${useApi})`);
    
    // Based on option type, process the content differently
    let summarizedContent = '';
    let resultTitle = '';
    
    if (useApi && localStorage.getItem('chatgptApiKey')) {
        // Use ChatGPT API for summarization
        summarizeWithChatGPT(optionType, content);
    } else {
        // Use hard-coded algorithms
        summarizeWithDefaultAlgorithm(optionType, content);
    }
}

// Function to summarize content using ChatGPT API
async function summarizeWithChatGPT(optionType, content) {
    try {
        const apiKey = localStorage.getItem('chatgptApiKey');
        if (!apiKey) {
            showSummarizationResult('Error', 'No API key found in settings. Please add your ChatGPT API key.');
            return;
        }
        
        // Create a prompt based on the option type
        let prompt = '';
        switch (optionType) {
            case 'summary':
                prompt = `Summarize the following content concisely:\n\n${content}`;
                break;
            case 'key-points':
                prompt = `Extract and list the main key points from the following content:\n\n${content}`;
                break;
            case 'todo':
                prompt = `Create a to-do list based on the following content, listing actionable items:\n\n${content}`;
                break;
            case 'transcribe':
                prompt = `Transcribe and summarize the following audio/video content (text representation):\n\n${content}`;
                break;
            case 'meeting':
                prompt = `Organize the following content as meeting notes with clear sections, participants, and action items:\n\n${content}`;
                break;
            default:
                prompt = `Summarize the following content:\n\n${content}`;
        }
        
        // Show loading indicator
        showSummarizationLoading();
        
        // Make API call to ChatGPT (placeholder for now)
        console.log('Would call ChatGPT API with prompt:', prompt.substring(0, 100) + '...');
        
        // Simulate API call (this is a placeholder)
        setTimeout(() => {
            const mockResult = `This is a mock result for ${optionType} summarization using the ChatGPT API.
            
In a real implementation, this would contain the actual response from the ChatGPT API based on the content of the article.`;
            
            showSummarizationResult(getOptionTitle(optionType), mockResult);
        }, 1500);
    } catch (error) {
        console.error('Error calling ChatGPT API:', error);
        showSummarizationResult('Error', 'Failed to summarize content using ChatGPT API.');
    }
}

// Function to summarize content using default algorithms
function summarizeWithDefaultAlgorithm(optionType, content) {
    // Show loading indicator
    showSummarizationLoading();
    
    // Strip HTML tags to get plain text
    const plainText = content.replace(/<[^>]*>/g, ' ').trim();
    
    // Simulate processing time
    setTimeout(() => {
        let result = '';
        
        switch (optionType) {
            case 'summary':
                result = generateDefaultSummary(plainText);
                break;
            case 'key-points':
                result = generateKeyPoints(plainText);
                break;
            case 'todo':
                result = generateTodoList(plainText);
                break;
            case 'transcribe':
                result = generateTranscription(plainText);
                break;
            case 'meeting':
                result = generateMeetingNotes(plainText);
                break;
            default:
                result = generateDefaultSummary(plainText);
        }
        
        showSummarizationResult(getOptionTitle(optionType), result);
    }, 1000);
}

// Helper functions for default summarization algorithms
function generateDefaultSummary(text) {
    // Simple algorithm to extract important sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordCount = {};
    
    // Count word frequency
    sentences.forEach(sentence => {
        const words = sentence.toLowerCase().split(/\s+/);
        words.forEach(word => {
            if (word.length > 3) { // Only count meaningful words
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });
    });
    
    // Score sentences based on word frequency
    const sentenceScores = sentences.map(sentence => {
        const words = sentence.toLowerCase().split(/\s+/);
        let score = 0;
        words.forEach(word => {
            if (wordCount[word]) {
                score += wordCount[word];
            }
        });
        return { sentence, score: score / words.length };
    });
    
    // Sort sentences by score and take top 25%
    sentenceScores.sort((a, b) => b.score - a.score);
    const topSentences = sentenceScores.slice(0, Math.max(3, Math.ceil(sentences.length * 0.25)));
    
    // Sort back to original order
    topSentences.sort((a, b) => {
        return sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence);
    });
    
    return topSentences.map(item => item.sentence).join('. ') + '.';
}

function generateKeyPoints(text) {
    // Extract what seem to be key sentences and format as bullet points
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keyPhrases = ['important', 'key', 'significant', 'main', 'critical', 'essential', 'crucial'];
    
    // Filter sentences that likely contain key points
    let keyPointSentences = sentences.filter(sentence => {
        const lower = sentence.toLowerCase();
        // Sentences with key phrases or that start with action verbs are likely key points
        return keyPhrases.some(phrase => lower.includes(phrase)) || 
               /^[A-Z][a-z]+ (is|are|was|were|should|could|will|can)/.test(sentence.trim());
    });
    
    // If we don't have enough key points, add some top sentences
    if (keyPointSentences.length < 3) {
        const wordCount = {};
        sentences.forEach(sentence => {
            const words = sentence.toLowerCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 3) {
                    wordCount[word] = (wordCount[word] || 0) + 1;
                }
            });
        });
        
        const sentenceScores = sentences.map(sentence => {
            const words = sentence.toLowerCase().split(/\s+/);
            let score = 0;
            words.forEach(word => {
                if (wordCount[word]) {
                    score += wordCount[word];
                }
            });
            return { sentence, score: score / words.length };
        });
        
        sentenceScores.sort((a, b) => b.score - a.score);
        const additionalPoints = sentenceScores
            .filter(item => !keyPointSentences.includes(item.sentence))
            .slice(0, 5 - keyPointSentences.length)
            .map(item => item.sentence);
        
        keyPointSentences = [...keyPointSentences, ...additionalPoints];
    }
    
    // Format as bullet points
    return keyPointSentences
        .map(sentence => '• ' + sentence.trim())
        .join('\n\n');
}

function generateTodoList(text) {
    // Extract action items or create todos from the text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const actionPhrases = ['need to', 'should', 'must', 'important to', 'don\'t forget', 'remember to'];
    
    // Filter sentences that sound like actions
    let actionItems = sentences.filter(sentence => {
        const lower = sentence.toLowerCase();
        return actionPhrases.some(phrase => lower.includes(phrase)) || 
               /^[A-Z][a-z]+ (the|a|an|to)/.test(sentence.trim());
    });
    
    // If we don't have enough items, add some general sentences
    if (actionItems.length < 3) {
        actionItems = [...actionItems, ...sentences
            .filter(s => !actionItems.includes(s))
            .slice(0, 5 - actionItems.length)];
    }
    
    // Format as a to-do list with checkboxes
    return actionItems
        .map(item => '- [ ] ' + item.trim())
        .join('\n\n');
}

function generateTranscription(text) {
    // In reality, this would use audio/video transcription APIs
    // For now, we'll just format the text as if it was transcribed
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    
    return `[Transcription]\n\n${paragraphs.join('\n\n')}`;
}

function generateMeetingNotes(text) {
    // Format content as meeting notes
    return `# Meeting Notes\n\n## Summary\n${generateDefaultSummary(text)}\n\n## Key Points\n${generateKeyPoints(text)}\n\n## Action Items\n${generateTodoList(text)}`;
}

// Helper function to get the title for the summarization option
function getOptionTitle(optionType) {
    switch (optionType) {
        case 'summary': return 'Automatic Summarization';
        case 'key-points': return 'Key Points';
        case 'todo': return 'To-Do List';
        case 'transcribe': return 'Transcription';
        case 'meeting': return 'Meeting Notes';
        default: return 'Summarization';
    }
}

// Show loading indicator for summarization
function showSummarizationLoading() {
    // Remove any existing loading overlay
    const existingOverlay = document.getElementById('summarizationLoadingOverlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Create a temporary overlay with loading spinner
    const overlay = document.createElement('div');
    overlay.id = 'summarizationLoadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 2s linear infinite;
    `;
    
    // Add the spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
}

// Show summarization result
function showSummarizationResult(title, content) {
    // Remove loading overlay if it exists
    const loadingOverlay = document.getElementById('summarizationLoadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
    
    // Remove any existing result modal
    const existingModal = document.getElementById('summarizationResultModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create result modal
    const resultModal = document.createElement('div');
    resultModal.className = 'modal result-modal';
    resultModal.id = 'summarizationResultModal';
    resultModal.style.cssText = `
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.4);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background-color: #fefefe;
        margin: 10% auto;
        padding: 0;
        border: 1px solid #888;
        width: 80%;
        max-width: 800px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    `;
    
    // Modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.style.cssText = `
        padding: 15px 20px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #eee;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const modalTitle = document.createElement('h2');
    modalTitle.textContent = title;
    modalTitle.style.cssText = `
        margin: 0;
        font-size: 1.4em;
        color: #333;
    `;
    
    const closeButton = document.createElement('span');
    closeButton.innerHTML = '&times;';
    closeButton.className = 'close-modal';
    closeButton.style.cssText = `
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    `;
    closeButton.onclick = function() {
        resultModal.remove();
    };
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    // Modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalBody.style.cssText = `
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
    `;
    
    const resultContent = document.createElement('div');
    resultContent.className = 'summarization-result';
    resultContent.style.cssText = `
        white-space: pre-wrap;
        line-height: 1.6;
    `;
    resultContent.textContent = content;
    
    modalBody.appendChild(resultContent);
    
    // Modal footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.style.cssText = `
        padding: 15px 20px;
        background-color: #f8f9fa;
        border-top: 1px solid #eee;
        border-radius: 0 0 8px 8px;
        display: flex;
        justify-content: flex-end;
    `;
    
    // Add buttons to footer
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy to Clipboard';
    copyButton.className = 'btn';
    copyButton.style.cssText = `
        padding: 8px 16px;
        margin-right: 10px;
        background-color: #4285f4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    copyButton.onclick = function() {
        navigator.clipboard.writeText(content).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => {
                copyButton.textContent = 'Copy to Clipboard';
            }, 2000);
        });
    };
    
    const insertButton = document.createElement('button');
    insertButton.textContent = 'Insert into Document';
    insertButton.className = 'btn';
    insertButton.style.cssText = `
        padding: 8px 16px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    insertButton.onclick = function() {
        const editorContent = document.querySelector('.editor-content');
        if (editorContent) {
            // Create a formatted div
            const formattedContent = document.createElement('div');
            formattedContent.className = 'summarization-insert';
            formattedContent.style.cssText = `
                margin: 20px 0;
                padding: 15px;
                border-left: 4px solid #4285f4;
                background-color: #f8f9fa;
            `;
            
            // Add title
            const summaryTitle = document.createElement('h3');
            summaryTitle.textContent = title;
            summaryTitle.style.cssText = `
                margin: 0 0 10px 0;
                color: #333;
            `;
            
            // Add content with proper formatting
            const summaryContent = document.createElement('div');
            summaryContent.style.cssText = `
                white-space: pre-wrap;
                line-height: 1.6;
            `;
            
            // Format the content based on type
            if (title === 'Key Points' || title === 'To-Do List') {
                // Convert bullet point text to HTML list
                const lines = content.split('\n\n');
                const list = document.createElement('ul');
                list.style.cssText = `
                    padding-left: 20px;
                    margin: 0;
                `;
                
                lines.forEach(line => {
                    const listItem = document.createElement('li');
                    listItem.textContent = line.replace(/^[•\-]\s*(\[ \])?\s*/, '');
                    list.appendChild(listItem);
                });
                
                summaryContent.appendChild(list);
            } else {
                // Regular text content
                summaryContent.textContent = content;
            }
            
            formattedContent.appendChild(summaryTitle);
            formattedContent.appendChild(summaryContent);
            
            // Insert at cursor position or append to editor
            editorContent.appendChild(formattedContent);
            
            // Close the modal
            resultModal.remove();
        }
    };
    
    modalFooter.appendChild(copyButton);
    modalFooter.appendChild(insertButton);
    
    // Assemble the modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalContent.appendChild(modalFooter);
    resultModal.appendChild(modalContent);
    
    // Add to document
    document.body.appendChild(resultModal);
    
    // Close when clicking outside
    window.onclick = function(event) {
        if (event.target === resultModal) {
            resultModal.remove();
        }
    };
}

// Function to show the SEO panel in the editor settings
function showSeoPanel() {
    console.log("Showing SEO panel");
    
    // Get the SEO tab content container
    const editorSettingsContent = document.querySelector('.editor-settings-content');
    if (!editorSettingsContent) {
        console.error("Editor settings content container not found");
        return;
    }
    
    // Store original content to restore later if needed
    if (!editorSettingsContent.dataset.originalContent) {
        editorSettingsContent.dataset.originalContent = editorSettingsContent.innerHTML;
    }
    
    // Create SEO content
    const seoContent = document.createElement('div');
    seoContent.className = 'seo-content';
    
    // Create SEO form sections
    seoContent.innerHTML = `
        <div class="settings-section">
            <div class="settings-section-title">Search Engine Optimization</div>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 20px;">
                Optimize your article for search engines to improve visibility and ranking.
            </p>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Meta Title</label>
                <input type="text" id="seo-meta-title" placeholder="Enter meta title" 
                       style="width: 100%; padding: 10px; border-radius: var(--border-radius); 
                       background-color: var(--card-color); color: var(--text-color); 
                       border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span style="font-size: 12px; color: var(--text-secondary);">Recommended: 50-60 characters</span>
                    <span id="meta-title-count" style="font-size: 12px; color: var(--text-secondary);">0/60</span>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Meta Description</label>
                <textarea id="seo-meta-description" placeholder="Enter meta description" 
                          style="width: 100%; height: 80px; padding: 10px; border-radius: var(--border-radius); 
                          background-color: var(--card-color); color: var(--text-color); 
                          border: 1px solid var(--border-color); resize: vertical;"></textarea>
                <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                    <span style="font-size: 12px; color: var(--text-secondary);">Recommended: 150-160 characters</span>
                    <span id="meta-description-count" style="font-size: 12px; color: var(--text-secondary);">0/160</span>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">URL Slug</label>
                <div style="display: flex; align-items: center;">
                    <span style="color: var(--text-secondary); margin-right: 5px;">kb.example.com/</span>
                    <input type="text" id="seo-url-slug" placeholder="enter-url-slug" 
                           style="flex: 1; padding: 10px; border-radius: var(--border-radius); 
                           background-color: var(--card-color); color: var(--text-color); 
                           border: 1px solid var(--border-color);">
                </div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">
                    Use lowercase letters, numbers, and hyphens. Avoid spaces and special characters.
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Focus Keyword</label>
                <input type="text" id="seo-focus-keyword" placeholder="Enter main keyword" 
                       style="width: 100%; padding: 10px; border-radius: var(--border-radius); 
                       background-color: var(--card-color); color: var(--text-color); 
                       border: 1px solid var(--border-color);">
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">
                    The main keyword or phrase you want this article to rank for.
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">SEO Score</label>
                <div style="display: flex; align-items: center;">
                    <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #4CAF50; 
                                display: flex; align-items: center; justify-content: center; 
                                color: white; font-size: 20px; font-weight: bold; margin-right: 15px;">85</div>
                    <div>
                        <div style="font-weight: 500; margin-bottom: 5px;">Good</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">
                            Your article is well-optimized for search engines.
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">Social Media Preview</label>
                <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 15px; margin-bottom: 20px;">
                    <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 10px;">
                        Preview how your article will appear when shared on social media:
                    </div>
                    <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: var(--border-radius); overflow: hidden;">
                        <div style="height: 150px; background-color: #2a2a2a; display: flex; align-items: center; justify-content: center; color: #666;">
                            <span>Article Featured Image</span>
                        </div>
                        <div style="padding: 15px;">
                            <div id="social-preview-title" style="font-weight: 500; margin-bottom: 5px; font-size: 16px;">
                                Article Title - Knowledge Base
                            </div>
                            <div id="social-preview-desc" style="font-size: 14px; color: var(--text-secondary); margin-bottom: 5px;">
                                Your article description will appear here. Make sure it's compelling and informative.
                            </div>
                            <div style="font-size: 12px; color: #888;">kb.example.com</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Replace current content with SEO content
    editorSettingsContent.innerHTML = '';
    editorSettingsContent.appendChild(seoContent);
    
    // Set up character counting for meta title and description
    const metaTitleInput = document.getElementById('seo-meta-title');
    const metaTitleCount = document.getElementById('meta-title-count');
    
    if (metaTitleInput && metaTitleCount) {
        metaTitleInput.addEventListener('input', function() {
            const count = this.value.length;
            metaTitleCount.textContent = `${count}/60`;
            
            // Update social preview
            const socialPreviewTitle = document.getElementById('social-preview-title');
            if (socialPreviewTitle) {
                socialPreviewTitle.textContent = this.value || 'Article Title - Knowledge Base';
            }
            
            // Color coding based on recommended length
            if (count > 60) {
                metaTitleCount.style.color = '#ff4444'; // Too long
            } else if (count > 50) {
                metaTitleCount.style.color = '#4CAF50'; // Good
            } else {
                metaTitleCount.style.color = 'var(--text-secondary)'; // Default
            }
        });
    }
    
    const metaDescInput = document.getElementById('seo-meta-description');
    const metaDescCount = document.getElementById('meta-description-count');
    
    if (metaDescInput && metaDescCount) {
        metaDescInput.addEventListener('input', function() {
            const count = this.value.length;
            metaDescCount.textContent = `${count}/160`;
            
            // Update social preview
            const socialPreviewDesc = document.getElementById('social-preview-desc');
            if (socialPreviewDesc) {
                socialPreviewDesc.textContent = this.value || 'Your article description will appear here. Make sure it\'s compelling and informative.';
            }
            
            // Color coding based on recommended length
            if (count > 160) {
                metaDescCount.style.color = '#ff4444'; // Too long
            } else if (count > 150) {
                metaDescCount.style.color = '#4CAF50'; // Good
            } else {
                metaDescCount.style.color = 'var(--text-secondary)'; // Default
            }
        });
    }
}

// Function to set up editor sidebar icons
function setupEditorSidebar() {
    console.log("Setting up editor sidebar icons");
    const commentIcon = document.querySelector('.editor-sidebar-icon[title="Comments"]');
    if (commentIcon) {
        commentIcon.addEventListener('click', function () {
            toggleCommentsPanel();
        });
    }
    
    const previewIcon = document.querySelector('.editor-sidebar-icon[title="Preview"]');
    if (previewIcon) {
        previewIcon.addEventListener('click', function () {
            showEditorPreviewPanel();
        });
    }
    
    const seoIcon = document.querySelector('.editor-sidebar-icon[title="SEO Tools"]');
    if (seoIcon) {
        console.log("Found SEO icon, attaching click handler");
        seoIcon.addEventListener('click', function () {
            console.log("SEO icon clicked from event listener");
            showSeoToolsPanel();
        });
    } else {
        console.log("SEO icon not found in DOM");
    }
}

// Function to init article viewer
function initArticleViewer() {
    console.log("Initializing article viewer");
    
    // Call these functions to set up initial state
    // Full text search functionality not implemented yet
    // initFullTextSearch();
    // File tree functionality not implemented yet
    // setupFileTree();
    // Event listeners setup functionality not implemented yet
    // setupEventListeners();
    setupEditorSidebar(); // Make sure this line is present
    
    // Other initialization code...
}

// After DOM content is loaded, initialize the article viewer
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM content loaded, initializing article viewer");
    initArticleViewer();
});

// Add a direct event listener for the SEO Tools icon
document.addEventListener('DOMContentLoaded', function() {
    console.log("Setting up direct SEO icon listener");
    
    // Wait a bit for any dynamic content to load
    setTimeout(() => {
        const seoIcon = document.querySelector('.editor-sidebar-icon[title="SEO Tools"]');
        if (seoIcon) {
            console.log("Found SEO icon with direct approach");
            seoIcon.addEventListener('click', function(e) {
                console.log("SEO icon clicked (direct listener)");
                e.preventDefault();
                e.stopPropagation();
                showSeoToolsPanel();
            });
        } else {
            console.log("SEO icon not found with direct approach");
        }
    }, 1000);
});