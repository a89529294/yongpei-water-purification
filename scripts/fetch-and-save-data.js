const fs = require('fs').promises;
const path = require('path');

// Function to clean JSON data (copied from generate-pages.js)
function cleanJSONData(data) {
    // Step 1: Decode Unicode escape sequences to actual characters
    const decodedData = decodeURIComponent(JSON.stringify(data));
    const jsonData = JSON.parse(decodedData);
    const jsObject = JSON.parse(jsonData);
    jsObject.price = jsObject.price.split(",")[0];
    return jsObject;
}

// Fetch all products from the API
async function fetchProducts() {
    console.log('Fetching products list...');

    // Set a longer timeout (60 seconds)
    const timeout = 60000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch("https://17go.com.tw/api/products.asp", {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Fetch product details
async function fetchProductDetails(productId) {
    console.log(`Fetching details for product ${productId}...`);

    // Set a longer timeout (30 seconds)
    const timeout = 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`https://17go.com.tw/api/Details.asp?product=${productId}`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const textData = await response.text();
        return cleanJSONData(textData);
    } catch (error) {
        console.error(`Error fetching details for product ${productId}:`, error);
        return null;
    }
}

// Main function to fetch all data and save it
async function fetchAndSaveAllData() {
    try {
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, '../data');
        await fs.mkdir(dataDir, { recursive: true });

        // Fetch products list
        const productsData = await fetchProducts();
        await fs.writeFile(
            path.join(dataDir, 'products.json'),
            JSON.stringify(productsData, null, 2)
        );
        console.log('Products data saved successfully!');

        // Process products and extract IDs
        let categoryId = 1;
        const categoryMap = new Map();

        // Transform the data into the expected format
        const products = Object.entries(productsData).flatMap(([categoryName, products]) => {
            // Get or create category ID
            if (!categoryMap.has(categoryName)) {
                categoryMap.set(categoryName, categoryId++);
            }
            const currentCategoryId = categoryMap.get(categoryName);

            // Transform each product in the category
            return products.map((product) => {
                return {
                    id: product.product,
                    name: product.a_name,
                    images: [product.imgSrc],
                    category: {
                        id: currentCategoryId,
                        name: categoryName,
                    },
                };
            });
        });

        // Get unique categories
        const categories = Array.from(categoryMap.entries()).map(([name, id]) => ({
            id,
            name,
        }));

        // Save processed products and categories
        await fs.writeFile(
            path.join(dataDir, 'processed-products.json'),
            JSON.stringify({ products, categories }, null, 2)
        );
        console.log('Processed products data saved successfully!');

        // Fetch and save details for each product
        const productDetails = [];
        for (const product of products) {
            try {
                const details = await fetchProductDetails(product.id);
                if (details) {
                    productDetails.push({
                        ...details,
                        id: product.id
                    });

                    // Add a small delay between requests to avoid overwhelming the server
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } catch (error) {
                console.error(`Failed to fetch details for product ${product.id}:`, error);
            }
        }

        // Save product details
        await fs.writeFile(
            path.join(dataDir, 'product-details.json'),
            JSON.stringify(productDetails, null, 2)
        );
        console.log('Product details saved successfully!');

        console.log('All data fetched and saved successfully!');
    } catch (error) {
        console.error('Error in fetchAndSaveAllData:', error);
        process.exit(1);
    }
}

// Run the script
fetchAndSaveAllData();