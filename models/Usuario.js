const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

usuarioSchema.methods.comparePassword = function(candidatePassword) {
  return this.password === candidatePassword;
};

module.exports = mongoose.model('Usuario', usuarioSchema);