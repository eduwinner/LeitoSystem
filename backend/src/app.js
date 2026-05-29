require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const bedRoutes = require('./routes/bedRoutes');

require('./models/User');
require('./models/Bed');
require('./models/Patient');
require('./models/BedHistory');

const app = express();

const origensPermitidas = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map((o) => o.trim());

app.use(helmet());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origensPermitidas.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(express.json({ limit: '10kb' }));

app.use('/auth/login', loginLimiter);
app.use('/auth', authRoutes);
app.use('/beds', bedRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'API do LeitoSystem funcionando.' });
});

const PORT = process.env.PORT || 3001;

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Banco de dados conectado com sucesso.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar no banco:', error);
  });

  const patientRoutes = require('./routes/patientRoutes');
  const userRoutes = require('./routes/userRoutes');

app.use('/patients', patientRoutes);
app.use('/users', userRoutes);