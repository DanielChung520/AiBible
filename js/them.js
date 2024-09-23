// theme.js
function detectSystemTheme() {
    const media = window.matchMedia('(prefers-color-scheme:dark)');
    const body = document.body;
  
    function applyTheme(theme) {
      if (theme === 'dark') {
        body.classList.add('dark-theme');
      } else {
        body.classList.remove('dark-theme');
      }
    }
  
    applyTheme(media.matches ? 'dark' : 'light');
  
    media.addEventListener('change', (e) => {
      applyTheme(e.matches ? 'dark' : 'light');
    });
  }
  
  detectSystemTheme();