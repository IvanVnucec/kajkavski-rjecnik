function getSortedItems() {
    return sortedItems = Object.entries(dictionary).sort((a, b) => trimAndLower(a[0]) > trimAndLower(b[0]) ? 1 : -1);
}

function clearList() {
    const list = document.querySelector('#list');
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

function trimAndLower(string) {
    return string.toLowerCase().trim();
}

function filterList() {
    clearList();
    var numberOfItems = 0;

    const input = searchInput.value;

    const sortedItems = getSortedItems();
    const list = document.getElementById('list');
    sortedItems.forEach(([key, value]) => {
        const keyClean = trimAndLower(key);
        const valueClean = trimAndLower(value);
        const inputClean = trimAndLower(input);

        if (keyClean.includes(inputClean) || valueClean.includes(inputClean)) {
            const li = document.createElement('li');
            li.innerText = key + ' - ' + value;
            list.appendChild(li);
            numberOfItems++;
        }
    });

    document.getElementById("number-of-items").innerHTML = numberOfItems;
}

function clearInput() {
    const searchInput = document.getElementById("search");
    searchInput.value = "";
    filterList();
    searchInput.focus();
}
