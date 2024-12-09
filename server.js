const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Usuario = require('./models/Usuario');
const Proyecto = require('./models/Proyecto');
const Tesina = require('./models/Tesina');
const Mobiliario = require('./models/Mobiliario');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB conectado'))
  .catch((error) => console.error('Error al conectar a MongoDB:', error));

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Token no proporcionado.');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findOne({ _id: decoded._id });

    if (!usuario) throw new Error('Usuario no encontrado.');

    req.token = token;
    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Autenticación requerida.' });
  }
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Inicio.html'));
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ username });
    if (!usuario || usuario.password !== password) {
      return res.status(401).send({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.send({ usuario, token });
  } catch (error) {
    res.status(400).send({ error: 'Error al iniciar sesión.' });
  }
});

app.post('/proyectos', auth, async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    await proyecto.save();
    res.status(201).send(proyecto);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/proyectos', auth, async (req, res) => {
  try {
    const proyectos = await Proyecto.find({});
    res.send(proyectos);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/proyectos/:id', auth, async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndDelete(req.params.id);
    if (!proyecto) return res.status(404).send({ error: 'Proyecto no encontrado.' });
    res.send(proyecto);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/tesinas', auth, async (req, res) => {
  try {
    const tesina = new Tesina(req.body);
    await tesina.save();
    res.status(201).send(tesina);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/tesinas', auth, async (req, res) => {
  try {
    const tesinas = await Tesina.find({});
    res.send(tesinas);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/tesinas/:id', auth, async (req, res) => {
  try {
    const tesina = await Tesina.findByIdAndDelete(req.params.id);
    if (!tesina) return res.status(404).send({ error: 'Tesina no encontrada.' });
    res.send(tesina);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/mobiliario', auth, async (req, res) => {
  try {
    const mobiliario = new Mobiliario(req.body);
    await mobiliario.save();
    res.status(201).send(mobiliario);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/mobiliario', auth, async (req, res) => {
  try {
    const mobiliarios = await Mobiliario.find({});
    res.send(mobiliarios);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/mobiliario/:tipo', auth, async (req, res) => {
  try {
    const { tipo } = req.params;
    const { cantidad } = req.body;
    const mobiliario = await Mobiliario.findOneAndUpdate(
      { tipo },
      { $inc: { cantidad } },
      { new: true, runValidators: true }
    );
    if (!mobiliario) return res.status(404).send({ error: 'Mobiliario no encontrado.' });
    res.send(mobiliario);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send({ error: 'Error interno del servidor.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});