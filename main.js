import { Article } from "./src/class.js";
import { createArticle } from "./src/class.js";

let articlesArray = [];

// Chargement initial des articles
async function initArticles() {
  try {
    const response = await fetch("./data/actualites.json");
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    articlesArray = await response.json();

    // Si nous sommes sur la page d'accueil avec les slides
    if (
      document.getElementById("indicator-1") ||
      document.getElementById("1")
    ) {
      console.log("Initialisation des slides avec les articles chargés");

      // Trier pour avoir les articles vedettes en premier
      articlesArray.sort((a, b) => {
        if (a.vedette && !b.vedette) return -1;
        if (!a.vedette && b.vedette) return 1;
        return 0;
      });

      // Mise à jour des contenus des slides
      updateSlideContent();

      // Démarrer le slider
      changehomepage(1);
      animateProgressBar(1);
    }

    return articlesArray;
  } catch (error) {
    console.error("Erreur lors du chargement initial des articles:", error);
    return [];
  }
}

function updateSlideContent() {
  // Mise à jour des boutons avec le contenu des articles
  console.log(
    "Mise à jour du contenu des slides avec les articles :",
    articlesArray
  );

  for (let i = 1; i <= 3; i++) {
    const slideBtn = document.querySelector(`.button_nav[data-slide="${i}"]`);
    if (slideBtn && articlesArray.length >= i) {
      const article = articlesArray[i - 1];
      console.log(`Mise à jour du slide ${i} avec l'article :`, article);

      // Mettre à jour le contenu du bouton
      const categorie = slideBtn.querySelector("span");
      const titre = slideBtn.querySelector("p");

      if (categorie) {
        categorie.textContent = article.categorie;
        console.log(`Slide ${i} - Catégorie mise à jour: ${article.categorie}`);
      } else {
        console.warn(`Slide ${i} - Élément span pour la catégorie non trouvé`);
      }

      if (titre) {
        titre.textContent = article.titre;
        console.log(`Slide ${i} - Titre mis à jour: ${article.titre}`);
      } else {
        console.warn(`Slide ${i} - Élément p pour le titre non trouvé`);
      }

      // Mise à jour de l'attribut aria-label
      slideBtn.setAttribute("aria-label", `Article ${i}: ${article.titre}`);
    } else {
      console.warn(
        `Slide ${i} - Bouton non trouvé ou pas assez d'articles (${articlesArray.length} articles disponibles)`
      );
    }
  }
}

function changehomepage(index) {
  console.log(`Changement de slide vers l'index: ${index}`);

  // Sélection des éléments
  let pres_h4 = document.querySelector("#presentation h4");
  let pres_p = document.querySelector("#presentation p");
  let pres_img = document.querySelector("#home_img");
  let article_link = document.querySelector("#presentation a");

  // Mettre à jour les indicateurs de boutons actifs
  const buttons = document.querySelectorAll(".button_nav");
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-slide") == index) {
      btn.classList.add("active");
    }
  });

  // Vérification que les éléments existent et que nous avons des articles
  if (pres_h4 && pres_p && pres_img && articlesArray.length >= index) {
    const article = articlesArray[index - 1];
    console.log(`Mise à jour du contenu avec l'article:`, article);

    // Transition de fondu pour l'image
    pres_img.style.opacity = "0";

    // Modification du contenu avec les propriétés de l'article
    pres_h4.innerText = article.categorie;
    pres_p.innerText = article.titre;

    // Mise à jour du lien
    if (article_link && article.id) {
      article_link.href = `article.html?id=${article.id}`;
    }

    // Précharger la nouvelle image
    const newImage = new Image();
    newImage.onload = function () {
      pres_img.src = article.image;

      // Transition pour faire apparaître l'image
      setTimeout(() => {
        pres_img.style.opacity = "1";
      }, 100);
    };
    newImage.src = article.image;

    // Fallback au cas où l'image ne se charge pas
    setTimeout(() => {
      if (pres_img.style.opacity === "0") {
        pres_img.src = article.image;
        pres_img.style.opacity = "1";
      }
    }, 1000);
  } else {
    console.warn(
      "Elements manquants ou articles non chargés pour le slide",
      index
    );
  }
}

