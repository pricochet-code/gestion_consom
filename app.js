let myChart = null;
let filtreActuel = 'Electricité';

window.onload = () => {
    document.getElementById('date').valueAsDate = new Date();
    updateChart();
};

// --- NAVIGATION ---
function ouvrirEdition() {
    document.getElementById('pagePrincipale').classList.add('hidden');
    document.getElementById('pageEdition').classList.remove('hidden');
    genererInterfaceEdition(filtreActuel);
}

function fermerEdition() {
    document.getElementById('pageEdition').classList.add('hidden');
    document.getElementById('pagePrincipale').classList.remove('hidden');
    updateChart();
}

// --- DONNÉES ---
function ajouterReleve() {
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    const index = parseFloat(document.getElementById('index').value);

    if (!date || isNaN(index)) return alert("Veuillez remplir tous les champs.");

    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    historique.push({ id: Date.now(), date, type, index });
    localStorage.setItem('consoHistorique', JSON.stringify(historique));
    
    document.getElementById('index').value = '';
    updateChart();
    alert("Relevé enregistré !");
}

function resetData() {
    if (confirm("Effacer définitivement TOUTES les données ?")) {
        localStorage.removeItem('consoHistorique');
        updateChart();
        location.reload();
    }
}

// --- HISTORIQUE FILTRÉ ---
function genererInterfaceEdition(typeFiltre) {
    filtreActuel = typeFiltre;
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    
    // Style des onglets
    const config = {
        'Electricité': { btn: 'btn-filter-Elec', css: 'bg-yellow-100 text-yellow-700' },
        'Eau': { btn: 'btn-filter-Eau', css: 'bg-blue-100 text-blue-700' },
        'Gaz': { btn: 'btn-filter-Gaz', css: 'bg-orange-100 text-orange-700' }
    };

    Object.keys(config).forEach(k => {
        const el = document.getElementById(config[k].btn);
        el.className = "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase transition-all";
        if(k === typeFiltre) el.classList.add(...config[k].css.split(' '));
        else el.classList.add('text-slate-400');
    });

    const liste = historique.filter(r => r.type === typeFiltre).sort((a,b) => new Date(b.date) - new Date(a.date));
    const conteneur = document.getElementById('listeModifiable');
    conteneur.innerHTML = liste.length ? '' : `<p class="text-center py-10 text-slate-400 italic">Aucun relevé pour ${typeFiltre}</p>`;

    liste.forEach(r => {
        const div = document.createElement('div');
        div.className = "bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-3";
        div.innerHTML = `
            <div class="grid grid-cols-2 gap-3">
                <input type="date" id="ed-${r.id}" value="${r.date}" class="bg-slate-50 rounded-xl p-2 text-sm border-none">
                <input type="number" id="ei-${r.id}" value="${r.index}" class="bg-slate-50 rounded-xl p-2 text-sm border-none">
            </div>
            <div class="flex gap-2">
                <button onclick="validerModif(${r.id})" class="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-[10px] font-bold uppercase">Enregistrer</button>
                <button onclick="supprimerReleve(${r.id})" class="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[10px] font-bold uppercase">Supprimer</button>
            </div>
        `;
        conteneur.appendChild(div);
    });
}

function validerModif(id) {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    const idx = historique.findIndex(r => r.id === id);
    if (idx !== -1) {
        historique[idx].date = document.getElementById(`ed-${id}`).value;
        historique[idx].index = parseFloat(document.getElementById(`ei-${id}`).value);
        localStorage.setItem('consoHistorique', JSON.stringify(historique));
        genererInterfaceEdition(filtreActuel);
    }
}

function supprimerReleve(id) {
    if (confirm("Supprimer ?")) {
        let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
        localStorage.setItem('consoHistorique', JSON.stringify(historique.filter(r => r.id !== id)));
        genererInterfaceEdition(filtreActuel);
    }
}

// --- CSV ---
function exporterCSV() {
    let h = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    let csv = "date,type,index\n" + h.map(r => `${r.date},${r.type},${r.index}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eco_suivi_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
}

function importerCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const lignes = event.target.result.split("\n").slice(1);
        let importes = lignes.map((l, i) => {
            const [date, type, index] = l.split(",");
            return (date && type && !isNaN(index)) ? { id: Date.now() + i, date: date.trim(), type: type.trim(), index: parseFloat(index) } : null;
        }).filter(x => x);
        if(confirm(`Importer ${importes.length} relevés ?`)) {
            let actuel = JSON.parse(localStorage.getItem('consoHistorique')) || [];
            localStorage.setItem('consoHistorique', JSON.stringify([...actuel, ...importes]));
            updateChart();
        }
    };
    reader.readAsText(file);
}

// --- GRAPHIQUE ---
function updateChart() {
    let historique = JSON.parse(localStorage.getItem('consoHistorique')) || [];
    if (!historique.length) { if(myChart) myChart.destroy(); return; }
    historique.sort((a, b) => new Date(a.date) - new Date(b.date));

    const datasets = ['Electricité', 'Eau', 'Gaz'].map(t => {
        const colors = { 'Electricité': '#eab308', 'Eau': '#2563eb', 'Gaz': '#f97316' };
        const axis = { 'Electricité': 'yE', 'Eau': 'yEau', 'Gaz': 'yG' };
        return {
            label: t,
            data: historique.filter(r => r.type === t).map(r => ({ x: new Date(r.date), y: r.index })),
            borderColor: colors[t], backgroundColor: colors[t],
            yAxisID: axis[t], tension: 0.2, spanGaps: true, pointRadius: 4
        };
    });

    if (myChart) myChart.destroy();
    myChart = new Chart(document.getElementById('consoChart').getContext('2d'), {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'time', time: { unit: 'day', displayFormats: { day: 'dd/MM' } } },
                yE: { position: 'left', beginAtZero: false, grace: '5%', title: { display: true, text: 'Élec (kWh)' } },
                yEau: { position: 'right', beginAtZero: false, grace: '5%', title: { display: true, text: 'Eau (m³)' }, grid: { drawOnChartArea: false } },
                yG: { position: 'right', beginAtZero: false, grace: '5%', title: { display: true, text: 'Gaz (kWh)' }, grid: { drawOnChartArea: false } }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            let l = `${ctx.dataset.label}: ${ctx.raw.y}`;
                            if(ctx.dataIndex > 0) {
                                const prev = ctx.dataset.data[ctx.dataIndex-1];
                                const diff = ctx.raw.y - prev.y;
                                const jours = Math.ceil(Math.abs(ctx.raw.x - prev.x) / (86400000)) || 1;
                                l += ` (+${diff.toFixed(1)} | ${(diff/jours).toFixed(2)}/j)`;
                            }
                            return l;
                        }
                    }
                }
            }
        }
    });
}
