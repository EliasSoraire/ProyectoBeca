const mongoose = require('mongoose');

const tesinaSchema = new mongoose.Schema({
  nombreAutor: { type: String, required: true },
  nombreTesina: { type: String, required: true },
  año: { type: Number, required: true },
  carrera: { type: String, required: true },
  tipo: { type: String, default: 'Tesina' }
});

module.exports = mongoose.model('Tesina', tesinaSchema);