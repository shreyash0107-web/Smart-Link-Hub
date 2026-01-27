const API_BASE = "http://localhost:3000/api";
let currentHub = null;
let hubs = [];
let authToken = null;
let userId = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  checkAuthentication();
  setupThemeToggle();
  setupTabNavigation();
  setupFormHandlers();
  loadHubs();
});

// ==================== AUTHENTICATION CHECK ====================
function checkAuthentication() {
  authToken = localStorage.getItem("authToken");
  userId = localStorage.getItem("userId");
  
  if (!authToken || !userId) {
    // Not authenticated, redirect to login
    window.location.href = "login.html";
    return false;
  }

  // Display user name
  const userName = localStorage.getItem("userName");
  const userNameEl = document.getElementById("user-name");
  if (userNameEl && userName) {
    userNameEl.textContent = userName;
  }
  
  return true;
}

function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  localStorage.removeItem("hubs");
  window.location.href = "login.html";
}

// ==================== ACCOUNT SETTINGS ====================
function showAccountSettings() {
  const modal = document.getElementById("account-settings-modal");
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  
  document.getElementById("setting-username").textContent = userName || "User";
  document.getElementById("setting-email").textContent = userEmail || "email@example.com";
  
  modal.style.display = "flex";
}

function closeAccountSettings() {
  document.getElementById("account-settings-modal").style.display = "none";
}

function deleteAccountConfirm() {
  const userName = localStorage.getItem("userName");
  const confirmMessage = `Are you sure you want to delete your account "${userName}"?\n\nThis action will:\n- Delete your account permanently\n- Remove all your link hubs\n- Delete all analytics data\n\nThis CANNOT be undone. Type your username to confirm.`;
  
  const userInput = prompt(confirmMessage);
  
  if (userInput === userName) {
    deleteAccount();
  } else if (userInput !== null) {
    alert("Username does not match. Account deletion cancelled.");
  }
}

async function deleteAccount() {
  try {
    const response = await fetch(`${API_BASE}/account/delete`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (response.ok) {
      alert("Account deleted successfully. Redirecting to home page...");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("hubs");
      window.location.href = "index.html";
    } else {
      alert("Error deleting account: " + data.error);
    }
  } catch (error) {
    console.error("Delete account error:", error);
    alert("Error deleting account. Please try again.");
  }
}

// ==================== THEME TOGGLE ====================
function setupThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const isDark = localStorage.getItem("darkMode") === "true";
  
  if (isDark) {
    document.body.classList.add("dark-mode");
    toggle.textContent = "☀️";
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark);
    toggle.textContent = isDark ? "☀️" : "🌙";
  });
}

// ==================== TAB NAVIGATION ====================
function setupTabNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach(tab => {
    tab.classList.remove("active");
  });

  // Remove active from all nav tabs
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.classList.remove("active");
  });

  // Show selected tab
  document.getElementById(tabName + "-tab").classList.add("active");
  
  // Mark nav tab as active
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

  // Load tab-specific content
  if (tabName === "manage") {
    loadManageTab();
  } else if (tabName === "analytics") {
    loadAnalyticsTab();
  }
}

// ==================== HUB MANAGEMENT ====================
async function loadHubs() {
  // In a real app, we'd fetch from API. For now, use localStorage
  const stored = localStorage.getItem("hubs");
  hubs = stored ? JSON.parse(stored) : [];
  
  // For demo purposes, show hubs from localStorage
  renderHubsList();
  updateSelectDropdowns();
}

