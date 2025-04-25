/**
 * Gestion de la page des équipes
 * Chargement dynamique des équipes depuis le fichier JSON
 * Affichage des équipes dans le dashboard et dans la liste principale
 * Filtrage par catégorie
 */

document.addEventListener("DOMContentLoaded", () => {
  // Éléments du DOM
  const equipesDashboard = document.getElementById("equipes-dashboard");
  const equipesContainer = document.getElementById("equipes-container");
  const filtresBoutons = document.querySelectorAll("#categorie-filters button");

  // Variables globales
  let toutesLesEquipes = [];
  let categorieActive = "all";

  /**
   * Charge les données des équipes depuis le fichier JSON
   */
  const chargerEquipes = async () => {
    try {
      const response = await fetch("./data/equipes.json");

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      toutesLesEquipes = data;

      // Trier les équipes par ordre
      toutesLesEquipes.sort((a, b) => a.ordre - b.ordre);

      // Afficher les équipes
      afficherEquipesDashboard();
      afficherEquipesListe();

      // Initialiser les filtres
      initialiserFiltres();
    } catch (error) {
      console.error("Erreur lors du chargement des équipes:", error);
      afficherErreurChargement();
    }
  };

  /**
   * Affiche les équipes dans le dashboard pour un accès rapide
   */
  const afficherEquipesDashboard = () => {
    // Vider le conteneur
    equipesDashboard.innerHTML = "";

    // Afficher chaque équipe
    toutesLesEquipes.forEach((equipe) => {
      const equipeElement = document.createElement("a");
      equipeElement.href = `#equipe-${equipe.id}`;
      equipeElement.className =
        "bg-zinc-800/80 backdrop-blur-sm rounded-lg p-4 transition-all hover:bg-zinc-700/90 hover:scale-105 hover:shadow-lg";
      equipeElement.dataset.categorie = equipe.categorie;

      equipeElement.innerHTML = `
        <div class="h-24 bg-zinc-900 rounded mb-3 overflow-hidden">
          <img src="${equipe.photo}" alt="${equipe.nom}" class="w-full h-full object-cover object-center transition-transform hover:scale-110">
        </div>
        <h4 class="text-white font-bold mb-1">${equipe.nom}</h4>
        <p class="text-orange-500 text-sm">${equipe.categorie}</p>
      `;

      equipesDashboard.appendChild(equipeElement);
    });
  };

  /**
   * Affiche les équipes dans la liste principale
   */
  const afficherEquipesListe = () => {
    // Vider le conteneur
    equipesContainer.innerHTML = "";

    // Filtrer les équipes si nécessaire
    const equipesAffichees =
      categorieActive === "all"
        ? toutesLesEquipes
        : toutesLesEquipes.filter(
            (equipe) => equipe.categorie === categorieActive
          );

    // Afficher un message si aucune équipe ne correspond au filtre
    if (equipesAffichees.length === 0) {
      equipesContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <p class="text-white text-xl">Aucune équipe ne correspond à ce filtre.</p>
        </div>
      `;
      return;
    }

    // Afficher chaque équipe
    equipesAffichees.forEach((equipe) => {
      const equipeElement = document.createElement("div");
      equipeElement.className =
        "bg-zinc-800/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg border border-zinc-700/30 transform transition-all hover:-translate-y-2 hover:shadow-xl";
      equipeElement.id = `equipe-${equipe.id}`;
      equipeElement.dataset.aos = "fade-up";

      // Construire les horaires d'entraînement
      const entrainementsHTML = equipe.entrainements
        .map(
          (e) =>
            `<li class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
          ${e.jour} : ${e.horaire}
        </li>`
        )
        .join("");

      equipeElement.innerHTML = `
        <div class="h-64 bg-zinc-700 relative overflow-hidden">
          <img src="${equipe.photo}" alt="${equipe.nom}" class="w-full h-full object-cover object-center transition-transform hover:scale-110">
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div class="inline-block bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
              ${equipe.categorie}
            </div>
            <h3 class="text-white text-xl font-bold">${equipe.nom}</h3>
          </div>
        </div>
        <div class="p-6">
          <p class="text-gray-300 mb-4">${equipe.description}</p>
          
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="text-white font-semibold">Entraîneur</h4>
              <span class="text-orange-500">${equipe.entraineur}</span>
            </div>
            <div class="w-full h-px bg-zinc-700 mb-4"></div>
            
            <h4 class="text-white font-semibold mb-2">Entraînements</h4>
            <ul class="text-gray-300 text-sm space-y-1 mb-4">
              ${entrainementsHTML}
            </ul>
            
            <div class="flex items-center text-gray-300 text-sm mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              <span>Matchs : ${equipe.matches}</span>
            </div>
          </div>
          
          <a href="equipe-details.html?id=${equipe.id}" class="w-full inline-block text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
            Voir l'équipe
          </a>
        </div>
      `;

      equipesContainer.appendChild(equipeElement);
    });
  };

  /**
   * Initialise les filtres par catégorie
   */
  const initialiserFiltres = () => {
    filtresBoutons.forEach((bouton) => {
      bouton.addEventListener("click", () => {
        // Mettre à jour la catégorie active
        categorieActive = bouton.dataset.categorie;

        // Mettre à jour l'apparence des boutons
        filtresBoutons.forEach((b) => {
          b.classList.remove("bg-orange-500", "active");
          b.classList.add("bg-zinc-800");
        });

        bouton.classList.remove("bg-zinc-800");
        bouton.classList.add("bg-orange-500", "active");

        // Mettre à jour l'affichage des équipes
        afficherEquipesListe();

        // Mettre en surbrillance les équipes correspondantes dans le dashboard
        surbrillanceDashboard();
      });
    });
  };

  /**
   * Met en surbrillance les équipes du dashboard correspondant au filtre actif
   */
  const surbrillanceDashboard = () => {
    const toutesEquipesDashboard = equipesDashboard.querySelectorAll("a");

    toutesEquipesDashboard.forEach((equipe) => {
      if (
        categorieActive === "all" ||
        equipe.dataset.categorie === categorieActive
      ) {
        equipe.classList.remove("opacity-50");
      } else {
        equipe.classList.add("opacity-50");
      }
    });
  };

  /**
   * Affiche un message d'erreur en cas de problème de chargement
   */
  const afficherErreurChargement = () => {
    // Message d'erreur pour le dashboard
    equipesDashboard.innerHTML = `
      <div class="col-span-full bg-red-900/30 text-white p-6 rounded-lg">
        <h3 class="text-xl font-bold mb-2">Erreur de chargement</h3>
        <p>Impossible de charger les données des équipes. Veuillez réessayer ultérieurement.</p>
      </div>
    `;

    // Message d'erreur pour la liste principale
    equipesContainer.innerHTML = `
      <div class="col-span-full bg-red-900/30 text-white p-6 rounded-lg">
        <h3 class="text-xl font-bold mb-2">Erreur de chargement</h3>
        <p>Impossible de charger les données des équipes. Veuillez réessayer ultérieurement.</p>
      </div>
    `;
  };

  // Démarrer le chargement des équipes
  chargerEquipes();
});
