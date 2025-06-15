let selectedBanner = null
let isWishing = false

document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo()
  initializeBannerSelection()
  loadHistory()

  document.getElementById("wish-1").addEventListener("click", () => makeWish(1))
  document.getElementById("wish-10").addEventListener("click", () => makeWish(10))
  document.getElementById("close-results").addEventListener("click", closeResults)
  document.getElementById("wish-again").addEventListener("click", closeResults)
  document.getElementById("logoutBtn").addEventListener("click", logout)

  document.getElementById("banner-filter").addEventListener("change", loadHistory)
  document.getElementById("rarity-filter").addEventListener("change", loadHistory)
})

async function loadUserInfo() {
  try {
    const response = await fetch("/api/user")
    if (response.ok) {
      const user = await response.json()
      document.getElementById("username").textContent = user.username
    }
  } catch (error) {
    console.error("Error loading user info:", error)
  }
}

function initializeBannerSelection() {
  const bannerCards = document.querySelectorAll(".banner-card")

  bannerCards.forEach((card) => {
    card.addEventListener("click", function () {
      if (isWishing) return

      // Remove active class from all cards
      bannerCards.forEach((c) => c.classList.remove("active"))

      // Add active class to selected card
      this.classList.add("active")

      selectedBanner = this.dataset.banner
      updateBannerInfo()

      // Enable wish buttons
      document.getElementById("wish-1").disabled = false
      document.getElementById("wish-10").disabled = false
    })
  })
}

function updateBannerInfo() {
  const bannerNames = {
    character: "Character Event Wish - Ballad in Goblets",
    weapon: "Weapon Event Wish - Epitome Invocation",
    standard: "Wanderlust Invocation - Standard Wish",
  }

  const descriptions = {
    character: "Featured 5★ character with 50/50 system and guaranteed pity",
    weapon: "Featured 5★ weapons with Epitomized Path system",
    standard: "Standard characters and weapons with no rate-up",
  }

  document.getElementById("selected-banner-name").textContent = bannerNames[selectedBanner]
  document.getElementById("selected-banner-desc").textContent = descriptions[selectedBanner]
}

async function makeWish(count) {
  if (!selectedBanner || isWishing) return

  isWishing = true

  // Disable buttons and show loading state
  const wish1Btn = document.getElementById("wish-1")
  const wish10Btn = document.getElementById("wish-10")

  wish1Btn.disabled = true
  wish10Btn.disabled = true
  wish1Btn.innerHTML = '<span class="spinner"></span>'
  wish10Btn.innerHTML = '<span class="spinner"></span>'

  try {
    const response = await fetch("/api/wish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bannerType: selectedBanner,
        count: count,
      }),
    })

    const data = await response.json()

    if (data.success) {
      displayResults(data.results)
      loadHistory() // Refresh history
    } else {
      alert("Wish failed: " + data.error)
    }
  } catch (error) {
    console.error("Error making wish:", error)
    alert("An error occurred while making the wish")
  } finally {
    // Reset buttons
    isWishing = false
    wish1Btn.disabled = false
    wish10Btn.disabled = false
    wish1Btn.innerHTML =
      '<span class="btn-text">Wish ×1</span><div class="wish-cost"><span class="fate-icon">🎫</span><span>1</span></div>'
    wish10Btn.innerHTML =
      '<span class="btn-text">Wish ×10</span><div class="wish-cost"><span class="fate-icon">🎫</span><span>10</span></div><div class="btn-glow"></div>'
  }
}

function displayResults(results) {
  const resultsContainer = document.getElementById("results-container")
  resultsContainer.innerHTML = ""

  results.forEach((result, index) => {
    setTimeout(() => {
      const resultDiv = document.createElement("div")
      resultDiv.className = `result-item star-${result.rarity}`

      const stars = "★".repeat(result.rarity)
      const elementIcon = getElementIcon(result.element)
      const typeIcon = result.type === "character" ? "👤" : "⚔️"

      resultDiv.innerHTML = `
                <div class="result-stars">${stars}</div>
                <div class="result-name">${result.name}</div>
                <div class="result-type">
                    ${typeIcon} ${result.type}
                    ${elementIcon ? `${elementIcon} ${result.element}` : ""}
                    ${result.weaponType ? `${result.weaponType}` : ""}
                </div>
                <div class="result-pity">Pity: ${result.pityCount}</div>
                ${result.rarity === 5 ? '<div class="result-special">✨ 5-Star!</div>' : ""}
            `

      resultsContainer.appendChild(resultDiv)

      // Play sound effect for 5-star (if you have audio files)
      if (result.rarity === 5) {
        playWishSound("5star")
      } else if (result.rarity === 4) {
        playWishSound("4star")
      }
    }, index * 200) // Stagger the animations
  })

  document.getElementById("wish-results-modal").classList.remove("hidden")
}

function closeResults() {
  document.getElementById("wish-results-modal").classList.add("hidden")
}

async function loadHistory() {
  const bannerFilter = document.getElementById("banner-filter").value
  const rarityFilter = document.getElementById("rarity-filter").value

  try {
    let url = "/api/history?page=1"
    if (bannerFilter) url += `&banner=${bannerFilter}`
    if (rarityFilter) url += `&rarity=${rarityFilter}`

    const response = await fetch(url)
    const data = await response.json()

    const historyContainer = document.getElementById("history-container")
    historyContainer.innerHTML = ""

    if (data.wishes.length === 0) {
      historyContainer.innerHTML = `
                <div class="no-history">
                    <p>No wishes found matching your filters.</p>
                </div>
            `
      return
    }

    data.wishes.forEach((wish) => {
      const historyItem = createHistoryItem(wish)
      historyContainer.appendChild(historyItem)
    })
  } catch (error) {
    console.error("Error loading history:", error)
  }
}

function createHistoryItem(wish) {
  const historyDiv = document.createElement("div")
  historyDiv.className = `history-item star-${wish.rarity}`

  const stars = "★".repeat(wish.rarity)
  const elementIcon = getElementIcon(wish.element)
  const typeIcon = wish.type === "character" ? "👤" : "⚔️"

  historyDiv.innerHTML = `
        <div class="history-info">
            <div class="history-stars">${stars}</div>
            <div class="history-details">
                <h4>${wish.itemName}</h4>
                <div class="history-meta">
                    ${typeIcon} ${wish.type}
                    ${elementIcon ? `• ${elementIcon} ${wish.element}` : ""}
                    ${wish.weaponType ? `• ${wish.weaponType}` : ""}
                    • ${wish.bannerType}
                </div>
            </div>
        </div>
        <div class="history-date">
            <div>${new Date(wish.timestamp).toLocaleDateString()}</div>
            <div>Pity: ${wish.pityCount}</div>
        </div>
    `

  return historyDiv
}

function getElementIcon(element) {
  const elementIcons = {
    Pyro: "🔥",
    Hydro: "💧",
    Anemo: "💨",
    Electro: "⚡",
    Dendro: "🌱",
    Cryo: "❄️",
    Geo: "🗿",
  }
  return elementIcons[element] || ""
}

function playWishSound(type) {
  // Placeholder for sound effects
  // You can add actual audio files and play them here
  console.log(`Playing ${type} wish sound`)
}

async function logout() {
  try {
    await fetch("/api/logout", { method: "POST" })
    window.location.href = "/"
  } catch (error) {
    console.error("Error logging out:", error)
  }
}
