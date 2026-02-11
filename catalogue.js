// === CATALOGUE JS ===

let productsData = [];

// === FILTRAGE AUTOMATIQUE AU CHARGEMENT ===

function applyHashFilter() {
    const hash = window.location.hash.substring(1);

    if (hash && hash !== 'all') {

        setTimeout(() => {

            const selectMobile = document.getElementById('filterSelectMobile');
            if (selectMobile) {
                selectMobile.value = hash;
            }

            // En desktop : activer le bon filtre
            const filterLinks = document.querySelectorAll('.filter-link');
            filterLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-filter') === hash) {
                    link.classList.add('active');
                }
            });

            // Filtrer les produits
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (cardCategory === hash) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }, 100);
    }
}

// === MARQUER LE LIEN ACTIF DANS LE MENU ===

function markActiveSubmenuLink() {
    const hash = window.location.hash.substring(1) || 'all';

    // Trouver tous les liens du sous-menu dans la navbar
    const submenuLinks = document.querySelectorAll('.submenu a');

    submenuLinks.forEach(link => {
        // Enlever la classe active de tous les liens
        link.classList.remove('active');

        // Extraire la catégorie depuis le href du lien
        const linkHash = link.getAttribute('href').split('#')[1] || 'all';

        // Ajouter la classe active au lien correspondant
        if (linkHash === hash || (hash === '' && linkHash === 'all')) {
            link.classList.add('active');
        }
    });
}

// Appeler au chargement de la page
window.addEventListener('DOMContentLoaded', markActiveSubmenuLink);

// Appeler quand le hash change (navigation dans la page)
window.addEventListener('hashchange', markActiveSubmenuLink);


// Appeler au chargement
window.addEventListener('load', applyHashFilter);

// Appeler quand le hash change
window.addEventListener('hashchange', applyHashFilter);


// Charger les produits depuis le JSON
async function loadProducts() {
    try {
        const response = await fetch('produits.json');
        const data = await response.json();
        productsData = data.produits;
        renderProducts(productsData);
        initCarousels();
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
    }
}

// Détecter si c'est une vidéo par l'extension
function isVideo(filename) {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Générer le HTML d'un média (image ou vidéo)
// Générer le HTML d'un média (image ou vidéo)
function createMediaHTML(mediaSrc, alt) {
    if (isVideo(mediaSrc)) {
        return `<video class="carousel-video" 
                    autoplay 
                    muted 
                    loop 
                    playsinline>
                    <source src="${mediaSrc}" type="video/mp4">
                </video>`;
    } else {
        return `<img src="${mediaSrc}" alt="${alt}" class="carousel-image">`;
    }
}



// Générer le HTML d'une card produit
function createProductCard(produit) {
    // Utiliser 'images' ou 'medias' (compatibilité)
    const medias = produit.medias || produit.images || [];

    // Créer les médias du carousel
    const mediasHTML = medias.map(media => createMediaHTML(media, produit.nom)).join('');

    // Créer les dots
    const dotsHTML = medias.map((_, index) =>
        `<span class="dot ${index === 0 ? 'active' : ''}"></span>`
    ).join('');

    // Nom de la classe pour la matière
    const materiereClass = `material-${produit.matiere}`;

    // Texte à afficher pour la matière
    const matiereTexts = {
        'or-jaune': 'Or Jaune',
        'or-blanc': 'Or Blanc',
        'or-rose': 'Or Rose',
        'platine': 'Platine',
        'argent': 'Argent'
    };
    const matiereText = matiereTexts[produit.matiere] || produit.matiere;

    return `
        <div class="product-card" data-category="${produit.categorie}">
            <div class="product-carousel" data-product-id="${produit.id}">
                <div class="material-label ${materiereClass}">${matiereText}</div>
                <div class="carousel-track">
                    ${mediasHTML}
                </div>
            </div>
            <div class="carousel-dots">
                ${dotsHTML}
            </div>
            <div class="product-info">
                <h3>${produit.nom}</h3>
                <p>${produit.description}</p>
            </div>
        </div>
    `;
}

// Afficher les produits dans la grille
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    const html = products.map(produit => createProductCard(produit)).join('');
    grid.innerHTML = html;
}

