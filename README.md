# 🌟 Genshin Impact Wish Simulator

An Genshin Impact wish simulator built with Node.js, featuring real characters and weapons from the game with accurate wishing mechanics.

## ✨ Features

### 🎯 Authentic Wishing System
- **Accurate Pity System**: Hard pity at 90 pulls (80 for weapons) with soft pity starting at 75
- **50/50 Mechanics**: Character banner guarantees featured character after losing 50/50
- **Epitomized Path**: Weapon banner fate point system for guaranteed weapons
- **Real Rates**: 0.6% base 5★ rate (0.7% for weapons), 5.1% 4★ rate

### 🏛️ Banner Types
- **Character Event Wish**: Featured 5★ characters with 50/50 system
- **Weapon Event Wish**: Featured 5★ weapons with Epitomized Path
- **Wanderlust Invocation**: Standard characters and weapons

### 👥 Real Genshin Content
- **70+ Characters**: Including Zhongli, Venti, Raiden Shogun, Hu Tao, Ganyu, and more
- **50+ Weapons**: Staff of Homa, Mistsplitter Reforged, Polar Star, and others
- **Element System**: Pyro, Hydro, Anemo, Electro, Dendro, Cryo, Geo
- **Weapon Types**: Sword, Claymore, Polearm, Bow, Catalyst

### 📊 User Features
- **Account System**: Secure registration and login
- **Statistics Dashboard**: Track total wishes, 5★ count, luck rate
- **Pull History**: Complete history with filters by banner/rarity
- **Pity Tracking**: Individual counters for each banner type

### 🎨 Authentic UI
- **Genshin-themed Design**: Colors, fonts, and styling matching the game
- **Animated Results**: Smooth wish reveal animations
- **Responsive Design**: Works on desktop and mobile
- **Star Rarity System**: Visual indicators for 3★, 4★, and 5★ items

## 🚀 Quick Start

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd genshin-wish-simulator
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the server**
   \`\`\`bash
   npm start
   \`\`\`

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode
\`\`\`bash
npm run dev
\`\`\`

## 🎮 How to Use

1. **Create Account**: Register with a username and password
2. **Select Banner**: Choose from Character, Weapon, or Standard banners
3. **Make Wishes**: Pull 1x or 10x with realistic rates and pity
4. **View Results**: See animated results with rarity indicators
5. **Track Progress**: Monitor stats and pity counters on dashboard
6. **Browse History**: Review complete pull history with filters

## 🔧 Technical Details

### Backend
- **Node.js** with Express.js framework
- **SQLite** database with better-sqlite3
- **Session-based** authentication with bcrypt
- **RESTful API** for all game operations

### Frontend
- **Vanilla JavaScript** with modern ES6+ features
- **CSS Grid & Flexbox** for responsive layouts
- **CSS Animations** for smooth transitions
- **Fetch API** for server communication

### Database Schema
- **Users**: Account information and authentication
- **Items**: Characters and weapons with metadata
- **Wishes**: Individual pull records with timestamps
- **UserBannerStates**: Pity counters and guarantee tracking

## 🎯 Wishing Mechanics

### Pity System
- **Hard Pity**: Guaranteed 5★ at 90 pulls (80 for weapons)
- **Soft Pity**: Increased rates starting at pull 75 (65 for weapons)
- **4★ Pity**: Guaranteed 4★ every 10 pulls

### Character Banner (50/50)
- 50% chance for featured character on first 5★
- Guaranteed featured character if previous 5★ was standard
- Pity carries over between character banners

### Weapon Banner (Epitomized Path)
- Choose a target weapon from the two featured options
- Gain 1 fate point for each non-target 5★ weapon
- Guaranteed target weapon at 2 fate points

### Standard Banner
- No featured characters or weapons
- 5★ pool includes standard characters and weapons
- No 50/50 system - all pulls are from standard pool

## 📁 Project Structure
```
\`\`\`
genshin-wish-simulator/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── README.md             # This file
└── public/               # Static files
    ├── index.html        # Landing page
    ├── register.html     # Registration page
    ├── login.html        # Login page
    ├── dashboard.html    # User dashboard
    ├── wish.html         # Wishing interface
    ├── css/
    │   └── style.css     # Main stylesheet
    ├── js/
    │   ├── dashboard.js  # Dashboard functionality
    │   ├── wish.js       # Wishing functionality
    │   └── particles.js  # Visual effects
    └── images/           # Game assets (placeholder paths)
        ├── characters/   # Character portraits
        ├── weapons/      # Weapon images
        └── ui/          # UI elements
\`\`\`
```
## 🎨 Customization

### Adding New Characters/Weapons
Edit the `insertGenshinData()` function in `server.js` to add new items:

\`\`\`javascript
const newCharacter = [
    'Character Name', 5, 'character', 'character', 1, 'Element', null, '/images/characters/name.png'
];
\`\`\`

### Modifying Rates
Adjust the rates in the `WishSimulator.getRates()` method:

\`\`\`javascript
const base5Star = bannerType === 'weapon' ? 0.007 : 0.006; // 0.7% for weapons, 0.6% for characters
\`\`\`

### Styling Changes
Modify CSS variables in `public/css/style.css`:

\`\`\`css
:root {
    --genshin-gold: #FFD700;
    --genshin-blue: #4A90E2;
    /* ... other variables */
}
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a fan-made simulator for educational and entertainment purposes. Genshin Impact is a trademark of miHoYo/HoYoverse. This project is not affiliated with or endorsed by miHoYo/HoYoverse.

## 🙏 Acknowledgments

- miHoYo/HoYoverse for creating Genshin Impact
- The Genshin Impact community for inspiration
- All contributors and testers

---

**May fortune smile upon you, Traveler!** ⭐
\`\`\`
