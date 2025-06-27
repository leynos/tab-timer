(async () => {
  const $ = (sel) => document.querySelector(sel);
  const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];

  // Handle form submit — create timer
  $("#setTimerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const h = parseInt($("#hours").value, 10) || 0;
    const m = parseInt($("#minutes").value, 10) || 0;
    const s = parseInt($("#seconds").value, 10) || 0;
    const durationMs = ((h * 60 + m) * 60 + s) * 1000;
    if (!durationMs) return;
    await browser.runtime.sendMessage({ action: "start", tabId: currentTab.id, durationMs });
    window.close();
  });

  /* Populate timer list */
  const timers = await browser.runtime.sendMessage({ action: "listTimers" });
  const listEl = $("#timerList");
  const rowTpl = $("#timerRow").content;
  const now = Date.now();
  for (const [tabId, t] of Object.entries(timers)) {
    const li = rowTpl.cloneNode(true);
    const remaining = t.elapsed ? "elapsed" : msToPretty(t.deadline - now);
    li.querySelector(".title").textContent = `Tab ${tabId}`;
    li.querySelector(".remaining").textContent = remaining;
    li.querySelector(".cancel").addEventListener("click", () => {
      browser.runtime.sendMessage({ action: "cancel", tabId: parseInt(tabId) });
      li.remove();
    });
    li.querySelector(".snooze").addEventListener("click", () => {
      const FIVE_MIN = 5 * 60 * 1000;
      browser.runtime.sendMessage({ action: "snooze", tabId: parseInt(tabId), durationMs: FIVE_MIN });
      li.querySelector(".remaining").textContent = msToPretty(FIVE_MIN);
    });
    listEl.appendChild(li);
  }

  function msToPretty(ms) {
    if (ms <= 0) return "elapsed";
    const s = Math.round(ms / 1000);
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
  }
})();
