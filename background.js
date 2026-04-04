/**
 * i3tabs - background.js
 *
 * Listens for keyboard commands (Alt+Shift+1 through Alt+Shift+9) and moves
 * the currently active tab to the requested position within the current window.
 *
 * The tabs API uses zero-based indexing, so "position 1" maps to index 0,
 * "position 2" maps to index 1, etc.
 *
 * If the requested index exceeds the number of tabs in the window, the tab is
 * moved to the last available position (index -1 in the API).
 */

browser.commands.onCommand.addListener(async (command) => {
  // Only handle our move-tab-N commands.
  if (!command.startsWith("move-tab-")) return;

  // Parse the 1-based position from the command name (e.g. "move-tab-3" → 3).
  const position = parseInt(command.replace("move-tab-", ""), 10);
  if (isNaN(position)) return;

  // Convert to a zero-based index for the tabs API.
  const targetIndex = position - 1;

  // Retrieve the currently active tab in the focused window.
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!activeTab) return;

  // Get the total number of tabs in the current window so we can clamp the
  // target index to a valid range.
  const allTabs = await browser.tabs.query({ currentWindow: true });
  const tabCount = allTabs.length;

  // Clamp: if the target index is beyond the last tab, move to the end.
  // The tabs API accepts -1 to mean "last position", which is convenient here.
  const clampedIndex = targetIndex < tabCount ? targetIndex : -1;

  await browser.tabs.move(activeTab.id, { index: clampedIndex });
});