function animateProgressBar(tmp) {
  let i = 0;
  const interval = setInterval(() => {
    if (i >= 100) {
      clearInterval(interval);

      // Mise à jour de l'indicateur visuel
      const indicator = document.getElementById(`indicator-${tmp}`);
      if (indicator) {
        // Réinitialiser l'animation
        indicator.classList.remove("scale-110");

        // Passer au slide suivant
        if (tmp < 3) {
          changehomepage(tmp + 1);
          setTimeout(() => animateProgressBar(tmp + 1), 100);
        } else {
          changehomepage(1);
          setTimeout(() => animateProgressBar(1), 100);
        }
      } else {
        // Fallback au cas où les nouveaux indicateurs n'existent pas
        const progressElement = document.getElementById(`${tmp}`);
        if (progressElement) {
          progressElement.style.width = `0%`;
          if (tmp < 3) {
            changehomepage(tmp + 1);
            setTimeout(() => animateProgressBar(tmp + 1), 100);
          } else {
            changehomepage(1);
            setTimeout(() => animateProgressBar(1), 100);
          }
        }
      }
    } else {
      // Animation de la progression pour les nouveaux indicateurs
      const indicator = document.getElementById(`indicator-${tmp}`);
      if (indicator) {
        // Utilise une transformation pour indiquer la progression
        if (i === 0) indicator.classList.add("scale-110");
      } else {
        // Fallback pour l'ancien système de barre de progression
        const progressElement = document.getElementById(`${tmp}`);
        if (progressElement) {
          progressElement.style.width = `${i}%`;
        }
      }
      i += 0.1;
    }
  }, 10);
}

// Gestion des clics sur les boutons du slider
document.addEventListener("DOMContentLoaded", function () {
  // Lancer le chargement des articles
  initArticles();

  const sliderButtons = document.querySelectorAll(".button_nav");

  sliderButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const slideIndex = parseInt(this.getAttribute("data-slide"));
      console.log(`Clic sur le bouton slide ${slideIndex}`);

      // Arrêter toutes les animations en cours
      document.querySelectorAll(".button_nav").forEach((btn) => {
        btn.classList.remove("active");
        const indicatorId = `indicator-${btn.getAttribute("data-slide")}`;
        const indicator = document.getElementById(indicatorId);
        if (indicator) indicator.classList.remove("scale-110");
      });

      // Activer le bouton cliqué
      this.classList.add("active");

      // Changer le contenu du slider
      changehomepage(slideIndex);

      // Redémarrer l'animation à partir de ce slide
      setTimeout(() => animateProgressBar(slideIndex), 100);
    });
  });
});

// Démarre l'animation seulement si on est sur la page qui contient ces éléments
// Ce code est désormais géré dans la fonction initArticles
// if (document.getElementById("1") || document.getElementById("indicator-1")) {
//   changehomepage(1); // S'assurer que le premier slide est actif
//   animateProgressBar(1);
// }

let button_mobile = document.querySelector("#mobile_button");
if (button_mobile) {
  let img_mobile = document.querySelector("#mobile_button img");

  button_mobile.addEventListener("click", () => {
    let header = document.querySelector("header");
    let main = document.querySelector("main");
    if (img_mobile.src.includes("menu")) {
      img_mobile.src = "./img/home/close.png";
    } else {
      img_mobile.src = "./img/home/boutton_menu.svg";
    }
    console.log("click");
    let menu = document.createElement("div");
    header.classList.toggle("bg-transparent");
    header.classList.toggle("h-screen");
    header.classList.toggle("bg-orange-400");
    main.classList.toggle("hidden");
    menu.id = "menu";
    menu.className = "flex flex-col items-center justify-left pl-8";
    let nav_mobile = document.querySelector("#nav_mobile");
    nav_mobile.classList.toggle("hidden");
  });
}

