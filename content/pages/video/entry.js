(async () => {
  const src = chrome.runtime.getURL('content/pages/video/main.js');
  console.time('[bilibili analysis] load video script');
  const content = await import(src);
  console.timeEnd('[bilibili analysis] load video script');
  content.init();
})();
