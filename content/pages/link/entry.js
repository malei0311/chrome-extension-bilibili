(async () => {
  const src = chrome.runtime.getURL('content/pages/link/main.js');
  console.time('[bilibili analysis] load link script');
  const content = await import(src);
  console.timeEnd('[bilibili analysis] load link script');
  content.init();
})();
