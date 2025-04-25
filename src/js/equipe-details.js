/**
 * Gestion de la page détaillée d'une équipe
 * Récupère les détails d'une équipe à partir de son ID dans l'URL
 * Affiche les informations complètes de l'équipe sélectionnée
 */

document.addEventListener("DOMContentLoaded", () => {
  // Éléments du DOM
  const equipeHeroImage = document.getElementById("equipe-hero-image");
  const equipeHeroContent = document.getElementById("equipe-hero-content");
  const equipeDetails = document.getElementById("equipe-details");

  // Récupérer l'ID de l'équipe depuis l'URL
  const params = new URLSearchParams(window.location.search);
  const equipeId = params.get("id");

  if (!equipeId) {
    // Si aucun ID n'est fourni, rediriger vers la page des équipes
    afficherErreur("Aucune équipe spécifiée");
    return;
  }

  // Charger les données de l'équipe
  chargerEquipe(equipeId);

  /**
   * Charge les données d'une équipe spécifique depuis le fichier JSON
   * @param {string} id - L'identifiant de l'équipe à charger
   */
  async function chargerEquipe(id) {
    try {
      const response = await fetch("./data/equipes.json");

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const equipes = await response.json();
      const equipe = equipes.find((e) => e.id == id);

      if (!equipe) {
        throw new Error(`Équipe avec l'ID ${id} non trouvée`);
      }

      // Mettre à jour le titre de la page
      document.title = `${equipe.nom} | HBC Aix-en-Savoie`;

      // Afficher les détails de l'équipe
      afficherEquipe(equipe);
    } catch (error) {
      console.error("Erreur lors du chargement de l'équipe:", error);
      afficherErreur(error.message);
    }
  }

  /**
   * Affiche les détails d'une équipe sur la page
   * @param {Object} equipe - L'objet contenant les données de l'équipe
   */
  function afficherEquipe(equipe) {
    // Mettre à jour l'image de fond
    equipeHeroImage.innerHTML = `
      <img 
        src="${equipe.photo}" 
        alt="${equipe.nom}" 
        class="w-full h-full object-cover object-center filter brightness-75"
        data-aos="fade"
      >
    `;

    // Mettre à jour le contenu du hero
    equipeHeroContent.innerHTML = `
      <div class="mb-2 inline-block bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded" data-aos="fade-right" data-aos-delay="100">
        ${equipe.categorie}
      </div>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-mont" data-aos="fade-up">
        ${equipe.nom}
      </h1>
      <p class="text-xl md:text-2xl text-white/90 font-mont max-w-3xl" data-aos="fade-up" data-aos-delay="200">
        Équipe ${equipe.categorie} du HBC Aix-en-Savoie
      </p>
    `;

    // Construire les horaires d'entraînement
    const entrainementsHTML = equipe.entrainements
      .map(
        (e) =>
          `<li class="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-orange-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            ${e.jour} : ${e.horaire}
          </li>`
      )
      .join("");

    // Mettre à jour les détails de l'équipe
    equipeDetails.innerHTML = `
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Informations principales -->
        <div class="md:w-2/3" data-aos="fade-right">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-6 relative inline-block">
            Présentation
            <span class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent"></span>
          </h2>
          
          <div class="bg-zinc-800/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-zinc-700/30">
            <p class="text-gray-300 text-lg mb-6 leading-relaxed">
              ${equipe.description}
            </p>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Entraîneur -->
              <div class="bg-zinc-800/80 rounded-lg p-4 border border-zinc-700/30">
                <h3 class="text-white font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Entraîneur
                </h3>
                <p class="text-orange-500 font-medium">${equipe.entraineur}</p>
              </div>
              
              <!-- Matchs -->
              <div class="bg-zinc-800/80 rounded-lg p-4 border border-zinc-700/30">
                <h3 class="text-white font-semibold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  Matchs
                </h3>
                <p class="text-gray-300">${equipe.matches}</p>
              </div>
            </div>
          </div>
          
          <!-- Entrainements -->
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-6 relative inline-block">
            Entraînements
            <span class="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent"></span>
          </h2>
          
          <div class="bg-zinc-800/60 backdrop-blur-sm rounded-xl p-6 border border-zinc-700/30">
            <ul class="text-gray-300 space-y-1">
              ${entrainementsHTML}
            </ul>
            
            <div class="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p class="text-white flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-orange-500 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                Les entraînements ont lieu au Gymnase des Prés Riants, 73100 Aix-les-Bains. Veuillez vous présenter 15 minutes avant le début de la séance.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="md:w-1/3" data-aos="fade-left">
          <!-- Carte d'information rapide -->
          <div class="bg-zinc-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-zinc-700/30 mb-6 sticky top-24">
            <div class="h-48 overflow-hidden">
              <img src="${equipe.photo}" alt="${equipe.nom}" class="w-full h-full object-cover object-center">
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-white mb-2">${equipe.nom}</h3>
              <p class="text-orange-500 font-medium mb-4">${equipe.categorie}</p>
              
              <div class="w-full h-px bg-zinc-700 mb-4"></div>
              
              <ul class="space-y-3 mb-6">
                <li class="flex items-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-orange-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  Entraîneur: ${equipe.entraineur}
                </li>
                <li class="flex items-center text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-orange-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                  </svg>
                  Matchs: ${equipe.matches}
                </li>
              </ul>
              
              <a href="form.html" class="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Rejoindre cette équipe
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Affiche un message d'erreur sur la page
   * @param {string} message - Le message d'erreur à afficher
   */
  function afficherErreur(message) {
    // Mettre à jour le contenu du hero
    equipeHeroContent.innerHTML = `
      <div class="text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4 font-mont">
          Équipe non trouvée
        </h1>
        <p class="text-xl text-white/90 font-mont mb-8 max-w-2xl mx-auto">
          ${message}
        </p>
        <a href="equipes.html" class="inline-block px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
          Voir toutes les équipes
        </a>
      </div>
    `;

    // Simplifier le reste de la page
    equipeDetails.innerHTML = "";
    document.getElementById(
      "prochain-match"
    ).parentElement.parentElement.style.display = "none";
    document.getElementById(
      "galerie-photos"
    ).parentElement.parentElement.style.display = "none";
  }
});
