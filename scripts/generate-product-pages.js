const fs = require('fs').promises;
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '..', 'product-detail.html');
const OUTPUT_DIR = path.join(__dirname, '..', 'products');

// This URL should be replaced with your actual API endpoint
const API_URL = 'https://api.example.com/products';

async function fetchProducts() {
    try {
        // Replace this with actual API call
        // For now, using mock data
        const mockProducts = [
            {
                id: 1,
                name: '產品1',
                description: '事海勿吉條言七即飛意辛哭着飽貫錯道汁從枝',
                features: [
                    { title: '特點一', description: '特點一的詳細描述' },
                    { title: '特點二', description: '特點二的詳細描述' }
                ],
                specifications: [
                    { title: '尺寸規格', value: '長30cm x 寬25cm x 高45cm' },
                    { title: '濾芯壽命', value: '6-12個月' },
                    { title: '適用水質', value: '自來水、地下水' }
                ],
                images: [
                    'img/custom/water-purifier-1.jpeg',
                    'img/custom/water-purifier-2.jpeg',
                    'https://picsum.photos/800/600?random=1',
                    'https://picsum.photos/800/600?random=2'
                ]
            },
            {
                id: 2,
                name: '高效能淨水器',
                description: '採用先進的RO逆滲透技術，能有效去除水中的雜質、重金屬和有害物質，為您提供純淨健康的飲用水。',
                features: [
                    { title: 'RO逆滲透', description: '有效過濾水中99.9%的雜質' },
                    { title: '智能監控', description: '即時監測濾芯使用狀況' }
                ],
                specifications: [
                    { title: '尺寸規格', value: '長35cm x 寬28cm x 高50cm' },
                    { title: '濾芯壽命', value: '12-18個月' },
                    { title: '適用水質', value: '各類自來水、地下水' }
                ],
                images: [
                    'https://picsum.photos/800/600?random=3',
                    'https://picsum.photos/800/600?random=4',
                    'https://picsum.photos/800/600?random=5',
                    'https://picsum.photos/800/600?random=6'
                ]
            },
            {
                id: 3,
                name: '商用淨水系統',
                description: '專為商業場所設計的大容量淨水系統，確保穩定的水質和充足的供水量。',
                features: [
                    { title: '大流量設計', description: '每小時可處理500加侖水量' },
                    { title: '商業級濾芯', description: '採用耐用的商業級濾芯，壽命更長' }
                ],
                specifications: [
                    { title: '尺寸規格', value: '長60cm x 寬40cm x 高80cm' },
                    { title: '濾芯壽命', value: '18-24個月' },
                    { title: '適用場所', value: '餐廳、辦公室、商場' }
                ],
                images: [
                    'https://picsum.photos/800/600?random=7',
                    'https://picsum.photos/800/600?random=8',
                    'https://picsum.photos/800/600?random=9',
                    'https://picsum.photos/800/600?random=10'
                ]
            },
            {
                id: 4,
                name: '迷你型淨水器',
                description: '小巧便攜的設計，適合小型廚房和租屋族使用，安裝簡單且維護方便。',
                features: [
                    { title: '省空間設計', description: '體積小巧，安裝靈活' },
                    { title: '快速安裝', description: '15分鐘內即可完成安裝' }
                ],
                specifications: [
                    { title: '尺寸規格', value: '長20cm x 寬15cm x 高35cm' },
                    { title: '濾芯壽命', value: '4-6個月' },
                    { title: '適用場所', value: '小型廚房、套房' }
                ],
                images: [
                    'https://picsum.photos/800/600?random=11',
                    'https://picsum.photos/800/600?random=12',
                    'https://picsum.photos/800/600?random=13',
                    'https://picsum.photos/800/600?random=14'
                ]
            },
            {
                id: 5,
                name: '全屋淨水系統',
                description: '整體式淨水解決方案，從進水點開始淨化，讓全屋用水都清潔安全。',
                features: [
                    { title: '全屋過濾', description: '從源頭開始淨化所有用水' },
                    { title: '多重過濾', description: '五道過濾確保水質純淨' }
                ],
                specifications: [
                    { title: '尺寸規格', value: '長80cm x 寬50cm x 高120cm' },
                    { title: '濾芯壽命', value: '24-36個月' },
                    { title: '適用範圍', value: '獨棟房屋、別墅' }
                ],
                images: [
                    'https://picsum.photos/800/600?random=15',
                    'https://picsum.photos/800/600?random=16',
                    'https://picsum.photos/800/600?random=17',
                    'https://picsum.photos/800/600?random=18'
                ]
            },
            {
                id: 6,
                name: '智能淨水器',
                description: '配備智能監控系統，可通過手機APP隨時查看水質狀況和濾芯使用情況。',
                features: [
                    { title: 'APP控制', description: '手機遠程監控和操作' },
                    { title: '數據分析', description: '實時監測水質數據' }
                ],
                specifications: [
                    { title: '尺寸規格', value: '長40cm x 寬30cm x 高60cm' },
                    { title: '濾芯壽命', value: '12個月' },
                    { title: '連接方式', value: 'WiFi、藍牙' }
                ],
                images: [
                    'https://picsum.photos/800/600?random=19',
                    'https://picsum.photos/800/600?random=20',
                    'https://picsum.photos/800/600?random=21',
                    'https://picsum.photos/800/600?random=22'
                ]
            }
        ];
        
        return mockProducts;
        
        // Uncomment below for actual API implementation
        /*
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        return products;
        */
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function generateProductPage(product, template) {
    let html = template;
    
    // Replace product information
    html = html.replace(
        /<h1 class="display-5 mb-4">產品名稱<\/h1>/,
        `<h1 class="display-5 mb-4">${product.name}</h1>`
    );
    
    html = html.replace(
        /<p class="mb-4">產品詳細描述將在這裡顯示。[^<]*<\/p>/,
        `<p class="mb-4">${product.description}</p>`
    );

    // Generate features HTML
    const featuresHtml = product.features.map(feature => `
        <div class="d-flex mb-4">
            <div class="flex-shrink-0 btn-square bg-primary rounded-circle">
                <i class="fa fa-check text-white"></i>
            </div>
            <div class="ms-4">
                <h5>${feature.title}</h5>
                <p class="mb-0">${feature.description}</p>
            </div>
        </div>
    `).join('');

    html = html.replace(
        /<div class="d-flex mb-4">[\s\S]*?<\/div>\s*<div class="d-flex mb-4">[\s\S]*?<\/div>/,
        featuresHtml
    );

    // Generate specifications HTML
    const specificationsHtml = product.specifications.map(spec => `
        <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
            <div class="feature-item bg-light">
                <h5>${spec.title}</h5>
                <p>${spec.value}</p>
            </div>
        </div>
    `).join('');

    html = html.replace(
        /<div class="col-lg-4 col-md-6 wow fadeInUp"[\s\S]*?<\/div>\s*<\/div>\s*<div class="col-lg-4 col-md-6 wow fadeInUp"[\s\S]*?<\/div>\s*<\/div>\s*<div class="col-lg-4 col-md-6 wow fadeInUp"[\s\S]*?<\/div>\s*<\/div>/,
        specificationsHtml
    );

    // Generate image gallery HTML
    const mainImage = product.images[0];
    const imagesHtml = product.images.map(image => `
        <div class="swiper-slide">
            <img src="${image}" alt="Product Image">
        </div>
    `).join('');

    html = html.replace(
        /<img id="mainImage"[^>]*>/,
        `<img id="mainImage" src="${mainImage}" alt="Product Image">`
    );

    html = html.replace(
        /<div class="swiper-wrapper">[\s\S]*?<\/div>\s*<div class="swiper-button-next/,
        `<div class="swiper-wrapper">${imagesHtml}</div><div class="swiper-button-next`
    );

    return html;
}

async function cleanProductsDirectory() {
    try {
        // Check if directory exists
        try {
            await fs.access(OUTPUT_DIR);
        } catch {
            // Directory doesn't exist, nothing to clean
            return;
        }

        // Read all files in the directory
        const files = await fs.readdir(OUTPUT_DIR);
        
        // Delete each HTML file
        for (const file of files) {
            if (file.endsWith('.html')) {
                const filePath = path.join(OUTPUT_DIR, file);
                await fs.unlink(filePath);
                console.log(`Deleted: ${filePath}`);
            }
        }
        
        console.log('Cleaned products directory');
    } catch (error) {
        console.error('Error cleaning products directory:', error);
        throw error;
    }
}

async function generateAllProductPages() {
    try {
        // Clean up existing product pages
        await cleanProductsDirectory();

        // Create output directory if it doesn't exist
        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        // Read template file
        const template = await fs.readFile(TEMPLATE_PATH, 'utf8');

        // Fetch products
        const products = await fetchProducts();

        // Generate pages for each product
        for (const product of products) {
            const productHtml = await generateProductPage(product, template);
            const outputPath = path.join(OUTPUT_DIR, `product-${product.id}.html`);
            await fs.writeFile(outputPath, productHtml);
            console.log(`Generated: ${outputPath}`);
        }

        console.log('All product pages generated successfully!');
    } catch (error) {
        console.error('Error generating product pages:', error);
    }
}

// Run the script
generateAllProductPages();
