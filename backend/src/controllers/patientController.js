const Patient = require('../models/Patient');

exports.create = async (req, res) => {
  try {
    const { nome, cpf, dataNascimento, sexo, telefone } = req.body;

    if (!nome || !cpf || !dataNascimento || !sexo) {
      return res.status(400).json({
        message: 'Nome, CPF, data de nascimento e sexo são obrigatórios.'
      });
    }

    const patient = await Patient.create({
      nome,
      cpf,
      dataNascimento,
      sexo,
      telefone
    });

    return res.status(201).json(patient);

  } catch (error) {
    console.error('ERRO AO CADASTRAR PACIENTE:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: 'Já existe um paciente com esse CPF.'
      });
    }

    return res.status(500).json({
      message: 'Erro ao cadastrar paciente',
      error: error.message
    });
  }
};

exports.findAll = async (req, res) => {
  try {
    const patients = await Patient.findAll();
    res.json(patients);
  } catch (error) {
    console.error('ERRO AO BUSCAR PACIENTES:', error);

    return res.status(500).json({
      message: 'Erro ao buscar pacientes',
      error: error.message
    });
  }
};


exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        message: 'Paciente não encontrado.'
      });
    }

    await patient.update(req.body);

    return res.json(patient);

  } catch (error) {
    console.error('ERRO AO ATUALIZAR PACIENTE:', error);

    return res.status(500).json({
      message: 'Erro ao atualizar paciente',
      error: error.message
    });
  }
};


exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    await patient.destroy();

    res.json({ message: 'Paciente excluído com sucesso' });
  } catch (error) {
    console.error('ERRO AO EXCLUIR PACIENTE:', error);

    res.status(500).json({
      message: 'Erro ao excluir paciente',
      error: error.message
    });
  }
};