# 🌟 Genshin Impact Wish Simulator Setup Guide

## Quick Setup Instructions

### 1. Create a New Directory
\`\`\`bash
mkdir genshin-wish-simulator
cd genshin-wish-simulator
\`\`\`

### 2. Initialize the Project
Copy all the files from the code project into your directory, then run:

\`\`\`bash
npm install
npm run setup
npm start
\`\`\`

### 3. Access the Application
Open your browser and go to: `http://localhost:3000`

## Troubleshooting

### If you get dependency errors:
1. Make sure you're in a fresh directory (not an existing React project)
2. Delete `node_modules` and `package-lock.json` if they exist
3. Run `npm install` again

### If you get SQLite errors:
- On Windows: You might need to install Visual Studio Build Tools
- On Mac: Make sure Xcode command line tools are installed
- On Linux: Install `build-essential` package

### Alternative SQLite Setup (if better-sqlite3 fails):
Replace better-sqlite3 with sqlite3 in package.json:
\`\`\`json
"sqlite3": "^5.1.6"
\`\`\`

Then modify the database code in server.js to use sqlite3 instead.

## File Structure
\`\`\`
genshin-wish-simulator/
├── server.js              # Main server
├── setup.js               # Setup script
├── package.json           # Dependencies
├── public/                # Static files
│   ├── *.html            # Web pages
│   ├── css/style.css     # Styles
│   ├── js/*.js           # Client scripts
│   └── images/           # Game assets
└── README.md             # Documentation
\`\`\`

## Features
- ✅ Authentic Genshin Impact characters and weapons
- ✅ Accurate pity system (90/80 hard pity, 75/65 soft pity)
- ✅ 50/50 system for character banners
- ✅ Epitomized Path for weapon banners
- ✅ User accounts with secure authentication
- ✅ Pull history and statistics tracking
- ✅ Responsive Genshin-themed UI
- ✅ Real-time wish animations

## Next Steps
1. Replace placeholder images with actual Genshin Impact assets
2. Add more characters and weapons as they're released
3. Implement banner rotation system
4. Add sound effects and music
5. Deploy to a hosting service

Enjoy your wishing, Traveler! 🌟
