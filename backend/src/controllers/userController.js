const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.listarServicosGerais = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { perfil: 'servicos_gerais' },
      attributes: ['id', 'nome'],
      order: [['nome', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar serviços gerais.', error: error.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'nome', 'email', 'perfil', 'createdAt'],
      order: [['nome', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar usuários.', error: error.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha || !perfil) {
      return res.status(400).json({ message: 'Nome, email, senha e perfil são obrigatórios.' });
    }

    const perfisValidos = ['admin', 'medico', 'enfermeiro', 'recepcionista', 'servicos_gerais'];
    if (!perfisValidos.includes(perfil)) {
      return res.status(400).json({ message: `Perfil inválido. Use: ${perfisValidos.join(', ')}.` });
    }

    const existe = await User.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ message: 'Já existe um usuário com esse e-mail.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await User.create({ nome, email, senha: senhaHash, perfil });

    res.status(201).json({
      message: 'Usuário criado com sucesso.',
      user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário.', error: error.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha, perfil } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    if (perfil) {
      const perfisValidos = ['admin', 'medico', 'enfermeiro', 'recepcionista', 'servicos_gerais'];
      if (!perfisValidos.includes(perfil)) {
        return res.status(400).json({ message: `Perfil inválido. Use: ${perfisValidos.join(', ')}.` });
      }
    }

    const dados = { nome, email, perfil };
    if (senha) dados.senha = await bcrypt.hash(senha, 10);

    await user.update(dados);

    res.json({
      message: 'Usuário atualizado com sucesso.',
      user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário.', error: error.message });
  }
};

exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Você não pode excluir sua própria conta.' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    await user.destroy();
    res.json({ message: 'Usuário excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir usuário.', error: error.message });
  }
};
