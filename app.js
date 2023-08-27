function getSortedItems() {
    return sortedItems = Object.entries(words).sort((a, b) => trimAndLower(a[0]) > trimAndLower(b[0]) ? 1 : -1);
}

function clearList() {
    document.getElementById("list").innerHTML = "";
}

function trimAndLower(string) {
    return string.trim().toLowerCase();
}

function highlightedString(string, highlight) {
    const index = string.indexOf(highlight);
    if (index != -1) {
        return string.slice(0, index)
            + `<mark>${string.slice(index, index + highlight.length)}</mark>`
            + string.slice(index + highlight.length);
    }

    return string;
}

function search(query) {
    const results = [];

    const sortedItems = getSortedItems();
    sortedItems.forEach((item) => {
        const key = trimAndLower(item[0]);
        const value = trimAndLower(item[1]);

        if (key.includes(query) || value.includes(query)) {
            results.push(item);
        }
    });

    return results;
}

function displayResults(results, query) {
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
    const query = trimAndLower(searchInput.value);
    const results = search(query);

    clearList();
    displayResults(results, query);
}

function onClear() {
    const searchInput = document.getElementById("search");
    searchInput.value = "";
    searchInput.focus();
    searchAndDisplay();
}
