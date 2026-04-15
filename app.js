let myChart = null;

window.onload = () => {
    document.getElementById('date').valueAsDate = new Date();
    updateChart();
};

function ajouterReleve() {
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const val = document.getElementById('index').value;
    const index = parseFloat(val);

    if (!date || isNaN(index)) return alert("Entrez une valeur valide");

    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    historique.push({ id: Date.now(), date, type, index });
    localStorage.setItem('consoHistorique', JSON.stringify(historique));
    
    document.getElementById('index').value = '';
    updateChart();
    alert("Ajouté !");
}

function ouvrirEdition() {
    document.getElementById('pagePrincipale').classList.add('hidden');
    document.getElementById('pageEdition').classList.remove('hidden');
    genererInterfaceEdition();
}

function fermerEdition() {
    document.getElementById('pageEdition').classList.add('hidden');
    document.getElementById('pagePrincipale').classList.remove('hidden');
    updateChart();
}

function genererInterfaceEdition() {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    historique.sort((a, b) => new Date(b.date) - new Date(a.date));
    const conteneur = document.getElementById('listeModifiable');
    conteneur.innerHTML = '';

    historique.forEach(r => {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center border";
        div.innerHTML = `
            <input type="date" id="d-${r.id}" value="${r.date}" class="border-b p-1">
            <select id="t-${r.id}" class="border-b p-1">
                <option value="Electricité" ${r.type==='Electricité'?'selected':''}>Elec</option>
                <option value="Eau" ${r.type==='Eau'?'selected':''}>Eau</option>
                <option value="Gaz" ${r.type==='Gaz'?'selected':''}>Gaz</option>
            </select>
            <input type="number" id="i-${r.id}" value="${r.index}" class="border-b p-1">
            <button onclick="validerModif(${r.id})" class="bg-green-500 text-white px-3 py-1 rounded">OK</button>
            <button onclick="supprimerReleve(${r.id})" class="text-red-500">Supprimer</button>
        `;
        conteneur.appendChild(div);
    });
}

function validerModif(id) {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    const idx = historique.findIndex(r => r.id === id);
    if(idx !== -1) {
        historique[idx].date = document.getElementById(`d-${id}`).value;
        historique[idx].type = document.getElementById(`t-${id}`).value;
        historique[idx].index = parseFloat(document.getElementById(`i-${id}`).value);
        localStorage.setItem('consoHistorique', JSON.stringify(historique));
        fermerEdition();
    }
}

function supprimerReleve(id) {
    if(confirm("Supprimer ?")) {
        let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
        historique = historique.filter(r => r.id !== id);
        localStorage.setItem('consoHistorique', JSON.stringify(historique));
        genererInterfaceEdition();
    }
}

function resetData() {
    if(confirm("Tout effacer ?")) {
        localStorage.removeItem('consoHistorique');
        location.reload();
    }
}

function updateChart() {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    if (historique.length === 0) {
        if (myChart) myChart.destroy();
        return;
    }

    historique.sort((a, b) => new Date(a.date) - new Date(b.date));

    const types = ['Electricité', 'Eau', 'Gaz'];
    const colors = { 'Electricité': '#eab308', 'Eau': '#2563eb', 'Gaz': '#f97316' };

    const datasets = types.map(t => {
        const dataPoints = historique
            .filter(r => r.type === t)
            .map(r => ({
                x: new Date(r.date),
                y: r.index
            }));

        return {
            label: t,
            data: dataPoints,
            borderColor: colors[t],
            backgroundColor: colors[t],
            yAxisID: t === 'Eau' ? 'yEau' : 'yE', // Eau à droite, Elec/Gaz à gauche
            spanGaps: true,
            tension: 0.2,
            pointRadius: 5
        };
    });

    if (myChart) myChart.destroy();
    
    const ctx = document.getElementById('consoChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: { unit: 'day', displayFormats: { day: 'dd MMM' } }
                },
                yE: { 
                    type: 'linear', 
                    position: 'left', 
                    title: { display: true, text: 'kWh (Elec/Gaz)' },
                    // ASTUCE : On ne force pas le zéro pour que la courbe "zoom" sur vos valeurs
                    beginAtZero: false, 
                    grace: '5%' // Ajoute un petit espace de 5% en haut et en bas pour ne pas coller aux bords
                },
                yEau: { 
                    type: 'linear', 
                    position: 'right', 
                    title: { display: true, text: 'm³ (Eau)' },
                    grid: { drawOnChartArea: false },
                    beginAtZero: false,
                    grace: '5%'
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const pointActuel = context.raw;
                            const dataSet = context.dataset.data;
                            const idx = context.dataIndex;
                            let label = `${context.dataset.label}: ${pointActuel.y}`;

                            if (idx > 0) {
                                const pointPrecedent = dataSet[idx - 1];
                                const diffIndex = pointActuel.y - pointPrecedent.y;
                                const diffJours = Math.ceil(Math.abs(pointActuel.x - pointPrecedent.x) / (1000 * 60 * 60 * 24)) || 1;
                                label += ` (+${diffIndex.toFixed(1)} | ${(diffIndex/diffJours).toFixed(2)}/j)`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}