function renderHubsList() {
  const list = document.getElementById("hubs-list");
  const empty = document.getElementById("empty-state");
  
  if (hubs.length === 0) {
    list.style.display = "none";
    empty.style.display = "block";
    return;
  }

  list.style.display = "grid";
  empty.style.display = "none";
  
  list.innerHTML = hubs.map(hub => `
    <div class="hub-card">
      <h3>${hub.title}</h3>
      <p>${hub.description || "No description"}</p>
      <div class="hub-card-meta">
        <strong>Visits:</strong> ${hub.visits || 0}
        <br>
        <strong>Links:</strong> ${hub.links?.length || 0}
      </div>
      <div class="hub-card-actions">
        <button class="btn btn-sm btn-primary" onclick="selectHubAndSwitch('${hub.id}')">Manage</button>
        <button class="btn btn-sm btn-secondary" onclick="copyHubUrl('${hub.id}')">Share</button>
        <button class="btn btn-sm btn-danger" onclick="deleteHubConfirm('${hub.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function updateSelectDropdowns() {
  const manageSelect = document.getElementById("manage-hub-select");
  const analyticsSelect = document.getElementById("analytics-hub-select");

  const options = hubs.map(hub => 
    `<option value="${hub.id}">${hub.title}</option>`
  ).join("");

  manageSelect.innerHTML = options || "<option>No hubs</option>";
  analyticsSelect.innerHTML = options || "<option>No hubs</option>";

  manageSelect.addEventListener("change", (e) => {
    if (e.target.value) selectHub(e.target.value);
  });

  analyticsSelect.addEventListener("change", (e) => {
    if (e.target.value) loadAnalytics(e.target.value);
  });
}

function selectHub(hubId) {
  currentHub = hubs.find(h => h.id === hubId);
  if (currentHub) {
    document.getElementById("manage-hub-select").value = hubId;
    loadManageContent();
  }
}

function selectHubAndSwitch(hubId) {
  selectHub(hubId);
  switchTab("manage");
}

// ==================== FORM HANDLERS ====================
function setupFormHandlers() {
  // Create Hub Form
  document.getElementById("hub-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("hub-title").value;
    const description = document.getElementById("hub-description").value;
    const theme = document.getElementById("hub-theme").value;

    if (!title.trim()) {
      showError("Title is required");
      return;
    }

    const newHub = {
      id: generateId(),
      title,
      description,
      theme,
      links: [],
      rules: [],
      visits: 0,
      created_at: new Date().toISOString()
    };

    hubs.push(newHub);
    saveHubs();
    
    document.getElementById("hub-form").reset();
    showSuccess("Hub created successfully!");
    switchTab("hubs");
  });

  // Add Link Form
  document.addEventListener("submit", (e) => {
    if (e.target.id === "link-form") {
      e.preventDefault();
      addLink();
    }
  });

  // Modal close button
  const modal = document.getElementById("rule-modal");
  document.querySelector(".close-modal").addEventListener("click", closeRuleModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) closeRuleModal();
  });

  // Rule type change
  document.getElementById("rule-type").addEventListener("change", onRuleTypeChange);
  document.getElementById("time-rule-type").addEventListener("change", (e) => {
    document.getElementById("specific-time-fields").style.display = 
      e.target.value === "specific-times" ? "block" : "none";
  });

  // Add Rule Button
  document.getElementById("add-rule-btn").addEventListener("click", () => {
    document.getElementById("rule-modal").style.display = "block";
  });

  // Rule Form Submit
  document.getElementById("rule-form").addEventListener("submit", (e) => {
    e.preventDefault();
    addRule();
  });

  // Delete Hub Button
  document.addEventListener("click", (e) => {
    if (e.target.id === "delete-hub-btn") {
      deleteHubConfirm(currentHub.id);
    }
  });
}

// ==================== LINK MANAGEMENT ====================
function addLink() {
  const name = document.getElementById("link-name").value;
  const url = document.getElementById("link-url").value;

  if (!name.trim() || !url.trim()) {
    showError("Link name and URL are required");
    return;
  }

  try {
    new URL(url);
  } catch {
    showError("Invalid URL format");
    return;
  }

  const link = {
    id: generateId(),
    name,
    url,
    clicks: 0,
    position: (currentHub.links?.length || 0)
  };

  if (!currentHub.links) currentHub.links = [];
  currentHub.links.push(link);
  
  saveHubs();
  document.getElementById("link-form").reset();
  renderLinks();
  showSuccess("Link added successfully!");
}

function renderLinks() {
  const container = document.getElementById("links-list");
  
  if (!currentHub.links || currentHub.links.length === 0) {
    container.innerHTML = "<p style='text-align: center; color: var(--text-light);'>No links yet</p>";
    return;
  }

  container.innerHTML = currentHub.links.map((link, index) => `
    <div class="link-item" draggable="true" ondragstart="startDrag(event, ${index})" ondragover="allowDrop(event)" ondrop="drop(event, ${index})">
      <div class="link-item-icon">🔗</div>
      <div class="link-item-info">
        <h4>${link.name}</h4>
        <a href="${link.url}" target="_blank">${link.url}</a>
      </div>
      <div class="link-item-stats">
        <div class="link-stat">
          <div class="link-stat-value">${link.clicks || 0}</div>
          <div class="link-stat-label">Clicks</div>
        </div>
      </div>
      <div class="link-item-actions">
        <button class="btn btn-sm btn-secondary" onclick="editLink('${link.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteLink('${link.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function deleteLink(linkId) {
  if (confirm("Delete this link?")) {
    currentHub.links = currentHub.links.filter(l => l.id !== linkId);
    saveHubs();
    renderLinks();
    showSuccess("Link deleted");
  }
}

function editLink(linkId) {
  const link = currentHub.links.find(l => l.id === linkId);
  if (link) {
    document.getElementById("link-name").value = link.name;
    document.getElementById("link-url").value = link.url;
    deleteLink(linkId);
  }
}

let draggedLink = null;
function startDrag(e, index) {
  draggedLink = index;
}

function allowDrop(e) {
  e.preventDefault();
}

function drop(e, targetIndex) {
  e.preventDefault();
  if (draggedLink !== null && draggedLink !== targetIndex) {
    const links = currentHub.links;
    const [removed] = links.splice(draggedLink, 1);
    links.splice(targetIndex, 0, removed);
    currentHub.links = links;
    saveHubs();
    renderLinks();
  }
  draggedLink = null;
}

// ==================== RULE MANAGEMENT ====================
function onRuleTypeChange(e) {
  document.querySelectorAll(".rule-config").forEach(el => el.style.display = "none");
  
  if (e.target.value === "time-based") {
    document.getElementById("time-config").style.display = "block";
    populateLinkSelects("time-links", "working-hours");
  } else if (e.target.value === "device-based") {
    document.getElementById("device-config").style.display = "block";
    populateLinkSelects("mobile-links");
    populateLinkSelects("desktop-links");
  } else if (e.target.value === "location-based") {
    document.getElementById("location-config").style.display = "block";
    populateLinkSelects("location-links");
  } else if (e.target.value === "performance-based") {
    document.getElementById("performance-config").style.display = "block";
  }
}

function populateLinkSelects(...selectIds) {
  selectIds.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select && currentHub.links) {
      select.innerHTML = currentHub.links.map(link => 
        `<option value="${link.id}">${link.name}</option>`
      ).join("");
    }
  });
}

