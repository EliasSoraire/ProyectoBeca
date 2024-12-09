const mongoose = require('mongoose');

const proyectoSchema = new mongoose.Schema({
  nombreAutor: { type: String, required: true },
  nombreProyecto: { type: String, required: true },
  año: { type: Number, required: true },
  carrera: { type: String, required: true },
  tipo: { type: String, default: 'Proyecto' }
});

module.exports = mongoose.model('Proyecto', proyectoSchema);