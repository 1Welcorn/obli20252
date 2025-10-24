# GitHub Pages Deployment Guide

## Quick Steps:

1. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Name: `obli-fluency-pathfinder`
   - Make it Public
   - Don't initialize with README

2. **Upload Files**:
   - Go to your new repository
   - Click "uploading an existing file"
   - Drag and drop ALL files from the `dist` folder
   - Commit message: "Initial deployment"
   - Click "Commit changes"

3. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Source: "Deploy from a branch"
   - Branch: "main" (or "master")
   - Folder: "/ (root)"
   - Click "Save"

4. **Your App Will Be Live At**:
   - `https://[your-username].github.io/obli-fluency-pathfinder`

## Files to Upload:
Upload ALL files from the `dist` folder:
- index.html
- assets/ folder (with all JS and CSS files)

## Important Notes:
- Make sure to upload the CONTENTS of the dist folder, not the folder itself
- Your app will be available in 1-2 minutes after enabling Pages
- You can update by uploading new files anytime
