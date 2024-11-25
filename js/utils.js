const API = {
  async get(endpoint) {
    try {
      const response = await fetch(endpoint);
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async loadAllData(endpoints) {
    try {
      const dataArray = await Promise.all(
        endpoints.map((endpoint) => fetch(endpoint).then((r) => r.json()))
      );

      return dataArray;
    } catch (error) {
      console.error("Error loading data:", error);
    }
  },

  async post(endpoint, data) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },
};