// Chargement et affichage des actualités depuis JSON
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM chargé, vérification de la section actualités");
  // Vérifier si on est sur la page d'accueil (contient la section actualités)
  const sectionActualites = document.getElementById("actualites");
  if (sectionActualites) {
    console.log("Section actualités trouvée, chargement des données");
    chargerActualites();
  } else {
    console.log("Section actualités non trouvée sur cette page");
  }
});

// Fonction pour récupérer les actualités depuis le fichier JSON
async function chargerActualites() {
  try {
    console.log("Début du chargement des actualités");
    const response = await fetch("./data/actualites.json");
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const actualites = await response.json();
    console.log(`${actualites.length} actualités chargées avec succès`);

    // Trier les actualités par date (plus récente d'abord)
    actualites.sort((a, b) => {
      const dateA = new Date(a.date.split(" ").reverse().join("-"));
      const dateB = new Date(b.date.split(" ").reverse().join("-"));
      return dateB - dateA;
    });

    // Articles en vedette dans le carousel
    const articlesVedette = actualites.filter((a) => a.vedette);
    console.log(`${articlesVedette.length} articles en vedette trouvés`);
    if (articlesVedette.length > 0) {
      afficherActualiteEnVedette(articlesVedette);
    }

    // Articles récents
    const articlesRecents = actualites.slice(0, 4);
    console.log("Affichage des articles récents");
    afficherActualitesRecentes(articlesRecents);

    // Infos brèves
    const infosBreves = actualites.filter((a) => a.tag === "BREF").slice(0, 3);
    console.log(`${infosBreves.length} infos brèves trouvées`);
    afficherInfosBreves(infosBreves);

    // Initialiser les filtres de catégories
    console.log("Initialisation des filtres de catégories");
    initFiltresCategories(actualites);
  } catch (error) {
    console.error("Erreur lors du chargement des actualités:", error);
    const sectionActualites = document.getElementById("actualites");
    if (sectionActualites) {
      sectionActualites.innerHTML += `
        <div class="text-center py-8">
          <p class="text-red-500">Impossible de charger les actualités. Veuillez réessayer ultérieurement.</p>
        </div>
      `;
    }
  }
}

/**
 * Affiche les actualités en vedette dans le carousel
 */
function afficherActualiteEnVedette(articlesVedette) {
  const carouselContainer = document.querySelector(".carousel-container");
  if (!carouselContainer) return;

  carouselContainer.innerHTML = "";

  articlesVedette.forEach((article, index) => {
    const slide = document.createElement("div");
    slide.className = `carousel-slide ${index === 0 ? "active" : "hidden"}`;

    slide.innerHTML = `
      <div class="relative h-full">
        <img src="${article.image}" alt="${
      article.titre
    }" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
          <div class="p-6 md:p-8 w-full">
            <span class="bg-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold mb-4 inline-block">${
              article.tag || article.categorie
            }</span>
            <h3 class="text-2xl md:text-3xl font-bold text-white mb-2">${
              article.titre
            }</h3>
            <p class="text-gray-200 mb-4 line-clamp-2">${article.resume}</p>
            <a href="article.html?id=${
              article.id
            }" class="px-4 py-2 bg-white text-black rounded hover:bg-orange-500 transition-colors inline-flex items-center gap-2">
              Lire l'article
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    `;

    carouselContainer.appendChild(slide);
  });

  // Initialiser les boutons du carousel
  const prevButton = document.querySelector(".carousel-prev");
  const nextButton = document.querySelector(".carousel-next");

  if (prevButton && nextButton) {
    prevButton.addEventListener("click", () => {
      navigateCarousel(-1);
    });

    nextButton.addEventListener("click", () => {
      navigateCarousel(1);
    });
  }

  // Navigation automatique du carousel toutes les 5 secondes
  setInterval(() => {
    navigateCarousel(1);
  }, 5000);
}

