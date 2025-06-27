/* Save as background.js */
// background.js — runs as service‑worker (MV3) and orchestrates timers

// Keys in storage.local: { timers: { [tabId]: {deadline:number, originalTitle:string|null} } }
const STORAGE_KEY = "timers";

/** Utility: read timers map from storage */
async function getTimers() {
  const { [STORAGE_KEY]: timers } = await browser.storage.local.get({ [STORAGE_KEY]: {} });
  return timers;
}

/** Utility: persist timers map */
async function setTimers(timers) {
  await browser.storage.local.set({ [STORAGE_KEY]: timers });
}

/** Create (or reset) an alarm for a tab */
async function scheduleAlarm(tabId, deadline) {
  // Remove any existing alarm for this tab
  const allAlarms = await browser.alarms.getAll();
  for (const a of allAlarms) {
    if (a.name.startsWith(`countdown-${tabId}-`)) {
      await browser.alarms.clear(a.name);
    }
  }
  await browser.alarms.create(`countdown-${tabId}-${deadline}`, { when: deadline });
}

/** Clear alarm & cleanup */
async function clearTimer(tabId) {
  const timers = await getTimers();
  if (!(tabId in timers)) return;
  const { originalTitle } = timers[tabId];
  // Restore title if possible
  try {
    const tab = await browser.tabs.get(parseInt(tabId));
    if (originalTitle) {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: (title) => {
          if (document.title.startsWith("🔔 ")) {
            document.title = title;
          }
        },
        args: [originalTitle]
      });
    }
  } catch (_) {
    /* tab might be closed */
  }
  // remove storage entry
  delete timers[tabId];
  await setTimers(timers);
  // clear alarms
  const allAlarms = await browser.alarms.getAll();
  for (const a of allAlarms) {
    if (a.name.startsWith(`countdown-${tabId}-`)) {
      await browser.alarms.clear(a.name);
    }
  }
}

/** Handle alarm fire */
async function handleAlarm(alarm) {
  if (!alarm.name.startsWith("countdown-")) return;
  const [, tabId] = alarm.name.split("-");
  const timers = await getTimers();
  const timer = timers[tabId];
  if (!timer) return; // cancelled in meantime

  // Mark the tab & notify
  try {
    const tab = await browser.tabs.get(parseInt(tabId));
    // Send message to contentScript to mark title
    await browser.tabs.sendMessage(tab.id, { action: "mark" });
    // Show toast / notification
    await browser.notifications.create(`notif-${tabId}-${Date.now()}`, {
      type: "basic",
      iconUrl: "icons/bell-96.png",
      title: "Tab timer elapsed",
      message: tab.title || "A tab's timer has elapsed",
      requireInteraction: false
    });
  } catch (_) {/* tab might be gone */}

  // Leave timer entry (status = elapsed) so it appears in popup; mark as elapsed by setting deadline:0
  timer.elapsed = true;
  await setTimers(timers);
}

// Initialise: re‑schedule any stored timers on startup
(async () => {
  const timers = await getTimers();
  const now = Date.now();
  for (const [tabId, t] of Object.entries(timers)) {
    if (t.elapsed) continue; // already elapsed, leave list alone
    // Only reschedule if deadline in future
    if (t.deadline > now) {
      scheduleAlarm(tabId, t.deadline);
    } else {
      // Mark as elapsed and trigger handlers for consistency
      handleAlarm({ name: `countdown-${tabId}-${t.deadline}` });
    }
  }
})();

/* Runtime message router */
browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "start") {
    const { tabId, durationMs } = msg;
    return (async () => {
      const tab = await browser.tabs.get(tabId);
      const deadline = Date.now() + durationMs;
      const timers = await getTimers();
      timers[tabId] = {
        deadline,
        originalTitle: tab.title,
        elapsed: false
      };
      await setTimers(timers);
      scheduleAlarm(tabId, deadline);
    })();
  }
  if (msg.action === "cancel") {
    return clearTimer(msg.tabId);
  }
  if (msg.action === "snooze") {
    return (async () => {
      const timers = await getTimers();
      const t = timers[msg.tabId];
      if (!t) return;
      const newDeadline = Date.now() + msg.durationMs;
      t.deadline = newDeadline;
      t.elapsed = false;
      await setTimers(timers);
      scheduleAlarm(msg.tabId, newDeadline);
    })();
  }
  if (msg.action === "listTimers") {
    return getTimers();
  }
});

browser.alarms.onAlarm.addListener(handleAlarm);

/* Clean up when tab closes */
browser.tabs.onRemoved.addListener((tabId) => {
  clearTimer(String(tabId));
});
