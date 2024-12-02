const Category1Page = {
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
      const response = await fetch("/api/data");
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

document.addEventListener("DOMContentLoaded", () => Category1Page.init());
