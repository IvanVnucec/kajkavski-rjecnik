const WORDS_SORTED = Object.entries(words).sort((first, second) => first[0].toLowerCase() > second[0].toLowerCase() ? 1 : -1);

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

function search(query) {
    const results = [];

    WORDS_SORTED.forEach((item) => {
        const key = item[0].toLowerCase();
        const value = item[1].toLowerCase();

        if (key.includes(query) || value.includes(query)) {
            results.push(item);
        }
    });

    return results;
}

function displayResults(results, query) {
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
    const results = search(query);

    displayResults(results, query);
}

function onClear() {
    const searchInput = document.getElementById("search");
    searchInput.value = "";
    searchInput.focus();
    searchAndDisplay();
}
