const express = require("express")
const session = require("express-session")
const bcrypt = require("bcrypt")
const sqlite3 = require("sqlite3").verbose()
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3000

// Database setup
const db = new sqlite3.Database("genshin_wishes.db")

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(
  session({
    secret: "genshin-wish-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
  }),
)

// Database initialization
function initializeDatabase() {
  // Create tables
  db.serialize(() => {
    db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `)

    db.run(`
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                rarity INTEGER NOT NULL,
                item_type TEXT NOT NULL,
                banner_type TEXT NOT NULL,
                is_featured BOOLEAN DEFAULT 0,
                element TEXT,
                weapon_type TEXT,
                image_url TEXT DEFAULT ''
            )
        `)

    db.run(`
            CREATE TABLE IF NOT EXISTS wishes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                item_id INTEGER NOT NULL,
                banner_type TEXT NOT NULL,
                pity_count INTEGER NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (item_id) REFERENCES items (id)
            )
        `)

    db.run(`
            CREATE TABLE IF NOT EXISTS user_banner_states (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                banner_type TEXT NOT NULL,
                pity_5star INTEGER DEFAULT 0,
                pity_4star INTEGER DEFAULT 0,
                guaranteed_featured BOOLEAN DEFAULT 0,
                fate_points INTEGER DEFAULT 0,
                selected_weapon_id INTEGER,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (selected_weapon_id) REFERENCES items (id),
                UNIQUE(user_id, banner_type)
            )
        `)

    // Insert Genshin Impact characters and weapons
    insertGenshinData()
  })
}

function insertGenshinData() {
  db.get("SELECT COUNT(*) as count FROM items", (err, row) => {
    if (err || row.count > 0) return // Data already exists or error

    const items = [
      // 5-Star Characters (Featured)
      ["Zhongli", 5, "character", "character", 1, "Geo", null, "/placeholder.svg?height=200&width=200"],
      ["Venti", 5, "character", "character", 1, "Anemo", null, "/placeholder.svg?height=200&width=200"],
      ["Childe", 5, "character", "character", 1, "Hydro", null, "/placeholder.svg?height=200&width=200"],
      ["Hu Tao", 5, "character", "character", 1, "Pyro", null, "/placeholder.svg?height=200&width=200"],
      ["Ganyu", 5, "character", "character", 1, "Cryo", null, "/placeholder.svg?height=200&width=200"],
      ["Xiao", 5, "character", "character", 1, "Anemo", null, "/placeholder.svg?height=200&width=200"],
      ["Albedo", 5, "character", "character", 1, "Geo", null, "/placeholder.svg?height=200&width=200"],
      ["Kazuha", 5, "character", "character", 1, "Anemo", null, "/placeholder.svg?height=200&width=200"],
      ["Ayaka", 5, "character", "character", 1, "Cryo", null, "/placeholder.svg?height=200&width=200"],
      ["Yoimiya", 5, "character", "character", 1, "Pyro", null, "/placeholder.svg?height=200&width=200"],
      ["Raiden Shogun", 5, "character", "character", 1, "Electro", null, "/placeholder.svg?height=200&width=200"],
      ["Kokomi", 5, "character", "character", 1, "Hydro", null, "/placeholder.svg?height=200&width=200"],
      ["Itto", 5, "character", "character", 1, "Geo", null, "/placeholder.svg?height=200&width=200"],
      ["Shenhe", 5, "character", "character", 1, "Cryo", null, "/placeholder.svg?height=200&width=200"],
      ["Yae Miko", 5, "character", "character", 1, "Electro", null, "/placeholder.svg?height=200&width=200"],
      ["Ayato", 5, "character", "character", 1, "Hydro", null, "/placeholder.svg?height=200&width=200"],
      ["Yelan", 5, "character", "character", 1, "Hydro", null, "/placeholder.svg?height=200&width=200"],
      ["Tighnari", 5, "character", "character", 1, "Dendro", null, "/placeholder.svg?height=200&width=200"],
      ["Nahida", 5, "character", "character", 1, "Dendro", null, "/placeholder.svg?height=200&width=200"],
      ["Wanderer", 5, "character", "character", 1, "Anemo", null, "/placeholder.svg?height=200&width=200"],
      ["Furina", 5, "character", "character", 1, "Hydro", null, "/placeholder.svg?height=200&width=200"],
      ["Neuvillette", 5, "character", "character", 1, "Hydro", null, "/placeholder.svg?height=200&width=200"],

      // 5-Star Standard Characters
      ["Diluc", 5, "character", "standard", 0, "Pyro", null, "/placeholder.svg?height=200&width=200"],
      ["Qiqi", 5, "character", "standard", 0, "Cryo", null, "/placeholder.svg?height=200&width=200"],
      ["Keqing", 5, "character", "standard", 0, "Electro", null, "/placeholder.svg?height=200&width=200"],
      ["Mona", 5, "character", "standard", 0, "Hydro", null, "/placeholder.svg?height=200&width=200"],
      ["Jean", 5, "character", "standard", 0, "Anemo", null, "/placeholder.svg?height=200&width=200"],

      // 4-Star Characters
      ["Bennett", 4, "character", "standard", 0, "Pyro", null, "/placeholder.svg?height=200&width=200"],
      ["Xingqiu", 4, "character", "standard", 0, "Hydro", null, "/placeholder.svg?height=200&width=200"],
      ["Fischl", 4, "character", "standard", 0, "Electro", null, "/placeholder.svg?height=200&width=200"],
      ["Sucrose", 4, "character", "standard", 0, "Anemo", null, "/placeholder.svg?height=200&width=200"],
      ["Diona", 4, "character", "standard", 0, "Cryo", null, "/placeholder.svg?height=200&width=200"],
      ["Razor", 4, "character", "standard", 0, "Electro", null, "/placeholder.svg?height=200&width=200"],
      ["Chongyun", 4, "character", "standard", 0, "Cryo", null, "/placeholder.svg?height=200&width=200"],
      ["Noelle", 4, "character", "standard", 0, "Geo", null, "/placeholder.svg?height=200&width=200"],
      ["Barbara", 4, "character", "standard", 0, "Hydro", null, "/placeholder.svg?height=200&width=200"],
      ["Xiangling", 4, "character", "standard", 0, "Pyro", null, "/placeholder.svg?height=200&width=200"],
      ["Beidou", 4, "character", "standard", 0, "Electro", null, "/placeholder.svg?height=200&width=200"],
      ["Ningguang", 4, "character", "standard", 0, "Geo", null, "/placeholder.svg?height=200&width=200"],
      ["Xinyan", 4, "character", "standard", 0, "Pyro", null, "/placeholder.svg?height=200&width=200"],
      ["Rosaria", 4, "character", "standard", 0, "Cryo", null, "/placeholder.svg?height=200&width=200"],
      ["Yanfei", 4, "character", "standard", 0, "Pyro", null, "/placeholder.svg?height=200&width=200"],
      ["Kujou Sara", 4, "character", "standard", 0, "Electro", null, "/placeholder.svg?height=200&width=200"],
      ["Sayu", 4, "character", "standard", 0, "Anemo", null, "/placeholder.svg?height=200&width=200"],
      ["Thoma", 4, "character", "standard", 0, "Pyro", null, "/placeholder.svg?height=200&width=200"],
      ["Gorou", 4, "character", "standard", 0, "Geo", null, "/placeholder.svg?height=200&width=200"],
      ["Yun Jin", 4, "character", "standard", 0, "Geo", null, "/placeholder.svg?height=200&width=200"],
      ["Shinobu", 4, "character", "standard", 0, "Electro", null, "/placeholder.svg?height=200&width=200"],
      ["Heizou", 4, "character", "standard", 0, "Anemo", null, "/placeholder.svg?height=200&width=200"],
      ["Collei", 4, "character", "standard", 0, "Dendro", null, "/placeholder.svg?height=200&width=200"],
      ["Dori", 4, "character", "standard", 0, "Electro", null, "/placeholder.svg?height=200&width=200"],
      ["Candace", 4, "character", "standard", 0, "Hydro", null, "/placeholder.svg?height=200&width=200"],
      ["Layla", 4, "character", "standard", 0, "Cryo", null, "/placeholder.svg?height=200&width=200"],
      ["Faruzan", 4, "character", "standard", 0, "Anemo", null, "/placeholder.svg?height=200&width=200"],

      // 5-Star Weapons (Featured)
      ["Staff of Homa", 5, "weapon", "weapon", 1, null, "Polearm", "/placeholder.svg?height=200&width=200"],
      ["Elegy for the End", 5, "weapon", "weapon", 1, null, "Bow", "/placeholder.svg?height=200&width=200"],
      [
        "Primordial Jade Winged-Spear",
        5,
        "weapon",
        "weapon",
        1,
        null,
        "Polearm",
        "/placeholder.svg?height=200&width=200",
      ],
      ["Vortex Vanquisher", 5, "weapon", "weapon", 1, null, "Polearm", "/placeholder.svg?height=200&width=200"],
      ["Haran Geppaku Futsu", 5, "weapon", "weapon", 1, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["Redhorn Stonethresher", 5, "weapon", "weapon", 1, null, "Claymore", "/placeholder.svg?height=200&width=200"],
      ["Polar Star", 5, "weapon", "weapon", 1, null, "Bow", "/placeholder.svg?height=200&width=200"],
      ["Engulfing Lightning", 5, "weapon", "weapon", 1, null, "Polearm", "/placeholder.svg?height=200&width=200"],
      ["Mistsplitter Reforged", 5, "weapon", "weapon", 1, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["Thundering Pulse", 5, "weapon", "weapon", 1, null, "Bow", "/placeholder.svg?height=200&width=200"],
      ["Freedom-Sworn", 5, "weapon", "weapon", 1, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["Song of Broken Pines", 5, "weapon", "weapon", 1, null, "Claymore", "/placeholder.svg?height=200&width=200"],

      // 5-Star Standard Weapons
      ["Wolf's Gravestone", 5, "weapon", "standard", 0, null, "Claymore", "/placeholder.svg?height=200&width=200"],
      ["Skyward Harp", 5, "weapon", "standard", 0, null, "Bow", "/placeholder.svg?height=200&width=200"],
      ["Skyward Blade", 5, "weapon", "standard", 0, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["Skyward Atlas", 5, "weapon", "standard", 0, null, "Catalyst", "/placeholder.svg?height=200&width=200"],
      ["Skyward Pride", 5, "weapon", "standard", 0, null, "Claymore", "/placeholder.svg?height=200&width=200"],
      ["Skyward Spine", 5, "weapon", "standard", 0, null, "Polearm", "/placeholder.svg?height=200&width=200"],
      ["Amos Bow", 5, "weapon", "standard", 0, null, "Bow", "/placeholder.svg?height=200&width=200"],
      [
        "Lost Prayer to the Sacred Winds",
        5,
        "weapon",
        "standard",
        0,
        null,
        "Catalyst",
        "/placeholder.svg?height=200&width=200",
      ],
      ["Aquila Favonia", 5, "weapon", "standard", 0, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["Primordial Jade Cutter", 5, "weapon", "standard", 0, null, "Sword", "/placeholder.svg?height=200&width=200"],

      // 4-Star Weapons
      ["Sacrificial Sword", 4, "weapon", "standard", 0, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["The Widsith", 4, "weapon", "standard", 0, null, "Catalyst", "/placeholder.svg?height=200&width=200"],
      ["Rust", 4, "weapon", "standard", 0, null, "Bow", "/placeholder.svg?height=200&width=200"],
      ["Favonius Warbow", 4, "weapon", "standard", 0, null, "Bow", "/placeholder.svg?height=200&width=200"],
      ["Dragon's Bane", 4, "weapon", "standard", 0, null, "Polearm", "/placeholder.svg?height=200&width=200"],
      ["Eye of Perception", 4, "weapon", "standard", 0, null, "Catalyst", "/placeholder.svg?height=200&width=200"],
      ["Favonius Codex", 4, "weapon", "standard", 0, null, "Catalyst", "/placeholder.svg?height=200&width=200"],
      ["Favonius Greatsword", 4, "weapon", "standard", 0, null, "Claymore", "/placeholder.svg?height=200&width=200"],
      ["Favonius Lance", 4, "weapon", "standard", 0, null, "Polearm", "/placeholder.svg?height=200&width=200"],
      ["Sacrificial Bow", 4, "weapon", "standard", 0, null, "Bow", "/placeholder.svg?height=200&width=200"],
      ["The Stringless", 4, "weapon", "standard", 0, null, "Bow", "/placeholder.svg?height=200&width=200"],
      ["Rainslasher", 4, "weapon", "standard", 0, null, "Claymore", "/placeholder.svg?height=200&width=200"],
      ["Prototype Rancour", 4, "weapon", "standard", 0, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["Lions Roar", 4, "weapon", "standard", 0, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["Flute", 4, "weapon", "standard", 0, null, "Sword", "/placeholder.svg?height=200&width=200"],

      // 3-Star Weapons
      ["Cool Steel", 3, "weapon", "standard", 0, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["Harbinger of Dawn", 3, "weapon", "standard", 0, null, "Sword", "/placeholder.svg?height=200&width=200"],
      ["Magic Guide", 3, "weapon", "standard", 0, null, "Catalyst", "/placeholder.svg?height=200&width=200"],
      ["Slingshot", 3, "weapon", "standard", 0, null, "Bow", "/placeholder.svg?height=200&width=200"],
      [
        "Thrilling Tales of Dragon Slayers",
        3,
        "weapon",
        "standard",
        0,
        null,
        "Catalyst",
        "/placeholder.svg?height=200&width=200",
      ],
      ["Debate Club", 3, "weapon", "standard", 0, null, "Claymore", "/placeholder.svg?height=200&width=200"],
      [
        "Bloodtainted Greatsword",
        3,
        "weapon",
        "standard",
        0,
        null,
        "Claymore",
        "/placeholder.svg?height=200&width=200",
      ],
      ["White Iron Greatsword", 3, "weapon", "standard", 0, null, "Claymore", "/placeholder.svg?height=200&width=200"],
      ["Black Tassel", 3, "weapon", "standard", 0, null, "Polearm", "/placeholder.svg?height=200&width=200"],
      ["White Tassel", 3, "weapon", "standard", 0, null, "Polearm", "/placeholder.svg?height=200&width=200"],
      ["Raven Bow", 3, "weapon", "standard", 0, null, "Bow", "/placeholder.svg?height=200&width=200"],
      ["Sharpshooters Oath", 3, "weapon", "standard", 0, null, "Bow", "/placeholder.svg?height=200&width=200"],
      ["Emerald Orb", 3, "weapon", "standard", 0, null, "Catalyst", "/placeholder.svg?height=200&width=200"],
      ["Twin Nephrite", 3, "weapon", "standard", 0, null, "Catalyst", "/placeholder.svg?height=200&width=200"],
    ]

    const stmt = db.prepare(`
            INSERT INTO items (name, rarity, item_type, banner_type, is_featured, element, weapon_type, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)

    items.forEach((item) => {
      stmt.run(item)
    })

    stmt.finalize()
    console.log(`✨ Inserted ${items.length} Genshin Impact items`)
  })
}

