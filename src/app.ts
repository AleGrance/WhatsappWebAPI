import "dotenv/config"
import express from "express"
import cors from "cors"
import routes from "./infrastructure/router"
const port = process.env.PORT || 3001
const app = express()
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(cors())
app.use(express.json())
app.use(`/`,routes)

app.listen(port, () => console.log(`Ready...${port}`))