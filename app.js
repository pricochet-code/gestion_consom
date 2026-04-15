function enregistrerDonnee() {
    const type = document.getElementById('type').value;
    const index = parseFloat(document.getElementById('index').value);
    const date = new Date().toLocaleDateString('fr-FR');

    if (isNaN(index)) return alert("Veuillez entrer un chiffre valide");

    // Récupérer l'historique
    let historique = JSON.parse(localStorage.getItem('consoData')) || [];

    // Trouver le dernier relevé pour ce type pour calculer la conso
    const recordsMemeType = historique.filter(r => r.type === type);
    let consommation = 0;
    
    if (recordsMemeType.length > 0) {
        const dernierReleve = recordsMemeType[recordsMemeType.length - 1];
        consommation = index - dernierReleve.index;
    }

    // Ajouter le nouveau relevé
    const nouveauReleve = { type, index, consommation, date };
    historique.push(nouveauReleve);
    localStorage.setItem('consoData', JSON.stringify(historique));

    afficherDonnees();
}

function afficherDonnees() {
    const historique = JSON.parse(localStorage.getItem('consoData')) || [];
    const conteneur = document.getElementById('listeConso');
    conteneur.innerHTML = '';

    // On affiche les 5 derniers relevés
    historique.reverse().slice(0, 5).forEach(r => {
        const div = document.createElement('div');
        div.className = "p-3 bg-gray-50 rounded border-l-4 " + (r.type === 'Eau' ? 'border-blue-500' : 'border-yellow-500');
        div.innerHTML = `
            <div class="flex justify-between">
                <span class="font-bold">${r.type}</span>
                <span class="text-gray-500 text-sm">${r.date}</span>
            </div>
            <div class="text-sm">Conso : <span class="font-semibold text-green-600">+${r.consommation.toFixed(2)}</span></div>
        `;
        conteneur.appendChild(div);
    });
}

// Charger les données au démarrage
window.onload = afficherDonnees;