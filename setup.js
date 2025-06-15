const fs = require("fs")
const path = require("path")

console.log("🌟 Setting up Genshin Impact Wish Simulator...")

// Create necessary directories
const directories = [
  "public",
  "public/css",
  "public/js",
  "public/images",
  "public/images/characters",
  "public/images/weapons",
  "public/images/ui",
]

directories.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ Created directory: ${dir}`)
  }
})

// Create placeholder images
const placeholderImages = [
  "public/images/ui/primogem.png",
  "public/images/ui/intertwined_fate.png",
  "public/images/characters/zhongli.png",
  "public/images/characters/venti.png",
  "public/images/characters/raiden.png",
  "public/images/characters/diluc.png",
  "public/images/weapons/staff_of_homa.png",
  "public/images/weapons/wolfs_gravestone.png",
]

// Create a simple 1x1 pixel PNG as placeholder
const placeholderPNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00,
  0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49,
  0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00,
  0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
])

placeholderImages.forEach((imagePath) => {
  if (!fs.existsSync(imagePath)) {
    fs.writeFileSync(imagePath, placeholderPNG)
    console.log(`✅ Created placeholder image: ${imagePath}`)
  }
})

console.log('🎉 Setup complete! Run "npm start" to launch the simulator.')
console.log("📝 Note: Placeholder images have been created. Replace them with actual Genshin Impact assets if desired.")
