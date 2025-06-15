document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo()
  loadStats()
  loadRecentPulls()

  document.getElementById("logoutBtn").addEventListener("click", logout)
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

async function loadStats() {
  try {
    const response = await fetch("/api/stats")
    const data = await response.json()

    document.getElementById("total-wishes").textContent = data.totalWishes
    document.getElementById("five-star-count").textContent = data.fiveStarCount
    document.getElementById("four-star-count").textContent = data.fourStarCount
    document.getElementById("luck-rate").textContent = data.luckRate + "%"

    // Update pity counters and progress bars
    updatePityDisplay("character", data.pityCounts.character || 0, 90)
    updatePityDisplay("weapon", data.pityCounts.weapon || 0, 80)
    updatePityDisplay("standard", data.pityCounts.standard || 0, 90)
  } catch (error) {
    console.error("Error loading stats:", error)
  }
}

function updatePityDisplay(bannerType, pityCount, maxPity) {
  const pityElement = document.getElementById(`${bannerType}-pity`)
  const progressElement = document.getElementById(`${bannerType}-progress`)

  if (pityElement) {
    pityElement.textContent = pityCount
  }

  if (progressElement) {
    const percentage = (pityCount / maxPity) * 100
    progressElement.style.width = percentage + "%"

    // Change color based on pity count
    if (pityCount >= 75) {
      progressElement.style.background = "linear-gradient(90deg, #FF6B35, #FF8C00)"
    } else if (pityCount >= 50) {
      progressElement.style.background = "linear-gradient(90deg, #FFD700, #FFA500)"
    } else {
      progressElement.style.background = "linear-gradient(90deg, #4A90E2, #74C2A8)"
    }
  }
}

async function loadRecentPulls() {
  try {
    const response = await fetch("/api/history?page=1")
    const data = await response.json()

    const recentPullsContainer = document.getElementById("recent-pulls")
    recentPullsContainer.innerHTML = ""

    if (data.wishes.length === 0) {
      recentPullsContainer.innerHTML = `
                <div class="no-pulls">
                    <p>No wishes yet, Traveler!</p>
                    <p>Start your journey by making your first wish.</p>
                </div>
            `
      return
    }

    data.wishes.slice(0, 5).forEach((wish) => {
      const pullElement = createPullElement(wish)
      recentPullsContainer.appendChild(pullElement)
    })
  } catch (error) {
    console.error("Error loading recent pulls:", error)
  }
}

function createPullElement(wish) {
  const pullDiv = document.createElement("div")
  pullDiv.className = `recent-pull star-${wish.rarity}`

  const stars = "★".repeat(wish.rarity)
  const elementIcon = getElementIcon(wish.element)
  const typeIcon = wish.type === "character" ? "👤" : "⚔️"

  pullDiv.innerHTML = `
        <div class="pull-info">
            <div class="pull-stars">${stars}</div>
            <div class="pull-details">
                <h4>${wish.itemName}</h4>
                <div class="pull-meta">
                    ${typeIcon} ${wish.type} ${elementIcon ? `• ${elementIcon} ${wish.element}` : ""}
                    ${wish.weaponType ? `• ${wish.weaponType}` : ""}
                    • ${wish.bannerType}
                </div>
            </div>
        </div>
        <div class="pull-date">
            ${new Date(wish.timestamp).toLocaleDateString()}
        </div>
    `

  return pullDiv
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

async function logout() {
  try {
    await fetch("/api/logout", { method: "POST" })
    window.location.href = "/"
  } catch (error) {
    console.error("Error logging out:", error)
  }
}
