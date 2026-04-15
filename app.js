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
    
    // On enregistre juste la valeur brute du compteur
    historique.push({ date, type, index });
    localStorage.setItem('consoHistorique', JSON.stringify(historique));
    
    alert("Relevé enregistré !");
    updateChart();
}

function updateChart() {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    
    // Tri chronologique
    historique.sort((a, b) => new Date(a.date) - new Date(b.date));

    const types = ['Electricité', 'Eau', 'Gaz'];
    const colors = { 'Electricité': '#facc15', 'Eau': '#3b82f6', 'Gaz': '#f97316' };
    const units = { 'Electricité': 'kWh', 'Eau': 'm³', 'Gaz': 'kWh' };

    const labels = [...new Set(historique.map(r => r.date))];

    const datasets = types.map(t => {
        // Filtrer les données pour ce type précis
        const dataForType = labels.map(l => {
            const entry = historique.find(h => h.date === l && h.type === t);
            return entry ? entry.index : null; // null si pas de relevé ce jour-là
        });

        return {
            label: `${t} (Compteur)`,
            data: dataForType,
            borderColor: colors[t],
            backgroundColor: colors[t],
            yAxisID: t === 'Eau' ? 'yEau' : 'yEnergie',
            tension: 0.1,
            spanGaps: true // Relie les points même s'il manque des jours
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
                        // C'est ici qu'on calcule la consommation pour l'étiquette
                        label: function(context) {
                            const indexActuel = context.parsed.y;
                            const dataIndex = context.dataIndex;
                            const dataset = context.dataset.data;
                            let label = `${context.dataset.label}: ${indexActuel}`;

                            // Trouver la valeur précédente pour calculer la différence
                            let indexPrecedent = null;
                            for (let i = dataIndex - 1; i >= 0; i--) {
                                if (dataset[i] !== null) {
                                    indexPrecedent = dataset[i];
                                    break;
                                }
                            }

                            if (indexPrecedent !== null) {
                                const conso = indexActuel - indexPrecedent;
                                label += ` (Conso: +${conso.toFixed(2)})`;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                yEnergie: { 
                    type: 'linear', 
                    position: 'left', 
                    title: { display: true, text: 'Compteur Élec/Gaz (kWh)' } 
                },
                yEau: { 
                    type: 'linear', 
                    position: 'right', 
                    title: { display: true, text: 'Compteur Eau (m³)' },
                    grid: { drawOnChartArea: false } 
                }
            }
        }
    });
}
