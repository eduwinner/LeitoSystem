const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BedHistory = sequelize.define('BedHistory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bedId:       { type: DataTypes.INTEGER, allowNull: false },
  bedNumero:   { type: DataTypes.STRING,  allowNull: false },
  patientId:   { type: DataTypes.INTEGER, allowNull: true },
  patientNome: { type: DataTypes.STRING,  allowNull: true },
  acao:           { type: DataTypes.STRING,  allowNull: false }, // 'alocado' | 'liberado' | 'manutencao'
  userId:         { type: DataTypes.INTEGER, allowNull: true },
  userNome:       { type: DataTypes.STRING,  allowNull: true },
  responsavelId:  { type: DataTypes.INTEGER, allowNull: true },
  responsavelNome:{ type: DataTypes.STRING,  allowNull: true }
}, { tableName: 'bed_history' });

module.exports = BedHistory;
