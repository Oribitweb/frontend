// popups.js – Handles popup forms and UI interactions
// Includes WebSocket with first-message auth (works with HttpOnly cookies)

// Shared popup dialogs (login / signup / forgot / upload / short / post).
// Migrated from includes/popups.php: the site is served as static HTML
// (GitHub Pages), so any dialog a page doesn't contain inline is injected here.
const SHARED_POPUPS = {
    loginPopup: `
<div class="popup" id="loginPopup" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
    <div class="popup__panel">
        <button class="popup__close" data-close="loginPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 18c1.4-2.3 3.2-3.5 5-3.5s3.6 1.2 5 3.5"/></svg>
        </div>
        <h2 class="popup__title" id="loginTitle">Welcome Back</h2>
        <p class="popup__subtitle">Log in to your ORBIT account</p>

        <form class="popup__form" id="loginForm" novalidate>
            <div class="input-group">
                <label for="loginUsername">Username</label>
                <input type="text" id="loginUsername" placeholder="Enter your username" required autocomplete="username">
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" placeholder="Enter your password" required autocomplete="current-password">
                <span class="input-group__error"></span>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Log In</button>
        </form>

        <button class="btn btn--text btn--full popup__forgot" data-action="forgotPassword">Forgot Password?</button>

        <div class="popup__divider"><span>or</span></div>

        <button class="btn btn--google btn--full">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
        </button>

        <p class="popup__switch">Don't have an account? <button class="btn--link" data-action="switchToSignup">Sign Up</button></p>
    </div>
</div>`,

    signupPopup: `
<div class="popup" id="signupPopup" role="dialog" aria-modal="true" aria-labelledby="signupTitle">
    <div class="popup__panel popup__panel--wide popup__panel--signup">
        <button class="popup__close" data-close="signupPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </div>
        <h2 class="popup__title" id="signupTitle">Create Account</h2>
        <p class="popup__subtitle">Join the ORBIT community</p>

        <form class="popup__form" id="signupForm" novalidate>
            <div class="avatar-upload" id="avatarUpload">
                <input type="file" id="avatarInput" accept="image/*" hidden>
                <div class="avatar-upload__preview" id="avatarPreview">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <span class="avatar-upload__label">Choose Avatar</span>
            </div>

            <div class="input-group">
                <label for="signupUsername">Username <span class="required">*</span></label>
                <input type="text" id="signupUsername" placeholder="Choose a username" required autocomplete="username">
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="signupEmail">Email / Phone Number <span class="required">*</span></label>
                <input type="text" id="signupEmail" placeholder="Email or phone number" required autocomplete="email">
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="signupPassword">Password <span class="required">*</span></label>
                <input type="password" id="signupPassword" placeholder="Create a password" required autocomplete="new-password" minlength="6">
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="signupConfirmPassword">Confirm Password <span class="required">*</span></label>
                <input type="password" id="signupConfirmPassword" placeholder="Confirm your password" required autocomplete="off">
                <span class="input-group__error"></span>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Create Account</button>
        </form>

        <div class="popup__divider"><span>or</span></div>

        <button class="btn btn--google btn--full">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
        </button>

        <p class="popup__switch">Already have an account? <button class="btn--link" data-action="switchToLogin">Log In</button></p>
    </div>
</div>`,

    forgotPopup: `
<div class="popup" id="forgotPopup" role="dialog" aria-modal="true" aria-labelledby="forgotTitle">
    <div class="popup__panel popup__panel--small">
        <button class="popup__close" data-close="forgotPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h2 class="popup__title" id="forgotTitle">Reset Password</h2>
        <p class="popup__subtitle">Enter your email and we'll send you a reset link</p>

        <form class="popup__form" id="forgotForm" novalidate>
            <div class="input-group">
                <label for="forgotEmail">Email Address</label>
                <input type="email" id="forgotEmail" placeholder="your@email.com" required>
                <span class="input-group__error"></span>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Send Reset Link</button>
        </form>

        <p class="popup__switch"><button class="btn--link" data-action="backToLogin">← Back to Log In</button></p>
    </div>
</div>`,

    channelPopup: `
<div class="popup" id="channelPopup" role="dialog" aria-modal="true" aria-labelledby="channelTitle">
    <div class="popup__panel popup__panel--wide">
        <button class="popup__close" data-close="channelPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></svg>
        </div>
        <h2 class="popup__title" id="channelTitle">Create Channel</h2>
        <p class="popup__subtitle">Launch your own corner of the ORBIT universe</p>

        <form class="popup__form" id="channelForm" novalidate>
            <div class="input-group">
                <label for="channelName">Channel Name <span class="required">*</span></label>
                <input type="text" id="channelName" placeholder="1–100 characters" maxlength="100" required>
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="channelHandle">Handle <span class="required">*</span></label>
                <input type="text" id="channelHandle" placeholder="letters, numbers, underscores (max 30)" maxlength="30" required autocomplete="off">
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="channelDescription">Description</label>
                <textarea id="channelDescription" rows="3" maxlength="10000" placeholder="Tell viewers what your channel is about..."></textarea>
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="channelAvatarUrl">Avatar URL</label>
                <input type="url" id="channelAvatarUrl" placeholder="https://example.com/avatar.png" maxlength="500">
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="channelBannerUrl">Banner URL</label>
                <input type="url" id="channelBannerUrl" placeholder="https://example.com/banner.png" maxlength="500">
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="channelWebsite">Website</label>
                <input type="url" id="channelWebsite" placeholder="https://example.com" maxlength="500">
                <span class="input-group__error"></span>
            </div>
            <div class="input-group">
                <label for="channelContactEmail">Contact Email</label>
                <input type="email" id="channelContactEmail" placeholder="contact@example.com" maxlength="255">
                <span class="input-group__error"></span>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Create Channel</button>
        </form>
    </div>
</div>`,

    uploadPopup: `
<div class="popup" id="uploadPopup" role="dialog" aria-modal="true" aria-labelledby="uploadTitle">
    <div class="popup__panel popup__panel--upload">
        <button class="popup__close" data-close="uploadPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <h2 class="popup__title" id="uploadTitle">Upload Video</h2>
        <p class="popup__subtitle">Share your content with the universe</p>

        <form class="popup__form upload-form" id="uploadForm" novalidate>
            <fieldset class="form-section">
                <legend class="form-section__title">Details</legend>
                <div class="input-group">
                    <label for="videoTitle">Title <span class="required">*</span></label>
                    <input type="text" id="videoTitle" placeholder="Add a catchy title" required>
                </div>
                <div class="input-group">
                    <label for="videoDescription">Description</label>
                    <div id="videoDescription" class="input-area" contenteditable="true" placeholder="Tell viewers about your video. Add #hashtags..."></div>
                    <div class="char-counter" id="descCounter">0 / 5000</div>
                </div>
                <div class="input-group">
                    <label>Thumbnail</label>
                    <div class="thumbnail-options">
                        <div class="file-upload-area thumbnail-box" id="thumbUploadArea">
                            <input type="file" id="thumbUploadInput" accept="image/*" hidden>
                            <div class="file-upload-area__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                            <p class="file-upload-area__text">Upload thumbnail</p>
                        </div>
                        <button type="button" class="thumbnail-box thumbnail-box--frame" id="chooseFrameBtn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/></svg>
                            <span>Choose from video</span>
                        </button>
                    </div>
                </div>
                <div class="input-group">
                    <label>Visibility</label>
                    <div class="radio-group">
                        <label class="radio-item"><input type="radio" name="visibility" value="private"> <span>Private</span></label>
                        <label class="radio-item"><input type="radio" name="visibility" value="unlisted"> <span>Unlisted</span></label>
                        <label class="radio-item"><input type="radio" name="visibility" value="public" checked> <span>Public</span></label>
                    </div>
                </div>
                <div class="input-group">
                    <label for="schedule">Schedule (optional)</label>
                    <input type="datetime-local" id="schedule" class="input--datetime">
                </div>
                <div class="input-group">
                    <label>Audience</label>
                    <div class="radio-group radio-group--vertical">
                        <label class="radio-item"><input type="radio" name="audience" value="kids"> <span>Yes, it's made for kids</span></label>
                        <label class="radio-item"><input type="radio" name="audience" value="not-kids" checked> <span>No, it's not made for kids</span></label>
                        <label class="radio-item"><input type="radio" name="audience" value="not-sure"> <span>Not sure</span></label>
                    </div>
                </div>
            </fieldset>

            <fieldset class="form-section">
                <legend class="form-section__title">Video</legend>
                <div class="input-group">
                    <label>Video File <span class="required">*</span></label>
                    <div class="file-upload-area" id="videoFileArea">
                        <input type="file" id="videoFileInput" accept="video/*" hidden>
                        <div class="file-upload-area__icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        </div>
                        <p class="file-upload-area__text" id="videoFileName">Click to select a video file</p>
                    </div>
                </div>
                <div class="progress-container" id="progressContainer" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-bar__fill" id="progressFill"></div>
                    </div>
                    <span class="progress-text" id="progressText">0%</span>
                </div>
            </fieldset>

            <fieldset class="form-section">
                <legend class="form-section__title">Select</legend>
                <div class="input-group">
                    <label for="language">Language</label>
                    <select id="language" class="select-input">
                        <option value="en">English</option>
                        <option value="fa">Persian</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="ar">Arabic</option>
                        <option value="de">German</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="category">Category</label>
                    <select id="category" class="select-input">
                        <option value="entertainment">Entertainment</option>
                        <option value="gaming">Gaming</option>
                        <option value="music">Music</option>
                        <option value="education">Education</option>
                        <option value="science">Science & Technology</option>
                        <option value="news">News & Politics</option>
                        <option value="sports">Sports</option>
                        <option value="travel">Travel & Events</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>License</label>
                    <div class="radio-group">
                        <label class="radio-item"><input type="radio" name="license" value="standard" checked> <span>Orbit Standard License</span></label>
                        <label class="radio-item"><input type="radio" name="license" value="cc"> <span>Creative Commons</span></label>
                    </div>
                </div>
                <div class="input-group">
                    <label>Comments</label>
                    <div class="radio-group radio-group--vertical">
                        <label class="radio-item"><input type="radio" name="comments" value="hold"> <span>Hold potentially inappropriate comments for review</span></label>
                        <label class="radio-item"><input type="radio" name="comments" value="hide"> <span>Hide all inappropriate comments</span></label>
                        <label class="radio-item"><input type="radio" name="comments" value="allow" checked> <span>Allow all comments</span></label>
                    </div>
                </div>
                <div class="input-group">
                    <label>Tags</label>
                    <div class="tag-section">
                        <div class="tag-display" id="tagDisplay"></div>
                        <div class="tag-input-row">
                            <input type="text" id="tagInput" class="tag-input-simple" placeholder="Add a tag...">
                            <button type="button" id="addTagBtn" class="btn btn--small btn--tag">Add</button>
                        </div>
                        <div class="tag-counter" id="tagCounter">0 / 500 tags</div>
                    </div>
                </div>
            </fieldset>

            <button type="submit" class="btn btn--primary btn--full">Upload Video</button>
        </form>
    </div>
</div>`,

    shortPopup: `
<div class="popup" id="shortPopup" role="dialog" aria-modal="true" aria-labelledby="shortTitle">
    <div class="popup__panel popup__panel--upload">
        <button class="popup__close" data-close="shortPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><polyline points="8 13 10 15 12 13"/></svg>
        </div>
        <h2 class="popup__title" id="shortTitle">Upload Short Video</h2>
        <p class="popup__subtitle">Vertical videos, 60 seconds or less</p>

        <form class="popup__form" id="shortForm" novalidate>
            <div class="input-group">
                <label for="shortTitle">Title</label>
                <input type="text" id="shortTitle" placeholder="Short video title" required>
            </div>
            <div class="input-group">
                <label>Short Video File <span class="required">*</span></label>
                <div class="file-upload-area" id="shortFileArea">
                    <input type="file" id="shortFileInput" accept="video/*" hidden>
                    <div class="file-upload-area__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    </div>
                    <p class="file-upload-area__text" id="shortFileName">Click to select a short video</p>
                </div>
            </div>
            <div class="input-group">
                <label>Visibility</label>
                <div class="radio-group">
                    <label class="radio-item"><input type="radio" name="shortVisibility" value="public" checked> <span>Public</span></label>
                    <label class="radio-item"><input type="radio" name="shortVisibility" value="unlisted"> <span>Unlisted</span></label>
                </div>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Publish Short</button>
        </form>
    </div>
</div>`,

    postPopup: `
<div class="popup" id="postPopup" role="dialog" aria-modal="true" aria-labelledby="postTitle">
    <div class="popup__panel popup__panel--upload">
        <button class="popup__close" data-close="postPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </div>
        <h2 class="popup__title" id="postTitle">New Community Post</h2>
        <p class="popup__subtitle">Share an update with your followers</p>

        <form class="popup__form" id="postForm" novalidate>
            <div class="input-group">
                <label for="postContent">Post Content <span class="required">*</span></label>
                <textarea id="postContent" rows="4" placeholder="What's on your mind?" required></textarea>
            </div>
            <div class="input-group">
                <label>Image (optional)</label>
                <div class="file-upload-area" id="postImageArea">
                    <input type="file" id="postImageInput" accept="image/*" hidden>
                    <div class="file-upload-area__icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <p class="file-upload-area__text" id="postImageName">Click to add an image</p>
                </div>
            </div>
            <button type="submit" class="btn btn--primary btn--full">Publish Post</button>
        </form>
    </div>
</div>`
};

