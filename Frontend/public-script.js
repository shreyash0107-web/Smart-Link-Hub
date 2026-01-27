// Smart Link Hub - Public Index Page

function viewSampleHub() {
  // For demo purposes, create and display a sample hub
  const sampleHub = {
    id: "sample-hub-123",
    title: "My Awesome Links",
    description: "All my important resources in one place",
    links: [
      { id: "1", name: "GitHub Profile", url: "https://github.com", clicks: 42 },
      { id: "2", name: "Portfolio", url: "https://example.com/portfolio", clicks: 28 },
      { id: "3", name: "Blog", url: "https://example.com/blog", clicks: 15 },
      { id: "4", name: "Twitter", url: "https://twitter.com", clicks: 67 }
    ]
  };

  displaySampleHub(sampleHub);
  document.querySelector(".welcome-card").style.display = "none";
  document.getElementById("sample-hub").style.display = "block";
}

function displaySampleHub(hubData) {
  const linksContainer = document.getElementById("links");
  
  linksContainer.innerHTML = hubData.links.map(link => `
    <a href="${link.url}" class="link" target="_blank">
      <div class="link-icon">🔗</div>
      <div class="link-info">
        <h3>${link.name}</h3>
        <p>${link.url}</p>
      </div>
      <div class="link-arrow">→</div>
    </a>
  `).join("");
}
