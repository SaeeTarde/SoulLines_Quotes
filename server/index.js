import { app } from "./app.js";
import dotenv from "dotenv";
import connect_DB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 7001;

connect_DB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongodb connection error!", err);
  });
