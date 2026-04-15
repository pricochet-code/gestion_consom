let myChart;
const ctx = document.getElementById('consoChart').getContext('2d');

// Initialisation au chargement
window.onload = () => {
    document.getElementById('date').valueAsDate = new Date();
    updateChart('jours');
};

function ajouterReleve() {
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const index = parseFloat(document.getElementById('index').value);

    if (!date || isNaN(index)) return alert("Remplissez tous les champs");

    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    
    // Calcul de la consommation par rapport au dernier relevé de ce type
    const precedents = historique.filter(r => r.type === type).sort((a,b) => new Date(b.date) - new Date(a.date));
    let conso = 0;
    if (precedents.length > 0) {
        conso = index - precedents[0].index;
    }

    historique.push({ date, type, index, conso });
    localStorage.setItem('consoHistorique', JSON.stringify(historique));
    
    alert("Enregistré !");
    updateChart('jours');
}

function updateChart(periode) {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    
    // Tri par date
    historique.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Ici on devrait normalement grouper les données par jour/semaine/mois
    // Pour cet exemple, on filtre simplement les 18 derniers relevés pour l'affichage
    const types = ['Electricité', 'Eau', 'Gaz'];
    const colors = { 'Electricité': '#facc15', 'Eau': '#3b82f6', 'Gaz': '#f97316' };
    const units = { 'Electricité': 'kWh', 'Eau': 'm³', 'Gaz': 'kWh' };

    const labels = [...new Set(historique.map(r => r.date))].slice(-10); // 10 dernières dates

    const datasets = types.map(t => {
        return {
            label: `${t} (${units[t]})`,
            data: labels.map(l => {
                const r = historique.find(h => h.date === l && h.type === t);
                return r ? r.conso : 0;
            }),
            borderColor: colors[t],
            backgroundColor: colors[t] + '22',
            yAxisID: t === 'Eau' ? 'yEau' : 'yEnergie',
            tension: 0.3
        }
    });

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yEnergie: { type: 'linear', position: 'left', title: { display: true, text: 'kWh' } },
                yEau: { type: 'linear', position: 'right', title: { display: true, text: 'm³' }, grid: { drawOnChartArea: false } }
            }
        }
    });
}
