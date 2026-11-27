// Fantasy Predict – FPL Link: content script. Runs ONLY on fantasy-predict.com.
//
// A tiny bridge between our settings page and the background worker, using
// window.postMessage on the page's own origin:
//
//   page → extension:  { source: "fp-page", type: "FP_EXT_PING" }
//                      { source: "fp-page", type: "FP_LINK_START", challenge, state }
//   extension → page:  { source: "fp-extension", type: "FP_EXT_PONG", version }
//                      { source: "fp-extension", type: "FP_LINK_RESULT", ok, code?, state, error? }
//
// Messages are accepted only from this same window and origin.

(function () {
  var VERSION = chrome.runtime.getManifest().version;

  function post(msg) {
    window.postMessage(Object.assign({ source: "fp-extension" }, msg), window.location.origin);
  }

  window.addEventListener("message", function (event) {
    if (event.source !== window || event.origin !== window.location.origin) return;
    var data = event.data;
    if (!data || data.source !== "fp-page") return;

    if (data.type === "FP_EXT_PING") {
      post({ type: "FP_EXT_PONG", version: VERSION });
      return;
    }

    if (data.type === "FP_LINK_START") {
      chrome.runtime.sendMessage(
        { type: "FP_START_LINK", challenge: data.challenge, state: data.state },
        function (response) {
          if (chrome.runtime.lastError || !response || !response.ok) {
            post({
              type: "FP_LINK_RESULT",
              ok: false,
              state: data.state,
              error: "Could not open the FPL sign-in. Please try again.",
            });
          }
        }
      );
    }
  });

  // The background worker reports the outcome here.
  chrome.runtime.onMessage.addListener(function (msg) {
    if (!msg || msg.type !== "FP_LINK_RESULT") return;
    post({ type: "FP_LINK_RESULT", ok: !!msg.ok, code: msg.code, state: msg.state, error: msg.error });
  });

  // Announce presence for pages that finish loading after us.
  post({ type: "FP_EXT_PONG", version: VERSION });
})();
