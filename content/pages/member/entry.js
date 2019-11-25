(async () => {
  const src = chrome.runtime.getURL('content/pages/member/main.js');
  console.time('[bilibili analysis] load member script');
  const content = await import(src);
  console.timeEnd('[bilibili analysis] load member script');
  content.init();
})();
