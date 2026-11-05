const express = require("express");

const router = express.Router();

// Import Contact Controller
const { sendContactEmail,} = require("../controllers/contact.controller");

// Contact Form API
router.post("/", sendContactEmail);
    
module.exports = router;