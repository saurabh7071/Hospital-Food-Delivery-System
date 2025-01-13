import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// middlewares 
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

// import routs
import patientDetails from "./routes/patientDetails.route.js"

// route declaration
app.use("/api/v1/patient-details", patientDetails)

export {app}