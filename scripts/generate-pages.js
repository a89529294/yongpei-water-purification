const fs = require('fs').promises;
const path = require('path');

// Constants for file paths
const BUILD_DIR = path.join(__dirname, '../build');
const BUILD_JS_DIR = path.join(BUILD_DIR, 'js');
const BUILD_PRODUCTS_DIR = path.join(BUILD_DIR, 'products');
const COMPONENTS_TEMPLATE_PATH = path.join(__dirname, '../js/components.js');
const CATEGORY_TEMPLATE_PATH = path.join(__dirname, '../category-template.html');
const PRODUCT_TEMPLATE_PATH = path.join(__dirname, '../product-detail-template.html');
const ROOT_DIR = path.join(__dirname, '..');
const API_URL = 'YOUR_API_ENDPOINT/products'; // TODO: Replace with actual API endpoint

// Helper function to remove directory recursively
async function removeDir(dir) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        await Promise.all(entries.map(async entry => {
            const fullPath = path.join(dir, entry.name);
            return entry.isDirectory() 
                ? removeDir(fullPath) 
                : fs.unlink(fullPath);
        }));
        
        await fs.rmdir(dir);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
}

// Clean build directory
async function cleanBuild() {
    console.log('Cleaning build directory...');
    await removeDir(BUILD_DIR);
}

// Ensure build directories exist
async function ensureDirectories() {
    await fs.mkdir(BUILD_DIR, { recursive: true });
    await fs.mkdir(BUILD_JS_DIR, { recursive: true });
    await fs.mkdir(BUILD_PRODUCTS_DIR, { recursive: true });
}

// Helper function to copy directory recursively
async function copyDir(src, dest) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    await fs.mkdir(dest, { recursive: true });

    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

// Copy all necessary files and folders to build directory
async function copyStaticFiles() {
    console.log('Copying static files to build directory...');
    
    // List of directories to copy
    const dirsToCopy = ['css', 'img', 'js', 'lib', 'scss'];
    
    // Copy directories
    for (const dir of dirsToCopy) {
        const srcDir = path.join(ROOT_DIR, dir);
        const destDir = path.join(BUILD_DIR, dir);
        await copyDir(srcDir, destDir);
    }
    
    // Get all HTML files from root directory
    const files = await fs.readdir(ROOT_DIR);
    const htmlFiles = files.filter(file => 
        file.endsWith('.html') && 
        file !== 'category-template.html' && 
        file !== 'product-detail-template.html'
    );
    
    // Copy HTML files
    for (const file of htmlFiles) {
        const srcPath = path.join(ROOT_DIR, file);
        const destPath = path.join(BUILD_DIR, file);
        await fs.copyFile(srcPath, destPath);
    }
}

// Fetch all products from the API
async function fetchProducts() {
    // const response = await fetch(API_URL);
    // if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // return response.json();

    return [
        {
            id: 1,
            name: 'Product 1',
            description: 'Description for Product 1',
            features: [
                { title: 'Feature 1', description: 'Feature 1 description' },
                { title: 'Feature 2', description: 'Feature 2 description' },
            ],
            specifications: [
                { title: 'Specification 1', description: 'Specification 1 description' },
                { title: 'Specification 2', description: 'Specification 2 description' },
            ],
            images: ['https://picsum.photos/200', 'https://picsum.photos/200'],
            category:{id:1, name:'Category 1'}
        },
        {
            id: 2,
            name: 'Product 2',
            description: 'Description for Product 2',
            features: [
                { title: 'Feature 1', description: 'Feature 1 description' },
                { title: 'Feature 2', description: 'Feature 2 description' },
            ],
            specifications: [
                { title: 'Specification 1', description: 'Specification 1 description' },
                { title: 'Specification 2', description: 'Specification 2 description' },
            ],
            images: ['https://picsum.photos/200', 'https://picsum.photos/200'],
            category:{id:2, name:'Category 2'}
        },
    ];
}

