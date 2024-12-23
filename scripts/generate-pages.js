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
      const price = parseInt(product.price.replace(/[^0-9]/g, ""));

      return {
        id: productId++,
        name: product.a_name,
        description: product.sub_title || product.title,
        features: [
          { title: "型號", description: product.roomno },
          { title: "價格", description: `NT$ ${price}` },
        ],
        specifications: [
          { title: "訂單數", description: `${product.orders} 筆` },
        ],
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

  // Generate dropdown content with categories as headers and products as links
  const dropdownContent = categories
    .map((category) => {
      const categoryProducts = products.filter(
        (p) => p.category.id === category.id
      );
      return `
          <div class="dropdown-header">${category.name}</div>
          ${
            categoryProducts.length > 3
              ? [
                  ...categoryProducts
                    .slice(0, 3)
                    .map(
                      (product) =>
                        `<a href="product-${product.id}.html" class="dropdown-item">${product.name}</a>`
                    ),
                  `<a href=${`#category-${category.id}`} class="dropdown-item">更多...</a>`,
                ].join("\n")
              : categoryProducts
                  .map(
                    (product) =>
                      `<a href="product-${product.id}.html" class="dropdown-item">${product.name}</a>`
                  )
                  .join("\n")
          }`;
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

// Generate category pages
async function generateCategoryPages(categories, products) {
  const categoryTemplate = await fs.readFile(CATEGORY_TEMPLATE_PATH, "utf-8");
  // console.log(categories, products);

  for (const category of categories) {
    const categoryProducts = products.filter(
      (p) => p.category.id === category.id
    );

    // Generate product cards HTML
    const productsHtml = categoryProducts
      .map(
        (product) => `
            <div class="col-6 col-md-3 wow fadeIn" data-wow-delay="0.1s">
                <div class="bg-light text-center p-3 product-card">
                    <img class="img-fluid mb-3" src="${
                      product.images[0]
                    }" alt="${product.name}"
                        style="height: 100px; object-fit: contain;">
                    <h5 class="mb-1 product-title">${product.name}</h5>
                    <p class="text-muted mb-2 truncate-2">${product.description.substring(
                      0,
                      100
                    )}...</p>
                    <a class="btn btn-sm btn-primary" href="product-${
                      product.id
                    }.html">查看細節</a>
                </div>
            </div>
        `
      )
      .join("\n");

    // Use JSDOM to manipulate the HTML content
    const dom = new JSDOM(categoryTemplate);
    const doc = dom.window.document;
    doc.getElementById("products-container").innerHTML = productsHtml;

    // Serialize the document back to a string
    const categoryContent = dom.serialize();

    await fs.writeFile(
      path.join(BUILD_DIR, `category-${category.id}.html`),
      categoryContent
    );
  }
}

// Generate individual product pages
async function generateProductPages(products) {
  const productTemplate = await fs.readFile(PRODUCT_TEMPLATE_PATH, "utf-8");

  for (const product of products) {
    let productContent = productTemplate;

    // Generate features HTML
    const featuresHtml = product.features
      .map(
        (feature) => `
          <div class="d-flex mb-4">
            <div class="flex-shrink-0 btn-square bg-primary rounded-circle">
              <i class="fa fa-check text-white"></i>
            </div>
            <div class="ms-4">
              <h5>${feature.title}</h5>
              <p class="mb-0">${feature.description}</p>
            </div>
          </div>
        `
      )
      .join("\n");

    // Generate specifications HTML
    const specificationsHtml = product.specifications
      .map(
        (spec) => `
          <div class="col-sm-6 mb-2">
            <h5>${spec.title}</h5>
            <p class="mb-0">${spec.description}</p>
          </div>
        `
      )
      .join("\n");

    // Get random images (10-13) and combine with product image
    const randomImageCount = Math.floor(Math.random() * 10) + 5; // Random number between 9 and 14
    const allImages = [product.images[0], ...getRandomImages(randomImageCount)];

    const dom = new JSDOM(productContent);
    const doc = dom.window.document;

    // Create gallery HTML
    const galleryHtml = `
      <div class="product-gallery">
        <div class="gallery-main mb-3">
          <img id="mainImage" src="${allImages[0]}" alt="${
      product.name
    } - Main Image" class="img-fluid">
        </div>
        <div class="gallery-thumbs-container">
        <button class="nav-btn prev" onclick="scrollGallery(-1)">
            <i class="bi bi-chevron-left"></i>
          </button>
        <div class="gallery-thumbs">
            <div class="thumb-container" id="thumbContainer">
            ${allImages
              .map(
                (img, index) => `
                <div class="thumb${
                  index === 0 ? " active" : ""
                }" onclick="selectImage(this, '${img}')">
                  <img src="${img}" alt="${product.name} - Thumbnail ${
                  index + 1
                }">
                </div>
              `
              )
              .join("")}
          </div>

          
        </div>
        <button class="nav-btn next" onclick="scrollGallery(1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    `;

    // Create gallery script
    const galleryScript = `
      <script>
        let currentScrollPosition = 0;
        const thumbWidth = document.querySelector('.thumb').offsetWidth + 10;
        const visibleThumbs = 6;

        function selectImage(thumb, imgSrc) {
          document.getElementById('mainImage').src = imgSrc;
          document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        }

        function scrollGallery(direction) {
          const container = document.getElementById('thumbContainer');
          const maxScroll = Math.max(0, (${allImages.length} - visibleThumbs) * thumbWidth);
          
          currentScrollPosition = Math.max(0, Math.min(maxScroll, currentScrollPosition + direction * thumbWidth));
          container.style.transform = \`translateX(-\${currentScrollPosition}px)\`;
          
          // Update button states
          document.querySelector('.prev').disabled = currentScrollPosition === 0;
          document.querySelector('.next').disabled = currentScrollPosition >= maxScroll;
        }

        function initGallery() {
          // Initial button state
          document.querySelector('.prev').disabled = true;
          document.querySelector('.next').disabled = ${allImages.length} <= visibleThumbs;
        }

        window.addEventListener('load', initGallery);
      </script>
    `;

    // Add gallery styles
    const galleryStyles = `
      <style>
        .product-gallery {
          max-width: 100%;
          margin: 0 auto;
          padding: 0 15px;
        }
        .gallery-main {
          width: 100%;
          height: 500px; 
          margin-bottom: 1rem;
        }
        @media (max-width: 768px) {
          .gallery-main {
            height: 300px;
          }
        }
        .gallery-main img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .gallery-thumbs-container {
          position: relative;
          max-width: 100%;
          margin: 0 auto;
        }
        .gallery-thumbs {
          width: 600px;
          max-width: calc(100% - 80px);
          margin: 0 auto;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        @media (max-width: 768px) {
          .gallery-thumbs {
            width: 100%;
          }
          .thumb {
            width: 60px !important;
            height: 60px !important;
          }
        }
        .thumb-container {
          width: 100%;
          display: flex;
          gap: 10px;
          transition: transform 0.3s ease;
        }
        .thumb {
          flex: 0 0 auto;
          width: 80px;
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
        @media (min-width: 769px) {
          .nav-btn.prev {
            left: -40px;
          }
          .nav-btn.next {
            right: -40px;
          }
        }
      </style>
    `;

    // Update the content
    const productGallery = doc.querySelector(".product-gallery");
    if (productGallery) {
      productGallery.outerHTML = galleryHtml;
    }

    // Add script and styles to head
    const head = doc.querySelector("head");
    head.insertAdjacentHTML("beforeend", galleryStyles);

    // Add script before closing body tag
    const body = doc.querySelector("body");
    body.insertAdjacentHTML("beforeend", galleryScript);

    doc.getElementById("features-container").innerHTML = featuresHtml;

    // Update title
    const titleElement = doc.querySelector("title");
    if (titleElement) titleElement.textContent = `湧沛淨水 - ${product.name}`;

    // Serialize the document back to a string
    let productString = dom.serialize();

    // Replace any remaining placeholders
    productString = productString
      .replace("產品名稱", product.name)
      .replace(
        "產品詳細描述將在這裡顯示。這裡可以包含產品的主要特點、用途和優勢等信息。",
        product.description
      )
      .replace(
        /<!-- Specifications Content -->[\s\S]*?<!-- End Specifications Content -->/m,
        specificationsHtml
      );

    await fs.writeFile(
      path.join(BUILD_DIR, `product-${product.id}.html`),
      productString
    );
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
