const fs = require("fs").promises;
const path = require("path");
const { JSDOM } = require("jsdom");

// Constants for file paths
const BUILD_DIR = path.join(__dirname, "../build");
const BUILD_JS_DIR = path.join(BUILD_DIR, "js");
const COMPONENTS_TEMPLATE_PATH = path.join(__dirname, "../js/components.js");
const CATEGORY_TEMPLATE_PATH = path.join(
  __dirname,
  "../product-category-template.html"
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

  const jsonData = JSON.parse(decodedData);

  const jsObject = JSON.parse(jsonData);

  jsObject.price = jsObject.price.split(",")[0];

  return jsObject;
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
      file !== "product-detail-template.html" &&
      file !== "product-category-template.html"
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

  //   const response = await fetch(
  //     "https://wait.mi-great.com.tw/yp/api/products.asp"
  //   );

  const response = await fetch("https://17go.com.tw/api/products.asp");

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

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
}

// Generate products details
async function getProductsDetails(products) {
  const productsDetails = [];

  // console.log("wtf", products);

  const promises = products.map((product) => {
    return (
      // fetch(
      //   `https://wait.mi-great.com.tw/yp/api/Details.asp?product=${product.id}`
      // )
      fetch(`https://17go.com.tw/api/Details.asp?product=${product.id}`)
        .then((response) => response.text())
        .then((textData) => {
          const detailedProduct = cleanJSONData(textData);

          return {
            ...detailedProduct,
            id: product.id,
          };
        })
    );
  });

  const results = await Promise.allSettled(promises);

  return results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter(Boolean);
}

