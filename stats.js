// stats.js
// Orchestrates loading of GitHub and Hackatime stats based on saved settings

(function () {
  function getSettings() {
    return JSON.parse(localStorage.getItem('settings')) || {};
  }

  function loadStats() {
    const s = getSettings();

    // Hackatime
    if (s.hackatimeUsername && s.hackatimeKey && typeof window.refreshHackatime === 'function') {
      window.refreshHackatime(s.hackatimeUsername, s.hackatimeKey);
    }

    // GitHub
    if (s.githubUsername && typeof window.refreshGithub === 'function') {
      window.refreshGithub(s.githubUsername);
    }
  }

  // Run once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    loadStats();
  });

  // Re-run whenever settings change
  window.addEventListener('storage', (e) => {
    if (e.key === 'settings') {
      loadStats();
    }
  });
})();
