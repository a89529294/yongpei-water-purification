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
                <div  class="nav-item dropdown">
                    <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">產品分類</a>
                    <div id='category-dropdown-content' class="dropdown-menu dropdown-menu-end">
                       
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

      if (currentPage.startsWith("category")) {
        const categoryParent = document.querySelector(".nav-item.dropdown");

        categoryParent.classList.add("active");
        const activeCategoryLink = document.querySelector(
          `.dropdown-item[href="${currentPage}"]`
        );

        if (activeCategoryLink) activeCategoryLink.classList.add("active");
      } else {
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }
    },
  },

  footer: {
    template: `
            <div class="container-fluid bg-light footer mt-2 pt-0 pt-md-2 wow fadeIn" data-wow-delay="0.1s">
        <div class="container py-5">
            <div class="row g-5">
                <div class="col-md-6">
                    <h1 class="text-primary mb-4"><img class="img-fluid me-2" src="img/custom/logo.jpg" alt=""
                            style="width: 45px;">湧沛淨水</h1>
                    <span>專注於水質淨化與水資源永續發展，為客戶提供最專業、最安全的水處理解決方案。我們相信乾淨的水是生命的根本，致力於改善水質，守護健康。</span>
                </div>
                <div class="col-md-6">
                    <h5 class="mb-4">訂閱最新資訊</h5>
                    <p>留下您的電子郵件，獲取水處理最新技術和服務資訊。</p>
                    <div class="position-relative">
                        <input class="form-control bg-transparent w-100 py-3 ps-4 pe-5" type="text" placeholder="你的信箱">
                        <button type="button"
                            class="btn btn-primary py-2 px-3 position-absolute top-0 end-0 mt-2 me-2">訂閱</button>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6">
                    <h5 class="mb-4">聯絡我們</h5>
                    <p><i class="fa fa-map-marker-alt me-3"></i>台北市信義區大安路123號</p>
                    <p><i class="fa fa-phone-alt me-3"></i>+886 2 1234 5678</p>
                    <p><i class="fa fa-envelope me-3"></i>service@watertechnology.com.tw</p>
                </div>
                <div class="col-lg-3 col-md-6">
                    <h5 class="mb-4">我們的服務</h5>
                    <a class="btn btn-link" href="">家用淨水系統</a>
                    <a class="btn btn-link" href="">商業淨水解決方案</a>
                    <a class="btn btn-link" href="">水質檢測服務</a>
                    <a class="btn btn-link" href="">濾水設備維護</a>
                </div>
                <div class="col-lg-3 col-md-6">
                    <h5 class="mb-4">快速連結</h5>
                    <a class="btn btn-link" href="about.html">關於我們</a>
                    <a class="btn btn-link" href="contact.html">聯絡我們</a>
                    <a class="btn btn-link" href="service.html">服務項目</a>
                    <!-- <a class="btn btn-link" href="">Terms & Condition</a> -->
                </div>
                <div class="col-lg-3 col-md-6">
                    <h5 class="mb-4">追蹤我們</h5>
                    <div class="d-flex">
                        <a class="btn btn-square rounded-circle me-1" href=""><i class="fab fa-twitter"></i></a>
                        <a class="btn btn-square rounded-circle me-1" href=""><i class="fab fa-facebook-f"></i></a>
                        <a class="btn btn-square rounded-circle me-1" href=""><i class="fab fa-youtube"></i></a>
                        <a class="btn btn-square rounded-circle me-1" href=""><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-fluid copyright">
            <div class="container">
                <div class="row">
                    <div class="col-md-6 text-center text-md-start mb-3 mb-md-0">
                        &copy; <a href="#">湧沛淨水</a>, All Right Reserved.
                    </div>
                </div>
            </div>
        </div>
    </div>
        `,
    mount: function (targetId) {
      document.getElementById(targetId).innerHTML = this.template;
    },
  },

  init: function () {
    this.navbar.mount("navbar-placeholder");
    this.navbar.highlightCurrentPage();
    this.footer.mount("footer-placeholder");
  },
};

document.addEventListener("DOMContentLoaded", () => Components.init());
