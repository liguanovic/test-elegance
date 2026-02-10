// Hamburger menu toggle
// Hamburger menu toggle
const menuHamburger = document.getElementById('menu-hamburger');
const navLinks = document.getElementById('navLinks');

if (menuHamburger) {
    menuHamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Fermer le menu quand on clique sur un lien (SAUF Catalogue)
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Ne pas fermer si c'est le lien Catalogue
            if (!link.classList.contains('catalogue-link')) {
                navLinks.classList.remove('active');
            }
        });
    });
}


// Fermer le menu quand la fenêtre est redimensionnée à tablet ou desktop
window.addEventListener('resize', () => {
    if (window.innerWidth >= 769 && navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
    }
});

// === SOUS-MENU CATALOGUE ===

const catalogueMenu = document.querySelector('.has-submenu');
const catalogueLink = document.querySelector('.catalogue-link');

if (catalogueLink && catalogueMenu) {
    // En mobile : toggle au clic sur "Catalogue"
    catalogueLink.addEventListener('click', (e) => {
        if (window.innerWidth < 769) {
            e.preventDefault(); // Empêcher la navigation
            catalogueMenu.classList.toggle('active');
        } else {
            // En desktop : toggle la classe active pour garder ouvert
            catalogueMenu.classList.toggle('active');
        }
    });

    // Fermer SEULEMENT le menu hamburger (pas le sous-menu) quand on clique sur un sous-lien en mobile
    const submenuLinks = document.querySelectorAll('.submenu a');
    submenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 769) {
                // Ne PAS fermer le sous-menu
                // catalogueMenu.classList.remove('active'); ← SUPPRIMÉ
                navLinks.classList.remove('active'); // Ferme seulement le menu hamburger
            }
        });
    });

    // Garder le sous-menu ouvert si on est sur catalogue.html
    if (window.location.pathname.includes('catalogue.html')) {
        catalogueMenu.classList.add('active');

        // Quand on ouvre le menu hamburger, s'assurer que le sous-menu reste ouvert
        if (menuHamburger && navLinks) {
            const originalHamburgerClick = menuHamburger.onclick;

            // Observer les changements du menu hamburger
            const observer = new MutationObserver(() => {
                if (navLinks.classList.contains('active') && window.innerWidth < 769) {
                    // Si le menu hamburger s'ouvre, garder le sous-menu ouvert
                    catalogueMenu.classList.add('active');
                }
            });

            observer.observe(navLinks, { attributes: true, attributeFilter: ['class'] });
        }
    }

    // Réinitialiser l'état au redimensionnement
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 769) {
            catalogueMenu.classList.remove('active');
        } else if (window.location.pathname.includes('catalogue.html')) {
            // Garder ouvert en mobile si on est sur catalogue.html
            catalogueMenu.classList.add('active');
        }
    });
}


// Navigation scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer pour les animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observer tous les éléments avec la classe fade-in
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Parallax effect pour le hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// === MARQUER LE LIEN ACTIF DANS LE SOUS-MENU (INDEX) ===

// Vérifier si on est sur la page catalogue
if (window.location.pathname.includes('catalogue.html')) {
    // Déjà géré dans catalogue.js
} else {
    // Sur index.html, vérifier le hash du lien cliqué
    const submenuLinks = document.querySelectorAll('.submenu a');

    submenuLinks.forEach(link => {
        link.addEventListener('click', function () {
            // Enlever active de tous
            submenuLinks.forEach(l => l.classList.remove('active'));
            // Ajouter active au lien cliqué
            this.classList.add('active');
        });
    });
}
