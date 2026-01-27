# Quick Start Guide - Smart Link Hub Generator

## 🚀 Getting Started in 2 Minutes

### Step 1: Start the Server
```bash
cd "c:\JPD hacakathon"
npm run dev
```

You should see:
```
✓ Database initialized
✓ Smart Link Hub running on http://localhost:3000
✓ Admin API: http://localhost:3000/api
```

### Step 2: Open Admin Dashboard
Go to http://localhost:3000/admin.html

### Step 3: Create Your First Hub

1. Click **"Create Hub"** tab
2. Enter:
   - **Hub Title**: "My Links"
   - **Description**: "All my important resources"
   - **Theme**: Light (or your preference)
3. Click **"Create Hub"**

### Step 4: Add Links

1. Click **"Manage"** tab
2. Select your hub from the dropdown
3. Add links:
   - **Link Name**: "GitHub"
   - **URL**: "https://github.com"
4. Click **"+ Add Link"**
5. Repeat for more links

### Step 5: Share Your Hub

In the **Manage** tab, you'll see:
- **Hub ID**: Unique identifier
- **Public URL**: Copy this and share it!

Your hub is live at: `http://localhost:3000/hub.html?id=YOUR_HUB_ID`

### Step 6: View Analytics

Click **"Analytics"** tab and select your hub to see:
- Total visits
- Click counts
- Top performing links
- Click-through rate

---

## 💡 Example Workflows

### Workflow 1: Time-Based Display

**Goal**: Show different links during working hours vs after hours

1. Create a hub with 4 links:
   - Work Tools (GitHub, Jira, Slack)
   - Personal Links (Twitter, Portfolio, Blog)

2. Go to **"Manage"** → Select your hub

3. Click **"+ Add Rule"**:
   - **Rule Type**: ⏰ Time-Based
   - **Time Rule Type**: Working Hours
   - **Links to show**: Select Work Tools
   - Click **"Add Rule"**

4. Now visitors see work links 9 AM - 5 PM on weekdays, and personal links otherwise!

### Workflow 2: Mobile-Specific Links

**Goal**: Show different apps for mobile users

1. Add these links:
   - iOS App (deep link)
   - Android App (Google Play)
   - Web Version

2. **"+ Add Rule"**:
   - **Rule Type**: 📱 Device-Based
   - **Mobile Links**: Select iOS & Android
   - **Desktop Links**: Select Web Version

3. Mobile users see app links, desktop users see web version!

### Workflow 3: Top Performer Promotion

**Goal**: Automatically show the most-clicked links first

1. Add 5+ links and let people click them for a day

2. **"+ Add Rule"**:
   - **Rule Type**: 📊 Performance-Based
   - **Show top N links**: 3
   - **Minimum clicks to qualify**: 5

3. The top 3 links automatically move to the top as people click them!

---

## 🎨 Customization

### Dark Mode
Click the moon icon (🌙) in the top right to toggle dark mode

### Theme Selection
When creating a hub, choose:
- **Light**: Clean white theme
- **Dark**: Dark background
- **Auto**: Follows system preference

---

## 📊 Dashboard Features

### My Hubs Tab
- View all your link hubs
- Quick access to manage and share
- See visit and link counts

### Manage Tab
- **Hub Details**: ID and public URL for sharing
- **Links Management**: Add, edit, delete, reorder links
- **Display Rules**: Configure conditional logic
- **Danger Zone**: Delete the entire hub

### Analytics Tab
- **Summary Stats**: Total visits, clicks, CTR
- **Top Links Chart**: Visual bar chart of performance
- **Link Details Table**: Detailed breakdown per link
- **Export**: Download analytics as JSON

---

## 🔗 Sharing Your Hub

### Public URL Format
```
http://localhost:3000/hub.html?id=YOUR_HUB_ID
```

### What Visitors See
- Your hub title and description
- All active links (filtered by rules)
- Clean, professional interface
- Click tracking (automatic)

### No Login Required
Your hubs are public by default - great for sharing!

---

## 🧠 Rule Engine Tips

### ⏰ Time-Based Rules
- **Best For**: Business hours, special promotions, seasonal content
- **Works**: 9 AM - 5 PM weekdays for "working hours" option
- **Supports**: Custom time ranges (0-23 hours)

### 📱 Device-Based Rules
- **Best For**: Mobile apps, platform-specific tools, responsive content
- **Works**: Detects iPhone, Android, mobile browsers vs desktop
- **Tip**: Show app store links to mobile users

### 🌍 Location-Based Rules
- **Best For**: Regional services, localized content, country-specific links
- **Works**: Country and region detection
- **Note**: Requires location headers (CloudFlare, proxies)

### 📊 Performance-Based Rules
- **Best For**: Promoting popular content, data-driven ordering
- **Works**: Auto-reorders based on real click counts
- **Tip**: Set minimum clicks threshold to avoid early instability

---

## 🆘 Troubleshooting

### Issue: Server won't start
**Solution**: 
```bash
# Kill any existing Node processes
Get-Process node | Stop-Process -Force

# Try starting again
npm run dev
```

### Issue: Database locked
**Solution**: The database file is being accessed. Restart the server.

### Issue: Can't see my hub
**Solution**: 
- Check that the hub ID is correct in the URL
- Make sure the server is running
- Clear browser cache

### Issue: Links not showing rules
**Solution**: Rules are applied in real-time based on user context:
- Time rules need correct system time
- Device rules read User-Agent header
- Performance rules need clicks to work

### Issue: Analytics not updating
**Solution**: 
- Click the hub link to increment visits
- Click the links themselves to track clicks
- Analytics update in real-time

---

## 📚 API Reference (For Developers)

### Create Hub
```bash
curl -X POST http://localhost:3000/api/hubs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Hub",
    "description": "Description",
    "theme": "light"
  }'
```

### Add Link
```bash
curl -X POST http://localhost:3000/api/hubs/{hubId}/links \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Link Name",
    "url": "https://example.com"
  }'
```

### Get Analytics
```bash
curl http://localhost:3000/api/hubs/{hubId}/analytics
```

### Track Click
```bash
curl -X POST http://localhost:3000/hubs/{hubId}/click/{linkId}
```

---

## ✅ Checklist: First Hub Launch

- [ ] Server running (`npm run dev`)
- [ ] Dashboard accessible (http://localhost:3000/admin.html)
- [ ] Hub created with title and description
- [ ] 3+ links added
- [ ] Hub ID copied
- [ ] Public URL tested in browser
- [ ] Clicked some links (to test tracking)
- [ ] Checked analytics dashboard
- [ ] Tried toggle dark mode
- [ ] Added at least one rule

---

## 🎓 Learn More

- Full documentation: See README.md
- Architecture details: See Backend structure section
- API endpoints: Complete list in README
- Advanced rules: See Rule Engine section

---

## 💬 Pro Tips

1. **Test Rules**: Add rules one at a time and test each
2. **Monitor Analytics**: Check daily to see what's popular
3. **Update Links**: Periodically add new links based on analytics
4. **Share Feedback**: Rules that work well should be documented
5. **Export Data**: Export analytics regularly for backup

---

**Ready to create smart link hubs?** 🚀

Go to http://localhost:3000/admin.html and start building!
