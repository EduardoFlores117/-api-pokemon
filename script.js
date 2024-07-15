const pokemonContainer = document.getElementById('pokemon-container');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('pokemon-search');
const suggestions = document.getElementById('suggestions');
const leftDetails = document.getElementById('left-details');
const rightDetails = document.getElementById('right-details');
const statsChart = document.getElementById('stats-chart').getContext('2d');
const compareContainer = document.getElementById('compare-container');
const comparisonIcon = document.getElementById('comparison-icon');
const compareButton = document.getElementById('compare-button');
const compareInput1 = document.getElementById('compare-pokemon1');
const compareInput2 = document.getElementById('compare-pokemon2');

let chart;

const fetchPokemon = async (pokemon) => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        const data = await response.json();
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        const weaknesses = await fetchWeaknesses(data.types);
        displayPokemon(data, speciesData, weaknesses);
    } catch (error) {
        alert(error.message);
    }
};

const fetchWeaknesses = async (types) => {
    const weaknesses = new Set();
    for (const type of types) {
        const response = await fetch(type.type.url);
        const data = await response.json();
        data.damage_relations.double_damage_from.forEach(weakness => weaknesses.add(weakness.name));
    }
    return Array.from(weaknesses);
};

const displayPokemon = (pokemon, speciesData, weaknesses) => {
    pokemonContainer.innerHTML = '';
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');
    pokemonCard.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    `;
    pokemonCard.addEventListener('click', () => showDetails(pokemon, speciesData, weaknesses));
    pokemonContainer.appendChild(pokemonCard);
};

const showDetails = (pokemon, speciesData, weaknesses) => {
    leftDetails.innerHTML = `
        <table>
            <tr><th>Name</th><td>${pokemon.name}</td></tr>
            <tr><th>ID</th><td>${pokemon.id}</td></tr>
            <tr><th>Height</th><td>${pokemon.height / 10} m</td></tr>
            <tr><th>Weight</th><td>${pokemon.weight / 10} kg</td></tr>
            <tr><th>Base Experience</th><td>${pokemon.base_experience}</td></tr>
            <tr><th>Types</th><td>${pokemon.types.map(type => type.type.name).join(', ')}</td></tr>
            <tr><th>Abilities</th><td>${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</td></tr>
            <tr><th>Weaknesses</th><td>${weaknesses.join(', ')}</td></tr>
        </table>
    `;
    leftDetails.classList.add('show-details');

    const stats = pokemon.stats.map(stat => stat.base_stat);
    const statsLabels = pokemon.stats.map(stat => stat.stat.name);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(statsChart, {
        type: 'radar',
        data: {
            labels: statsLabels,
            datasets: [{
                label: pokemon.name,
                data: stats,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });

    rightDetails.classList.add('show-details');
};

const showSuggestions = async (input) => {
    suggestions.innerHTML = '';
    if (input.length > 0) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
        const data = await response.json();
        const filtered = data.results.filter(pokemon => pokemon.name.toLowerCase().startsWith(input.toLowerCase()));
        filtered.forEach(pokemon => {
            const suggestion = document.createElement('li');
            suggestion.classList.add('list-group-item');
            suggestion.textContent = pokemon.name;
            suggestion.addEventListener('click', () => {
                searchInput.value = pokemon.name;
                suggestions.innerHTML = '';
            });
            suggestions.appendChild(suggestion);
        });
    }
};

const fetchAndComparePokemons = async (pokemon1, pokemon2) => {
    try {
        const responses = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon1.toLowerCase()}`),
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon2.toLowerCase()}`)
        ]);
        const data = await Promise.all(responses.map(response => {
            if (!response.ok) {
                throw new Error('One or both Pokémon not found');
            }
            return response.json();
        }));
        const weaknesses1 = await fetchWeaknesses(data[0].types);
        const weaknesses2 = await fetchWeaknesses(data[1].types);
        displayComparison(data[0], data[1], weaknesses1, weaknesses2);
    } catch (error) {
        alert(error.message);
    }
};

const displayComparison = (pokemon1, pokemon2, weaknesses1, weaknesses2) => {
    leftDetails.innerHTML = `
        <table>
            <tr><th>${pokemon1.name}</th><th>${pokemon2.name}</th></tr>
            <tr><td>ID: ${pokemon1.id}</td><td>ID: ${pokemon2.id}</td></tr>
            <tr><td>Height: ${pokemon1.height / 10} m</td><td>Height: ${pokemon2.height / 10} m</td></tr>
            <tr><td>Weight: ${pokemon1.weight / 10} kg</td><td>Weight: ${pokemon2.weight / 10} kg</td></tr>
            <tr><td>Base Experience: ${pokemon1.base_experience}</td><td>Base Experience: ${pokemon2.base_experience}</td></tr>
            <tr><td>Types: ${pokemon1.types.map(type => type.type.name).join(', ')}</td><td>Types: ${pokemon2.types.map(type => type.type.name).join(', ')}</td></tr>
            <tr><td>Abilities: ${pokemon1.abilities.map(ability => ability.ability.name).join(', ')}</td><td>Abilities: ${pokemon2.abilities.map(ability => ability.ability.name).join(', ')}</td></tr>
            <tr><td>Weaknesses: ${weaknesses1.join(', ')}</td><td>Weaknesses: ${weaknesses2.join(', ')}</td></tr>
        </table>
    `;
    leftDetails.classList.add('show-details');

    const stats1 = pokemon1.stats.map(stat => stat.base_stat);
    const statsLabels1 = pokemon1.stats.map(stat => stat.stat.name);
    const stats2 = pokemon2.stats.map(stat => stat.base_stat);
    const statsLabels2 = pokemon2.stats.map(stat => stat.stat.name);

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(statsChart, {
        type: 'radar',
        data: {
            labels: statsLabels1,
            datasets: [
                {
                    label: pokemon1.name,
                    data: stats1,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: pokemon2.name,
                    data: stats2,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                r: {
                    beginAtZero: true
                }
            }
        }
    });

    rightDetails.classList.add('show-details');
};

searchButton.addEventListener('click', () => {
    const pokemonName = searchInput.value.trim();
    if (pokemonName) {
        fetchPokemon(pokemonName);
    }
});

searchInput.addEventListener('input', (e) => {
    showSuggestions(e.target.value);
});

comparisonIcon.addEventListener('click', () => {
    compareContainer.classList.toggle('show-details');
});

compareButton.addEventListener('click', () => {
    const pokemon1 = compareInput1.value.trim();
    const pokemon2 = compareInput2.value.trim();
    if (pokemon1 && pokemon2) {
        fetchAndComparePokemons(pokemon1, pokemon2);
    }
});
