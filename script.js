document.addEventListener('DOMContentLoaded', () => {
    
    /* --- Navigation Menu --- */
    const menuToggle = document.getElementById('menuToggle');
    const fullscreenMenu = document.getElementById('fullscreenMenu');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        fullscreenMenu.classList.toggle('active');
    });

    /* --- Scroll Animations --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-text, .fade-in-up').forEach(el => {
        observer.observe(el);
    });

    /* --- GitHub API Integration --- */
    const REPO = 'velcera/velcera.github.io';
    const API_URL = `https://api.github.com/repos/${REPO}/issues?state=open`;

    async function fetchGitHubData() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Network response was not ok');
            const issues = await response.json();
            
            const sliders = issues.filter(issue => issue.labels.some(label => label.name === 'slider'));
            const products = issues.filter(issue => issue.labels.some(label => label.name === 'product'));
            
            renderSliders(sliders);
            renderProducts(products);
        } catch (error) {
            console.error('Error fetching data from GitHub:', error);
            document.getElementById('heroSlider').innerHTML = '<div class="loader">Failed to load images. Please check back later.</div>';
            document.getElementById('productGrid').innerHTML = '<div class="loader" style="position: relative; transform: none; left: auto; top: auto; width: 100%; text-align: center; margin: 2rem 0;">Failed to load products. Please check back later.</div>';
        }
    }

    /* --- Render Sliders --- */
    function renderSliders(sliderIssues) {
        const sliderContainer = document.getElementById('heroSlider');
        sliderContainer.innerHTML = ''; // Clear loader
        
        if (sliderIssues.length === 0) {
            sliderContainer.innerHTML = '<div class="loader">No slider images found. Please add issues with the "slider" label.</div>';
            return;
        }

        let slideElements = [];
        
        sliderIssues.forEach((issue, index) => {
            const body = issue.body || '';
            // Extract first image from markdown body (handles ![alt](url), [alt](url), and <img src="url">)
            const imgMatch = body.match(/(?:!\[.*?\]|\[.*?\])\((.*?)\)|<img.*?src=["'](.*?)["']/);
            const imageUrl = imgMatch ? (imgMatch[1] || imgMatch[2]) : null;
            if (imageUrl) {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'slide' + (index === 0 ? ' active' : '');
                img.alt = `Slide ${index + 1}`;
                sliderContainer.appendChild(img);
                slideElements.push(img);
            }
        });

        if (slideElements.length > 1) {
            let currentSlide = 0;
            setInterval(() => {
                slideElements[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slideElements.length;
                slideElements[currentSlide].classList.add('active');
            }, 3000);
        }
    }

    /* --- Render Products --- */
    function renderProducts(productIssues) {
        const productGrid = document.getElementById('productGrid');
        productGrid.innerHTML = ''; // Clear loader

        if (productIssues.length === 0) {
            productGrid.innerHTML = '<div class="loader" style="position: relative; transform: none; left: auto; top: auto; width: 100%; text-align: center; margin: 2rem 0;">No products found. Please add issues with the "product" label.</div>';
            return;
        }

        productIssues.forEach(issue => {
            const name = issue.title;
            const body = issue.body || '';
            
            // Helper function to extract text under a markdown heading
            const extractSection = (heading) => {
                const regex = new RegExp(`### ${heading}\\s*([\\s\\S]*?)(?:### |$)`);
                const match = body.match(regex);
                return match ? match[1].trim() : '';
            };

            const imageSection = extractSection('Product Image');
            const description = extractSection('Product Description') || 'Experience the luxury of Velcéra.';
            const price = extractSection('Price') || 'Contact for price';
            const orderLinkRaw = extractSection('Order Now Link');

            // Extract image URL (handles ![alt](url), [alt](url), and <img src="url">)
            const imgMatch = imageSection.match(/(?:!\[.*?\]|\[.*?\])\((.*?)\)|<img.*?src=["'](.*?)["']/);
            const imageUrl = imgMatch ? (imgMatch[1] || imgMatch[2]) : 'placeholder.jpg'; // fallback
            
            // Extract order URL (handle markdown links or raw URLs)
            const linkMatch = orderLinkRaw.match(/\[.*?\]\((.*?)\)/);
            const orderLink = linkMatch ? linkMatch[1] : (orderLinkRaw.startsWith('http') ? orderLinkRaw : '#');

            const productCard = document.createElement('div');
            productCard.className = 'product-card fade-in-up';
            productCard.innerHTML = `
                <div class="product-image-container">
                    <img src="${imageUrl}" alt="${name}" class="product-image" onerror="this.src='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_1%20text%20%7B%20fill%3A%23aaaaaa%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_1%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23eeeeee%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2274.5%22%20y%3D%22104.5%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'">
                </div>
                <h3 class="product-name">${name}</h3>
                <p class="product-description">${description}</p>
                <div class="product-price">${price}</div>
                <a href="${orderLink}" class="order-btn" target="_blank" rel="noopener noreferrer">Order Now</a>
            `;
            
            productGrid.appendChild(productCard);
            observer.observe(productCard);
        });
    }

    // Initialize fetching
    fetchGitHubData();
});
