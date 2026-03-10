export const installPromptScript = `
  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    window.__puqInstallPrompt = event;
  });
`;
