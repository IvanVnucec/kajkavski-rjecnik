const dictionary = {
    'afinger': 'vješalica za odjeću',
    'ajngel': 'anđeo',
    'anjcug': 'odijelo',
    'apa-čapa': 'igra skrivača',
    'ausvinklin': 'koji nije pod pravim kutem',
    'pajcek': 'svinjica',
    'partoš': 'metla',
    'peljučkati': 'brčkati, kao vodu ili u vodi',
    'pelnica': 'podrum',
    'pemo': 'idemo',
    'petati': 'dirati',
    'pes': 'pas',
    'petek': 'petak',
    'picek': 'pile',
    'kramp': 'pijuk',
    'pinkala': 'kemijska olovka, penkala',
    'plaziti': 'penjati se ili puzati',
    'pleba': 'plavilo za rublje',
    'ploha': 'nagli jaki pljusak',
    'podurknuti': 'potopiti nešto u vodu',
    'pokač': 'muhomlat',
    'poljek': 'pored',
    'pondelek': 'ponedjeljak',
    'ponjgla': 'tava',
    'popevati': 'pjevati',
    'poplon': 'prekrivač',
    'porga': 'posudba, zajam',
    'raca': 'patka',
    'racok': 'patak',
    'rafung': 'dimnjak',
    'racika': 'pače',
    'rafungerač': 'dimnjačar',
    'raketljin': 'raketa',
    'resporjeno': 'raspareno',
    'rajsnedljin': 'pribadača sa širokom glavom',
    'rignja': 'poklopac na posuđu',
    'ritati': 'udarati nogom',
    'ronjgla': 'plitak širok lonac',
    'robati': 'krasti',
    'robec': 'rubac',
    'robača': 'košulja',
    'rud': 'rudo zapreženih kola',
    'ron': 'baš',
    'rodica': 'duga',
    'žegetljivo': 'škakljivo',
    'žganica': 'rakija',
    'žibek': 'guskica',
    'žmehko, žmefko': 'teško',
    'žmeknuti': 'ocijediti, stisnuti',
    'žoga': 'pila, lopta',
    'žoto': 'žuto',
    'žrt': 'dugačka drvena oblica kojom se učvršćivao teret sijena na kolima',
    'žvegla': 'zviždaljka',
    'žveplo': 'sumpor',
};

function getSortedItems() {
    return sortedItems = Object.entries(dictionary).sort((a, b) => a[0] > b[0] ? 1 : -1);
}

function clearList() {
    const list = document.querySelector('#list');
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

function filterList() {
    clearList();

    const input = searchInput.value;

    const sortedItems = getSortedItems();
    const list = document.querySelector('#list');
    sortedItems.forEach(([key, value]) => {
        if (key.includes(input) || value.includes(input)) {
            const li = document.createElement('li');
            li.innerText = key + ' - ' + value;
            list.appendChild(li);
        }
    });
}

function clearInput() {
    const searchInput = document.querySelector("#search");
    searchInput.value = "";
    filterList();
    searchInput.focus();
}
