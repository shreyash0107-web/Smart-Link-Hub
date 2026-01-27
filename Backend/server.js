const express = require("express");
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");
const { initializeDatabase, query, get, all } = require("./database");
const RuleEngine = require("./ruleEngine");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../Frontend")));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const clickLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30
});

app.use("/api/", apiLimiter);
app.use("/hubs/", clickLimiter);

// ==================== UTILITY FUNCTIONS ====================

function getContext(req) {
  return {
    time: new Date(),
    userAgent: req.headers["user-agent"] || "",
    country: req.headers["cf-ipcountry"] || "US",
    region: req.headers["cf-ipcountry"] || "US",
    ip: req.ip
  };
}

function validateHubInput(data) {
  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    return { valid: false, error: "Title is required and must be a non-empty string" };
  }
  
  if (data.description && typeof data.description !== "string") {
    return { valid: false, error: "Description must be a string" };
  }

  if (data.theme && !["light", "dark", "auto"].includes(data.theme)) {
    return { valid: false, error: "Invalid theme" };
  }

  return { valid: true };
}

function validateLinkInput(data) {
  if (!data.name || typeof data.name !== "string") {
    return { valid: false, error: "Link name is required" };
  }

  if (!data.url || typeof data.url !== "string") {
    return { valid: false, error: "Link URL is required" };
  }

  try {
    new URL(data.url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  return { valid: true };
}

// ==================== HUB MANAGEMENT ENDPOINTS ====================

// Create a new link hub
app.post("/api/hubs", (req, res) => {
  try {
    const validation = validateHubInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const hubId = uuidv4();
    const now = new Date().toISOString();
    
    const { title, description = "", theme = "light" } = req.body;

    query(
      `INSERT INTO link_hubs (id, title, description, theme, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [hubId, title, description, theme, now, now]
    );

    const hub = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    
    res.status(201).json({
      success: true,
      message: "Link hub created successfully",
      data: {
        ...hub,
        links: [],
        rules: JSON.parse(hub.rules_config || "[]")
      }
    });
  } catch (error) {
    console.error("Create hub error:", error);
    res.status(500).json({ error: "Failed to create link hub" });
  }
});

// ==================== AUTHENTICATION FUNCTIONS ====================

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "salt_key").digest("hex");
}

function generateToken(userId) {
  return crypto.randomBytes(32).toString("hex") + "_" + userId;
}

// ==================== AUTHENTICATION ROUTES ====================

// Sign Up
app.post("/api/auth/signup", (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (name.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email exists
    const existing = get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Create user
    const userId = uuidv4();
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    query(
      `INSERT INTO users (id, name, email, password_hash, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name, email.toLowerCase(), passwordHash, now, now]
    );

    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      userId,
      name
    });
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Sign In
app.post("/api/auth/signin", (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordHash = hashPassword(password);
    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: "Signed in successfully",
      token,
      userId: user.id,
      name: user.name
    });
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({ error: "Failed to sign in" });
  }
});

