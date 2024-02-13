import * as dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { connectToDatabase } from "./database";
import { employeeRouter } from "./employee.routes";
import { userRoute } from "./routes/users.routes";
import { adminRoute } from "./routes/admin.routes";
import bodyParser from "body-parser";
import { candidateRoute } from "./routes/candidates.routes";
 
// Load environment variables from the .env file, where the ATLAS_URI is configured
dotenv.config();
 
const { ATLAS_URI } = process.env;
 
if (!ATLAS_URI) {
   console.error("No ATLAS_URI environment variable has been defined in config.env");
   process.exit(1);
}
 
connectToDatabase(ATLAS_URI)
   .then(() => {
    //    const express = require("express");
       const app = express();
       const fileUpload = require('express-fileupload')
       app.use(cors());

       app.use("/employees", employeeRouter);
       app.use("/api", userRoute);
       app.use("/candidate", candidateRoute);
       app.use("/admin", adminRoute);
       app.use(express.static("uploads"));
       app.use(express.urlencoded({ extended: true }))
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({
      extended: false
      }));
       app.use(fileUpload())
 
       // start the Express server
       app.listen(5200, () => {
           console.log(`Server running at http://localhost:5200...`);
       });
 
   })
   .catch(error => console.error(error));