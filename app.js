// app.js
// (Top duplicate refreshHackatime removed — use the robust implementation defined later)

// GitHub refresh
window.refreshGithub = async function(username) {
  const githubSummary = document.getElementById('githubSummary');
  const githubRepos = document.getElementById('githubRepos');

  if (!githubSummary || !githubRepos) return;

  githubSummary.textContent = 'Loading GitHub…';
  githubRepos.innerHTML = '';

  try {
    const profileRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
    const profile = await profileRes.json();
    githubSummary.textContent = `${profile.login} • ${profile.public_repos} repos • ${profile.followers} followers`;

    const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=30`);
    const repos = await reposRes.json();
    repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

    repos.slice(0, 30).forEach(r => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${r.html_url}" target="_blank">${r.name} (${r.stargazers_count}★)</a>`;
      githubRepos.appendChild(li);
    });
  } catch (err) {
    console.error('GitHub fetch error', err);
    githubSummary.textContent = 'Error loading GitHub, Do you have internet?';
  }
};

// Startup: load saved settings and shortcuts once DOM is ready
// (Initial DOMContentLoaded that used to call the top/global refreshHackatime was removed to avoid calling the wrong/duplicate implementation)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('searchForm');
  const q = document.getElementById('q');
  const engine = document.getElementById('engine');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = (q.value || '').trim();
    if (!query) return;

    const eVal = engine.value;
    let url = '';
    if (eVal === 'google') url = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    else if (eVal === 'duck') url = 'https://duckduckgo.com/?q=' + encodeURIComponent(query);
    else if (eVal === 'bing') url = 'https://www.bing.com/search?q=' + encodeURIComponent(query);
    else if (eVal === 'brave') url = 'https://search.brave.com/search?q=' + encodeURIComponent(query);
    else if (eVal === 'perplexity') url = 'https://www.perplexity.ai/search/?q=' + encodeURIComponent(query);
    else if (eVal === 'ecosia') url = 'https://www.ecosia.org/search?q=' + encodeURIComponent(query);
    else if (eVal === 'wikipedia') url = 'https://en.wikipedia.org/w/index.php?search=' + encodeURIComponent(query);
    else if (eVal === 'firefox') url = 'https://search.firefox.com/?q=' + encodeURIComponent(query);
    else url = 'https://www.google.com/search?q=' + encodeURIComponent(query); // fallback

    window.location.href = url;
  });

  // Terminal date
  const dateLine = document.getElementById('dateLine');
  const now = new Date();
  dateLine.textContent = now.toString();

  // Make window headers draggable cause why not
  function makeDraggable(winId) {
    const win = document.getElementById(winId);
    const header = win.querySelector('.window-header');
    let isDown = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

    // this made it look better soooo.....
    if (winId === 'win1') { win.style.transform = 'translate(0px, 0px)'; }
    if (winId === 'win2') { win.style.transform = 'translate(0px, 0px)'; }

    header.addEventListener('mousedown', (e) => {
      isDown = true;
      const rect = win.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      win.style.willChange = 'transform';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
      win.style.willChange = 'auto';
    });

    // Touch support
    header.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      isDown = true;
      const rect = win.getBoundingClientRect();
      startX = t.clientX;
      startY = t.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      win.style.willChange = 'transform';
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      win.style.transform = `translate(${dx}px, ${dy}px)`;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDown = false;
      win.style.willChange = 'auto';
    });
  }
  makeDraggable('win1');
  makeDraggable('win2');
});
document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsPopup = document.getElementById('settingsPopup');
  const closeSettings = document.getElementById('closeSettings');

  const darkModeToggle = document.getElementById('darkModeToggle');
  const showShortcutsToggle = document.getElementById('showShortcutsToggle');
  const animatedBgToggle = document.getElementById('animatedBgToggle');

  const nameInput = document.getElementById('nameInput');
  const saveNameBtn = document.getElementById('saveNameBtn');

  const hackatimeUsernameInput = document.getElementById('hackatimeUsername');
  const hackatimeKeyInput = document.getElementById('hackatimeKey');
  const saveHackatimeBtn = document.getElementById('saveHackatimeBtn');

  const githubUsernameInput = document.getElementById('githubUsername');
  const saveGithubBtn = document.getElementById('saveGithubBtn');

  let shortcuts = getShortcuts();
  const shortcutNameInput = document.getElementById("shortcutName");
  const shortcutURLInput = document.getElementById("shortcutURL");
  const saveShortcutBtn = document.getElementById("saveShortcutButton");
  const clearShortcutsBtn = document.getElementById("clearCustomShortcuts");
  const shortcutListElement = document.getElementById("shortcutList");

  function getSettings() {
    return JSON.parse(localStorage.getItem('settings')) || {};
  }

  function getShortcuts() {
    return JSON.parse(localStorage.getItem("customShortcuts")) || [];
  }

  function saveSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings(settings);
  }

  function saveShortcuts() {
    localStorage.setItem("customShortcuts", JSON.stringify(shortcuts));
    renderShortcuts(shortcuts);
  }

  function clearShortcuts() {
    shortcuts = [];
    saveShortcuts();
  }

  function applySettings(settings) {
    document.body.classList.toggle('dark', !!settings.darkMode);
    const win2 = document.getElementById('win2');
    if (win2) win2.style.display = settings.showShortcuts === false ? 'none' : '';
    const matrix = document.querySelector('.matrix');
    if (matrix) matrix.style.display = settings.animatedBg === false ? 'none' : '';
  }

  function loadSettingsToUI() {
    const s = getSettings();
    if (!s || Object.keys(s).length === 0) return;
    if (darkModeToggle) darkModeToggle.checked = !!s.darkMode;
    if (showShortcutsToggle) showShortcutsToggle.checked = s.showShortcuts !== false;
    if (animatedBgToggle) animatedBgToggle.checked = s.animatedBg !== false;
    if (nameInput) nameInput.value = s.name || '';
    if (hackatimeUsernameInput) hackatimeUsernameInput.value = s.hackatimeUsername || '';
    if (hackatimeKeyInput) hackatimeKeyInput.value = s.hackatimeKey || '';
    if (githubUsernameInput) githubUsernameInput.value = s.githubUsername || '';
    applySettings(s);
  }

  function addShortcut(name, url) {
    shortcuts.push({"name": name, "URL": url});
    saveShortcuts();
    renderShortcuts();
  }

  function renderShortcuts() {
    shortcutListElement.innerHTML = '';
    let defaultShortcuts = [
      {
        "name": "Hack Club",
        "URL": "https://hackclub.com"
      },
      {
        "name": "Hack Club Slack",
        "URL": "https://hackclub.slack.com"
      },
      {
        "name": "GitHub",
        "URL": "https://github.com"
      },
      {
        "name": "Hacker News",
        "URL": "https://news.ycombinator.com"
      }
    ];
    const customShortcuts = getShortcuts();

    defaultShortcuts.concat(customShortcuts).forEach((shortcut) => {
      let listElement = document.createElement("li");
      let nextAccent = "";
      switch (shortcutListElement.childElementCount % 3) {
        case 0:
          nextAccent = "accent";
          break;
        case 1:
          nextAccent = "accent-2";
          break;
        case 2:
          nextAccent = "accent-3";
          break;
      }
      listElement.innerHTML = `<a href="${shortcut["URL"]}" style="color: var(--${nextAccent}); text-decoration: none;">${shortcut["name"]}</a>`;
      shortcutListElement.appendChild(listElement);
    })
  }

  function updateAndSaveFromUI() {
    const current = getSettings();
    const updated = {
      ...current,
      darkMode: !!darkModeToggle.checked,
      showShortcuts: !!showShortcutsToggle.checked,
      animatedBg: !!animatedBgToggle.checked,
      name: nameInput.value.trim(),
      hackatimeUsername: hackatimeUsernameInput.value.trim(),
      hackatimeKey: hackatimeKeyInput.value.trim(),
      githubUsername: githubUsernameInput.value.trim()
    };
    saveSettings(updated);
    return updated;
  }
  console.log("checkpoint 1");

  settingsBtn?.addEventListener('click', () => {
    if (settingsPopup) settingsPopup.style.display = 'block';
  });

  closeSettings?.addEventListener('click', () => {
    if (settingsPopup) settingsPopup.style.display = 'none';
  });

  darkModeToggle?.addEventListener('change', () => {
    updateAndSaveFromUI();
  });

  showShortcutsToggle?.addEventListener('change', () => {
    updateAndSaveFromUI();
  });

  animatedBgToggle?.addEventListener('change', () => {
    updateAndSaveFromUI();
  });

  saveNameBtn?.addEventListener('click', () => {
    const s = updateAndSaveFromUI();
    // inject greeting if terminal exists
    const term = document.getElementById('term1');
    if (term && s.name) {
      const oldG = term.querySelector('.greetingLine');
      if (oldG) oldG.remove();
      const oldO = term.querySelector('.greetingOutput');
      if (oldO) oldO.remove();

      const greetingLine = document.createElement('span');
      greetingLine.className = 'line greetingLine';
      greetingLine.textContent = `$ echo "Hello, ${s.name}!"`;
      term.appendChild(greetingLine);

      const outputLine = document.createElement('span');
      outputLine.className = 'line greetingOutput';
      outputLine.textContent = `Hello, ${s.name}!`;
      term.appendChild(outputLine);
    }
    alert(`Name saved as "${s.name}"`);
  });
  saveShortcutBtn.addEventListener('click', (e) => {
    console.log("Correct button pressed.");
    e.preventDefault();
    const name = shortcutNameInput.value.trim();
    const url = shortcutURLInput.value.trim();
    if (!name ||  !url) return;
    try {
      new URL(url);
    } catch (_) {
      console.error("invalid URL");
      alert("Invalid URL. Please remember to include the protocol (http:// or https://).");
      return;
    }
    addShortcut(name, url);
    shortcutNameInput.value = '';
    shortcutURLInput.value = '';
    alert(`Shortcut "${name}" added!`);
  })

  clearShortcutsBtn.addEventListener('click', () => { clearShortcuts() });

  saveHackatimeBtn?.addEventListener('click', () => {
    const s = updateAndSaveFromUI();
    alert('Hackatime settings saved.');
    // optional: trigger a refresh if your hackatime functions exist
    if (typeof refreshHackatime === 'function' && s.hackatimeUsername && s.hackatimeKey) {
      refreshHackatime(s.hackatimeUsername, s.hackatimeKey);
    }
  });

  saveGithubBtn?.addEventListener('click', () => {
    const s = updateAndSaveFromUI();
    alert('GitHub username saved.');
    if (typeof refreshGithub === 'function' && s.githubUsername) {
      refreshGithub(s.githubUsername);
    }
  });

  // keyboard: close settings on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsPopup && settingsPopup.style.display === 'block') {
      settingsPopup.style.display = 'none';
    }
  });
  renderShortcuts();
  loadSettingsToUI();
});
  

