// Auto-refresh kitchen dashboard every 30 seconds
(function () {
  const REFRESH_INTERVAL = 30000;
  let countdown = REFRESH_INTERVAL / 1000;

  const btn = document.getElementById('refresh-btn');
  if (!btn) return;

  const interval = setInterval(() => {
    countdown--;
    btn.textContent = `Refresh (${countdown}s)`;
    if (countdown <= 0) {
      clearInterval(interval);
      location.reload();
    }
  }, 1000);

  btn.addEventListener('click', () => {
    clearInterval(interval);
    location.reload();
  });
})();
