const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("trust proxy", 1);

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.listen(port, () => {
  console.log("Listen to port: " + port);
});
