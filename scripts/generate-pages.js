const fs = require("fs").promises;
const path = require("path");
const { JSDOM } = require("jsdom");

// Constants for file paths
const BUILD_DIR = path.join(__dirname, "../build");
const BUILD_JS_DIR = path.join(BUILD_DIR, "js");
const COMPONENTS_TEMPLATE_PATH = path.join(__dirname, "../js/components.js");
const CATEGORY_TEMPLATE_PATH = path.join(
  __dirname,
  "../category-template.html"
);
const PRODUCT_TEMPLATE_PATH = path.join(
  __dirname,
  "../product-detail-template.html"
);
const ROOT_DIR = path.join(__dirname, "..");
const API_URL = "YOUR_API_ENDPOINT/products"; // TODO: Replace with actual API endpoint

function cleanJSONData(data) {
  // Step 1: Decode Unicode escape sequences to actual characters
  const decodedData = decodeURIComponent(JSON.stringify(data));

  // Step 2: Clean up the price field (remove extra commas and spaces)
  const cleanedData = decodedData.replace(/"price":"([^"]+)"/, (match, p1) => {
    return `"price":"${p1.replace(/\s+/g, "").replace(/,+$/, "")}"`; // Remove spaces and trailing commas
  });

  // Step 3: Parse the JSON data
  const jsonData = JSON.parse(cleanedData);

  // Step 4: Return the cleaned data without altering the HTML in the contents
  return JSON.parse(jsonData);
}

// Helper function to remove directory recursively
async function removeDir(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory() ? removeDir(fullPath) : fs.unlink(fullPath);
      })
    );

    await fs.rmdir(dir);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

// Clean build directory
async function cleanBuild() {
  console.log("Cleaning build directory...");
  await removeDir(BUILD_DIR);
}