document.addEventListener('DOMContentLoaded', () => {
  const BASE_V1 = 'https://hackatime.hackclub.com/api/v1';
  const BASE_HACKATIME_V1 = 'https://hackatime.hackclub.com/api/hackatime/v1';

  // Settings inputs
  const usernameInput = document.getElementById('hackatimeUsername');
  const keyInput = document.getElementById('hackatimeKey');
  const saveHackatimeBtn = document.getElementById('saveHackatimeBtn');

  const githubInput = document.getElementById('githubUsername');
  const saveGithubBtn = document.getElementById('saveGithubBtn');

  // Hackatime UI
  const summaryEl = document.getElementById('hackatimeSummary');
  const table = document.getElementById('hackatimeTable');
  const tbody = table.querySelector('tbody');
  const projectsWrap = document.getElementById('hackatimeProjects');
  const projectsList = document.getElementById('hackatimeProjectsList');

  // GitHub UI
  const githubSummary = document.getElementById('githubSummary');
  const githubRepos = document.getElementById('githubRepos');

  function loadSettings() {
    const s = JSON.parse(localStorage.getItem('settings')) || {};
    usernameInput.value = s.hackatimeUsername || '';
    keyInput.value = s.hackatimeKey || '';
    githubInput.value = s.githubUsername || '';

    if (s.hackatimeUsername && s.hackatimeKey) {
      refreshHackatime(s.hackatimeUsername, s.hackatimeKey);
    } else {
      summaryEl.textContent = '';
      table.style.display = 'none';
      projectsWrap.style.display = 'none';
    }

    if (s.githubUsername) {
      refreshGithub(s.githubUsername);
    } else {
      githubSummary.textContent = '';
      githubRepos.innerHTML = '';
    }
  }

  function saveSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    settings.hackatimeUsername = usernameInput.value.trim();
    settings.hackatimeKey = keyInput.value.trim();
    settings.githubUsername = githubInput.value.trim();
    localStorage.setItem('settings', JSON.stringify(settings));
    return settings;
  }

  saveHackatimeBtn.addEventListener('click', () => {
    const s = saveSettings();
    if (s.hackatimeUsername && s.hackatimeKey) refreshHackatime(s.hackatimeUsername, s.hackatimeKey);
    else {
      summaryEl.textContent = 'Please enter both Hackatime username and API key.';
      table.style.display = 'none';
      projectsWrap.style.display = 'none';
    }
  });

  saveGithubBtn.addEventListener('click', () => {
    const s = saveSettings();
    if (s.githubUsername) refreshGithub(s.githubUsername);
    else {
      githubSummary.textContent = 'Enter a GitHub username to load repos.';
      githubRepos.innerHTML = '';
    }
  });

  // --- Hackatime functions ---
  async function refreshHackatime(username, apiKey) {
    // reset UI
    summaryEl.textContent = '';
    summaryEl.dataset.loading = 'true';
    summaryEl.textContent = 'Loading Hackatime...';
    tbody.innerHTML = '';
    table.style.display = 'none';
    projectsList.innerHTML = '';
    projectsWrap.style.display = 'none';

    // fetch today and stats in parallel
    const p1 = fetchTodayStatus(apiKey);
    const p2 = fetchUserStats(username, apiKey);
    const p3 = fetchUserProjects(username, apiKey);

    await Promise.allSettled([p1, p2, p3]);

    // remove loading marker
    if (summaryEl.dataset.loading === 'true') {
      delete summaryEl.dataset.loading;
      if (summaryEl.textContent === 'Loading Hackatime...') summaryEl.textContent = '';
    }
  }

  async function fetchTodayStatus(apiKey) {
    try {
      const url = `${BASE_HACKATIME_V1}/users/current/statusbar/today?api_key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('Today status fetch failed', res.status);
        return;
      }
      const json = await res.json();
      const text = json?.data?.grand_total?.text || null;
      const seconds = json?.data?.grand_total?.total_seconds || 0;
      const todayLine = text ? `Today: ${text}` : `Today: ${(seconds / 3600).toFixed(2)} hrs`;

      // show only today's time (replace previous today line if present)
      // If totals already present, keep them and prepend today
      const prev = summaryEl.textContent || '';
      // Remove any previous "Today:" prefix to avoid duplicates
      const cleaned = prev.replace(/^Today:[^•]*•\s?/, '');
      summaryEl.textContent = cleaned ? `${todayLine} • ${cleaned}` : todayLine;
    } catch (err) {
      console.error('fetchTodayStatus error', err);
    }
  }

  async function fetchUserStats(username, apiKey) {
    try {
      const url = `${BASE_V1}/users/${encodeURIComponent(username)}/stats?api_key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error('User stats fetch failed', res.status);
        summaryEl.textContent = 'Unable to load user stats.';
        return;
      }
      const data = await res.json();

      // totals
      const totalSeconds = data?.total_seconds || 0;
      const totalHours = (totalSeconds / 3600).toFixed(2);
      const totalsLine = `Total: ${totalHours} hrs`;
      const prev = summaryEl.textContent || '';
      // Avoid duplicating totals
      const cleanedPrev = prev.replace(/Total:[^•]*•\s?/, '');
      summaryEl.textContent = cleanedPrev ? `${cleanedPrev} • ${totalsLine}` : totalsLine;

      // languages
      renderLanguages(data?.languages || []);
      // if projects included in stats payload, render them
      if (Array.isArray(data?.projects) && data.projects.length) renderProjects(data.projects);
    } catch (err) {
      console.error('fetchUserStats error', err);
      summaryEl.textContent = 'Error fetching user stats.';
    }
  }

  async function fetchUserProjects(username, apiKey) {
    try {
      const url = `${BASE_V1}/users/${encodeURIComponent(username)}/projects?api_key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('Projects fetch failed', res.status);
        return;
      }
      const data = await res.json();
      const projects = Array.isArray(data) ? data : data?.projects || [];
      if (projects.length) renderProjects(projects);
    } catch (err) {
      console.error('fetchUserProjects error', err);
    }
  }

  function renderLanguages(languages) {
    if (!Array.isArray(languages) || languages.length === 0) return;
    const headerRow = table.querySelector('thead tr');
    headerRow.innerHTML = `
      <th style="padding:6px; border:1px solid #12202a;">Language</th>
      <th style="padding:6px; border:1px solid #12202a;">Time</th>
    `;
    tbody.innerHTML = '';
    languages.slice(0, 10).forEach(lang => {
      const tr = document.createElement('tr');
      const nameCell = document.createElement('td');
      const timeCell = document.createElement('td');
      nameCell.textContent = lang.name || '';
      timeCell.textContent = lang.text || formatSeconds(lang.seconds);
      nameCell.style.padding = '6px';
      nameCell.style.border = '1px solid #12202a';
      timeCell.style.padding = '6px';
      timeCell.style.border = '1px solid #12202a';
      tr.appendChild(nameCell);
      tr.appendChild(timeCell);
      tbody.appendChild(tr);
    });
    table.style.display = 'table';
  }

  function renderProjects(projects) {
    if (!Array.isArray(projects) || projects.length === 0) return;
    projectsList.innerHTML = '';
    projects.slice(0, 10).forEach(p => {
      const li = document.createElement('li');
      li.style.padding = '6px 0';
      li.style.borderBottom = '1px dashed rgba(255,255,255,0.03)';
      const name = p.name || p.repo || p.title || 'Unnamed';
      const timeText = p.text || formatSeconds(p.seconds) || '';
      li.textContent = `${name}${timeText ? ' — ' + timeText : ''}`;
      projectsList.appendChild(li);
    });
    projectsWrap.style.display = 'block';
  }

  function formatSeconds(sec) {
    if (typeof sec !== 'number' || !isFinite(sec) || sec <= 0) return '';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const parts = [];
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    return parts.join(' ');
  }

  // --- GitHub integration ---
  async function refreshGithub(githubUsername) {
    githubSummary.textContent = 'Loading GitHub...';
    githubRepos.innerHTML = '';
    try {
      // Basic profile
      const profileRes = await fetch(`https://api.github.com/users/${encodeURIComponent(githubUsername)}`);
      if (!profileRes.ok) {
        githubSummary.textContent = 'GitHub user not found.';
        return;
      }
      const profile = await profileRes.json();
      githubSummary.textContent = `${profile.login} • ${profile.public_repos} repos • ${profile.followers} followers`;

      // Top repos (by stargazers, fetch first page then sort)
      const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(githubUsername)}/repos?per_page=100`);
      if (!reposRes.ok) {
        githubRepos.innerHTML = '<li>Unable to load repos.</li>';
        return;
      }
      const repos = await reposRes.json();
      // sort by stargazers_count desc then updated_at
      repos.sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)));
      githubRepos.innerHTML = '';
      repos.slice(0, 8).forEach(r => {
        const li = document.createElement('li');
        li.style.padding = '6px 0';
        li.style.borderBottom = '1px dashed rgba(255,255,255,0.03)';
        const a = document.createElement('a');
        a.href = r.html_url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.style.color = '#cbd5e1';
        a.textContent = `${r.name} (${r.stargazers_count}★)`;
        li.appendChild(a);
        if (r.description) {
          const desc = document.createElement('div');
          desc.style.fontSize = '12px';
          desc.style.color = '#9fb3c8';
          desc.textContent = r.description;
          li.appendChild(desc);
        }
        githubRepos.appendChild(li);
      });
    } catch (err) {
      console.error('refreshGithub error', err);
      githubSummary.textContent = 'Error loading GitHub.';
    }
  }

  // Expose the robust implementations globally so other scripts can call them
  window.refreshHackatime = refreshHackatime;
  window.refreshGithub = refreshGithub;

  // Initialize
  loadSettings();
});