// Wishing Logic
class WishSimulator {
  static getRates(bannerType, pityCount) {
    const base5Star = bannerType === "weapon" ? 0.007 : 0.006
    const base4Star = 0.051

    const softPityStart = bannerType === "weapon" ? 65 : 75
    const hardPity = bannerType === "weapon" ? 80 : 90

    if (pityCount >= hardPity) {
      return { rate5Star: 1.0, rate4Star: 0 }
    } else if (pityCount >= softPityStart) {
      const increase = (pityCount - softPityStart + 1) * 0.06
      return {
        rate5Star: Math.min(base5Star + increase, 1.0),
        rate4Star: base4Star,
      }
    } else {
      return { rate5Star: base5Star, rate4Star: base4Star }
    }
  }

  static performWish(userId, bannerType, count = 1, callback) {
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
      if (err || !user) return callback(null)

      // Get or create banner state
      db.get(
        "SELECT * FROM user_banner_states WHERE user_id = ? AND banner_type = ?",
        [userId, bannerType],
        (err, bannerState) => {
          if (err) return callback(null)

          if (!bannerState) {
            db.run(
              `INSERT INTO user_banner_states (user_id, banner_type, pity_5star, pity_4star, guaranteed_featured, fate_points)
                         VALUES (?, ?, 0, 0, 0, 0)`,
              [userId, bannerType],
              (err) => {
                if (err) return callback(null)

                db.get(
                  "SELECT * FROM user_banner_states WHERE user_id = ? AND banner_type = ?",
                  [userId, bannerType],
                  (err, newBannerState) => {
                    if (err) return callback(null)
                    processWishes(newBannerState)
                  },
                )
              },
            )
          } else {
            processWishes(bannerState)
          }
        },
      )

      function processWishes(bannerState) {
        const results = []
        let processedCount = 0

        for (let i = 0; i < count; i++) {
          bannerState.pity_5star += 1
          bannerState.pity_4star += 1

          const { rate5Star, rate4Star } = WishSimulator.getRates(bannerType, bannerState.pity_5star)
          const rand = Math.random()

          let rarity, pityCount

          if (rand < rate5Star) {
            // 5-star pull
            bannerState.pity_5star = 0
            rarity = 5
            pityCount = bannerState.pity_5star
            WishSimulator.get5StarItem(bannerType, bannerState, (item) => {
              if (item) {
                db.run(
                  "INSERT INTO wishes (user_id, item_id, banner_type, pity_count) VALUES (?, ?, ?, ?)",
                  [userId, item.id, bannerType, pityCount],
                  () => {
                    results.push({ item, rarity, pityCount })
                    processedCount++
                    if (processedCount === count) finishWishing()
                  },
                )
              } else {
                processedCount++
                if (processedCount === count) finishWishing()
              }
            })
          } else if (rand < rate5Star + rate4Star || bannerState.pity_4star >= 10) {
            // 4-star pull
            bannerState.pity_4star = 0
            rarity = 4
            pityCount = bannerState.pity_4star
            WishSimulator.get4StarItem(bannerType, (item) => {
              if (item) {
                db.run(
                  "INSERT INTO wishes (user_id, item_id, banner_type, pity_count) VALUES (?, ?, ?, ?)",
                  [userId, item.id, bannerType, pityCount],
                  () => {
                    results.push({ item, rarity, pityCount })
                    processedCount++
                    if (processedCount === count) finishWishing()
                  },
                )
              } else {
                processedCount++
                if (processedCount === count) finishWishing()
              }
            })
          } else {
            // 3-star pull
            rarity = 3
            pityCount = 0
            WishSimulator.get3StarItem((item) => {
              if (item) {
                db.run(
                  "INSERT INTO wishes (user_id, item_id, banner_type, pity_count) VALUES (?, ?, ?, ?)",
                  [userId, item.id, bannerType, pityCount],
                  () => {
                    results.push({ item, rarity, pityCount })
                    processedCount++
                    if (processedCount === count) finishWishing()
                  },
                )
              } else {
                processedCount++
                if (processedCount === count) finishWishing()
              }
            })
          }
        }

        function finishWishing() {
          db.run(
            `UPDATE user_banner_states 
                     SET pity_5star = ?, pity_4star = ?, guaranteed_featured = ?, fate_points = ?
                     WHERE user_id = ? AND banner_type = ?`,
            [
              bannerState.pity_5star,
              bannerState.pity_4star,
              bannerState.guaranteed_featured,
              bannerState.fate_points,
              userId,
              bannerType,
            ],
            () => {
              callback(results)
            },
          )
        }
      }
    })
  }

  static get5StarItem(bannerType, bannerState, callback) {
    if (bannerType === "character") {
      db.all(
        "SELECT * FROM items WHERE rarity = 5 AND banner_type = ? AND is_featured = 1",
        ["character"],
        (err, featuredChars) => {
          if (err) return callback(null)

          db.all(
            "SELECT * FROM items WHERE rarity = 5 AND banner_type = ? AND item_type = ?",
            ["standard", "character"],
            (err, standardChars) => {
              if (err) return callback(null)

              if (bannerState.guaranteed_featured || Math.random() < 0.5) {
                bannerState.guaranteed_featured = 0
                callback(featuredChars[Math.floor(Math.random() * featuredChars.length)])
              } else {
                bannerState.guaranteed_featured = 1
                callback(standardChars[Math.floor(Math.random() * standardChars.length)])
              }
            },
          )
        },
      )
    } else if (bannerType === "weapon") {
      db.all(
        "SELECT * FROM items WHERE rarity = 5 AND banner_type = ? AND is_featured = 1",
        ["weapon"],
        (err, featuredWeapons) => {
          if (err) return callback(null)

          if (bannerState.fate_points >= 2) {
            bannerState.fate_points = 0
            if (bannerState.selected_weapon_id) {
              db.get("SELECT * FROM items WHERE id = ?", [bannerState.selected_weapon_id], (err, selectedWeapon) => {
                callback(selectedWeapon || featuredWeapons[Math.floor(Math.random() * featuredWeapons.length)])
              })
            } else {
              callback(featuredWeapons[Math.floor(Math.random() * featuredWeapons.length)])
            }
          } else {
            const weapon = featuredWeapons[Math.floor(Math.random() * featuredWeapons.length)]
            if (weapon && weapon.id !== bannerState.selected_weapon_id) {
              bannerState.fate_points += 1
            } else {
              bannerState.fate_points = 0
            }
            callback(weapon)
          }
        },
      )
    } else {
      db.all("SELECT * FROM items WHERE rarity = 5 AND banner_type = ?", ["standard"], (err, standardItems) => {
        if (err) return callback(null)
        callback(standardItems[Math.floor(Math.random() * standardItems.length)])
      })
    }
  }

  static get4StarItem(bannerType, callback) {
    db.all("SELECT * FROM items WHERE rarity = 4", (err, items) => {
      if (err) return callback(null)
      callback(items[Math.floor(Math.random() * items.length)])
    })
  }

  static get3StarItem(callback) {
    db.all("SELECT * FROM items WHERE rarity = 3", (err, items) => {
      if (err) return callback(null)
      callback(items[Math.floor(Math.random() * items.length)])
    })
  }
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next()
  } else {
    res.status(401).json({ error: "Authentication required" })
  }
}