// Forgot Password
app.post("/api/auth/forgot-password", (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // In a real app, we would send an email with a reset link
    // For demo, we'll just check if email exists
    const user = get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    
    // Always return success for security
    res.json({
      success: true,
      message: "If this email exists, you will receive a password reset link"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
});

// Delete Account
app.delete("/api/account/delete", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify token (in a real app, use JWT verification)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return res.status(401).json({ error: "Invalid token" });
    }

    let userId;
    try {
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      userId = payload.userId;
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user to verify exists
    const user = get("SELECT * FROM users WHERE id = ?", [userId]);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete all hubs for this user
    const userHubs = all("SELECT id FROM link_hubs WHERE user_id = ?", [userId]);
    for (const hub of userHubs) {
      // Delete all links in this hub
      query("DELETE FROM links WHERE hub_id = ?", [hub.id]);
      // Delete all analytics for this hub
      query("DELETE FROM link_analytics WHERE link_id IN (SELECT id FROM links WHERE hub_id = ?)", [hub.id]);
      query("DELETE FROM analytics WHERE hub_id = ?", [hub.id]);
      // Delete the hub
      query("DELETE FROM link_hubs WHERE id = ?", [hub.id]);
    }

    // Delete the user
    query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// ==================== HUB ROUTES ====================
app.get("/api/hubs/:hubId", (req, res) => {
  try {
    const { hubId } = req.params;

    const hub = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    if (!hub) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const links = all(`SELECT * FROM links WHERE hub_id = ? ORDER BY position`, [hubId]);
    const rules = JSON.parse(hub.rules_config || "[]");

    res.json({
      success: true,
      data: {
        ...hub,
        links,
        rules
      }
    });
  } catch (error) {
    console.error("Get hub error:", error);
    res.status(500).json({ error: "Failed to retrieve hub" });
  }
});

// Update hub details
app.put("/api/hubs/:hubId", (req, res) => {
  try {
    const { hubId } = req.params;
    
    const hub = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    if (!hub) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const validation = validateHubInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { title, description, theme } = req.body;
    const now = new Date().toISOString();

    query(
      `UPDATE link_hubs SET title = ?, description = ?, theme = ?, updated_at = ? WHERE id = ?`,
      [title, description || "", theme || "light", now, hubId]
    );

    const updated = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    const links = all(`SELECT * FROM links WHERE hub_id = ?`, [hubId]);
    const rules = JSON.parse(updated.rules_config || "[]");

    res.json({
      success: true,
      message: "Hub updated successfully",
      data: {
        ...updated,
        links,
        rules
      }
    });
  } catch (error) {
    console.error("Update hub error:", error);
    res.status(500).json({ error: "Failed to update hub" });
  }
});

// Delete hub
app.delete("/api/hubs/:hubId", (req, res) => {
  try {
    const { hubId } = req.params;

    const hub = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    if (!hub) {
      return res.status(404).json({ error: "Hub not found" });
    }

    query(`DELETE FROM links WHERE hub_id = ?`, [hubId]);
    query(`DELETE FROM analytics WHERE hub_id = ?`, [hubId]);
    query(`DELETE FROM link_analytics WHERE hub_id = ?`, [hubId]);
    query(`DELETE FROM link_hubs WHERE id = ?`, [hubId]);

    res.json({ success: true, message: "Hub deleted successfully" });
  } catch (error) {
    console.error("Delete hub error:", error);
    res.status(500).json({ error: "Failed to delete hub" });
  }
});

// ==================== LINK MANAGEMENT ENDPOINTS ====================

// Add link to hub
app.post("/api/hubs/:hubId/links", (req, res) => {
  try {
    const { hubId } = req.params;

    const hub = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    if (!hub) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const validation = validateLinkInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const linkId = uuidv4();
    const { name, url } = req.body;
    
    const lastLink = get(
      `SELECT position FROM links WHERE hub_id = ? ORDER BY position DESC LIMIT 1`,
      [hubId]
    );
    const position = (lastLink?.position || 0) + 1;

    const now = new Date().toISOString();

    query(
      `INSERT INTO links (id, hub_id, name, url, position, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [linkId, hubId, name, url, position, now]
    );

    const link = get(`SELECT * FROM links WHERE id = ?`, [linkId]);

    res.status(201).json({
      success: true,
      message: "Link added successfully",
      data: link
    });
  } catch (error) {
    console.error("Add link error:", error);
    res.status(500).json({ error: "Failed to add link" });
  }
});

// Update link
app.put("/api/hubs/:hubId/links/:linkId", (req, res) => {
  try {
    const { hubId, linkId } = req.params;

    const link = get(`SELECT * FROM links WHERE id = ? AND hub_id = ?`, [linkId, hubId]);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    const validation = validateLinkInput(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { name, url, is_active } = req.body;

    query(
      `UPDATE links SET name = ?, url = ?, is_active = ? WHERE id = ?`,
      [name, url, is_active !== undefined ? (is_active ? 1 : 0) : link.is_active, linkId]
    );

    const updated = get(`SELECT * FROM links WHERE id = ?`, [linkId]);

    res.json({
      success: true,
      message: "Link updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Update link error:", error);
    res.status(500).json({ error: "Failed to update link" });
  }
});

// Delete link
app.delete("/api/hubs/:hubId/links/:linkId", (req, res) => {
  try {
    const { hubId, linkId } = req.params;

    const link = get(`SELECT * FROM links WHERE id = ? AND hub_id = ?`, [linkId, hubId]);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    query(`DELETE FROM link_analytics WHERE link_id = ?`, [linkId]);
    query(`DELETE FROM links WHERE id = ?`, [linkId]);

    res.json({ success: true, message: "Link deleted successfully" });
  } catch (error) {
    console.error("Delete link error:", error);
    res.status(500).json({ error: "Failed to delete link" });
  }
});

// Reorder links
app.post("/api/hubs/:hubId/links/reorder", (req, res) => {
  try {
    const { hubId } = req.params;
    const { linkOrder } = req.body;

    if (!Array.isArray(linkOrder)) {
      return res.status(400).json({ error: "linkOrder must be an array" });
    }

    linkOrder.forEach((linkId, index) => {
      query(`UPDATE links SET position = ? WHERE id = ? AND hub_id = ?`, [index, linkId, hubId]);
    });

    const links = all(`SELECT * FROM links WHERE hub_id = ? ORDER BY position`, [hubId]);

    res.json({
      success: true,
      message: "Links reordered successfully",
      data: links
    });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ error: "Failed to reorder links" });
  }
});

// ==================== RULE MANAGEMENT ENDPOINTS ====================

// Add/Update rules for a hub
app.post("/api/hubs/:hubId/rules", (req, res) => {
  try {
    const { hubId } = req.params;
    const { rules } = req.body;

    const hub = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    if (!hub) {
      return res.status(404).json({ error: "Hub not found" });
    }

    if (!Array.isArray(rules)) {
      return res.status(400).json({ error: "Rules must be an array" });
    }

    for (const rule of rules) {
      const validation = RuleEngine.validateRule(rule);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    const rulesJson = JSON.stringify(rules);
    query(`UPDATE link_hubs SET rules_config = ? WHERE id = ?`, [rulesJson, hubId]);

    res.json({
      success: true,
      message: "Rules updated successfully",
      data: rules
    });
  } catch (error) {
    console.error("Update rules error:", error);
    res.status(500).json({ error: "Failed to update rules" });
  }
});

// Get rules for a hub
app.get("/api/hubs/:hubId/rules", (req, res) => {
  try {
    const { hubId } = req.params;

    const hub = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    if (!hub) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const rules = JSON.parse(hub.rules_config || "[]");

    res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    console.error("Get rules error:", error);
    res.status(500).json({ error: "Failed to retrieve rules" });
  }
});

// ==================== ANALYTICS ENDPOINTS ====================

// Get analytics for a hub
app.get("/api/hubs/:hubId/analytics", (req, res) => {
  try {
    const { hubId } = req.params;

    const hub = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    if (!hub) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const hubAnalytics = all(
      `SELECT * FROM analytics WHERE hub_id = ? ORDER BY timestamp DESC LIMIT 30`,
      [hubId]
    );

    const links = all(`SELECT * FROM links WHERE hub_id = ?`, [hubId]);
    const linkAnalytics = all(
      `SELECT * FROM link_analytics WHERE hub_id = ? ORDER BY timestamp DESC LIMIT 100`,
      [hubId]
    );

    const topLinks = links
      .map(l => ({
        ...l,
        totalClicks: linkAnalytics.filter(a => a.link_id === l.id).reduce((sum, a) => sum + a.clicks, 0) + l.clicks
      }))
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, 5);

    const totalVisits = hub.total_visits || 0;
    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

    res.json({
      success: true,
      data: {
        totalVisits,
        totalClicks,
        topLinks,
        hubAnalytics,
        linkAnalytics,
        linkDetails: links.map(l => ({
          ...l,
          clicks: l.clicks
        }))
      }
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    res.status(500).json({ error: "Failed to retrieve analytics" });
  }
});

// ==================== PUBLIC ENDPOINTS ====================

// Get public link hub page
app.get("/hubs/:hubId", (req, res) => {
  try {
    const { hubId } = req.params;

    const hub = get(`SELECT * FROM link_hubs WHERE id = ?`, [hubId]);
    if (!hub) {
      return res.status(404).json({ error: "Hub not found" });
    }

    const newVisits = (hub.total_visits || 0) + 1;
    query(`UPDATE link_hubs SET total_visits = ? WHERE id = ?`, [newVisits, hubId]);

    const today = new Date().toISOString().split("T")[0];
    const existing = get(
      `SELECT * FROM analytics WHERE hub_id = ? AND date = ?`,
      [hubId, today]
    );

    if (existing) {
      query(
        `UPDATE analytics SET visits = visits + 1 WHERE hub_id = ? AND date = ?`,
        [hubId, today]
      );
    } else {
      const analyticsId = uuidv4();
      query(
        `INSERT INTO analytics (id, hub_id, date, visits, timestamp) VALUES (?, ?, ?, 1, ?)`,
        [analyticsId, hubId, today, Date.now()]
      );
    }

    let links = all(`SELECT * FROM links WHERE hub_id = ?`, [hubId]);
    const rules = JSON.parse(hub.rules_config || "[]");
    const context = getContext(req);
    links = RuleEngine.evaluateRules(links, rules, context);

    res.json({
      success: true,
      data: {
        id: hub.id,
        title: hub.title,
        description: hub.description,
        theme: hub.theme,
        links,
        total_visits: newVisits,
        visits: newVisits
      }
    });
  } catch (error) {
    console.error("Get hub error:", error);
    res.status(500).json({ error: "Failed to retrieve hub" });
  }
});

// Track link click
app.post("/hubs/:hubId/click/:linkId", (req, res) => {
  try {
    const { hubId, linkId } = req.params;

    const link = get(`SELECT * FROM links WHERE id = ? AND hub_id = ?`, [linkId, hubId]);
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    query(`UPDATE links SET clicks = clicks + 1 WHERE id = ?`, [linkId]);

    const today = new Date().toISOString().split("T")[0];
    const existing = get(
      `SELECT * FROM link_analytics WHERE link_id = ? AND date = ?`,
      [linkId, today]
    );

    if (existing) {
      query(
        `UPDATE link_analytics SET clicks = clicks + 1 WHERE link_id = ? AND date = ?`,
        [linkId, today]
      );
    } else {
      const analyticsId = uuidv4();
      query(
        `INSERT INTO link_analytics (id, link_id, hub_id, date, clicks, timestamp) 
         VALUES (?, ?, ?, ?, 1, ?)`,
        [analyticsId, linkId, hubId, today, Date.now()]
      );
    }

    res.json({ success: true, message: "Click recorded" });
  } catch (error) {
    console.error("Click tracking error:", error);
    res.status(500).json({ error: "Failed to record click" });
  }
});

// ==================== INITIALIZATION ====================

async function startServer() {
  try {
    await initializeDatabase();
    console.log("✓ Database initialized");

    const PORT = 3000;
    app.listen(PORT, () => {
      console.log(`✓ Smart Link Hub running on http://localhost:${PORT}`);
      console.log(`✓ Admin API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
