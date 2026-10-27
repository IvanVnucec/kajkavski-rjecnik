const searchInput = document.getElementById('search');

// Resolve dictionary.js relative to this script's own URL, so the worker loads
// correctly from pages at any depth (/ and /<slug>/).
const SEARCH_WORKER = new Worker(new URL('dictionary.js', document.currentScript.src));
SEARCH_WORKER.addEventListener('message', function (e) {
    const results = e.data;
    displayResults(results);
});

function clearList() {
    document.getElementById("list").innerHTML = "";
}

function highlightedString(string, highlight) {
    const index = string.toLowerCase().indexOf(highlight.toLowerCase());
    if (index != -1) {
        return string.slice(0, index)
            + `<mark>${string.slice(index, index + highlight.length)}</mark>`
            + string.slice(index + highlight.length);
    }

    return string;
}

function searchStart(query) {
    SEARCH_WORKER.postMessage(query);
}

function displayResults(results) {
    const query = searchInput.value.toLowerCase()

    clearList();
    const list = document.getElementById('list');
    results.forEach(([key, value]) => {
        const li = document.createElement('li');
        li.innerHTML = highlightedString(key, query)
            + ' - ' + highlightedString(value, query);
        list.appendChild(li);
    });

    document.getElementById("number-of-items").innerHTML = results.length;
}

// shouldSyncUrl is true only for user-driven searches (typing, clear, submit),
// so the initial search on page load (onload, prefilled input) doesn't rewrite the URL.
function searchAndDisplay(shouldSyncUrl = false) {
    const query = searchInput.value.toLowerCase();
    searchStart(query);

    if (shouldSyncUrl) {
        // keep the URL in sync (?q=...) so searches can be shared and survive reload
        const url = query
            ? `${location.pathname}?q=${encodeURIComponent(query)}`
            : location.pathname;
        history.replaceState(null, '', url);
    }
}

function onClear() {
    searchInput.value = "";
    searchInput.focus();
    searchAndDisplay(true);
}

// register event listener on search input
searchInput.addEventListener('input', () => searchAndDisplay(true));

// prefill search param (?q=...)
const params = new URLSearchParams(location.search);
const q = params.get('q');
if (q) {
    searchInput.value = q;
}
