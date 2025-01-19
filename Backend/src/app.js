import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

// middlewares 
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

// import routs
import patientDetails from "./routes/patientDetails.route.js"
import dietPlan from "./routes/dietPlan.route.js"
import pantryStaff from "./routes/pantry-staff.route.js"
import mealPreparation from "./routes/mealPreparation.route.js"
import deliveryPerson from "./routes/delivery-person.route.js"
import mealDelivery from "./routes/mealDelivery.route.js"

// route declaration
app.use("/api/v1/patient-details", patientDetails)
app.use("/api/v1/diet-plan", dietPlan)
app.use("/api/v1/pantry-staff", pantryStaff)
app.use("/api/v1/meal-preparation", mealPreparation)
app.use("/api/v1/delivery-person", deliveryPerson)
app.use("/api/v1/meal-delivery", mealDelivery)

export {app}