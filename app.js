let myChart;
const ctx = document.getElementById('consoChart').getContext('2d');

window.onload = () => {
    document.getElementById('date').valueAsDate = new Date();
    updateChart();
};

function ajouterReleve() {
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const index = parseFloat(document.getElementById('index').value);

    if (!date || isNaN(index)) return alert("Remplissez tous les champs");

    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    historique.push({ id: Date.now(), date, type, index });
    localStorage.setItem('consoHistorique', JSON.stringify(historique));
    
    updateChart();
    if(!document.getElementById('sectionHistorique').classList.contains('hidden')) afficherHistorique();
}

function resetData() {
    if(confirm("Voulez-vous vraiment supprimer toutes les données ? Cette action est irréversible.")) {
        localStorage.removeItem('consoHistorique');
        updateChart();
        afficherHistorique();
    }
}

function toggleHistorique() {
    const section = document.getElementById('sectionHistorique');
    section.classList.toggle('hidden');
    if (!section.classList.contains('hidden')) afficherHistorique();
}

function afficherHistorique() {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    historique.sort((a, b) => new Date(b.date) - new Date(a.date)); // Plus récent en haut
    
    const tbody = document.getElementById('tableHistorique');
    tbody.innerHTML = historique.map(r => `
        <tr class="border-b text-sm">
            <td class="p-2">${r.date}</td>
            <td class="p-2">${r.type}</td>
            <td class="p-2 font-mono">${r.index}</td>
            <td class="p-2">
                <button onclick="supprimerReleve(${r.id})" class="text-red-500 mr-2">Supprimer</button>
            </td>
        </tr>
    `).join('');
}

function supprimerReleve(id) {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    historique = historique.filter(r => r.id !== id);
    localStorage.setItem('consoHistorique', JSON.stringify(historique));
    updateChart();
    afficherHistorique();
}

function updateChart() {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    historique.sort((a, b) => new Date(a.date) - new Date(b.date));

    const types = ['Electricité', 'Eau', 'Gaz'];
    const colors = { 'Electricité': '#facc15', 'Eau': '#3b82f6', 'Gaz': '#f97316' };
    const labels = [...new Set(historique.map(r => r.date))];

    const datasets = types.map(t => {
        const dataForType = labels.map(l => {
            const entry = historique.find(h => h.date === l && h.type === t);
            return entry ? { y: entry.index, date: entry.date } : null;
        });

        return {
            label: t,
            data: dataForType,
            borderColor: colors[t],
            backgroundColor: colors[t],
            yAxisID: t === 'Eau' ? 'yEau' : 'yEnergie',
            tension: 0.1,
            spanGaps: true
        }
    });

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const pointActuel = context.raw;
                            const dataset = context.dataset.data;
                            const dataIndex = context.dataIndex;
                            let label = `${context.dataset.label}: ${pointActuel.y}`;

                            // Recherche du point précédent existant
                            let pointPrecedent = null;
                            for (let i = dataIndex - 1; i >= 0; i--) {
                                if (dataset[i] !== null) {
                                    pointPrecedent = dataset[i];
                                    break;
                                }
                            }

                            if (pointPrecedent) {
                                const consoTotale = pointActuel.y - pointPrecedent.y;
                                // Calcul de l'écart de jours
                                const date1 = new Date(pointPrecedent.date);
                                const date2 = new Date(pointActuel.date);
                                const diffTemps = Math.abs(date2 - date1);
                                const diffJours = Math.ceil(diffTemps / (1000 * 60 * 60 * 24)) || 1; // min 1 jour
                                
                                const consoJ = consoTotale / diffJours;
                                label += ` (Total: +${consoTotale.toFixed(1)} | Moy: ${consoJ.toFixed(2)}/j)`;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                yEnergie: { position: 'left', title: { display: true, text: 'kWh' } },
                yEau: { position: 'right', title: { display: true, text: 'm³' }, grid: { drawOnChartArea: false } }
            }
        }
    });
}