/**
 * Navigue dans le carousel
 */
function navigateCarousel(direction) {
  const slides = document.querySelectorAll(".carousel-slide");
  if (!slides.length) return;

  const activeSlide = document.querySelector(".carousel-slide.active");
  if (!activeSlide) {
    slides[0].classList.add("active");
    slides[0].classList.remove("hidden");
    return;
  }

  let activeIndex = Array.from(slides).indexOf(activeSlide);

  activeSlide.classList.remove("active");
  activeSlide.classList.add("hidden");

  activeIndex = (activeIndex + direction + slides.length) % slides.length;
  slides[activeIndex].classList.add("active");
  slides[activeIndex].classList.remove("hidden");
}

/**
 * Affiche les actualités récentes
 */
function afficherActualitesRecentes(articlesRecents) {
  const container = document.querySelector(".recent-news-container");
  if (!container) return;

  container.innerHTML = "";

  articlesRecents.forEach((article) => {
    const articleElement = document.createElement("div");
    articleElement.className =
      "bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105";
    articleElement.setAttribute("data-aos", "fade-up");

    articleElement.innerHTML = `
      <div class="relative">
        <img src="${article.image}" alt="${
      article.titre
    }" class="w-full h-48 object-cover" />
        <span class="absolute top-4 left-4 bg-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">${
          article.tag || article.categorie
        }</span>
      </div>
      <div class="p-4">
        <p class="text-gray-600 text-sm mb-2">${article.date}</p>
        <h3 class="text-xl font-bold mb-3">${article.titre}</h3>
        <p class="text-gray-600 mb-4 line-clamp-3">${article.resume}</p>
        <a href="article.html?id=${
          article.id
        }" class="text-orange-600 font-semibold hover:text-orange-800 flex items-center gap-1">
          Lire la suite
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>
    `;

    container.appendChild(articleElement);
  });
}

/**
 * Affiche les infos brèves
 */
function afficherInfosBreves(infosBreves) {
  const container = document.querySelector(".brief-news-container");
  if (!container) return;

  container.innerHTML = "";

  infosBreves.forEach((info) => {
    const infoElement = document.createElement("div");
    infoElement.className =
      "flex gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow";

    infoElement.innerHTML = `
      <div class="flex-shrink-0">
        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        </div>
      </div>
      <div>
        <p class="text-gray-600 text-sm">${info.date}</p>
        <h4 class="font-bold mb-1">${info.titre}</h4>
        <a href="article.html?id=${info.id}" class="text-orange-600 text-sm hover:underline">En savoir plus</a>
      </div>
    `;

    container.appendChild(infoElement);
  });
}

/**
 * Initialise les filtres de catégories
 */
function initFiltresCategories(actualites) {
  const filterButtons = document.querySelectorAll(".category-filter");
  if (!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Mettre à jour l'état actif des boutons
      filterButtons.forEach((btn) =>
        btn.classList.remove("active", "border-orange-500", "text-orange-500")
      );
      this.classList.add("active", "border-orange-500", "text-orange-500");

      const category = this.getAttribute("data-category");
      const container = document.querySelector(".filtered-news-container");
      if (!container) return;

      container.innerHTML = "";

      let filteredActualites;
      if (category === "all") {
        filteredActualites = actualites.slice(0, 6);
      } else {
        filteredActualites = actualites
          .filter((actu) => actu.categorie === category)
          .slice(0, 6);
      }

      if (filteredActualites.length === 0) {
        container.innerHTML = `
          <div class="col-span-full text-center py-8">
            <p class="text-gray-500">Aucune actualité dans cette catégorie</p>
          </div>
        `;
        return;
      }

      filteredActualites.forEach((article) => {
        const articleElement = document.createElement("div");
        articleElement.className =
          "bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105";

        articleElement.innerHTML = `
          <div class="relative">
            <img src="${article.image}" alt="${
          article.titre
        }" class="w-full h-48 object-cover" />
            <span class="absolute top-4 left-4 bg-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">${
              article.tag || article.categorie
            }</span>
          </div>
          <div class="p-4">
            <p class="text-gray-600 text-sm mb-2">${article.date}</p>
            <h3 class="text-xl font-bold mb-3">${article.titre}</h3>
            <p class="text-gray-600 mb-4 line-clamp-3">${article.resume}</p>
            <a href="article.html?id=${
              article.id
            }" class="text-orange-600 font-semibold hover:text-orange-800 flex items-center gap-1">
              Lire la suite
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </a>
          </div>
        `;

        container.appendChild(articleElement);
      });
    });
  });

  // Activer le premier filtre par défaut
  const defaultFilter = document.querySelector(".category-filter");
  if (defaultFilter) {
    defaultFilter.click();
  }
}

