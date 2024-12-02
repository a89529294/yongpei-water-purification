const Components = {
  navbar: {
    template: `
            <nav class="navbar navbar-expand-lg bg-white navbar-light sticky-top p-0 px-4 px-lg-5">
        <a href="index.html" class="navbar-brand d-flex align-items-center">
            <h2 class="m-0 text-primary"><img class="img-fluid me-2" src="img/custom/logo.jpg" alt=""
                    style="width: 45px;">湧沛淨水</h2>
        </a>
        <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarCollapse">
            <div class="navbar-nav ms-auto py-4 py-lg-0">
                <a href="index.html" class="nav-item nav-link">首頁</a>
                <a href="about.html" class="nav-item nav-link">關於</a>
                <a href="service.html" class="nav-item nav-link">服務項目</a>
                <a href="new-products.html" class="nav-item nav-link">最新產品</a>
                <div class="nav-item dropdown">
                    <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">產品分類</a>
                    <div class="dropdown-menu shadow-sm m-0">
                        <a href="category-1.html" class="dropdown-item">分類一</a>
                        <a href="category-2.html" class="dropdown-item">分類二</a>
                    </div>
                </div>
                <a href="contact.html" class="nav-item nav-link">聯絡方式</a>
            </div>
            <div class="h-100 d-lg-inline-flex align-items-center d-none">
                <a class="btn btn-square rounded-circle bg-light text-primary me-2" href=""><i
                        class="fab fa-facebook-f"></i></a>
                <a class="btn btn-square rounded-circle bg-light text-primary me-2" href=""><i
                        class="fab fa-twitter"></i></a>
                <a class="btn btn-square rounded-circle bg-light text-primary me-0" href=""><i
                        class="fab fa-linkedin-in"></i></a>
            </div>
        </div>
    </nav>
        `,
    mount: function (targetId) {
      document.getElementById(targetId).innerHTML = this.template;
    },
    highlightCurrentPage: function () {
      const currentPage =
        window.location.pathname.split("/").pop() || "index.html";
      const activeLink = document.querySelector(
        `.nav-link[href="${currentPage}"]`
      );
      if (activeLink) {
        activeLink.classList.add("active");
      }
    },
  },

  footer: {
    template: `
            <footer class="footer mt-5 py-3 bg-light">
                <!-- footer content -->
            </footer>
        `,
    mount: function (targetId) {
      document.getElementById(targetId).innerHTML = this.template;
    },
  },

  init: function () {
    this.navbar.mount("navbar-placeholder");
    this.navbar.highlightCurrentPage();
    // this.footer.mount("footer-placeholder");
  },
};

document.addEventListener("DOMContentLoaded", () => Components.init());
