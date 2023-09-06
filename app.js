const SEARCH_WORKER = new Worker('dictionary.js');
SEARCH_WORKER.addEventListener('message', function (e) {
    console.log('search finished')
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

function searchAndDisplay() {
    const query = searchInput.value.toLowerCase();
    searchStart(query);
}

function onClear() {
    searchInput.value = "";
    searchInput.focus();
    searchAndDisplay();
}
