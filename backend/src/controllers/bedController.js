const Bed = require('../models/Bed');
const Patient = require('../models/Patient');
const BedHistory = require('../models/BedHistory');
const User = require('../models/User');

const listarLeitos = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const where = { ativo: true };
    if (req.query.status) where.status = req.query.status;
    if (req.query.setor)  where.setor  = { [require('sequelize').Op.iLike]: `%${req.query.setor}%` };

    const { count, rows } = await Bed.findAndCountAll({
      where,
      order: [['numero', 'ASC']],
      limit,
      offset,
      include: [{ model: Patient, as: 'patient', attributes: ['id', 'nome', 'numeroProntuario'], required: false }]
    });

    return res.status(200).json({
      dados: rows,
      total: count,
      pagina: page,
      totalPaginas: Math.ceil(count / limit),
      limite: limit
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao listar leitos.',
      error: error.message
    });
  }
};

const criarLeito = async (req, res) => {
  try {
    const { numero, setor, tipo, status } = req.body;

    if (!numero || !setor || !tipo) {
      return res.status(400).json({
        message: 'Número, setor e tipo são obrigatórios.'
      });
    }

    const leitoExistente = await Bed.findOne({ where: { numero } });

    if (leitoExistente) {
      return res.status(400).json({
        message: 'Já existe um leito com esse número.'
      });
    }

    const novoLeito = await Bed.create({
      numero,
      setor,
      tipo,
      status: status || 'disponivel'
    });

    return res.status(201).json({
      message: 'Leito cadastrado com sucesso.',
      bed: novoLeito
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao cadastrar leito.',
      error: error.message
    });
  }
};

const atualizarLeito = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, setor, tipo, status, responsavelId } = req.body;

    const bed = await Bed.findByPk(id);

    if (!bed) {
      return res.status(404).json({ message: 'Leito não encontrado.' });
    }

    if (status === 'manutencao' && !responsavelId) {
      return res.status(400).json({ message: 'Informe o responsável pela manutenção.' });
    }

    const statusAnterior = bed.status;

    const responsavel = (status === 'manutencao' && responsavelId)
      ? await User.findByPk(responsavelId, { attributes: ['id', 'nome'] })
      : null;

    await bed.update({
      numero, setor, tipo, status,
      responsavelManutencaoNome: status === 'manutencao' ? (responsavel?.nome || null) : null
    });

    if (status === 'manutencao' && statusAnterior !== 'manutencao') {
      await BedHistory.create({
        bedId: bed.id, bedNumero: bed.numero,
        patientId: null, patientNome: null,
        acao: 'manutencao',
        userId: req.user?.id || null, userNome: req.user?.nome || null,
        responsavelId: responsavel?.id || null,
        responsavelNome: responsavel?.nome || null
      });
    }

    return res.status(200).json({ message: 'Leito atualizado com sucesso.', bed });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao atualizar leito.', error: error.message });
  }
};

const deletarLeito = async (req, res) => {
  try {
    const { id } = req.params;
    const bed = await Bed.findByPk(id);
    if (!bed) return res.status(404).json({ message: 'Leito não encontrado.' });

    const temHistorico = await BedHistory.findOne({ where: { bedId: id } });
    if (temHistorico) {
      return res.status(400).json({
        message: 'Este leito possui histórico de movimentação e não pode ser excluído. Use a opção de inativar.',
        podeInativar: true
      });
    }

    await bed.destroy();
    return res.status(200).json({ message: 'Leito removido com sucesso.' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao deletar leito.', error: error.message });
  }
};

const listarInativos = async (req, res) => {
  try {
    const beds = await Bed.findAll({
      where: { ativo: false },
      order: [['numero', 'ASC']]
    });
    return res.json(beds);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar leitos inativos.', error: error.message });
  }
};

const reativarLeito = async (req, res) => {
  try {
    const bed = await Bed.findByPk(req.params.id);
    if (!bed) return res.status(404).json({ message: 'Leito não encontrado.' });
    await bed.update({ ativo: true, status: 'disponivel' });
    return res.json({ message: 'Leito reativado com sucesso.', bed });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao reativar leito.', error: error.message });
  }
};

const inativarLeito = async (req, res) => {
  try {
    const bed = await Bed.findByPk(req.params.id);
    if (!bed) return res.status(404).json({ message: 'Leito não encontrado.' });
    await bed.update({ ativo: false, status: 'inativo' });
    return res.json({ message: 'Leito inativado com sucesso.', bed });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao inativar leito.', error: error.message });
  }
};

const ocupar = async (req, res) => {
  try {
    const { patientId } = req.body;
    const bed = await Bed.findByPk(req.params.id);
    if (!bed) return res.status(404).json({ message: 'Leito não encontrado' });

    const patient = patientId ? await Patient.findByPk(patientId) : null;

    bed.status = 'ocupado';
    bed.patientId = patientId;
    await bed.save();

    await BedHistory.create({
      bedId: bed.id, bedNumero: bed.numero,
      patientId: patient?.id || null, patientNome: patient?.nome || null,
      acao: 'alocado',
      userId: req.user?.id || null, userNome: req.user?.nome || null
    });

    res.json(bed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const liberar = async (req, res) => {
  try {
    const bed = await Bed.findByPk(req.params.id, { include: [{ model: Patient, as: 'patient', required: false }] });
    if (!bed) return res.status(404).json({ message: 'Leito não encontrado' });

    const patientId = bed.patientId;
    const patientNome = bed.patient?.nome || null;
    const responsavelNome = bed.responsavelManutencaoNome || null;

    bed.status = 'disponivel';
    bed.patientId = null;
    bed.responsavelManutencaoNome = null;
    await bed.save();

    await BedHistory.create({
      bedId: bed.id, bedNumero: bed.numero,
      patientId, patientNome,
      acao: 'liberado',
      userId: req.user?.id || null, userNome: req.user?.nome || null,
      responsavelNome
    });

    res.json(bed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Funcao para contar todos os leitos, status e taxa de ocupacao
const getDashboard = async (req, res) => {
  try {
    const total = await Bed.count();

    const disponiveis = await Bed.count({
      where: { status: 'disponivel' }
    });

    const ocupados = await Bed.count({
      where: { status: 'ocupado' }
    });

    const manutencao = await Bed.count({
      where: { status: 'manutencao' }
    });

    const taxaOcupacao =
      total > 0 ? ((ocupados / total) * 100).toFixed(2) : 0;

    return res.json({
      total,
      disponiveis,
      ocupados,
      manutencao,
      taxaOcupacao
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Erro ao carregar dashboard',
      error: error.message
    });
  }
};

const getHistorico = async (req, res) => {
  try {
    const historico = await BedHistory.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    return res.json(historico);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao buscar histórico.', error: error.message });
  }
};

module.exports = {
  listarLeitos, listarInativos, criarLeito, atualizarLeito,
  deletarLeito, inativarLeito, reativarLeito,
  ocupar, liberar, getDashboard, getHistorico
};