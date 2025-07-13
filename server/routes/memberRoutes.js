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
        const { name, email, phone, plan } = req.body;
        const newMember = new Member({name, email, phone, plan});
        const saved = await newMember.save();
        res.json('saved').status(201);
    }
    catch (err) {
        console.log(err);
    }
})

// router.post('/seed', async (req, res) => {
//   await Member.insertMany(dummyData);
//   res.send("Seeded!");
// });


module.exports = router;
