<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>EcoSuivi - Mon Tableau de Bord</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>

    <style>
        /* Optimisations mobiles iPhone */
        input, select, button {
            font-size: 16px !important; /* Évite le zoom auto au clic sur iOS */
        }
        .canvas-container {
            position: relative;
            height: 60vh;
            width: 100%;
        }
        @media (min-width: 768px) {
            .canvas-container {
                height: 400px;
            }
        }
    </style>
</head>
<body class="bg-slate-50 min-h-screen font-sans text-slate-900">

    <div id="pagePrincipale" class="max-w-4xl mx-auto p-4 space-y-6">
        
        <header class="flex justify-between items-center py-2">
            <h1 class="text-2xl font-extrabold text-blue-700 tracking-tight">EcoSuivi</h1>
            <button onclick="resetData()" class="text-[10px] bg-red-50 text-red-500 px-3 py-1 rounded-full border border-red-100 uppercase font-bold tracking-widest">
                Réinitialiser
            </button>
        </header>

        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Nouveau Relevé</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="space-y-1">
                    <label class="text-xs font-semibold ml-1 text-slate-500">Date</label>
                    <input type="date" id="date" class="w-full bg-slate-50 border-none rounded-2xl p-3 focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-semibold ml-1 text-slate-500">Énergie</label>
                    <select id="type" class="w-full bg-slate-50 border-none rounded-2xl p-3 focus:ring-2 focus:ring-blue-500">
                        <option value="Electricité">Électricité (kWh)</option>
                        <option value="Eau">Eau (m³)</option>
                        <option value="Gaz">Gaz (kWh)</option>
                    </select>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-semibold ml-1 text-slate-500">Index compteur</label>
                    <input type="number" id="index" step="any" inputmode="decimal" placeholder="00000" 
                           class="w-full bg-slate-50 border-none rounded-2xl p-3 focus:ring-2 focus:ring-blue-500">
                </div>
                <button onclick="ajouterReleve()" class="bg-blue-600 text-white font-bold rounded-2xl py-3 px-6 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all md:self-end">
                    Enregistrer
                </button>
            </div>
            
            <div class="mt-6 pt-4 border-t border-slate-50">
                <button onclick="ouvrirEdition()" class="flex items-center text-blue-600 font-semibold text-sm">
                    <span class="mr-2 text-lg">📂</span> Voir l'historique et modifier
                </button>
            </div>
        </div>

        <div class="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Évolution des consommations</h2>
            <div class="canvas-container">
                <canvas id="consoChart"></canvas>
            </div>
            <p class="text-[10px] text-slate-400 mt-4 text-center italic">
                L'axe horizontal respecte la durée réelle entre vos relevés.
            </p>
        </div>
    </div>

    <div id="pageEdition" class="hidden fixed inset-0 bg-slate-50 z-50 overflow-y-auto p-4 pb-20">
        <div class="max-w-2xl mx-auto">
            <div class="flex justify-between items-center sticky top-0 bg-slate-50/90 backdrop-blur py-4 mb-6">
                <h1 class="text-xl font-bold text-slate-800">Historique complet</h1>
                <button onclick="fermerEdition()" class="bg-slate-900 text-white px-5 py-2 rounded-2xl font-bold text-sm shadow-xl">
                    Fermer
                </button>
            </div>
            
            <div id="listeModifiable" class="space-y-4">
                </div>
        </div>
    </div>

    <script src="app.js"></script>

</body>
</html>