function addRule() {
  const ruleType = document.getElementById("rule-type").value;
  if (!ruleType) {
    showError("Please select a rule type");
    return;
  }

  let rule = { id: generateId(), type: ruleType, enabled: true };

  if (ruleType === "time-based") {
    const timeType = document.getElementById("time-rule-type").value;
    const links = Array.from(document.getElementById("time-links").selectedOptions).map(o => o.value);
    
    if (links.length === 0) {
      showError("Select at least one link");
      return;
    }

    rule.config = { type: timeType };
    if (timeType === "working-hours") {
      rule.config.workingHoursLinks = links;
    } else {
      rule.config.startHour = parseInt(document.getElementById("time-start").value) || 9;
      rule.config.endHour = parseInt(document.getElementById("time-end").value) || 17;
      rule.config.linkIds = links;
    }
  } else if (ruleType === "device-based") {
    const mobileLinks = Array.from(document.getElementById("mobile-links").selectedOptions).map(o => o.value);
    const desktopLinks = Array.from(document.getElementById("desktop-links").selectedOptions).map(o => o.value);
    
    rule.config = {
      type: "device-specific",
      mobileLinks,
      desktopLinks
    };
  } else if (ruleType === "location-based") {
    const locType = document.getElementById("location-type").value;
    const values = document.getElementById("location-values").value.split(",").map(v => v.trim()).filter(Boolean);
    const links = Array.from(document.getElementById("location-links").selectedOptions).map(o => o.value);
    
    if (values.length === 0 || links.length === 0) {
      showError("Enter locations and select links");
      return;
    }

    rule.config = {
      type: locType === "country" ? "country-specific" : "region-specific",
      [locType === "country" ? "countries" : "regions"]: values,
      linkIds: links
    };
  } else if (ruleType === "performance-based") {
    rule.config = {
      type: "top-performers",
      topN: parseInt(document.getElementById("top-n").value) || 3,
      minClicks: parseInt(document.getElementById("min-clicks").value) || 0
    };
  }

  if (!currentHub.rules) currentHub.rules = [];
  currentHub.rules.push(rule);
  saveHubs();
  renderRules();
  closeRuleModal();
  showSuccess("Rule added!");
}

