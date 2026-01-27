// Public Smart Link Hub Viewer

async function loadHub(hubId) {
  try {
    const response = await fetch(`http://localhost:3000/hubs/${hubId}`);
    if (!response.ok) {
      showError("Hub not found");
      return;
    }

    const data = await response.json();
    if (data.success) {
      displayHub(data.data);
    }
  } catch (error) {
    console.error("Error loading hub:", error);
    showError("Failed to load hub");
  }
}

function displayHub(hubData) {
  document.getElementById("hub-title").textContent = hubData.title || "Link Hub";
  document.getElementById("hub-description").textContent = hubData.description || "";
  
  // Display total visits count
  const hubStatsEl = document.getElementById("hub-stats");
  if (hubStatsEl) {
    const totalVisits = hubData.total_visits || 0;
    hubStatsEl.innerHTML = `
      <div class="hub-stats-display">
        <span class="stat-item">
          <span class="stat-icon">👁️</span>
          <span class="stat-text"><strong>${totalVisits}</strong> visits</span>
        </span>
        <span class="stat-item">
          <span class="stat-icon">🔗</span>
          <span class="stat-text"><strong>${hubData.links?.length || 0}</strong> links</span>
        </span>
      </div>
    `;
  }
  
  const linksContainer = document.getElementById("links");
  
  if (!hubData.links || hubData.links.length === 0) {
    linksContainer.innerHTML = "<p class='empty-state'>No links available</p>";
    return;
  }

  linksContainer.innerHTML = hubData.links.map(link => `
    <div class="link-wrapper">
      <a href="${link.url}" class="link" onclick="trackClick('${hubData.id}', '${link.id}', event)">
        <div class="link-icon">🔗</div>
        <div class="link-info">
          <h3>${link.name}</h3>
          <p>${link.url}</p>
        </div>
        <div class="link-stats">
          <span class="click-count">${link.clicks || 0} clicks</span>
          <div class="link-arrow">→</div>
        </div>
      </a>
    </div>
  `).join("");
}

async function trackClick(hubId, linkId, event) {
  try {
    await fetch(`http://localhost:3000/hubs/${hubId}/click/${linkId}`, {
      method: "POST"
    });
  } catch (error) {
    console.error("Error tracking click:", error);
  }
  // Let the link navigate naturally
}

function showError(message) {
  const container = document.getElementById("links");
  container.innerHTML = `<div class='empty-state'>${message}</div>`;
}

// Get hub ID from URL parameters
function getHubIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || localStorage.getItem("lastHubId");
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  const hubId = getHubIdFromUrl();
  if (hubId) {
    loadHub(hubId);
    localStorage.setItem("lastHubId", hubId);
  }
});

