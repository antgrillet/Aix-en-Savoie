/**
 * Navigation et header du site
 * Gère les fonctionnalités de la barre de navigation et du menu mobile
 */

document.addEventListener("DOMContentLoaded", function () {
  // Éléments DOM
  const header = document.getElementById("main-header");
  const mobileButton = document.getElementById("mobile_button");
  const navMobile = document.getElementById("nav_mobile");
  let menuOpen = false;

  /**
   * Gère l'apparence du header lors du défilement
   */
  function handleScroll() {
    if (window.scrollY > 50) {
      header.classList.add("header-scrolled");
    } else {
      header.classList.remove("header-scrolled");
    }
  }

  /**
   * Gère l'ouverture et la fermeture du menu mobile
   */
  function toggleMobileMenu() {
    menuOpen = !menuOpen;

    if (menuOpen) {
      navMobile.classList.remove("hidden");
      navMobile.classList.add("mobile-menu-appear");
      mobileButton.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden"; // Empêcher le défilement

      // Remplacer l'icône du menu par une croix
      mobileButton.innerHTML = `
        <span class="sr-only">Fermer le menu</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 6L18 18" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    } else {
      navMobile.classList.add("hidden");
      navMobile.classList.remove("mobile-menu-appear");
      mobileButton.setAttribute("aria-expanded", "false");
      document.body.style.overflow = ""; // Réactiver le défilement

      // Remettre l'icône du hamburger
      mobileButton.innerHTML = `
        <span class="sr-only">Ouvrir le menu</span>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 6H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3 18H21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
    }
  }

  /**
   * Marque le lien actif dans la navigation
   */
  function setActiveLink() {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      const linkPage = link.getAttribute("href");
      if (
        linkPage === currentPage ||
        (currentPage === "" && linkPage === "index.html")
      ) {
        link.classList.add("active");
      }
    });
  }

  // Initialisation
  window.addEventListener("scroll", handleScroll);
  mobileButton.addEventListener("click", toggleMobileMenu);

  // Démarrage
  handleScroll(); // Applique l'état initial du header
  setActiveLink(); // Marque le lien actif
});
