const axios = require("axios");

const testLogin = async () => {
  const url = "http://localhost:3000/api/auth/login";
  const credentials = {
    email: "db.sales@agentx.com",
    password: "Sales@123",
  };

  try {
    const response = await axios.post(url, credentials);
    console.log("Login Success!");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Login Failed!");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }
  }
};

testLogin();
