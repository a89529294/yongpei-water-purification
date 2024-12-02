const IndexPage = {
  init: function () {
    this.bindEvents();
    this.loadInitialData();
  },

  bindEvents: function () {
    // Add your event listeners here
    // document
    //   .querySelector("#someButton")
    //   .addEventListener("click", this.handleClick);
  },

  loadInitialData: async function () {
    try {
      console.log("...");
      const response = await fetch("http://localhost:3000/api/test");
      const text = await response.text();
      console.log(text);

      // const response = await fetch("https://acdev.lol/api/test");
      // const text = await response.text();
      // console.log(text);

      // const data = await response.json();
      // Handle data
    } catch (error) {
      console.error("Error:", error);
    }
  },

  handleClick: function (e) {
    // Handle click events
  },
};

document.addEventListener("DOMContentLoaded", () => IndexPage.init());
