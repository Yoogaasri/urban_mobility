const express = require("express");
const router = express.Router();
const Carpool = require("../models/Carpool");
const authMiddleware = require("../middleware/authMiddleware");

// Create a new carpool
router.post("/create", authMiddleware, async (req, res) => {
  const {
    startLocation,
    endLocation,
    seatsAvailable,
    type,
    price,
    date,
    time,
    womendriver,
  } = req.body;
  try {
    const carpool = await Carpool.create({
      host: req.user.id,
      startLocation,
      endLocation,
      seatsAvailable,
      type,
      date,
      time,
      price,
      womendriver,
    });
    res.status(201).json(carpool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all carpools
router.get("/", async (req, res) => {
  try {
    const carpools = await Carpool.find().populate(
      "host participants",
      "name email"
    );
    res.json(carpools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a carpool
router.post("/join/:id", authMiddleware, async (req, res) => {
  try {
    const carpool = await Carpool.findById(req.params.id);
    if (!carpool) return res.status(404).json({ message: "Carpool not found" });

    if (carpool.participants.includes(req.user.id))
      return res
        .status(400)
        .json({ message: "You have already joined this carpool" });

    if (carpool.participants.length >= carpool.seatsAvailable)
      return res.status(400).json({ message: "No seats available" });

    carpool.participants.push(req.user.id);
    await carpool.save();
    res.json(carpool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get carpools hosted or joined by the user
router.get("/user-carpools", authMiddleware, async (req, res) => {
  try {
    // Fetch carpools where the user is the host
    const hostedRides = await Carpool.find({ host: req.user.id }).populate(
      "host participants",
      "name email"
    );

    // Fetch carpools where the user is a participant
    const joinedRides = await Carpool.find({
      participants: req.user.id,
    }).populate("host participants", "name email");

    res.json({ hostedRides, joinedRides });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    // Find the carpool by ID
    const carpool = await Carpool.findById(req.params.id);
    if (!carpool) {
      return res.status(404).json({ message: "Carpool not found" });
    }

    // Ensure the user is the host
    if (carpool.host.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this carpool" });
    }

    // Delete the carpool
    await carpool.deleteOne();
    res.json({ message: "Carpool deleted successfully" });
  } catch (error) {
    console.error("Error deleting carpool:", error); // Log the error
    res
      .status(500)
      .json({ message: "An error occurred while deleting the carpool." });
  }
});

module.exports = router;
