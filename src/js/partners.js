/**
 * Gestion des partenaires
 * Charge et affiche les partenaires dans les différentes sections
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Initialisation du module partenaires...");

  // Vérification des éléments DOM nécessaires
  const mainPartnersContainer = document.getElementById("main-partners");
  const carouselTrack = document.getElementById("carousel-track");

  if (!mainPartnersContainer) {
    console.error("Élément #main-partners introuvable dans le DOM");
  }

  if (!carouselTrack) {
    console.error("Élément #carousel-track introuvable dans le DOM");
  }

  // Initialisation
  loadPartners();

  /**
   * Charge les données des partenaires depuis le fichier JSON
   */
  async function loadPartners() {
    try {
      console.log(
        "Tentative de chargement des partenaires depuis data/partenaires.json"
      );

      // Vérifier que nous pouvons accéder au fichier JSON
      const jsonUrl = "./data/partenaires.json";
      console.log("URL du fichier JSON:", jsonUrl);

      const response = await fetch(jsonUrl);

      if (!response.ok) {
        throw new Error(
          `Impossible de charger les données des partenaires. Statut: ${response.status}`
        );
      }

      const partners = await response.json();
      console.log(`${partners.length} partenaires chargés avec succès`);

      // Correction des chemins d'images
      partners.forEach((partner) => {
        // Remplacer les placeholder
        if (partner.logo === "img/partners/partner-placeholder.png") {
          partner.logo = "";
        }
      });

      // Remplir les sections avec les partenaires
      renderMainPartners(partners);
      renderCarouselPartners(partners);

      // Initialiser le carrousel après le chargement des partenaires
      initCarousel();
    } catch (error) {
      console.error("Erreur lors du chargement des partenaires:", error);
      handleLoadError(error.message);
    }
  }

  /**
   * Gère les erreurs de chargement des partenaires
   * @param {string} errorMessage - Message d'erreur à afficher
   */
  function handleLoadError(errorMessage = "Erreur inconnue") {
    console.warn("Affichage des messages d'erreur dans l'interface");

    // Message d'erreur pour la section principale
    if (mainPartnersContainer) {
      mainPartnersContainer.innerHTML = `
        <div class="col-span-full p-6 text-center">
          <p class="text-gray-400">Impossible de charger les partenaires. Veuillez réessayer plus tard.</p>
          <p class="text-xs text-gray-500 mt-2">Détail: ${errorMessage}</p>
        </div>
      `;
    }

    // Message d'erreur pour le carrousel
    if (carouselTrack) {
      carouselTrack.innerHTML = `
        <div class="w-full p-6 text-center">
          <p class="text-gray-400">Impossible de charger les partenaires.</p>
        </div>
      `;
    }
  }

  /**
   * Affiche les partenaires principaux (majeurs)
   * @param {Array} partners - Liste des partenaires
   */
  function renderMainPartners(partners) {
    if (!mainPartnersContainer) return;

    console.log("Rendu des partenaires principaux");

    const majorPartners = partners.filter(
      (partner) => partner.partenaire_majeur
    );

    console.log(
      `Nombre de partenaires majeurs trouvés: ${majorPartners.length}`
    );

    // Si aucun partenaire majeur, afficher un message
    if (majorPartners.length === 0) {
      mainPartnersContainer.innerHTML = `
        <div class="col-span-full p-6 text-center">
          <p class="text-gray-400">Aucun partenaire principal n'est disponible pour le moment.</p>
        </div>
      `;
      return;
    }

    // Limiter à 8 partenaires principaux maximum
    const displayPartners = majorPartners.slice(0, 8);

    // Vider le conteneur
    mainPartnersContainer.innerHTML = "";

    // Ajouter chaque partenaire
    displayPartners.forEach((partner, index) => {
      console.log(
        `Ajout du partenaire principal #${index + 1}: ${partner.nom}`
      );
      mainPartnersContainer.appendChild(createPartnerElement(partner, true));
    });
  }

  /**
   * Affiche les partenaires secondaires dans le carrousel
   * @param {Array} partners - Liste des partenaires
   */
  function renderCarouselPartners(partners) {
    if (!carouselTrack) return;

    console.log("Rendu des partenaires secondaires dans le carrousel");

    const regularPartners = partners.filter(
      (partner) => !partner.partenaire_majeur
    );

    console.log(
      `Nombre de partenaires secondaires trouvés: ${regularPartners.length}`
    );

    // Si aucun partenaire régulier, afficher un message
    if (regularPartners.length === 0) {
      carouselTrack.innerHTML = `
        <div class="w-full p-6 text-center">
          <p class="text-gray-400">Aucun partenaire supplémentaire n'est disponible pour le moment.</p>
        </div>
      `;
      return;
    }

    // Vider le conteneur
    carouselTrack.innerHTML = "";

    // Ajouter chaque partenaire
    regularPartners.forEach((partner, index) => {
      console.log(
        `Ajout du partenaire secondaire #${index + 1}: ${partner.nom}`
      );
      carouselTrack.appendChild(createPartnerElement(partner, false));
    });
  }

  /**
   * Crée une image de placeholder avec les initiales du partenaire
   * @param {string} name - Nom du partenaire
   * @param {boolean} isMain - Si c'est un partenaire principal (pour la taille)
   * @returns {string} - URL de l'image SVG en base64
   */
  function createPlaceholderImage(name, isMain) {
    // Extraire les initiales (max 2 caractères)
    const initials = name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);

    // Paramètres SVG
    const width = isMain ? 200 : 150;
    const height = isMain ? 120 : 80;
    const fontSize = isMain ? 40 : 30;

    // Générer un SVG avec les initiales
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0" rx="8" ry="8"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" 
              fill="#666" text-anchor="middle" dominant-baseline="middle">${initials}</text>
        <text x="50%" y="80%" font-family="Arial, sans-serif" font-size="${
          fontSize / 3
        }" 
              fill="#999" text-anchor="middle">Partenaire</text>
      </svg>
    `;

    // Convertir en base64 et retourner comme URL data
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Crée un élément HTML pour un partenaire
   * @param {Object} partner - Données du partenaire
   * @param {boolean} isMain - Si le partenaire est affiché dans la section principale
   * @return {HTMLElement} Élément HTML à afficher
   */
  function createPartnerElement(partner, isMain) {
    try {
      const partnerElement = document.createElement("a");

      // Vérifier les données du partenaire
      if (!partner.nom) {
        console.warn("Partenaire sans nom détecté", partner);
        partner.nom = "Partenaire";
      }

      if (!partner.logo || partner.logo === "") {
        console.warn(`Partenaire sans logo: ${partner.nom}`, partner);
        partner.logo = createPlaceholderImage(partner.nom, isMain);
      }

      partnerElement.href = partner.site || "javascript:void(0)";
      partnerElement.target = partner.site ? "_blank" : "";
      partnerElement.rel = partner.site ? "noopener noreferrer" : "";

      // Style différent selon la section
      if (isMain) {
        partnerElement.className = "partner-item partner-item-main group";
      } else {
        partnerElement.className = "partner-item partner-item-carousel";
      }

      // Si pas de site web, désactiver le lien
      if (!partner.site || partner.site === "#") {
        partnerElement.classList.add("cursor-default");
        partnerElement.onclick = (e) => e.preventDefault();
      }

      // Générer un placeholder si l'image échoue à charger
      const handleImageError = `
        this.onerror=null; 
        this.src='${createPlaceholderImage(partner.nom, isMain)}';
        console.warn('Erreur de chargement du logo: ${partner.nom}');
      `;

      // Contenu HTML du partenaire
      if (isMain) {
        // Affichage pour partenaires principaux avec effet de survol
        partnerElement.setAttribute(
          "data-tooltip",
          partner.description || "Partenaire du HBC Aix-en-Savoie"
        );
        partnerElement.innerHTML = `
          <img 
            src="${partner.logo}" 
            alt="${partner.nom}" 
            class="partner-logo max-h-full max-w-full object-contain"
            onerror="${handleImageError}"
          >
          <div class="partner-item-hover-overlay">
            <p class="partner-item-name">${partner.nom}</p>
          </div>
        `;
      } else {
        // Affichage simplifié pour le carrousel
        partnerElement.title =
          partner.description || "Partenaire du HBC Aix-en-Savoie";
        partnerElement.innerHTML = `
          <img 
            src="${partner.logo}" 
            alt="${partner.nom}" 
            class="partner-logo max-h-20 max-w-[90%] object-contain hover:scale-105 transition-transform duration-300"
            onerror="${handleImageError}"
          >
        `;
      }

      return partnerElement;
    } catch (error) {
      console.error(
        "Erreur lors de la création de l'élément partenaire:",
        error,
        partner
      );

      // Élément de fallback en cas d'erreur
      const errorElement = document.createElement("div");
      errorElement.className =
        "bg-red-100 p-3 rounded-lg text-center text-xs text-red-800";
      errorElement.textContent = "Erreur d'affichage";
      return errorElement;
    }
  }

  /**
   * Initialise le carrousel des partenaires
   */
  function initCarousel() {
    console.log("Initialisation du carrousel des partenaires");

    const track = document.getElementById("carousel-track");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");

    if (!track) {
      console.error("Élément carousel-track introuvable");
      return;
    }

    if (!prevBtn || !nextBtn) {
      console.warn("Boutons de navigation du carrousel introuvables");
    }

    let position = 0;
    const slideWidth = 220; // Largeur d'un slide + marge (ajustée pour les nouvelles dimensions)

    // Calculer le nombre de slides visibles et la position maximale
    function updateCarouselMetrics() {
      const visibleSlides = Math.floor(
        track.parentElement.offsetWidth / slideWidth
      );
      const totalSlides = track.children.length;
      const maxPosition = Math.max(
        0,
        (totalSlides - visibleSlides) * slideWidth
      );

      console.log(
        `Métriques du carrousel: ${totalSlides} slides, ${visibleSlides} visibles, position max: ${maxPosition}px`
      );

      // Afficher les boutons seulement s'il y a suffisamment de slides
      if (prevBtn && nextBtn) {
        if (totalSlides > visibleSlides) {
          prevBtn.classList.remove("hidden");
          nextBtn.classList.remove("hidden");
        } else {
          prevBtn.classList.add("hidden");
          nextBtn.classList.add("hidden");
          // Réinitialiser la position si nécessaire
          position = 0;
          track.style.transform = `translateX(0)`;
        }
      }

      return { visibleSlides, totalSlides, maxPosition };
    }

    // Mise à jour initiale
    let { maxPosition } = updateCarouselMetrics();

    // Gestionnaire du bouton précédent
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        position = Math.max(0, position - slideWidth);
        updateCarouselPosition();
      });
    }

    // Gestionnaire du bouton suivant
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const { maxPosition: currentMaxPosition } = updateCarouselMetrics();
        position = Math.min(currentMaxPosition, position + slideWidth);
        updateCarouselPosition();
      });
    }

    // Mettre à jour la position du carrousel
    function updateCarouselPosition() {
      track.style.transform = `translateX(-${position}px)`;

      // Activer/désactiver les boutons en fonction de la position
      if (prevBtn && nextBtn) {
        prevBtn.disabled = position === 0;
        nextBtn.disabled = position >= maxPosition;

        prevBtn.classList.toggle("opacity-50", position === 0);
        nextBtn.classList.toggle("opacity-50", position >= maxPosition);
      }
    }

    // Initialiser la position
    updateCarouselPosition();

    // Mettre à jour le carrousel lors du redimensionnement de la fenêtre
    window.addEventListener("resize", () => {
      const metrics = updateCarouselMetrics();
      maxPosition = metrics.maxPosition;

      // Ajuster la position si nécessaire
      position = Math.min(position, maxPosition);
      updateCarouselPosition();
    });
  }
});
