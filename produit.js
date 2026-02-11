// === PRODUIT.JS - Fiche produit ===


let productsData = [];
let currentProduct = null;


// Récupérer l'ID depuis l'URL
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}


// Charger les produits
async function loadProducts() {
    try {
        const response = await fetch('produits.json');
        const data = await response.json();
        productsData = data.produits;


        const productId = getProductIdFromURL();
        currentProduct = productsData.find(p => p.id === productId);


        if (currentProduct) {
            renderProduct(currentProduct);
            renderSimilarProducts(currentProduct.categorie, currentProduct.id);
        } else {


            document.getElementById('produitContainer').innerHTML = '<p>Produit non trouvé</p>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement:', error);
    }
}


// Détecter si c'est une vidéo
function isVideo(filename) {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}


// Créer le HTML d'un média
function createMediaHTML(mediaSrc, alt) {
    if (isVideo(mediaSrc)) {
        return `<video class="carousel-video" autoplay muted loop playsinline>
                    <source src="${mediaSrc}" type="video/mp4">
                </video>`;
    } else {
        return `<img src="${mediaSrc}" alt="${alt}" class="carousel-image">`;
    }
}


// Afficher le produit principal
function renderProduct(produit) {
    const medias = produit.images || [];
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
        'argent': 'Argent',
        'diamants': 'Diamants'
    };
    const matiereText = matiereTexts[produit.matiere] || produit.matiere;


    const html = `
        <div class="product-visual">
            <div class="product-carousel" data-product-id="${produit.id}">
                <div class="material-label ${materiereClass}">${matiereText}</div>
                <div class="carousel-track">
                    ${mediasHTML}
                </div>
            </div>
            <div class="carousel-dots">
                ${dotsHTML}
            </div>
        </div>
        <div class="product-content">
            <div class="product-info">
                <h3>${produit.nom}</h3>
                <p>${produit.description}</p>
            </div>
            <div class="product-description-detail">
                <h2>Description</h2>
                <p>${produit.description_detaillee || produit.description}</p>
            </div>
             <div class="referral-message">
            <i class="fa-solid fa-gift"></i>
            <p>Pour tout parrainage effectué, obtenez une réduction de <strong>5%</strong> sur votre prochaine commande</p>
        </div>
            <div class="contact-buttons">
    <a href="https://wa.me/33142860000?text=Bonjour, je suis intéressé par ${encodeURIComponent(produit.nom)}" class="btn-whatsapp" target="_blank" rel="noopener">
        <i class="fa-brands fa-whatsapp btn-icon"></i>
        WhatsApp
    </a>
    <a href="mailto:elegance.jewelry@proton.me?subject=Demande d'information sur ${encodeURIComponent(produit.nom)}" class="btn-mail">
        <i class="fa-regular fa-envelope btn-icon"></i>
        Contact
    </a>
</div>
    </div>
    `;


    document.getElementById('produitContainer').innerHTML = html;


    document.getElementById('produitDescription').innerHTML = '';


    initCarousel();
}


// Afficher les produits similaires
function renderSimilarProducts(categorie, currentId) {
    const similar = productsData.filter(p =>
        p.categorie === categorie && p.id !== currentId
    ).slice(0, 8);



    const html = similar.map(produit => createProductCard(produit)).join('');
    document.getElementById('similarProductsGrid').innerHTML = html;


    document.querySelectorAll('.similar-products .product-card').forEach(card => {
        card.style.cursor = 'pointer';


        card.addEventListener('click', (e) => {


            if (e.target.closest('.carousel-dots') || e.target.classList.contains('dot')) {
                return;
            }


            const productId = card.querySelector('.product-carousel').getAttribute('data-product-id');
            window.location.href = `produit.html?id=${productId}`;
        });
    });



    initSimilarCarousels();
}


// Créer une card produit
function createProductCard(produit) {
    const medias = produit.images || [];
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
        'argent': 'Argent',
        'diamants': 'Diamants'
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


// Initialiser le carousel du produit principal
function initCarousel() {
    const carousel = document.querySelector('.produit-container .product-carousel');
    if (!carousel) return;


    const track = carousel.querySelector('.carousel-track');
    const medias = carousel.querySelectorAll('.carousel-image, .carousel-video');
    const dots = document.querySelectorAll('.produit-container .dot');


    let currentIndex = 0;


    function goToSlide(index) {
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;


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


    // Swipe tactile
    let startX = 0;
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });


    carousel.addEventListener('touchend', (e) => {
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


    // Clic desktop
    carousel.addEventListener('click', (e) => {
        if (e.target.closest('.dot')) return;


        const rect = carousel.getBoundingClientRect();
        const clickX = e.clientX - rect.left;


        if (clickX < rect.width / 2 && currentIndex > 0) {
            goToSlide(currentIndex - 1);
        } else if (clickX >= rect.width / 2 && currentIndex < medias.length - 1) {
            goToSlide(currentIndex + 1);
        }
    });
}


// Initialiser les carousels des produits similaires
function initSimilarCarousels() {
    const carousels = document.querySelectorAll('.similar-products .product-carousel');


    carousels.forEach(carousel => {
        const card = carousel.closest('.product-card');
        const track = carousel.querySelector('.carousel-track');
        const medias = carousel.querySelectorAll('.carousel-image, .carousel-video');
        const dots = card.querySelectorAll('.dot');


        let currentIndex = 0;


        function goToSlide(index) {
            currentIndex = index;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;


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
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                goToSlide(index);
            });
        });
    });
}


document.addEventListener('DOMContentLoaded', loadProducts);