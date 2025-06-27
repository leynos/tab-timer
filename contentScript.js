// Receives messages to mark/unmark the tab title
let originalTitle = null;

browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "mark") {
    if (!document.title.startsWith("🔔 ")) {
      originalTitle = document.title;
      document.title = `🔔 ${originalTitle}`;
    }
  }
});