// Generate components.js with category dropdown
async function generateComponents(categories) {
    const componentsContent = await fs.readFile(COMPONENTS_TEMPLATE_PATH, 'utf-8');
    const dropdownItems = categories
        .map(category => `<a href="category-${category.id}.html" class="dropdown-item">${category.name}</a>`)
        .join('\n');

    const updatedContent = componentsContent.replace(
        /<div class="dropdown-menu shadow-sm m-0">([\s\S]*?)<\/div>/,
        `<div class="dropdown-menu shadow-sm m-0">\n${dropdownItems}\n</div>`
    );

    await fs.writeFile(path.join(BUILD_JS_DIR, 'components.js'), updatedContent);
}

// Generate category pages
async function generateCategoryPages(categories, products) {
    const categoryTemplate = await fs.readFile(CATEGORY_TEMPLATE_PATH, 'utf-8');

    for (const category of categories) {
        const categoryProducts = products.filter(p => p.category.id === category.id);
        
        // Generate product cards HTML
        const productsHtml = categoryProducts.map(product => `
            <div class="col-6 col-md-3 wow fadeIn" data-wow-delay="0.1s">
                <div class="bg-light text-center p-3 product-card">
                    <img class="img-fluid mb-3" src="${product.images[0]}" alt="${product.name}"
                        style="height: 100px; object-fit: contain;">
                    <h5 class="mb-1 product-title">${product.name}</h5>
                    <p class="text-muted mb-2 truncate-2">${product.description.substring(0, 100)}...</p>
                    <a class="btn btn-sm btn-primary" href="products/product-${product.id}.html">查看細節</a>
                </div>
            </div>
        `).join('\n');

        // Replace template content
        let categoryContent = categoryTemplate
            .replace('Token Sale', category.name) // Replace title
            .replace(/<div class="row g-3">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/m, 
                `<div class="row g-3">${productsHtml}</div></div></div>`);

        await fs.writeFile(path.join(BUILD_DIR, `category-${category.id}.html`), categoryContent);
    }
}

// Generate individual product pages
async function generateProductPages(products) {
    const productTemplate = await fs.readFile(PRODUCT_TEMPLATE_PATH, 'utf-8');

    for (const product of products) {
        let productContent = productTemplate;

        // Generate features HTML
        const featuresHtml = product.features
            .map(feature => `
                <div class="col-sm-6 mb-4">
                    <h5><i class="fa fa-check-circle text-primary me-2"></i>${feature.title}</h5>
                    <p>${feature.description}</p>
                </div>
            `).join('\n');

        // Generate specifications HTML
        const specificationsHtml = product.specifications
            .map(spec => `
                <div class="col-sm-6 mb-2">
                    <h6>${spec.title}</h6>
                    <p class="mb-0">${spec.value}</p>
                </div>
            `).join('\n');

        // Generate image carousel items
        const carouselItems = product.images
            .map((img, index) => `
                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                    <img class="w-100" src="${img}" alt="Image">
                </div>
            `).join('\n');

        // Replace template content
        productContent = productContent
            .replace('Product Name', product.name)
            .replace('Product Description', product.description)
            .replace(/<!-- Features Content -->[\s\S]*?<!-- End Features Content -->/m, featuresHtml)
            .replace(/<!-- Specifications Content -->[\s\S]*?<!-- End Specifications Content -->/m, specificationsHtml)
            .replace(/<!-- Carousel Items -->[\s\S]*?<!-- End Carousel Items -->/m, carouselItems);

        await fs.writeFile(path.join(BUILD_PRODUCTS_DIR, `product-${product.id}.html`), productContent);
    }
}

// Main function to run everything
async function generateAllPages() {
    try {
        console.log('Starting page generation process...');
        
        // Clean and recreate build directory
        await cleanBuild();
        
        // Ensure directories exist
        await ensureDirectories();
        
        // Copy static files first
        await copyStaticFiles();
        
        // Fetch products data
        const products = await fetchProducts();
        
        // Extract unique categories
        const categories = [...new Set(products.map(p => p.category.id))]
            .map(id => ({
                id,
                name: products.find(p => p.category.id === id).category.name
            }));
        
        // Generate all pages
        await Promise.all([
            generateComponents(categories),
            generateCategoryPages(categories, products),
            generateProductPages(products)
        ]);
        
        console.log('Successfully generated all pages!');
    } catch (error) {
        console.error('Error generating pages:', error);
        process.exit(1);
    }
}

// Run the script
generateAllPages();
