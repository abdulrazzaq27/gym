const express = require('express');
const router = express.Router();
const Member = require('../models/Member')
const dummyData = require('../data/dummy');

router.get('/', async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    }
    catch (err) {
        console.log("Error retreiving Members", err);
    }
});

router.post('/', async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    console.error("Error creating member:", err);
    res.status(500).json({ message: "Failed to create member" });
  }
});


// router.post('/seed', async (req, res) => {
//   await Member.insertMany(dummyData);
//   res.send("Seeded!");
// });


module.exports = router;