// Routes
app.get("/", (req, res) => {
  if (req.session.userId) {
    res.redirect("/dashboard")
  } else {
    res.sendFile(path.join(__dirname, "public", "index.html"))
  }
})

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"))
})

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"))
})

app.get("/dashboard", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"))
})

app.get("/wish", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "wish.html"))
})

// API Routes
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body

  try {
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, existingUser) => {
      if (err) return res.status(500).json({ error: "Registration failed" })
      if (existingUser) return res.status(400).json({ error: "Username already exists" })

      const passwordHash = await bcrypt.hash(password, 10)
      db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", [username, passwordHash], function (err) {
        if (err) return res.status(500).json({ error: "Registration failed" })

        req.session.userId = this.lastID
        req.session.username = username
        res.json({ success: true, message: "Registration successful" })
      })
    })
  } catch (error) {
    res.status(500).json({ error: "Registration failed" })
  }
})

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body

  try {
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
      if (err) return res.status(500).json({ error: "Login failed" })

      if (user && (await bcrypt.compare(password, user.password_hash))) {
        req.session.userId = user.id
        req.session.username = user.username
        res.json({ success: true, message: "Login successful" })
      } else {
        res.status(401).json({ error: "Invalid credentials" })
      }
    })
  } catch (error) {
    res.status(500).json({ error: "Login failed" })
  }
})