// Gestion des filtres (mobile + desktop)
function initFilters() {
    const selectMobile = document.getElementById('filterSelectMobile');
    const filterLinks = document.querySelectorAll('.filter-link');

    // Fonction de filtrage
    function filterProducts(category) {
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');

            if (category === 'all' || cardCategory === category) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    // Filtre mobile (select)
    if (selectMobile) {
        selectMobile.addEventListener('change', (e) => {
            const selectedCategory = e.target.value;
            filterProducts(selectedCategory);
        });
    }

    // Filtres desktop (liens)
    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Retirer la classe active de tous les liens
            filterLinks.forEach(l => l.classList.remove('active'));

            // Ajouter la classe active au lien cliqué
            link.classList.add('active');

            // Filtrer les produits
            const category = link.getAttribute('data-filter');
            filterProducts(category);
        });
    });
}

// Gestion des carousels avec support vidéo
function initCarousels() {
    const carousels = document.querySelectorAll('.product-carousel');

    carousels.forEach(carousel => {
        const card = carousel.closest('.product-card');
        const track = carousel.querySelector('.carousel-track');
        const medias = carousel.querySelectorAll('.carousel-image, .carousel-video');
        const dots = card.querySelectorAll('.dot');

        if (!track || medias.length === 0) return;

        let currentIndex = 0;

        // Fonction pour aller à une slide
        function goToSlide(index) {
            currentIndex = index;
            const offset = -currentIndex * 100;
            track.style.transform = `translateX(${offset}%)`;

            // Mettre à jour les dots
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            // Gérer les vidéos
            medias.forEach((media, i) => {
                if (media.tagName === 'VIDEO') {
                    if (i === currentIndex) {
                        media.play().catch(() => { });
                    } else {
                        media.pause();
                        media.currentTime = 0;
                    }
                }
            });
        }

        // Navigation par dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Swipe tactile
        let startX = 0;
        let isDragging = false;

        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;

            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentIndex < medias.length - 1) {
                    goToSlide(currentIndex + 1);
                } else if (diff < 0 && currentIndex > 0) {
                    goToSlide(currentIndex - 1);
                }
            }
        });

        // Navigation au clic (desktop)
        carousel.addEventListener('click', (e) => {
            if (e.target.closest('.dot') || e.target.tagName === 'VIDEO') return;

            const rect = carousel.getBoundingClientRect();
            const clickX = e.clientX - rect.left;

            if (clickX < rect.width / 2 && currentIndex > 0) {
                goToSlide(currentIndex - 1);
            } else if (clickX >= rect.width / 2 && currentIndex < medias.length - 1) {
                goToSlide(currentIndex + 1);
            }
        });

        // Lancer la première vidéo au chargement
        setTimeout(() => {
            const firstMedia = medias[0];
            if (firstMedia?.tagName === 'VIDEO') {
                firstMedia.play().catch(() => {
                    // Si autoplay bloqué, jouer au premier clic
                    carousel.addEventListener('click', () => {
                        firstMedia.play();
                    }, { once: true });
                });
            }
        }, 200);
    });
}



// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadProducts().then(() => {
        initFilters();
    });
});

// === RENDRE LES CARDS CLIQUABLES ===
function makeCardsClickable() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', (e) => {
            // Ne pas rediriger si on clique sur un dot
            if (e.target.classList.contains('dot')) return;

            const productId = card.querySelector('.product-carousel').getAttribute('data-product-id');
            window.location.href = `produit.html?id=${productId}`;
        });
    });
}

// Appeler après le chargement des produits
document.addEventListener('DOMContentLoaded', () => {
    loadProducts().then(() => {
        initFilters();
        makeCardsClickable(); // ← AJOUTEZ CETTE LIGNE
    });
});
