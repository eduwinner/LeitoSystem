const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bed = sequelize.define('Bed', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  setor: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'disponivel',
    validate: {
      isIn: [['disponivel', 'ocupado', 'manutencao', 'inativo']]
    }
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  responsavelManutencaoNome: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'beds'
});

const Patient = require('./Patient');

Bed.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient'
});

module.exports = Bed;