// Minimal service worker so the app is installable. It only touches page
// navigations (network first, with an offline notice); API calls, report
// streaming and assets go straight to the network untouched.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(
          '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
            '<body style="font-family:system-ui;background:#090e1a;color:#e2e8f0;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:16px">' +
            "<div><h1 style=\"font-size:20px\">Sem conexão</h1><p>Verifique sua internet e tente novamente.</p></div></body>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } },
        ),
    ),
  );
});