function renderRules() {
  const container = document.getElementById("rules-container");
  
  if (!currentHub.rules || currentHub.rules.length === 0) {
    container.innerHTML = "<p style='text-align: center; color: var(--text-light);'>No rules configured</p>";
    return;
  }

  container.innerHTML = currentHub.rules.map(rule => `
    <div class="rule-item">
      <div class="rule-item-info">
        <h4>${getRuleTypeLabel(rule.type)}</h4>
        <p>${getRuleDescription(rule)}</p>
      </div>
      <div class="rule-item-actions">
        <button class="btn btn-sm btn-danger" onclick="deleteRule('${rule.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function getRuleTypeLabel(type) {
  const labels = {
    "time-based": "⏰ Time-Based",
    "device-based": "📱 Device-Based",
    "location-based": "🌍 Location-Based",
    "performance-based": "📊 Performance-Based"
  };
  return labels[type] || type;
}

function getRuleDescription(rule) {
  const { type, config } = rule;
  if (type === "time-based") {
    return config.type === "working-hours" ? "Show links during working hours" : `Show during ${config.startHour}-${config.endHour}`;
  } else if (type === "device-based") {
    return "Different links for mobile and desktop";
  } else if (type === "location-based") {
    return `Show in ${rule.config.countries?.join(", ") || rule.config.regions?.join(", ")}`;
  } else if (type === "performance-based") {
    return `Auto-promote top ${rule.config.topN} links`;
  }
  return "Custom rule";
}

function deleteRule(ruleId) {
  if (confirm("Delete this rule?")) {
    currentHub.rules = currentHub.rules.filter(r => r.id !== ruleId);
    saveHubs();
    renderRules();
    showSuccess("Rule deleted");
  }
}

function closeRuleModal() {
  document.getElementById("rule-modal").style.display = "none";
  document.getElementById("rule-form").reset();
  document.querySelectorAll(".rule-config").forEach(el => el.style.display = "none");
}

// ==================== MANAGE TAB ====================
function loadManageTab() {
  if (hubs.length === 0) {
    document.getElementById("manage-content").style.display = "none";
    return;
  }

  if (!currentHub && hubs.length > 0) {
    selectHub(hubs[0].id);
  }
}

function loadManageContent() {
  if (!currentHub) return;

  document.getElementById("manage-content").style.display = "block";
  document.getElementById("hub-id").textContent = currentHub.id;
  document.getElementById("hub-url").textContent = `${window.location.origin}/hub.html?id=${currentHub.id}`;
  document.getElementById("hub-visits").textContent = currentHub.visits || 0;

  renderLinks();
  renderRules();
}

function copyHubUrl(hubId) {
  const hub = hubs.find(h => h.id === hubId);
  const url = `${window.location.origin}/hub.html?id=${hub.id}`;
  copyToClipboard(url);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showSuccess("Copied to clipboard!");
  });
}

function deleteHubConfirm(hubId) {
  if (confirm("Delete this hub and all its links? This cannot be undone.")) {
    hubs = hubs.filter(h => h.id !== hubId);
    saveHubs();
    currentHub = null;
    renderHubsList();
    updateSelectDropdowns();
    showSuccess("Hub deleted");
  }
}

// ==================== ANALYTICS TAB ====================
function loadAnalyticsTab() {
  if (hubs.length === 0) {
    document.getElementById("analytics-content").style.display = "none";
    return;
  }

  const select = document.getElementById("analytics-hub-select");
  if (select.value) {
    loadAnalytics(select.value);
  }
}

let topLinksChartInstance = null;
let clickDistributionChartInstance = null;
let visitsChartInstance = null;

function loadAnalytics(hubId) {
  const hub = hubs.find(h => h.id === hubId);
  if (!hub) return;

  document.getElementById("analytics-content").style.display = "block";

  const totalVisits = hub.visits || 0;
  const links = hub.links || [];
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);
  const ctr = totalVisits > 0 ? ((totalClicks / totalVisits) * 100).toFixed(2) : 0;
  const topLink = links.sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0];

  document.getElementById("stat-visits").textContent = totalVisits;
  document.getElementById("stat-clicks").textContent = totalClicks;
  document.getElementById("stat-top-link").textContent = topLink ? topLink.name : "-";
  document.getElementById("stat-ctr").textContent = ctr + "%";

  // Sort links by clicks
  const sortedLinks = links.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
  const topN = sortedLinks.slice(0, 8);

  // ==== TOP LINKS BAR CHART ====
  if (links.length > 0) {
    const ctx1 = document.getElementById("topLinksChart").getContext("2d");
    
    if (topLinksChartInstance) {
      topLinksChartInstance.destroy();
    }

    topLinksChartInstance = new Chart(ctx1, {
      type: "bar",
      data: {
        labels: topN.map(l => l.name.substring(0, 20)),
        datasets: [
          {
            label: "Clicks",
            data: topN.map(l => l.clicks || 0),
            backgroundColor: [
              "#00a86b",
              "#007a4d",
              "#1df5a7",
              "#667eea",
              "#5568d3",
              "#f59e0b",
              "#ec4899",
              "#14b8a6"
            ],
            borderRadius: 8,
            borderSkipped: false,
            hoverBackgroundColor: [
              "#008c59",
              "#006839",
              "#1ae099",
              "#556ddc",
              "#445bc0",
              "#d97706",
              "#db2777",
              "#0d9488"
            ]
          }
        ]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)"
            }
          },
          y: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // ==== CLICK DISTRIBUTION PIE CHART ====
  if (topN.length > 0) {
    const ctx2 = document.getElementById("clickDistributionChart").getContext("2d");
    
    if (clickDistributionChartInstance) {
      clickDistributionChartInstance.destroy();
    }

    clickDistributionChartInstance = new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: topN.map(l => l.name.substring(0, 15)),
        datasets: [
          {
            data: topN.map(l => l.clicks || 0),
            backgroundColor: [
              "#00a86b",
              "#007a4d",
              "#1df5a7",
              "#667eea",
              "#5568d3",
              "#f59e0b",
              "#ec4899",
              "#14b8a6"
            ],
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverBorderColor: "#f1f5f9",
            hoverBorderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 16,
              font: {
                size: 12,
                weight: "600"
              }
            }
          }
        }
      }
    });
  }

  // ==== VISITS OVERVIEW LINE CHART ====
  if (sortedLinks.length > 0) {
    const ctx3 = document.getElementById("visitsChart").getContext("2d");
    
    if (visitsChartInstance) {
      visitsChartInstance.destroy();
    }

    // Create data for line chart showing cumulative clicks over links
    const cumulativeData = [];
    let cumulative = 0;
    sortedLinks.slice(0, 12).forEach(link => {
      cumulative += link.clicks || 0;
      cumulativeData.push(cumulative);
    });

    visitsChartInstance = new Chart(ctx3, {
      type: "line",
      data: {
        labels: sortedLinks.slice(0, 12).map(l => l.name.substring(0, 15)),
        datasets: [
          {
            label: "Cumulative Clicks",
            data: cumulativeData,
            borderColor: "#00a86b",
            backgroundColor: "rgba(0, 168, 107, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: "#00a86b",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "#007a4d",
            hoverBackgroundColor: "rgba(0, 168, 107, 0.2)"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 12,
                weight: "600"
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0, 0, 0, 0.05)"
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  // Links Table
  const tableHtml = links.length === 0 ? "<p style='text-align: center; color: var(--text-light); padding: 20px;'>No links yet</p>" : `
    <table>
      <thead>
        <tr>
          <th>Link Name</th>
          <th>URL</th>
          <th>Clicks</th>
          <th>CTR %</th>
        </tr>
      </thead>
      <tbody>
        ${links.map(link => {
          const ctr = totalVisits > 0 ? (((link.clicks || 0) / totalVisits) * 100).toFixed(2) : 0;
          return `
            <tr>
              <td>${link.name}</td>
              <td><a href="${link.url}" target="_blank" style="color: var(--primary); text-decoration: none;">${link.url}</a></td>
              <td><strong>${link.clicks || 0}</strong></td>
              <td><span style="background: rgba(0, 168, 107, 0.1); padding: 4px 8px; border-radius: 6px; color: var(--primary); font-weight: 600;">${ctr}%</span></td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  `;
  document.getElementById("links-analytics-table").innerHTML = tableHtml;

  // Export button
  document.getElementById("export-analytics").onclick = () => exportAnalytics(hub);
}

function exportAnalytics(hub) {
  const data = {
    hub: {
      title: hub.title,
      description: hub.description,
      exported: new Date().toISOString()
    },
    statistics: {
      totalVisits: hub.visits || 0,
      totalClicks: (hub.links || []).reduce((sum, l) => sum + (l.clicks || 0), 0)
    },
    links: hub.links || []
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${hub.title}-analytics-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showSuccess("Analytics exported!");
}

// ==================== UTILITIES ====================
function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function saveHubs() {
  localStorage.setItem("hubs", JSON.stringify(hubs));
}

function showSuccess(message) {
  showNotification(message, "success");
}

function showError(message) {
  showNotification(message, "error");
}

function showNotification(message, type) {
  const div = document.createElement("div");
  div.className = type === "success" ? "success-message" : "error-message";
  div.textContent = message;
  div.style.position = "fixed";
  div.style.top = "1rem";
  div.style.right = "1rem";
  div.style.zIndex = "9999";
  div.style.maxWidth = "400px";
  
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => div.remove(), 300);
  }, 3000);
}
