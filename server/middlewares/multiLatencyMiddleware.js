const express = require('express')
const app = express();

app.use((req, res, next) => {
  if (req.user) {
    req.adminId = req.user.id;
  }
  next();
});