// Ensure build directories exist
async function ensureDirectories() {
  await fs.mkdir(BUILD_DIR, { recursive: true });
  await fs.mkdir(BUILD_JS_DIR, { recursive: true });
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
  console.log("Copying static files to build directory...");

  // List of directories to copy
  const dirsToCopy = ["css", "img", "js", "lib", "scss"];

  // Copy directories
  for (const dir of dirsToCopy) {
    const srcDir = path.join(ROOT_DIR, dir);
    const destDir = path.join(BUILD_DIR, dir);
    await copyDir(srcDir, destDir);
  }

  // Get all HTML files from root directory
  const files = await fs.readdir(ROOT_DIR);
  const htmlFiles = files.filter(
    (file) =>
      file.endsWith(".html") &&
      file !== "category-template.html" &&
      file !== "product-detail-template.html"
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
  // individual product details
  // https://wait.mi-great.com.tw/yp/api/Details.asp?product=2

  const response = await fetch(
    "https://wait.mi-great.com.tw/yp/api/products.asp"
  );
  // const response = await fetch("http://17go.com.tw/api/products.asp");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  // console.log(data);

  let productId = 1;
  let categoryId = 1;
  const categoryMap = new Map();

  // Transform the data into the expected format
  const products = Object.entries(data).flatMap(([categoryName, products]) => {
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

  // Store categories globally or return them along with products
  return {
    products,
    categories,
  };

  // return [
  //   {
  //     id: 1,
  //     name: "Product 1",
  //     description: "Description for Product 1",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 1, name: "Category 1" },
  //   },
  //   {
  //     id: 3,
  //     name: "Product 3",
  //     description:
  //       "Description for Product 3 Description for Product 3 Description for Product 3",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 2, name: "Category 2" },
  //   },
  //   {
  //     id: 4,
  //     name: "Product 4",
  //     description: "Description for Product 4",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 4, name: "Category 3" },
  //   },
  //   {
  //     id: 2,
  //     name: "Product 2",
  //     description: "Description for Product 2",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 2, name: "Category 2" },
  //   },
  //   {
  //     id: 5,
  //     name: "Product 5",
  //     description: "Description for Product 5",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 2, name: "Category 2" },
  //   },
  //   {
  //     id: 6,
  //     name: "Product 6",
  //     description: "Description for Product 6",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 2, name: "Category 2" },
  //   },
  //   {
  //     id: 7,
  //     name: "Product 7",
  //     description: "Description for Product 7",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 2, name: "Category 2" },
  //   },
  //   {
  //     id: 8,
  //     name: "Product 8",
  //     description: "Description for Product 3",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 2, name: "Category 2" },
  //   },
  //   {
  //     id: 9,
  //     name: "Product 9",
  //     description: "Description for Product 9",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 2, name: "Category 2" },
  //   },
  //   {
  //     id: 10,
  //     name: "Product 10",
  //     description: "Description for Product 10",
  //     features: [
  //       { title: "Feature 1", description: "Feature 1 description" },
  //       { title: "Feature 2", description: "Feature 2 description" },
  //     ],
  //     specifications: [
  //       {
  //         title: "Specification 1",
  //         description: "Specification 1 description",
  //       },
  //       {
  //         title: "Specification 2",
  //         description: "Specification 2 description",
  //       },
  //     ],
  //     images: ["https://picsum.photos/200", "https://picsum.photos/200"],
  //     category: { id: 2, name: "Category 2" },
  //   },
  // ];
}

// Helper function to generate random image URLs
function getRandomImages(count) {
  return Array.from(
    { length: count },
    (_, i) => `https://picsum.photos/800/600?random=${Math.random()}`
  );
}

// Generate components.js with category dropdown
async function generateComponents(categories, products) {
  const componentsContent = await fs.readFile(
    COMPONENTS_TEMPLATE_PATH,
    "utf-8"
  );

  console.log(categories);

  // Generate dropdown content with categories as headers and products as links
  const dropdownContent = categories
    .map((category) => {
      const categoryProducts = products.filter(
        (p) => p.category.id === category.id
      );
      return `
          <a href="#category-${category.id}" class="dropdown-header">${category.name}</a>
          `;
    })
    .join("\n");

  // Replace the content of the dropdown container
  const updatedContent = componentsContent.replace(
    /<div id='category-dropdown-content'[^>]*>([\s\S]*?)<\/div>/,
    `<div id='category-dropdown-content' class="dropdown-menu dropdown-menu-end">
      ${dropdownContent}
    </div>`
  );

  await fs.writeFile(path.join(BUILD_JS_DIR, "components.js"), updatedContent);
}

// Generate individual product pages
async function generateProductPages(products) {
  const productTemplate = await fs.readFile(PRODUCT_TEMPLATE_PATH, "utf-8");

  for (const product of products) {
    try {
      // Fetch detailed product data from API
      const response = await fetch(
        `https://wait.mi-great.com.tw/yp/api/Details.asp?product=${product.id}`
      );
      const textData = await response.text();
      const detailedProduct = cleanJSONData(textData);

      let productContent = productTemplate;
      const dom = new JSDOM(productContent);
      const doc = dom.window.document;

      // Update product details in template
      doc.title = `湧沛淨水 - ${detailedProduct.title} ${detailedProduct.a_name}`;
      doc.querySelector(".product-title").textContent = detailedProduct.title;
      doc.querySelector(".product-name").textContent = detailedProduct.a_name;
      doc.querySelector(
        ".product-price"
      ).textContent = `NT$ ${detailedProduct.price}`;
      doc.querySelector(".product-model").textContent = detailedProduct.roomno;

      // Generate product content HTML
      const contentHtml = `<div class="content-item mb-3">${detailedProduct.contents}</div>`;

      doc.querySelector(".product-contents").innerHTML = contentHtml;

      // const productImageSrcArray = detailedProduct.images || [];
      const productImageSrcArray = Array(10)
        .fill("")
        .map((_, index) => `https://picsum.photos/200?random=${index}`);

      // Generate gallery HTML
      const galleryHtml = `
        <div class="product-gallery">
          <div class="gallery-main mb-3">
            <img id="mainImage" src="${productImageSrcArray[0]}" alt="${
        detailedProduct.title
      } - Main Image" class="img-fluid">
          </div>
          <div class="gallery-thumbs-container">
            <button class="nav-btn prev">
              <i class="bi bi-chevron-left"></i>
            </button>
            <div class="gallery-thumbs">
              <div class="thumb-container" id="thumbContainer">
                ${productImageSrcArray
                  .map(
                    (img, index) => `
                    <div class="thumb${index === 0 ? " active" : ""}">
                      <img src="${img}" alt="${
                      detailedProduct.title
                    } - Thumbnail ${index + 1}">
                    </div>
                  `
                  )
                  .join("")}
              </div>
            </div>
            <button class="nav-btn next">
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
          <style>
            .product-gallery {
              max-width: 100%;
              margin: 0 auto;
            }
            .gallery-main {
              width: 100%;
              max-height: 400px;
              margin-bottom: 1rem;
              text-align: center;
            }
            .gallery-main img {
              max-width: 100%;
              max-height: 400px;
              object-fit: contain;
            }
            .gallery-thumbs-container {
              position: relative;
              max-width: 100%;
              margin: 0 auto;
              padding: 0 40px;
            }
            .gallery-thumbs {
              width: 100%;
              overflow: hidden;
            }
            .thumb-container {
              display: flex;
              gap: 10px;
              transition: transform 0.3s ease;
            }
            .thumb {
              flex: 0 0 80px;
              height: 80px;
              border: 2px solid transparent;
              cursor: pointer;
              transition: border-color 0.3s;
            }
            .thumb.active {
              border-color: var(--primary);
            }
            .thumb img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .nav-btn {
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              width: 32px;
              height: 32px;
              border: none;
              border-radius: 50%;
              background: var(--primary);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              z-index: 1;
              padding: 0;
            }
            .nav-btn:disabled {
              background: #ccc;
              cursor: not-allowed;
            }
            .nav-btn.prev {
              left: 0;
            }
            .nav-btn.next {
              right: 0;
            }
          </style>
        </div>
      `;

      doc.querySelector(".product-gallery").outerHTML = galleryHtml;

      // Add gallery script
      const galleryScript = `
          document.addEventListener('DOMContentLoaded', function() {
            let currentScrollPosition = 0;
            const thumbWidth = 90; // 80px width + 10px gap
            const visibleThumbs = 6;
            const container = document.getElementById('thumbContainer');
            const mainImage = document.getElementById('mainImage');
            const prevBtn = document.querySelector('.nav-btn.prev');
            const nextBtn = document.querySelector('.nav-btn.next');
            const maxScroll = Math.max(0, (${productImageSrcArray.length} - visibleThumbs) * thumbWidth);

            // Initialize thumbnail click handlers
            document.querySelectorAll('.thumb').forEach(thumb => {
              thumb.addEventListener('click', function() {
                const imgSrc = this.querySelector('img').src;
                mainImage.src = imgSrc;
                document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                console.log('Current scroll position:', currentScrollPosition);
              });
            });

            // Initialize navigation buttons
            prevBtn.addEventListener('click', () => scrollGallery(-1));
            nextBtn.addEventListener('click', () => scrollGallery(1));

            function scrollGallery(direction) {
              currentScrollPosition = Math.max(0, Math.min(maxScroll, currentScrollPosition + direction * thumbWidth));
              container.style.transform = \`translateX(-\${currentScrollPosition}px)\`;
              
              // Update button states
              prevBtn.disabled = currentScrollPosition === 0;
              nextBtn.disabled = currentScrollPosition >= maxScroll;
            }

            // Initialize touch events for mobile swipe
            let touchStartX = 0;
            container.addEventListener('touchstart', (e) => {
              touchStartX = e.touches[0].clientX;
            }, { passive: true });

            container.addEventListener('touchend', (e) => {
              const touchEndX = e.changedTouches[0].clientX;
              const swipeDistance = touchEndX - touchStartX;
              
              if (Math.abs(swipeDistance) > 50) { // minimum distance for a swipe
                scrollGallery(swipeDistance > 0 ? -1 : 1);
              }
            }, { passive: true });

            // Initial setup
            prevBtn.disabled = true;
            nextBtn.disabled = ${productImageSrcArray.length} <= visibleThumbs;
          });
      `;

      // Insert the gallery script before </body>
      const scriptElement = doc.createElement("script");
      scriptElement.textContent = galleryScript;
      doc.body.appendChild(scriptElement);

      // Save the generated HTML
      const outputPath = path.join(BUILD_DIR, `product-${product.id}.html`);
      await fs.writeFile(outputPath, dom.serialize(), "utf-8");
    } catch (error) {
      console.error(`Error generating page for product ${product.id}:`, error);
    }
  }
}

// Generate index page with categorized products
async function modifyIndexPage(categories, products) {
  console.log(products[0]);
  console.log("Generating index page with categorized products...");
  const indexPath = path.join(BUILD_DIR, "index.html");
  const indexContent = await fs.readFile(indexPath, "utf-8");
  const dom = new JSDOM(indexContent);
  const document = dom.window.document;

  // Create and inject the slider script
  const sliderScript = document.createElement("script");
  sliderScript.textContent = `
    let touchStartX = 0;
    let touchEndX = 0;

    function initializeSliders() {
      document.querySelectorAll('.slider').forEach(slider => {
        const sliderId = slider.id;
        const sliderWidth = slider.offsetWidth;
        const children = slider.children;
        const childWidth = children[0].offsetWidth;
        const totalWidth = children.length * childWidth;
        
        // Adjust last slide margin
        slider.lastElementChild.style.marginRight = '0';
        const visibleSlides = Math.ceil(sliderWidth / childWidth);
        const targetWidth = visibleSlides * childWidth;
        const marginRight = childWidth - targetWidth + sliderWidth;
        slider.lastElementChild.style.marginRight = marginRight + 'px';

        // hide nav buttons if total content width is less than slider width
        if (totalWidth <= sliderWidth) {
          document.getElementById('nav-' + sliderId + '-left').style.display = 'none';
          document.getElementById('nav-' + sliderId + '-right').style.display = 'none';
        }

        // Add touch event listeners
        slider.addEventListener('touchstart', handleTouchStart);
        slider.addEventListener('touchend', handleTouchEnd);
      });
    }

    function handleTouchStart(event) {
      touchStartX = event.touches[0].clientX;
    }

    function handleTouchEnd(event) {
      touchEndX = event.changedTouches[0].clientX;
      handleSwipe(event.currentTarget);
    }

    function handleSwipe(slider) {
      const swipeThreshold = 50; // minimum distance for a swipe
      const swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) > swipeThreshold) {
        // Negative swipeDistance means swipe left, positive means swipe right
        const direction = swipeDistance > 0 ? -1 : 1;
        scrollSlider(slider.id, direction);
      }
    }

    function scrollSlider(sliderId, direction) {
      const slider = document.getElementById(sliderId);
      const slideWidth = slider.querySelector('.slide').offsetWidth;
      slider.scrollBy({
        left: slideWidth * direction,
        behavior: 'smooth'
      });
    }

    // Initialize sliders when the page loads
    window.addEventListener('load', initializeSliders);
    // Also initialize when window is resized
    window.addEventListener('resize', initializeSliders);
  `;

  // Find the closing body tag and insert the script before it
  const body = document.querySelector("body");
  body.insertBefore(sliderScript, body.lastElementChild);

  // Find the products placeholder div
  const productsPlaceholder = document.getElementById("products-placeholder");
  if (!productsPlaceholder) {
    console.warn("Products placeholder not found in index.html");
    return;
  }

  // Clear existing content
  productsPlaceholder.innerHTML = "";

  // Generate content for each category
  categories.forEach((category, categoryIndex) => {
    // Create category row
    const categoryRow = document.createElement("div");
    categoryRow.className = "category-row";
    categoryRow.id = `category-${category.id}`;

    // Add category title
    const categoryTitle = document.createElement("h2");
    categoryTitle.className = "category-title";
    categoryTitle.textContent = category.name;
    categoryRow.appendChild(categoryTitle);

    // Create slider container
    const sliderContainer = document.createElement("div");
    sliderContainer.className = "slider-container";

    // Create slider
    const slider = document.createElement("div");
    slider.className = "slider";
    const sliderId = `slider-${categoryIndex}`;
    slider.id = sliderId;

    // Filter products for this category and create slides
    const categoryProducts = products.filter(
      (product) => product.category.id === category.id
    );

    categoryProducts.forEach((product, i) => {
      const slide = document.createElement("div");
      slide.className = "slide";

      // Create product content
      const productLink = document.createElement("a");
      productLink.href = `product-${product.id}.html`;
      productLink.className = "wow fadeInUp";
      productLink.setAttribute("data-wow-delay", `${i * 0.1}s`);

      const productImage = document.createElement("img");
      productImage.src = product.images[0];
      productImage.alt = product.name;
      productImage.className = "img-fluid mb-3";

      const productDescription = document.createElement("div");
      productDescription.className = "product-description";
      const productTitle = document.createElement("h5");
      productTitle.textContent = product.name;
      productTitle.className = "product-title";
      productDescription.appendChild(productTitle);

      const productDescriptionText = document.createElement("p");
      productDescriptionText.className = "product-description-text";
      productDescriptionText.textContent = product.description;
      productDescription.appendChild(productDescriptionText);

      // Assemble product slide
      productLink.appendChild(productImage);
      productLink.appendChild(productDescription);
      slide.appendChild(productLink);

      slider.appendChild(slide);
    });

    // Add navigation buttons
    const leftButton = document.createElement("button");
    leftButton.id = `nav-${sliderId}-left`;
    leftButton.className = "nav-button left";
    leftButton.innerHTML = "&#10094;";
    leftButton.setAttribute("onclick", `scrollSlider('${sliderId}', -1)`);

    const rightButton = document.createElement("button");
    rightButton.id = `nav-${sliderId}-right`;
    rightButton.className = "nav-button right";
    rightButton.innerHTML = "&#10095;";
    rightButton.setAttribute("onclick", `scrollSlider('${sliderId}', 1)`);

    // Assemble slider container
    sliderContainer.appendChild(leftButton);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(rightButton);

    // Add slider container to category row
    categoryRow.appendChild(sliderContainer);

    // Add category row to products placeholder
    productsPlaceholder.appendChild(categoryRow);
  });

  // Save the modified index.html
  await fs.writeFile(indexPath, dom.serialize(), "utf-8");
}

// Main function to run everything
async function generateAllPages() {
  try {
    console.log("Starting page generation process...");

    // Clean and recreate build directory
    await cleanBuild();

    // Ensure directories exist
    await ensureDirectories();

    // Copy static files first
    await copyStaticFiles();

    // Fetch products data
    const { products, categories } = await fetchProducts();

    // Extract unique categories
    // const categories = [...new Set(products.map((p) => p.category.id))].map(
    //   (id) => ({
    //     id,
    //     name: products.find((p) => p.category.id === id).category.name,
    //   })
    // );

    // Generate all pages
    await Promise.all([
      generateComponents(categories, products),
      // generateCategoryPages(categories, products),
      generateProductPages(products),
      modifyIndexPage(categories, products),
    ]);

    console.log("Successfully generated all pages!");
  } catch (error) {
    console.error("Error generating pages:", error);
    process.exit(1);
  }
}

// Run the script
generateAllPages();