// Generate components.js with category dropdown
async function generateComponents(categories, products) {
  const componentsContent = await fs.readFile(
    COMPONENTS_TEMPLATE_PATH,
    "utf-8"
  );

  // Generate dropdown content with categories as headers and products as links
  const dropdownContent = categories
    .map((category) => {
      const categoryProducts = products.filter(
        (p) => p.category.id === category.id
      );
      return `
          <a href="/category-${category.id}" class="dropdown-header">${category.name}</a>
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
      // const response = await fetch(
      //   `https://wait.mi-great.com.tw/yp/api/Details.asp?product=${product.id}`
      // );
      const response = await fetch(
        `https://17go.com.tw/api/Details.asp?product=${product.id}`
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
        "#breadcrumb-category"
      ).innerHTML = `<a href="/category-${product.category.id}">${product.category.name}</a>`;
      doc.querySelector("#breadcrumb-product-name").textContent =
        detailedProduct.a_name;

      const productImageSrcArray = detailedProduct.imgSrc || [];

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

      // Add product description
      const descriptionHtml = `
          <h5>介紹</h5>
          <p class="mb-0 product-contents">${detailedProduct.contents}</p>
      `;

      // Update the left column with gallery and description
      const leftColumn = doc.querySelector(
        "#product-image-and-description-container"
      );
      leftColumn.innerHTML = galleryHtml + descriptionHtml;

      if (detailedProduct.roomno === "hm6991") console.log(detailedProduct);

      // Update features container
      const featuresContainer = doc.getElementById("features-container");
      featuresContainer.innerHTML = `
        <div class="d-flex mb-4">
          <div class="flex-shrink-0 btn-square bg-primary rounded-circle">
            <i class="fa fa-check text-white"></i>
          </div>
          <div class="ms-4">
            <h5>型號</h5>
            <p class="mb-0 product-model">${detailedProduct.roomno}</p>
          </div>
        </div>
        <div class="d-flex mb-4">
          <div class="flex-shrink-0 btn-square bg-primary rounded-circle">
            <i class="fa fa-check text-white"></i>
          </div>
          <div class="ms-4">
            <h5>價格</h5>
            <p class="mb-0 product-price">NT$ ${detailedProduct.price}</p>
          </div>
        </div>
      `;

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

// Generate category pages
async function generateCategoryPages(categories, products) {
  const categoryTemplate = await fs.readFile(CATEGORY_TEMPLATE_PATH, "utf-8");

  const productsDetails = await getProductsDetails(products);

  // console.log("Generated products details:", productsDetails);

  // Create category pages for each category
  for (const category of categories) {
    try {
      let categoryContent = categoryTemplate;
      const dom = new JSDOM(categoryContent);
      const doc = dom.window.document;

      // Update category details in template
      doc.title = `湧沛淨水 - ${category.name}`;
      doc.querySelector("#category-name").textContent = category.name;
      doc.querySelector("#breadcrumb-category").textContent = category.name;
      doc.querySelector("#category-title").textContent = category.name;
      doc.querySelector(
        "#category-description"
      ).textContent = `探索我們的${category.name}系列產品`;

      // Clear the product container
      const productsContainer = doc.querySelector("#products-container");
      productsContainer.innerHTML = "";

      // Filter products for this category
      const categoryProducts = products.filter(
        (product) => product.category.id === category.id
      );

      // Add products to the container
      categoryProducts.forEach((product, index) => {
        const productCard = doc.createElement("div");
        productCard.className = "col-lg-4 col-md-6 wow fadeInUp";
        productCard.setAttribute("data-wow-delay", `${0.1 * (index + 1)}s`);

        const foundProduct = productsDetails.find((p) => p.id === product.id);
        const productPrice = foundProduct?.price;
        const productNo = foundProduct?.roomno;

        const productDescription = doc.createElement("div");
        productDescription.className = "product-description";

        const productTitle = doc.createElement("h5");
        productTitle.textContent = product.name;
        productTitle.className = "product-title";
        productDescription.appendChild(productTitle);

        const priceContainer = doc.createElement("div");
        priceContainer.style.marginTop = "8px";

        const roomNumber = doc.createElement("div");
        roomNumber.className = "room-number";
        roomNumber.style.color = "#666";
        roomNumber.style.textAlign = "left";
        roomNumber.textContent = `Room ${productNo || "N/A"}`;

        const productPriceElement = doc.createElement("div");
        productPriceElement.className = "product-price";
        productPriceElement.style.color = "#2c5282";
        productPriceElement.style.textAlign = "right";
        productPriceElement.textContent = `$ ${productPrice}`;

        priceContainer.appendChild(roomNumber);
        priceContainer.appendChild(productPriceElement);
        productDescription.appendChild(priceContainer);

        const productImage = doc.createElement("img");
        productImage.src = product.images[0];
        productImage.alt = product.name;
        productImage.className = "img-fluid mb-3";

        const productLink = doc.createElement("a");
        productLink.href = `product-${product.id}.html`;
        productLink.appendChild(productImage);
        productLink.appendChild(productDescription);

        productCard.appendChild(productLink);

        productsContainer.appendChild(productCard);
      });

      // Save the category page
      const categoryFileName = `category-${category.id}.html`;
      const outputPath = path.join(BUILD_DIR, categoryFileName);
      await fs.writeFile(outputPath, dom.serialize(), "utf-8");
    } catch (error) {
      console.error(
        `Error generating category page for ${category.name}:`,
        error
      );
    }
  }
}

// Generate index page with categorized products
async function modifyIndexPage(categories, products) {
  // console.log(categories, products);
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

  const productsDetails = await getProductsDetails(products);
  for (const p of productsDetails) {
    if (p.id === 11) console.log(p);
  }

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

    for (const c of categoryProducts) {
      if (category.id === 2) console.log(c);
    }

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

      const priceContainer = document.createElement("div");
      priceContainer.style.marginTop = "8px";

      const roomNumber = document.createElement("div");
      roomNumber.className = "room-number";
      roomNumber.style.color = "#ddd";
      roomNumber.style.textAlign = "left";
      roomNumber.textContent = productsDetails.find(
        (p) => p.id === product.id
      )?.roomno;

      const productPrice = document.createElement("div");
      productPrice.className = "product-price";
      productPrice.style.color = "#eee";
      productPrice.style.textAlign = "right";
      productPrice.textContent = `$ ${
        productsDetails.find((p) => p.a_name === product.name)?.price
      }`;

      priceContainer.appendChild(roomNumber);
      priceContainer.appendChild(productPrice);
      productDescription.appendChild(priceContainer);

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

    //  Generate all pages
    await Promise.all([
      generateComponents(categories, products),
      generateProductPages(products),
      generateCategoryPages(categories, products),
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
