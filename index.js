var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/Database");
var db = mongoose.connection;
db.on("error", () => console.log("Error in connecting to database"));
db.once("open", () => console.log("Connected to database"));

// Signup route
app.post("/sign_up", (req, res) => {
  var name = req.body.name;
  var age = req.body.age;
  var email = req.body.email;
  var phone = req.body.phone;
  var gender = req.body.gender;
  var password = req.body.password;

  var data = {
    name: name,
    age: age,
    email: email,
    phone: phone,
    gender: gender,
    password: password,
  };
  db.collection("users").insertOne(data, (err, collection) => {
    if (err) {
      throw err;
    }
    console.log("Record inserted successfully");
  });
  return res.redirect("signupsuccess.html");
});

// Login route
app.post("/login", (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  db.collection("users").findOne({ email: email }, (err, user) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).send("Error fetching user");
    }
    if (!user) {
      return res.status(401).send("Invalid email or password");
    }
    if (user.password !== password) {
      return res.status(401).send("Invalid email or password");
    }
    console.log("User  logged in successfully");
    return res.redirect("signupsuccess.html");
  });
});

// Appointment booking route
app.post("/book_appointment", (req, res) => {
  const { fullName, email, phone, doctor, date, time, reason } = req.body;

  // Basic validation
  if (!fullName || !email || !doctor || !date || !time) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Validate date is not in the past
  const appointmentDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    return res.status(400).json({ error: "Appointment date cannot be in the past." });
  }

  const appointmentData = {
    fullName,
    email,
    phone: phone || "N/A",
    doctor,
    date,
    time,
    reason: reason || "N/A",
    createdAt: new Date(),
  };

  db.collection("appointments").insertOne(appointmentData, (err, result) => {
    if (err) {
      console.error("Error inserting appointment:", err);
      return res.status(500).json({ error: "Failed to book appointment." });
    }
    console.log("Appointment booked successfully");
    return res.json({
      message: "Booking confirmed",
      appointment: appointmentData,
    });
  });
});

// Root route
app.get("/", (req, res) => {
  res.set({
    "Allow-access-Allow-origin": "*",
  });
  return res.redirect("index.html");
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});