app.post("/api/logout", (req, res) => {
  req.session.destroy()
  res.json({ success: true, message: "Logged out" })
})

app.post("/api/wish", requireAuth, (req, res) => {
  const { bannerType, count } = req.body

  try {
    WishSimulator.performWish(req.session.userId, bannerType, count, (results) => {
      if (results) {
        res.json({
          success: true,
          results: results.map((r) => ({
            name: r.item.name,
            rarity: r.rarity,
            type: r.item.item_type,
            element: r.item.element,
            weaponType: r.item.weapon_type,
            pityCount: r.pityCount,
            imageUrl: r.item.image_url,
          })),
        })
      } else {
        res.status(400).json({ error: "Wish failed" })
      }
    })
  } catch (error) {
    console.error("Wish error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.get("/api/stats", requireAuth, (req, res) => {
  try {
    db.all("SELECT * FROM wishes WHERE user_id = ?", [req.session.userId], (err, wishes) => {
      if (err) return res.status(500).json({ error: "Failed to get stats" })

      db.all("SELECT * FROM user_banner_states WHERE user_id = ?", [req.session.userId], (err, bannerStates) => {
        if (err) return res.status(500).json({ error: "Failed to get stats" })

        const totalWishes = wishes.length
        let fiveStarCount = 0
        let fourStarCount = 0
        let processedWishes = 0

        if (wishes.length === 0) {
          return res.json({
            totalWishes: 0,
            fiveStarCount: 0,
            fourStarCount: 0,
            luckRate: 0,
            pityCounts: {},
          })
        }

        wishes.forEach((wish) => {
          db.get("SELECT * FROM items WHERE id = ?", [wish.item_id], (err, item) => {
            if (!err && item) {
              if (item.rarity === 5) fiveStarCount++
              if (item.rarity === 4) fourStarCount++
            }
            processedWishes++

            if (processedWishes === wishes.length) {
              const pityCountsObj = {}
              bannerStates.forEach((state) => {
                pityCountsObj[state.banner_type] = state.pity_5star
              })

              res.json({
                totalWishes,
                fiveStarCount,
                fourStarCount,
                luckRate: totalWishes > 0 ? Math.round((fiveStarCount / totalWishes) * 100 * 100) / 100 : 0,
                pityCounts: pityCountsObj,
              })
            }
          })
        })
      })
    })
  } catch (error) {
    console.error("Stats error:", error)
    res.status(500).json({ error: "Failed to get stats" })
  }
})

app.get("/api/history", requireAuth, (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const bannerFilter = req.query.banner || ""
    const rarityFilter = Number.parseInt(req.query.rarity) || 0
    const limit = 20
    const offset = (page - 1) * limit

    let query = `
            SELECT w.*, i.name, i.rarity, i.item_type, i.element, i.weapon_type, i.image_url
            FROM wishes w
            JOIN items i ON w.item_id = i.id
            WHERE w.user_id = ?
        `
    const params = [req.session.userId]

    if (bannerFilter) {
      query += " AND w.banner_type = ?"
      params.push(bannerFilter)
    }

    if (rarityFilter) {
      query += " AND i.rarity = ?"
      params.push(rarityFilter)
    }

    query += " ORDER BY w.timestamp DESC LIMIT ? OFFSET ?"
    params.push(limit, offset)

    db.all(query, params, (err, wishes) => {
      if (err) return res.status(500).json({ error: "Failed to get history" })

      res.json({
        wishes: wishes.map((w) => ({
          id: w.id,
          itemName: w.name,
          rarity: w.rarity,
          type: w.item_type,
          element: w.element,
          weaponType: w.weapon_type,
          bannerType: w.banner_type,
          timestamp: w.timestamp,
          pityCount: w.pity_count,
          imageUrl: w.image_url,
        })),
        hasNext: wishes.length === limit,
        hasPrev: page > 1,
        page: page,
      })
    })
  } catch (error) {
    console.error("History error:", error)
    res.status(500).json({ error: "Failed to get history" })
  }
})

app.get("/api/user", requireAuth, (req, res) => {
  res.json({
    id: req.session.userId,
    username: req.session.username,
  })
})

// Initialize database and start server
initializeDatabase()

app.listen(PORT, () => {
  console.log(`🌟 Genshin Impact Wish Simulator running on http://localhost:${PORT}`)
  console.log("✨ Database initialized with authentic Genshin characters and weapons!")
  console.log("🎮 Create an account and start wishing, Traveler!")
})
