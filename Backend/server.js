require("dotenv").config();

const app = require("./app");
const db = require("./src/db/db.js");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Runnning on Port ${PORT}`);
});
