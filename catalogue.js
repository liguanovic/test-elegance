// === CATALOGUE JS AVEC PAGINATION ===

let productsData = [];
let currentPage = 1;
let itemsPerPage = 8; // Par défaut mobile

// Calculer itemsPerPage selon la largeur d'écran
function updateItemsPerPage() {
    if (window.innerWidth >= 769) {
        itemsPerPage = 12; // Tablet & Desktop
    } else {
        itemsPerPage = 8; // Mobile
    }
}

// === FILTRAGE AUTOMATIQUE AU CHARGEMENT ===
function applyHashFilter() {
    const hash = window.location.hash.substring(1);

    if (hash && hash !== 'all') {
        setTimeout(() => {
            const selectMobile = document.getElementById('filterSelectMobile');
            if (selectMobile) {
                selectMobile.value = hash;
            }

            const filterLinks = document.querySelectorAll('.filter-link');
            filterLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-filter') === hash) {
                    link.classList.add('active');
                }
            });

            filterProducts(hash);
        }, 100);
    }
}

// === MARQUER LE LIEN ACTIF DANS LE MENU ===
function markActiveSubmenuLink() {
    const hash = window.location.hash.substring(1) || 'all';
    const submenuLinks = document.querySelectorAll('.submenu a');

    submenuLinks.forEach(link => {
        link.classList.remove('active');
        const linkHash = link.getAttribute('href').split('#')[1] || 'all';

        if (linkHash === hash || (hash === '' && linkHash === 'all')) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('DOMContentLoaded', markActiveSubmenuLink);
window.addEventListener('hashchange', markActiveSubmenuLink);
window.addEventListener('load', applyHashFilter);
window.addEventListener('hashchange', applyHashFilter);

// Charger les produits depuis le JSON
async function loadProducts() {
    try {
        const response = await fetch('produits.json');
        const data = await response.json();
        productsData = data.produits;
        updateItemsPerPage();
        renderProducts(productsData);
        initCarousels();
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
    }
}

// Détecter si c'est une vidéo
function isVideo(filename) {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Générer le HTML d'un média
function createMediaHTML(mediaSrc, alt) {
    if (isVideo(mediaSrc)) {
        return `<video class="carousel-video" autoplay muted loop playsinline>
                    <source src="${mediaSrc}" type="video/mp4">
                </video>`;
    } else {
        return `<img src="${mediaSrc}" alt="${alt}" class="carousel-image">`;
    }
}

// Générer le HTML d'une card produit
function createProductCard(produit) {
    const medias = produit.medias || produit.images || [];
    const mediasHTML = medias.map(media => createMediaHTML(media, produit.nom)).join('');
    const dotsHTML = medias.map((_, index) =>
        `<span class="dot ${index === 0 ? 'active' : ''}"></span>`
    ).join('');

    const materiereClass = `material-${produit.matiere}`;
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

// Afficher les produits avec pagination
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    const html = paginatedProducts.map(produit => createProductCard(produit)).join('');
    grid.innerHTML = html;

    renderPagination(products.length);
    makeCardsClickable();
    initCarousels();
}

// Créer la pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationContainer = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '<div class="pagination-wrapper">';

    // Bouton précédent
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-arrow" onclick="changePage(${currentPage - 1})">‹</button>`;
    } else {
        paginationHTML += `<button class="pagination-arrow disabled">‹</button>`;
    }

    // Pages numérotées
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const activeClass = i === currentPage ? 'active' : '';
            paginationHTML += `<button class="pagination-number ${activeClass}" onclick="changePage(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `<span class="pagination-dots">...</span>`;
        }
    }

    // Bouton suivant
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-arrow" onclick="changePage(${currentPage + 1})">›</button>`;
    } else {
        paginationHTML += `<button class="pagination-arrow disabled">›</button>`;
    }

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Changer de page
function changePage(page) {
    currentPage = page;
    const currentCategory = getCurrentCategory();
    const filteredProducts = getFilteredProducts(currentCategory);
    renderProducts(filteredProducts);

    // Scroller jusqu'aux filtres (toutes tailles d'écran)
    const filtersSection = document.querySelector('.catalogue-filters');
    if (filtersSection) {
        const offsetTop = filtersSection.offsetTop - 100;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
}




// Obtenir la catégorie actuelle
function getCurrentCategory() {
    const activeLink = document.querySelector('.filter-link.active');
    const selectMobile = document.getElementById('filterSelectMobile');

    if (activeLink) {
        return activeLink.getAttribute('data-filter');
    } else if (selectMobile) {
        return selectMobile.value;
    }
    return 'all';
}

// Filtrer les produits
function getFilteredProducts(category) {
    if (category === 'all') {
        return productsData;
    }
    return productsData.filter(p => p.categorie === category);
}

// Fonction de filtrage
function filterProducts(category) {
    currentPage = 1; // Reset à la page 1
    const filtered = getFilteredProducts(category);
    renderProducts(filtered);
}

// Gestion des filtres
function initFilters() {
    const selectMobile = document.getElementById('filterSelectMobile');
    const filterLinks = document.querySelectorAll('.filter-link');

    if (selectMobile) {
        selectMobile.addEventListener('change', (e) => {
            filterProducts(e.target.value);
        });
    }

    filterLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            filterLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const category = link.getAttribute('data-filter');
            filterProducts(category);
        });
    });
}

// Gestion des carousels
function initCarousels() {
    const carousels = document.querySelectorAll('.product-carousel');

    carousels.forEach(carousel => {
        const card = carousel.closest('.product-card');
        const track = carousel.querySelector('.carousel-track');
        const medias = carousel.querySelectorAll('.carousel-image, .carousel-video');
        const dots = card.querySelectorAll('.dot');

        if (!track || medias.length === 0) return;

        let currentIndex = 0;

        function goToSlide(index) {
            currentIndex = index;
            const offset = -currentIndex * 100;
            track.style.transform = `translateX(${offset}%)`;

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

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

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

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

        setTimeout(() => {
            const firstMedia = medias[0];
            if (firstMedia?.tagName === 'VIDEO') {
                firstMedia.play().catch(() => {
                    carousel.addEventListener('click', () => {
                        firstMedia.play();
                    }, { once: true });
                });
            }
        }, 200);
    });
}

// Rendre les cards cliquables
function makeCardsClickable() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.style.cursor = 'pointer';

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) return;

            const productId = card.querySelector('.product-carousel').getAttribute('data-product-id');
            window.location.href = `produit.html?id=${productId}`;
        });
    });
}

// Recalculer au resize
window.addEventListener('resize', () => {
    const oldItemsPerPage = itemsPerPage;
    updateItemsPerPage();
    if (oldItemsPerPage !== itemsPerPage) {
        currentPage = 1;
        const currentCategory = getCurrentCategory();
        const filtered = getFilteredProducts(currentCategory);
        renderProducts(filtered);
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadProducts().then(() => {
        initFilters();
    });
});