function ensureSharedPopups() {
    for (const [id, html] of Object.entries(SHARED_POPUPS)) {
        if (!document.getElementById(id)) {
            document.body.insertAdjacentHTML('beforeend', html);
        }
    }
}

function initPopups() {
    ensureSharedPopups();
    const MAX_CHARS = 5000;
    const MAX_TAGS = 500;
    const API_BASE = window.API_BASE;
    let tags = [];
    
    let activeWebSocket = null;
    let uploadInProgress = false;
    let wsToken = null; // Cached WebSocket token
    let wsTokenExpiry = 0; // Timestamp when token expires

    // ===== Helper Functions =====
    function clearFormErrors(form) {
        form.querySelectorAll('.input-group__error').forEach(el => el.textContent = '');
    }
    function showFieldError(form, message, fieldId = null) {
        let target;
        if (fieldId) {
            const input = document.getElementById(fieldId);
            target = input?.closest('.input-group')?.querySelector('.input-group__error');
        } else {
            target = form.querySelector('.input-group__error');
        }
        if (target) target.textContent = message;
        else window.showToast(message);
    }

    // Toggle the submit button's pending state (spinner + label) while an auth request runs.
    function setAuthSubmitting(form, loading, loadingText = '') {
        const btn = form.querySelector('button[type="submit"]');
        if (!btn) return;
        if (loading) {
            if (!btn.dataset.label) btn.dataset.label = btn.textContent.trim();
            btn.disabled = true;
            btn.classList.add('btn--loading');
            btn.innerHTML = `<span class="btn__spinner" aria-hidden="true"></span>${loadingText || btn.dataset.label}`;
        } else {
            btn.disabled = false;
            btn.classList.remove('btn--loading');
            btn.textContent = btn.dataset.label || btn.textContent;
        }
    }

    function closeWebSocket() {
        if (activeWebSocket) {
            activeWebSocket.close();
            activeWebSocket = null;
        }
    }

    /**
     * Fetch a short-lived WebSocket token from the backend.
     * Works with HttpOnly cookies because the browser sends them automatically.
     */
    async function getWebSocketToken() {
        // Return cached token if still valid (with 30-second buffer)
        if (wsToken && Date.now() < wsTokenExpiry - 30000) {
            return wsToken;
        }
        
        try {
            const response = await window.fetch(`${API_BASE}/videos/ws-token`);
            
            if (!response.ok) {
                console.error('Failed to fetch WebSocket token:', response.status);
                return null;
            }
            
            const data = await response.json();
            wsToken = data.token;
            wsTokenExpiry = Date.now() + (data.expires_in * 1000);
            
            console.log('WebSocket token obtained (expires in', data.expires_in, 's)');
            return wsToken;
        } catch (err) {
            console.error('Error fetching WebSocket token:', err);
            return null;
        }
    }

    function showTopNotification(message, videoId) {
        const existing = document.getElementById('video-ready-notification');
        if (existing) existing.remove();

        const bar = document.createElement('div');
        bar.id = 'video-ready-notification';
        bar.innerHTML = `
            <div class="video-ready-notification-content">
                <span>✅ ${message}</span>
                <div class="notification-actions">
                    <a href="video.html?id=${encodeURIComponent(videoId)}" class="btn btn-primary btn-sm">Watch Now</a>
                    <button class="btn-close-notification" aria-label="Close">✕</button>
                </div>
            </div>
        `;

        Object.assign(bar.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            zIndex: '10000',
            background: '#2e7d32',
            color: 'white',
            padding: '12px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'slideDown 0.3s ease-out'
        });

        document.body.prepend(bar);

        const closeBtn = bar.querySelector('.btn-close-notification');
        closeBtn.addEventListener('click', () => {
            bar.style.animation = 'slideUp 0.3s ease-in';
            bar.addEventListener('animationend', () => bar.remove());
        });

        setTimeout(() => {
            if (bar.parentNode) {
                bar.style.animation = 'slideUp 0.3s ease-in';
                bar.addEventListener('animationend', () => bar.remove());
            }
        }, 30000);
    }

    function injectNotificationStyles() {
        if (document.getElementById('notification-styles')) return;
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideDown {
                from { transform: translateY(-100%); }
                to { transform: translateY(0); }
            }
            @keyframes slideUp {
                from { transform: translateY(0); }
                to { transform: translateY(-100%); }
            }
            .video-ready-notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                max-width: 1200px;
            }
            .notification-actions {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .btn-close-notification {
                background: transparent;
                border: none;
                color: white;
                font-size: 1.2em;
                cursor: pointer;
                padding: 0 5px;
            }
        `;
        document.head.appendChild(style);
    }

    injectNotificationStyles();

    // ===== WebSocket with First-Message Authentication =====
    async function connectToVideoStatus(videoId, onReady, onError) {
        closeWebSocket();

        // Fetch token from backend (works with HttpOnly cookies)
        const token = await getWebSocketToken();
        if (!token) {
            console.error('Failed to get WebSocket token');
            if (onError) onError('Not authenticated');
            return;
        }

        try {
            const apiUrl = new URL(API_BASE);
            const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${wsProtocol}//${apiUrl.host}/videos/ws/video/${videoId}`;

            console.log('Connecting to WebSocket:', wsUrl);
            const ws = new WebSocket(wsUrl);
            activeWebSocket = ws;

            let authTimeout;
            let authenticated = false;

            ws.onopen = () => {
                console.log('WebSocket connected, sending auth...');
                
                // Send auth token as first message
                ws.send(JSON.stringify({
                    type: "auth",
                    token: token
                }));
                
                authTimeout = setTimeout(() => {
                    if (!authenticated) {
                        console.error('WebSocket authentication timeout');
                        ws.close();
                        if (onError) onError('Authentication timeout');
                    }
                }, 5000);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message:', data);

                    if (data.type === 'auth_ok') {
                        clearTimeout(authTimeout);
                        authenticated = true;
                        console.log('WebSocket authenticated');
                        
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.textContent = 'Processing video...';
                            statusElement.className = 'upload-status processing';
                        }
                        return;
                    }
                    
                    if (data.type === 'auth_error') {
                        clearTimeout(authTimeout);
                        console.error('WebSocket auth failed:', data.message);
                        ws.close();
                        if (onError) onError(data.message || 'Authentication failed');
                        return;
                    }

                    if (!authenticated) {
                        console.warn('Received message before auth, ignoring');
                        return;
                    }

                    if (data.type === 'video.ready' && data.videoId === videoId) {
                        console.log('Video ready!');
                        
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.textContent = 'Video ready for playback!';
                            statusElement.className = 'upload-status success';
                        }
                        
                        closeWebSocket();
                        if (onReady) onReady(videoId);
                    } 
                    else if (data.type === 'video.error') {
                        console.error('Video error:', data.error);
                        
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.textContent = `Processing failed: ${data.error}`;
                            statusElement.className = 'upload-status error';
                        }
                        
                        closeWebSocket();
                        window.showToast(`❌ Video processing failed: ${data.error}`);
                        if (onError) onError(data.error);
                    }
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                clearTimeout(authTimeout);
                
                const statusElement = document.getElementById('uploadStatus');
                if (statusElement) {
                    statusElement.textContent = 'Connection error';
                    statusElement.className = 'upload-status error';
                }
            };

            ws.onclose = (event) => {
                console.log('WebSocket closed:', event.code, event.reason);
                clearTimeout(authTimeout);
                
                // Don't reconnect on auth failures or intentional closes
                if (event.code !== 1000 && event.code !== 1005 && event.code !== 4001 && activeWebSocket === ws) {
                    console.log('Unexpected close, reconnecting...');
                    setTimeout(() => {
                        if (activeWebSocket === ws) {
                            connectToVideoStatus(videoId, onReady, onError);
                        }
                    }, 3000);
                }
            };
        } catch (err) {
            console.error('Invalid API_BASE:', err);
            if (onError) onError('Invalid API configuration');
        }
    }
    
    function showUploadProgress(show, status = 'uploading') {
        const progressContainer = document.getElementById('progressContainer');
        const uploadStatus = document.getElementById('uploadStatus');
        
        if (progressContainer) {
            progressContainer.style.display = show ? 'flex' : 'none';
        }
        
        if (uploadStatus) {
            if (show) {
                uploadStatus.style.display = 'block';
                uploadStatus.textContent = status === 'uploading' ? 'Uploading video...' : 'Processing video...';
                uploadStatus.className = `upload-status ${status}`;
            } else {
                uploadStatus.style.display = 'none';
            }
        }
    }

    // ===== Auth Forms =====
    // Delegated on document: works even if the popup HTML is inserted after this script runs.
    // e.preventDefault() is called synchronously, so the browser never does a native form submit
    // (which would reload the page and drop the login request).

    // Backend errors come back as JSON text like {"detail":"..."}; show just the detail.
    function parseError(err) {
        const raw = (err && err.message) || '';
        try {
            const j = JSON.parse(raw);
            if (typeof j.detail === 'string') return j.detail;
        } catch (_) { /* not JSON */ }
        return raw;
    }

    const authHandlers = {
        loginForm: async (form) => {
            clearFormErrors(form);
            const username = form.querySelector('#loginUsername')?.value.trim();
            const password = form.querySelector('#loginPassword')?.value;
            if (!username || !password) {
                showFieldError(form, 'Please fill all fields');
                return;
            }
            setAuthSubmitting(form, true, 'Logging in...');
            try {
                console.log('[popups] login submit for', username);
                await window.loginUser({ username, password });
                window.closeAllPopups();
                await window.fetchCurrentUser();
                if (!window.currentUser) {
                    window.showToast('Could not load user data, but you are logged in.');
                } else {
                    window.showToast(`Welcome back, ${window.currentUser.username}!`);
                }
            } catch (err) {
                console.error('[popups] login failed:', err);
                const detail = parseError(err);
                const msg = /invalid|incorrect|credentials/i.test(detail)
                    ? 'Invalid username or password'
                    : (detail && detail.length < 120 ? detail : 'Login failed');
                showFieldError(form, msg);
            } finally {
                setAuthSubmitting(form, false);
            }
        },

        signupForm: async (form) => {
            clearFormErrors(form);
            const username = form.querySelector('#signupUsername')?.value.trim();
            const email = form.querySelector('#signupEmail')?.value.trim();
            const password = form.querySelector('#signupPassword')?.value;
            const confirmPassword = form.querySelector('#signupConfirmPassword')?.value;
            if (!username || !email || !password || !confirmPassword) {
                showFieldError(form, 'All required fields must be filled');
                return;
            }
            if (password !== confirmPassword) {
                showFieldError(form, 'Passwords do not match', 'signupPassword');
                return;
            }
            if (password.length < 6) {
                showFieldError(form, 'Password must be at least 6 characters', 'signupPassword');
                return;
            }
            setAuthSubmitting(form, true, 'Creating account...');
            try {
                await window.registerUser({ username, email, password, confirm_password: confirmPassword });
                window.closeAllPopups();
                window.openPopupById('loginPopup');
                window.showToast('Account created! Please log in.');
            } catch (err) {
                console.error('[popups] register failed:', err);
                let errorMsg = parseError(err);
                if (errorMsg.includes('Username already registered')) errorMsg = 'Username already exists';
                else if (errorMsg.includes('Email already registered')) errorMsg = 'Email already exists';
                showFieldError(form, errorMsg || 'Registration failed');
            } finally {
                setAuthSubmitting(form, false);
            }
        },

        forgotForm: async (form) => {
            const email = form.querySelector('#forgotEmail')?.value.trim();
            if (email) {
                window.showToast('If this email exists, you will receive a reset link (feature coming soon).');
                window.closeAllPopups();
                window.openPopupById('loginPopup');
            } else {
                showFieldError(form, 'Email is required');
            }
        },

        // POST /channels/ – mirrors backend ChannelCreate schema
        channelForm: async (form) => {
            clearFormErrors(form);

            if (!window.currentUser) {
                window.showToast('Please log in to create a channel.');
                window.openPopupById('loginPopup');
                return;
            }

            const name = form.querySelector('#channelName')?.value.trim();
            // A leading @ is convenient to type but not allowed by the handle pattern
            const handle = (form.querySelector('#channelHandle')?.value.trim() || '').replace(/^@+/, '');
            const description = form.querySelector('#channelDescription')?.value.trim();
            const avatar_url = form.querySelector('#channelAvatarUrl')?.value.trim();
            const banner_url = form.querySelector('#channelBannerUrl')?.value.trim();
            const website = form.querySelector('#channelWebsite')?.value.trim();
            const contact_email = form.querySelector('#channelContactEmail')?.value.trim();

            if (!name) { showFieldError(form, 'Channel name is required', 'channelName'); return; }
            if (!handle) { showFieldError(form, 'Handle is required', 'channelHandle'); return; }
            if (!/^[a-zA-Z0-9_]{1,30}$/.test(handle)) {
                showFieldError(form, 'Handle must be 1–30 characters: letters, numbers, underscores', 'channelHandle');
                return;
            }
            const urlFields = [['channelAvatarUrl', avatar_url], ['channelBannerUrl', banner_url], ['channelWebsite', website]];
            for (const [fieldId, value] of urlFields) {
                if (!value) continue;
                let valid = false;
                try { const u = new URL(value); valid = u.protocol === 'http:' || u.protocol === 'https:'; } catch (_) {}
                if (!valid) { showFieldError(form, 'Must be a valid http(s) URL', fieldId); return; }
            }
            if (contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
                showFieldError(form, 'Must be a valid email address', 'channelContactEmail');
                return;
            }

            const payload = { name, handle };
            if (description) payload.description = description;
            if (avatar_url) payload.avatar_url = avatar_url;
            if (banner_url) payload.banner_url = banner_url;
            if (website) payload.website = website;
            if (contact_email) payload.contact_email = contact_email;

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            try {
                const response = await window.fetch(`${API_BASE}/channels/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    let detail = `Request failed (${response.status})`;
                    try {
                        const errorBody = await response.json();
                        if (typeof errorBody.detail === 'string') detail = errorBody.detail;
                        else if (Array.isArray(errorBody.detail)) detail = errorBody.detail.map(e => e.msg).join('. ');
                    } catch (_) {}
                    if (response.status === 401) detail = 'You are not logged in. Please log in again.';
                    if (/handle/i.test(detail)) showFieldError(form, detail, 'channelHandle');
                    else if (/channel name|name '/i.test(detail)) showFieldError(form, detail, 'channelName');
                    else showFieldError(form, detail);
                    return;
                }

                const channel = await response.json();
                window.closeAllPopups();
                form.reset();
                window.showToast(`✅ Channel "${channel.name}" created!`);
            } catch (err) {
                console.error('[popups] create channel failed:', err);
                showFieldError(form, 'Could not reach the server. Please try again.');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        }
    };

    document.addEventListener('submit', (e) => {
        const handler = authHandlers[e.target && e.target.id];
        if (!handler) return;          // not an auth form (e.g. uploadForm has its own handler)
        e.preventDefault();
        handler(e.target);
    });

    const AUTH_SWITCH_ACTIONS = ['switchToSignup', 'switchToLogin', 'forgotPassword', 'backToLogin'];

    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const action = btn.dataset.action;
        if (!AUTH_SWITCH_ACTIONS.includes(action)) return; // not ours — let other handlers deal with it
        window.closeAllPopups();
        if (action === 'switchToSignup') window.openPopupById('signupPopup');
        else if (action === 'switchToLogin') window.openPopupById('loginPopup');
        else if (action === 'forgotPassword') window.openPopupById('forgotPopup');
        else if (action === 'backToLogin') window.openPopupById('loginPopup');
    });

    function uploadFileWithProgress(url, file, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const percent = Math.round((event.loaded / event.total) * 100);
                    onProgress(percent, event.loaded, event.total);
                }
            });
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
                }
            });
            xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
            xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
            xhr.open('PUT', url);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
            xhr.send(file);
        });
    }

    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (uploadInProgress) {
                window.showToast('Upload already in progress...');
                return;
            }

            if (!window.currentUser) {
                window.showToast('Please log in to upload videos.');
                window.openPopupById('loginPopup');
                return;
            }

            const title = document.getElementById('videoTitle')?.value.trim();
            if (!title) {
                window.showToast('Please enter a video title.');
                return;
            }
            const descriptionDiv = document.getElementById('videoDescription');
            const description = descriptionDiv?.innerText || '';
            const visibilityRadio = document.querySelector('input[name="visibility"]:checked');
            const visibility = visibilityRadio ? visibilityRadio.value : 'public';
            const scheduleInput = document.getElementById('schedule');
            let scheduled_at = scheduleInput?.value ? new Date(scheduleInput.value).toISOString() : null;

            const audienceRadio = document.querySelector('input[name="audience"]:checked');
            let is_made_for_kids = false;
            if (audienceRadio) {
                if (audienceRadio.value === 'kids') is_made_for_kids = true;
                else if (audienceRadio.value === 'not-kids') is_made_for_kids = false;
            }

            const language = document.getElementById('language')?.value || 'en';
            const categorySelect = document.getElementById('category');
            const category_id = categorySelect ? parseInt(categorySelect.value) || null : null;
            const licenseRadio = document.querySelector('input[name="license"]:checked');
            const license = licenseRadio ? licenseRadio.value : 'standard';
            const commentsRadio = document.querySelector('input[name="comments"]:checked');
            let allow_comments = true;
            if (commentsRadio) {
                if (commentsRadio.value === 'allow') allow_comments = true;
                else if (commentsRadio.value === 'hide') allow_comments = false;
                else allow_comments = true;
            }

            const tagsList = tags;

            const videoFileInput = document.getElementById('videoFileInput');
            const videoFile = videoFileInput?.files[0];
            if (!videoFile) {
                window.showToast('Please select a video file.');
                return;
            }
            if (videoFile.size > 500 * 1024 * 1024) {
                window.showToast('File too large. Max 500MB.');
                return;
            }
            if (!videoFile.type.startsWith('video/')) {
                window.showToast('File must be a video.');
                return;
            }

            const thumbInput = document.getElementById('thumbUploadInput');
            const thumbnailFile = thumbInput?.files[0] || null;

            const progressContainer = document.getElementById('progressContainer');
            const progressFill = document.getElementById('progressFill');
            const progressText = document.getElementById('progressText');
            const uploadStatus = document.getElementById('uploadStatus');
            
            if (progressContainer) progressContainer.style.display = 'flex';
            if (progressFill) progressFill.style.width = '0%';
            if (progressText) progressText.textContent = '0%';
            if (uploadStatus) {
                uploadStatus.style.display = 'block';
                uploadStatus.textContent = 'Preparing upload...';
                uploadStatus.className = 'upload-status uploading';
            }

            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            uploadInProgress = true;

            let upload_url = null;
            let object_key = null;

            try {
                const filenameEncoded = encodeURIComponent(videoFile.name);
                const presignedResponse = await window.fetch(
                    `${API_BASE}/videos/upload-url?filename=${filenameEncoded}`
                );

                if (!presignedResponse.ok) {
                    let errMsg = `Server error (${presignedResponse.status})`;
                    try {
                        const errorBody = await presignedResponse.json();
                        if (Array.isArray(errorBody.detail)) {
                            errMsg = errorBody.detail.map(e => e.msg).join('. ');
                        } else if (typeof errorBody.detail === 'string') {
                            errMsg = errorBody.detail;
                        }
                    } catch (_) {}
                    if (presignedResponse.status === 401) {
                        errMsg = 'You are not logged in. Please log in again.';
                    }
                    throw new Error(errMsg);
                }

                const data = await presignedResponse.json();
                upload_url = data.upload_url;
                object_key = data.object_key;
                console.log('Presigned URL obtained:', upload_url);

                if (uploadStatus) uploadStatus.textContent = 'Uploading video...';
                await uploadFileWithProgress(
                    upload_url,
                    videoFile,
                    (percent, loaded, total) => {
                        if (progressFill) progressFill.style.width = percent + '%';
                        if (progressText) {
                            const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
                            const totalMB = (total / (1024 * 1024)).toFixed(1);
                            progressText.textContent = `${percent}% (${loadedMB}MB / ${totalMB}MB)`;
                        }
                    }
                );

                let thumbnail_key = null;
                if (thumbnailFile) {
                    if (uploadStatus) uploadStatus.textContent = 'Uploading thumbnail...';
                    const thumbResp = await fetch(`${API_BASE}/videos/thumbnail-upload-url?filename=${encodeURIComponent(thumbnailFile.name)}&content_type=${encodeURIComponent(thumbnailFile.type || 'image/jpeg')}`);
                    if (thumbResp.ok) {
                        const thumbData = await thumbResp.json();
                        await uploadFileWithProgress(thumbData.upload_url, thumbnailFile);
                        thumbnail_key = thumbData.object_key;
                    } else {
                        console.warn('Thumbnail upload URL request failed');
                    }
                }

                if (uploadStatus) uploadStatus.textContent = 'Starting video processing...';
                const completePayload = {
                    title,
                    description: description || null,
                    original_filename: videoFile.name,
                    file_size: videoFile.size,
                    mime_type: videoFile.type,
                    object_key,
                    visibility,
                    category_id,
                    language,
                    allow_comments,
                    is_made_for_kids,
                    is_short: false,
                    scheduled_at,
                    license,
                    tags: tagsList,
                    thumbnail_key
                };

                const completeResponse = await fetch(`${API_BASE}/videos/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(completePayload)
                });

                if (!completeResponse.ok) {
                    let errData;
                    try { errData = await completeResponse.json(); } catch (_) { }
                    throw new Error(errData?.detail || `Confirmation failed (${completeResponse.status})`);
                }

                const completeData = await completeResponse.json();
                console.log('Upload complete, video ID:', completeData.video_id);
                
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressFill) progressFill.style.width = '0%';
                if (progressText) progressText.textContent = '0%';
                
                window.showToast(`✅ Upload complete! Video ID: ${completeData.video_id} – Processing started.`);
                
                if (uploadStatus) {
                    uploadStatus.textContent = 'Processing video... This may take a few minutes.';
                    uploadStatus.className = 'upload-status processing';
                }
                
                // Connect to WebSocket for real-time updates
                connectToVideoStatus(
                    completeData.public_id,
                    async (videoId) => {
                        console.log('Video ready:', videoId);
                        
                        try {
                            const signedUrlResponse = await fetch(
                                `${API_BASE}/videos/${videoId}/signed-url`
                            );
                            if (signedUrlResponse.ok) {
                                const signedUrlData = await signedUrlResponse.json();
                                window.lastSignedUrl = signedUrlData.signed_url;
                            }
                        } catch (err) {
                            console.error('Error fetching signed URL:', err);
                        }
                        
                        showTopNotification('Your video is ready!', videoId);
                        
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.innerHTML = `
                                <div class="processing-complete">
                                    <span>✅ Video ready!</span>
                                    <button onclick="window.location.href='video.html?id=${encodeURIComponent(videoId)}'" class="btn btn-primary btn-sm">
                                        Watch Now
                                    </button>
                                </div>
                            `;
                            statusElement.className = 'upload-status success';
                        }
                        
                        uploadForm.reset();
                        if (descriptionDiv) descriptionDiv.innerHTML = '';
                        if (document.getElementById('descCounter')) document.getElementById('descCounter').textContent = '0 / 5000';
                        tags = [];
                        renderTags();
                        const videoFileNameSpan = document.getElementById('videoFileName');
                        if (videoFileNameSpan) videoFileNameSpan.textContent = 'Click to select a video file';
                        if (typeof window.fetchCurrentUser === 'function') window.fetchCurrentUser();
                        
                        uploadInProgress = false;
                        if (submitBtn) submitBtn.disabled = false;
                        
                        setTimeout(() => {
                            const statusEl = document.getElementById('uploadStatus');
                            if (statusEl) statusEl.style.display = 'none';
                        }, 10000);
                    },
                    (error) => {
                        console.error('Video failed:', error);
                        const statusElement = document.getElementById('uploadStatus');
                        if (statusElement) {
                            statusElement.textContent = `Processing failed: ${error}`;
                            statusElement.className = 'upload-status error';
                        }
                        uploadInProgress = false;
                        if (submitBtn) submitBtn.disabled = false;
                    }
                );
                
            } catch (err) {
                console.error('Upload error:', err);
                window.showToast(`Upload failed: ${err.message}`);
                
                const statusElement = document.getElementById('uploadStatus');
                if (statusElement) {
                    statusElement.textContent = `Upload failed: ${err.message}`;
                    statusElement.className = 'upload-status error';
                }
                
                uploadInProgress = false;
                if (submitBtn) submitBtn.disabled = false;
                if (progressContainer) progressContainer.style.display = 'none';
                if (progressFill) progressFill.style.width = '0%';
                if (progressText) progressText.textContent = '0%';
            }
        });
    }

    // ===== Short Video Upload =====
    const shortForm = document.getElementById('shortForm');
    if (shortForm) {
        shortForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('shortTitle')?.value.trim();
            if (!title) { window.showToast('Please enter a title.'); return; }
            const shortFile = document.getElementById('shortFileInput');
            if (shortFile && shortFile.files.length === 0) { window.showToast('Please select a short video.'); return; }
            window.showToast('Short published! (backend integration coming soon)');
            window.closeAllPopups();
            shortForm.reset();
            const shortFileName = document.getElementById('shortFileName');
            if (shortFileName) shortFileName.textContent = 'Click to select a short video';
        });
    }

    // ===== Community Post Popup =====
    const postForm = document.getElementById('postForm');
    if (postForm) {
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const content = document.getElementById('postContent')?.value.trim();
            if (!content) { window.showToast('Please write something.'); return; }
            window.showToast('Post published!');
            window.closeAllPopups();
            postForm.reset();
            const postImageName = document.getElementById('postImageName');
            if (postImageName) postImageName.textContent = 'Click to add an image';
        });
    }

    // ===== Create Channel =====
    // Enforce the handle pattern (^[a-zA-Z0-9_]+$) as the user types
    const channelHandleInput = document.getElementById('channelHandle');
    if (channelHandleInput) {
        channelHandleInput.addEventListener('input', () => {
            const cleaned = channelHandleInput.value.replace(/[^a-zA-Z0-9_]/g, '');
            if (cleaned !== channelHandleInput.value) channelHandleInput.value = cleaned;
        });
    }

    // ===== Description Editor =====
    const descDiv = document.getElementById('videoDescription');
    const descCounter = document.getElementById('descCounter');
    if (descDiv) {
        function getCursorOffset(container) {
            const sel = window.getSelection();
            if (sel.rangeCount === 0) return 0;
            const range = sel.getRangeAt(0).cloneRange();
            range.selectNodeContents(container);
            range.setEnd(sel.getRangeAt(0).endContainer, sel.getRangeAt(0).endOffset);
            return range.toString().length;
        }
        function setCursorOffset(container, offset) {
            const sel = window.getSelection();
            const range = document.createRange();
            const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
            let node, currentPos = 0;
            while ((node = walker.nextNode())) {
                const len = node.textContent.length;
                if (currentPos + len >= offset) {
                    range.setStart(node, offset - currentPos);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    return;
                }
                currentPos += len;
            }
            range.selectNodeContents(container);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
        }
        function highlightHashtagsInElement(el) {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            const nodesToReplace = [];
            while (walker.nextNode()) {
                const node = walker.currentNode;
                if (/#[\w\u0600-\u06FF]+/g.test(node.textContent)) nodesToReplace.push(node);
            }
            nodesToReplace.forEach(textNode => {
                const fragment = document.createDocumentFragment();
                const text = textNode.textContent;
                const regex = /#[\w\u0600-\u06FF]+/g;
                let lastIdx = 0, match;
                while ((match = regex.exec(text)) !== null) {
                    if (match.index > lastIdx) fragment.appendChild(document.createTextNode(text.substring(lastIdx, match.index)));
                    const span = document.createElement('span');
                    span.className = 'hashtag';
                    span.textContent = match[0];
                    fragment.appendChild(span);
                    lastIdx = regex.lastIndex;
                }
                if (lastIdx < text.length) fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
                textNode.parentNode.replaceChild(fragment, textNode);
            });
        }
        function enforceMaxLength() {
            let text = descDiv.innerText;
            if (text.length > MAX_CHARS) {
                descDiv.innerText = text.substring(0, MAX_CHARS);
                setCursorOffset(descDiv, MAX_CHARS);
            }
            descCounter.textContent = `${descDiv.innerText.length} / ${MAX_CHARS}`;
        }
        descDiv.addEventListener('input', () => {
            const cursorPos = getCursorOffset(descDiv);
            enforceMaxLength();
            descDiv.querySelectorAll('.hashtag').forEach(span => span.replaceWith(document.createTextNode(span.textContent)));
            highlightHashtagsInElement(descDiv);
            setCursorOffset(descDiv, cursorPos);
        });
    }

    // ===== Thumbnail & Video UI =====
    const thumbUploadArea = document.getElementById('thumbUploadArea');
    const thumbUploadInput = document.getElementById('thumbUploadInput');
    if (thumbUploadArea) thumbUploadArea.addEventListener('click', () => thumbUploadInput.click());
    if (thumbUploadInput) thumbUploadInput.addEventListener('change', () => {
        if (thumbUploadInput.files[0]) window.showToast('Thumbnail selected.');
    });
    const chooseFrameBtn = document.getElementById('chooseFrameBtn');
    if (chooseFrameBtn) chooseFrameBtn.addEventListener('click', () => window.showToast('Frame selection coming soon.'));

    const videoFileArea = document.getElementById('videoFileArea');
    const videoFileInput = document.getElementById('videoFileInput');
    const videoFileName = document.getElementById('videoFileName');
    if (videoFileArea) videoFileArea.addEventListener('click', () => videoFileInput.click());
    if (videoFileInput) {
        videoFileInput.addEventListener('change', () => {
            if (videoFileInput.files[0]) {
                videoFileName.textContent = videoFileInput.files[0].name;
            } else {
                videoFileName.textContent = 'Click to select a video file';
                const progressContainer = document.getElementById('progressContainer');
                if (progressContainer) progressContainer.style.display = 'none';
            }
        });
    }

    const shortFileArea = document.getElementById('shortFileArea');
    const shortFileInput = document.getElementById('shortFileInput');
    if (shortFileArea) shortFileArea.addEventListener('click', () => shortFileInput.click());
    if (shortFileInput) {
        shortFileInput.addEventListener('change', () => {
            const shortFileName = document.getElementById('shortFileName');
            if (shortFileName) shortFileName.textContent = shortFileInput.files[0] ? shortFileInput.files[0].name : 'Click to select a short video';
        });
    }

    const postImageArea = document.getElementById('postImageArea');
    const postImageInput = document.getElementById('postImageInput');
    if (postImageArea) postImageArea.addEventListener('click', () => postImageInput.click());
    if (postImageInput) {
        postImageInput.addEventListener('change', () => {
            const postImageName = document.getElementById('postImageName');
            if (postImageName) postImageName.textContent = postImageInput.files[0] ? postImageInput.files[0].name : 'Click to add an image';
        });
    }

    // ===== Tags System =====
    const tagDisplay = document.getElementById('tagDisplay');
    const tagInput = document.getElementById('tagInput');
    const addTagBtn = document.getElementById('addTagBtn');
    const tagCounterSpan = document.getElementById('tagCounter');
    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    function renderTags() {
        if (!tagDisplay) return;
        tagDisplay.innerHTML = tags.map((t, i) => `<span class="tag-chip">${escapeHtml(t)}<button type="button" data-index="${i}">×</button></span>`).join('');
        if (tagCounterSpan) tagCounterSpan.textContent = `${tags.length} / ${MAX_TAGS} tags`;
        document.querySelectorAll('.tag-chip button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.index);
                tags.splice(idx, 1);
                renderTags();
            });
        });
    }
    function addTag(text) {
        text = text.trim();
        if (text === '' || tags.includes(text) || tags.length >= MAX_TAGS) return;
        tags.push(text);
        renderTags();
        if (tagInput) tagInput.value = '';
    }
    if (tagInput && addTagBtn) {
        tagInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput.value); } });
        addTagBtn.addEventListener('click', () => addTag(tagInput.value));
        tagInput.addEventListener('keyup', (e) => { if (e.key === ',') addTag(tagInput.value.replace(',', '')); });
    }

    // ===== Avatar Preview =====
    const avatarUploadArea = document.getElementById('avatarUpload');
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarUploadArea) avatarUploadArea.addEventListener('click', () => avatarInput.click());
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && avatarPreview) {
                const reader = new FileReader();
                reader.onload = ev => avatarPreview.innerHTML = `<img src="${ev.target.result}">`;
                reader.readAsDataURL(file);
            }
        });
    }
    
    // ===== Cleanup =====
    window.addEventListener('beforeunload', () => {
        closeWebSocket();
    });
}

// Run after the DOM is parsed (getElementById calls above need the elements to exist)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPopups);
} else {
    initPopups();
}