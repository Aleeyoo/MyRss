const feedUrlInput = document.getElementById('feed-url-input');
const loadFeedButton = document.getElementById('load-feed-button');
const rssContainer = document.getElementById('rss-container');
const loadingIndicator = document.getElementById('loading');
const errorDisplay = document.getElementById('error');
const modal = document.getElementById("articleModal");
const modalTitle = document.getElementById("article-title");
const modalContent = document.getElementById("article-content");
const modalDate = document.getElementById("article-date");
const closeBtn = document.querySelector(".close");

loadFeedButton.addEventListener('click', () => {
  const rssFeedUrl = feedUrlInput.value.trim();
  if (rssFeedUrl) {
    loadRSSFeed(rssFeedUrl);
  } else {
    alert('Please enter an RSS feed URL.');
  }
});

// 采用现代async/await语法替代Promise链
async function loadRSSFeed(rssFeedUrl) {
  try {
    const items = await parseRSS(rssFeedUrl);
    displayRSSItems(items);
  } catch (error) {
    displayError(error.message);
  }
}

// 增强错误处理机制
function displayError(message) {
  console.error(`[${new Date().toISOString()}] Error: ${message}`);
  loadingIndicator.textContent = '';
  errorDisplay.textContent = `Error: ${message}`;
  errorDisplay.style.display = 'block';
}

async function parseRSS(url) {
  const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
  const data = await response.json();
  if (data.status !== 'ok') throw new Error(`RSS2JSON error: ${data.message}`);
  
  return data.items;
}

function displayRSSItems(items) {
  loadingIndicator.textContent = '';
  rssContainer.innerHTML = '';

  items.forEach(item => {
    const rssItemDiv = document.createElement('div');
    rssItemDiv.classList.add('rss-item');

    const title = document.createElement('h2');
    title.textContent = item.title;
    rssItemDiv.appendChild(title);

    const imgMatch = item.description.match(/<img.*?src="(.*?)"/);
    if (imgMatch?.[1]) {
      const img = document.createElement('img');
      img.src = imgMatch[1];
      rssItemDiv.appendChild(img);
    }

    const description = document.createElement('p');
    description.innerHTML = item.description;
    rssItemDiv.appendChild(description);

    const date = document.createElement('p');
    date.classList.add('date');
    date.textContent = new Date(item.pubDate).toLocaleString();
    rssItemDiv.appendChild(date);

    rssItemDiv.addEventListener('click', () => openArticle(item));
    rssContainer.appendChild(rssItemDiv);
  });
}

function displayError(message) {
  loadingIndicator.textContent = '';
  errorDisplay.textContent = `Error: ${message}`;
  errorDisplay.style.display = 'block';
}

function openArticle(item) {
  modalTitle.textContent = item.title;
  modalContent.innerHTML = item.content || item.description;
  modalDate.textContent = new Date(item.pubDate).toLocaleString();
  modal.style.display = "block";
}

closeBtn.onclick = () => modal.style.display = "none";
window.onclick = event => {
  if (event.target === modal) modal.style.display = "none";
};