// Chargement et affichage des actualités de la page actus.html
document.addEventListener("DOMContentLoaded", function () {
  // Vérifier si on est sur la page d'actualités
  const isActusPage = window.location.pathname.includes("actus.html");
  if (isActusPage) {
    console.log("Page d'actualités détectée, chargement des articles...");
    loadActusPage();
  }
});

/**
 * Charge les fonctionnalités pour la page des actualités
 */
async function loadActusPage() {
  try {
    // Chargement des actualités
    const response = await fetch("./data/actualites.json");
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    let articles = await response.json();
    console.log(`${articles.length} articles chargés pour la page actualités`);

    // Tri par date (plus récents en premier)
    articles.sort((a, b) => {
      const dateA = new Date(a.date.split(" ").reverse().join("-"));
      const dateB = new Date(b.date.split(" ").reverse().join("-"));
      return dateB - dateA;
    });

    // Mettre à jour le compteur d'articles
    const countElement = document.getElementById("articles-count");
    if (countElement) {
      countElement.textContent = articles.length;
    }

    // Chargement de l'article à la une
    loadFeaturedArticle(articles.find((a) => a.vedette) || articles[0]);

    // Initialisation des filtres
    setupFilters(articles);

    // Initialisation de la pagination
    const ITEMS_PER_PAGE = 9;
    let currentPage = 1;
    let filteredArticles = [...articles];
    let viewMode = "grid"; // Mode d'affichage par défaut

    // Gestion du tri
    const sortSelect = document.getElementById("sort-articles");
    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        sortArticles(this.value);
        renderArticles();
      });
    }

    // Gestion du changement de mode d'affichage
    const viewModeButtons = document.querySelectorAll(".view-mode-btn");
    viewModeButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        viewModeButtons.forEach((b) =>
          b.classList.remove("active", "text-orange-500", "bg-zinc-700")
        );
        this.classList.add("active", "text-orange-500", "bg-zinc-700");
        viewMode = this.getAttribute("data-mode");
        renderArticles();
      });
    });

    // Fonction pour trier les articles
    function sortArticles(sortType) {
      switch (sortType) {
        case "newest":
          filteredArticles.sort((a, b) => {
            const dateA = new Date(a.date.split(" ").reverse().join("-"));
            const dateB = new Date(b.date.split(" ").reverse().join("-"));
            return dateB - dateA;
          });
          break;
        case "oldest":
          filteredArticles.sort((a, b) => {
            const dateA = new Date(a.date.split(" ").reverse().join("-"));
            const dateB = new Date(b.date.split(" ").reverse().join("-"));
            return dateA - dateB;
          });
          break;
        case "alpha":
          filteredArticles.sort((a, b) => a.titre.localeCompare(b.titre));
          break;
      }
    }

    // Configuration des contrôles de pagination
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const paginationNumbers = document.getElementById("pagination-numbers");

    if (prevPageBtn && nextPageBtn) {
      prevPageBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          renderArticles();
        }
      });

      nextPageBtn.addEventListener("click", () => {
        if (currentPage < Math.ceil(filteredArticles.length / ITEMS_PER_PAGE)) {
          currentPage++;
          renderArticles();
        }
      });
    }

    // Fonction pour générer les numéros de page
    function generatePaginationNumbers() {
      if (!paginationNumbers) return;

      paginationNumbers.innerHTML = "";
      const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);

      // Logique pour limiter le nombre de boutons de pagination
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + 4);

      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement("button");
        pageBtn.className = `px-4 py-2 ${
          i === currentPage
            ? "bg-orange-500 text-white"
            : "text-white hover:bg-zinc-700"
        } transition-colors`;
        pageBtn.textContent = i;
        pageBtn.addEventListener("click", () => {
          currentPage = i;
          renderArticles();
        });
        paginationNumbers.appendChild(pageBtn);
      }
    }

    // Fonction pour filtrer les articles par catégorie
    function filterArticlesByCategory(category) {
      if (category === "all") {
        filteredArticles = [...articles];
      } else {
        filteredArticles = articles.filter(
          (a) =>
            a.categorie === category || a.tags.includes(category.toLowerCase())
        );
      }

      // Mettre à jour le compteur
      if (countElement) {
        countElement.textContent = filteredArticles.length;
      }

      currentPage = 1; // Retour à la première page
      renderArticles();
    }

    // Fonction pour afficher les articles avec pagination
    function renderArticles() {
      const container = document.getElementById("articles-container");
      if (!container) return;

      // Calculer les articles à afficher sur la page courante
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = Math.min(
        startIndex + ITEMS_PER_PAGE,
        filteredArticles.length
      );
      const displayedArticles = filteredArticles.slice(startIndex, endIndex);

      // Adapter la classe du conteneur selon le mode d'affichage
      if (viewMode === "grid") {
        container.className =
          "articles-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
      } else {
        container.className = "articles-list space-y-6";
      }

      container.innerHTML = "";

      // Aucun article trouvé
      if (displayedArticles.length === 0) {
        const noResults = document.createElement("div");
        noResults.className = "col-span-full text-center py-12";
        noResults.innerHTML = `
          <div class="bg-zinc-800/50 rounded-lg p-8 max-w-lg mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-xl text-white font-bold mb-2">Aucun article trouvé</h3>
            <p class="text-gray-400">Essayez de modifier vos critères de recherche ou consultez toutes les actualités.</p>
          </div>
        `;
        container.appendChild(noResults);
      } else {
        // Affichage des articles selon le mode choisi
        displayedArticles.forEach((article) => {
          const articleElement = document.createElement("div");

          if (viewMode === "grid") {
            // Affichage en grille
            articleElement.className =
              "bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105";
            articleElement.setAttribute("data-aos", "fade-up");

            articleElement.innerHTML = `
              <div class="relative">
                <img src="${article.image}" alt="${
              article.titre
            }" class="w-full h-48 object-cover" />
                <span class="absolute top-4 left-4 bg-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">${
                  article.tag || article.categorie
                }</span>
              </div>
              <div class="p-4">
                <p class="text-gray-600 text-sm mb-2">${article.date}</p>
                <h3 class="text-xl font-bold mb-3">${article.titre}</h3>
                <p class="text-gray-600 mb-4 line-clamp-3">${article.resume}</p>
                <a href="article.html?id=${
                  article.id
                }" class="text-orange-600 font-semibold hover:text-orange-800 flex items-center gap-1">
                  Lire la suite
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </a>
              </div>
            `;
          } else {
            // Affichage en liste
            articleElement.className =
              "bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-xl";
            articleElement.setAttribute("data-aos", "fade-up");

            articleElement.innerHTML = `
              <div class="relative md:w-1/3">
                <img src="${article.image}" alt="${
              article.titre
            }" class="w-full h-48 md:h-full object-cover" />
                <span class="absolute top-4 left-4 bg-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">${
                  article.tag || article.categorie
                }</span>
              </div>
              <div class="p-4 md:p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  <p class="text-gray-600 text-sm mb-2">${article.date}</p>
                  <h3 class="text-xl md:text-2xl font-bold mb-3">${
                    article.titre
                  }</h3>
                  <p class="text-gray-600 mb-4">${article.resume}</p>
                </div>
                <div class="flex items-center justify-between mt-4">
                  <div class="flex flex-wrap gap-2">
                    ${article.tags
                      .map(
                        (tag) =>
                          `<span class="text-xs bg-gray-200 rounded-full px-2 py-1">${tag}</span>`
                      )
                      .join("")}
                  </div>
                  <a href="article.html?id=${
                    article.id
                  }" class="text-orange-600 font-semibold hover:text-orange-800 flex items-center gap-1">
                    Lire la suite
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            `;
          }

          container.appendChild(articleElement);
        });
      }

      // Mise à jour de la pagination
      generatePaginationNumbers();
    }

    // Configuration des filtres
    function setupFilters(articles) {
      // Extraction des catégories uniques
      const categories = ["all", ...new Set(articles.map((a) => a.categorie))];

      // Génération des boutons de filtres
      const filterContainer = document.querySelector(
        ".category-filters-container"
      );
      if (filterContainer) {
        categories.forEach((category) => {
          const filterBtn = document.createElement("button");
          filterBtn.className =
            "bg-transparent text-black px-4 py-2 lg:px-6 lg:py-3 font-medium text-xs lg:text-sm border-black/10 border-solid border rounded-full hover:bg-black hover:text-white";
          filterBtn.textContent = category === "all" ? "Toutes" : category;
          filterBtn.dataset.category = category;

          filterBtn.addEventListener("click", function () {
            // Activer le bouton sélectionné
            document
              .querySelectorAll(".category-filters-container button")
              .forEach((btn) => {
                btn.classList.remove("bg-black", "text-white");
              });
            this.classList.add("bg-black", "text-white");

            // Filtrer les articles
            filterArticlesByCategory(this.dataset.category);
          });

          filterContainer.appendChild(filterBtn);
        });

        // Activer le premier filtre par défaut
        const defaultFilter = filterContainer.querySelector("button");
        if (defaultFilter) {
          defaultFilter.click();
        }
      }
    }

    // Charger l'article en vedette
    function loadFeaturedArticle(article) {
      const featuredContainer = document.querySelector(".featured-article");
      if (!featuredContainer || !article) return;

      featuredContainer.innerHTML = `
        <img class="lg:w-[60%] max-w-[80vw] 2xl:max-w-4xl aspect-video object-cover" src="${article.image}" alt="${article.titre}">
        <div class="flex flex-col items-start justify-start bg-black pl-4 pr-8 py-4 gap-6 lg:max-h-72 lg:max-w-lg lg:-ml-12 -mt-10">
          <h3 class="text-white text-2xl lg:text-3xl uppercase text-center lg:text-left">${article.titre}</h3>
          <p class="font-medium text-ellipsis text-white overflow-hidden hidden md:inline max-h-32 line-clamp-3">${article.resume}</p>
          <a href="article.html?id=${article.id}" class="w-40 h-12 bg-white font-mont text-xs font-bold text-center hover:bg-orange-500 hover:text-white flex items-center justify-center">
            Lire l'article
            <span class="h-min text-center ml-4 text-lg font-black">➞</span>
          </a>
        </div>
      `;
    }

    // Rendu initial des articles
    renderArticles();
  } catch (error) {
    console.error("Erreur lors du chargement des articles:", error);
    const container = document.getElementById("articles-container");
    if (container) {
      container.innerHTML = `
        <div class="col-span-full text-center py-8">
          <p class="text-red-500">Impossible de charger les actualités. Veuillez réessayer ultérieurement.</p>
        </div>
      `;
    }
  }
}
