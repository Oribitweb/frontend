<?php
$pageTitle = "ORBIT — Explore the Universe of Video";
$extraCSS = '<link rel="stylesheet" href="css/main.css">';
$activePage = 'Explore';
include 'includes/header.php';
include 'includes/sidebar.php';
?>

<main class="main-content" id="mainContent">
    <div class="category-pills">
        <button class="category-pill category-pill--active">All</button>
        <button class="category-pill">Music</button>
        <button class="category-pill">Gaming</button>
        <button class="category-pill">Live Streams</button>
        <button class="category-pill">Science</button>
        <button class="category-pill">Technology</button>
        <button class="category-pill">Art</button>
        <button class="category-pill">Sports</button>
        <button class="category-pill">Education</button>
        <button class="category-pill">Podcasts</button>
    </div>
    <div class="video-grid" id="videoGrid"></div>
</main>

<!-- ==================== LOGIN POPUP ==================== -->
<div class="popup" id="loginPopup" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
    <div class="popup__panel">
        <button class="popup__close" data-close="loginPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 18c1.4-2.3 3.2-3.5 5-3.5s3.6 1.2 5 3.5"/></svg>
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
</div>

<!-- ==================== SIGNUP POPUP ==================== -->
<div class="popup" id="signupPopup" role="dialog" aria-modal="true" aria-labelledby="signupTitle">
    <div class="popup__panel popup__panel--wide popup__panel--signup">
        <button class="popup__close" data-close="signupPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        </div>
        <h2 class="popup__title" id="signupTitle">Create Account</h2>
        <p class="popup__subtitle">Join the ORBIT community</p>

        <form class="popup__form" id="signupForm" novalidate>
            <div class="avatar-upload" id="avatarUpload">
                <input type="file" id="avatarInput" accept="image/*" hidden>
                <div class="avatar-upload__preview" id="avatarPreview">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
</div>

<!-- ==================== FORGOT PASSWORD POPUP ==================== -->
<div class="popup" id="forgotPopup" role="dialog" aria-modal="true" aria-labelledby="forgotTitle">
    <div class="popup__panel popup__panel--small">
        <button class="popup__close" data-close="forgotPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
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
</div>

<!-- ==================== UPLOAD VIDEO POPUP ==================== -->
<div class="popup" id="uploadPopup" role="dialog" aria-modal="true" aria-labelledby="uploadTitle">
    <div class="popup__panel popup__panel--upload">
        <button class="popup__close" data-close="uploadPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
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
                        <label class="radio-item"><input type="radio" name="audience" value="kids"> <span>Yes, it’s made for kids</span></label>
                        <label class="radio-item"><input type="radio" name="audience" value="not-kids" checked> <span>No, it’s not made for kids</span></label>
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
</div>

<!-- ==================== SHORT VIDEO POPUP ==================== -->
<div class="popup" id="shortPopup" role="dialog" aria-modal="true" aria-labelledby="shortTitle">
    <div class="popup__panel popup__panel--upload">
        <button class="popup__close" data-close="shortPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><polyline points="8 13 10 15 12 13"/></svg>
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
</div>

<!-- ==================== COMMUNITY POST POPUP ==================== -->
<div class="popup" id="postPopup" role="dialog" aria-modal="true" aria-labelledby="postTitle">
    <div class="popup__panel popup__panel--upload">
        <button class="popup__close" data-close="postPopup" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="popup__icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
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
</div>

<?php include 'includes/footer.php'; ?>
<script src="js/main.js"></script>
</body>
</html>