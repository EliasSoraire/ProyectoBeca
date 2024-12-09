const mongoose = require('mongoose');

const mobiliarioSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  cantidad: { type: Number, required: true }
});

module.exports = mongoose.model('Mobiliario', mobiliarioSchema);