import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { confirmarExcluir } from '../services/swal';

const PERFIS = ['admin', 'medico', 'enfermeiro', 'recepcionista'];

const LABEL_PERFIL = {
  admin: 'Administrador',
  medico: 'Médico',
  enfermeiro: 'Enfermeiro',
  recepcionista: 'Recepcionista'
};

function Users() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [users, setUsers] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('enfermeiro');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    if (usuario?.perfil !== 'admin') { navigate('/dashboard'); return; }
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(response.data);
    } catch {
      toast.error('Erro ao carregar usuários.');
    }
  };

  const limpar = () => {
    setNome(''); setEmail(''); setSenha(''); setPerfil('enfermeiro'); setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !email || !perfil || (!editandoId && !senha)) {
      toast.warning('Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      if (editandoId) {
        const dados = { nome, email, perfil };
        if (senha) dados.senha = senha;
        await api.put(`/users/${editandoId}`, dados, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await api.post('/users', { nome, email, senha, perfil }, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Usuário criado com sucesso!');
      }
      limpar();
      carregarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar usuário.');
    }
  };

  const handleEditar = (user) => {
    setNome(user.nome);
    setEmail(user.email);
    setSenha('');
    setPerfil(user.perfil);
    setEditandoId(user.id);
  };

  const handleExcluir = async (id) => {
    const { isConfirmed } = await confirmarExcluir('Excluir usuário?', 'Esta ação não pode ser desfeita.');
    if (!isConfirmed) return;
    try {
      await api.delete(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Usuário excluído com sucesso!');
      carregarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir usuário.');
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>LeitoSystem</h1>
          <p style={styles.subtitle}>Gerenciamento de Usuários</p>
        </div>
        <div style={styles.headerRight}>
          <button onClick={() => navigate('/dashboard')} style={styles.navButton}>Dashboard</button>
          <button onClick={() => navigate('/beds')} style={styles.navButton}>Leitos</button>
          <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/'); }} style={styles.logoutButton}>Sair</button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>{editandoId ? 'Editar Usuário' : 'Novo Usuário'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            <input type="text" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} style={styles.input} />
            <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
            <input type="password" placeholder={editandoId ? 'Nova senha (deixe em branco para manter)' : 'Senha'} value={senha} onChange={(e) => setSenha(e.target.value)} style={styles.input} />
            <select value={perfil} onChange={(e) => setPerfil(e.target.value)} style={styles.input}>
              {PERFIS.map((p) => (
                <option key={p} value={p}>{LABEL_PERFIL[p]}</option>
              ))}
            </select>
            <button type="submit" style={styles.primaryButton}>
              {editandoId ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
            {editandoId && (
              <button type="button" onClick={limpar} style={styles.secondaryButton}>Cancelar</button>
            )}
          </form>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Usuários Cadastrados</h2>
          {users.length === 0 ? (
            <p>Nenhum usuário encontrado.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>E-mail</th>
                  <th style={styles.th}>Perfil</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={styles.td}>{u.nome}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...badgeStyle(u.perfil) }}>
                        {LABEL_PERFIL[u.perfil] || u.perfil}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button onClick={() => handleEditar(u)} style={styles.editButton}>Editar</button>
                        {u.id !== usuario?.id && (
                          <button onClick={() => handleExcluir(u.id)} style={styles.deleteButton}>Excluir</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

function badgeStyle(perfil) {
  const map = {
    admin:         { backgroundColor: '#dbeafe', color: '#1e40af' },
    medico:        { backgroundColor: '#dcfce7', color: '#166534' },
    enfermeiro:    { backgroundColor: '#fef9c3', color: '#854d0e' },
    recepcionista: { backgroundColor: '#f3e8ff', color: '#6b21a8' }
  };
  return map[perfil] || { backgroundColor: '#e2e8f0', color: '#334155' };
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px' },
  header: {
    backgroundColor: '#1d4ed8', color: '#fff', borderRadius: '16px',
    padding: '20px 24px', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '24px', gap: '16px', flexWrap: 'wrap'
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  title: { margin: 0, fontSize: '28px' },
  subtitle: { margin: '4px 0 0 0', fontSize: '14px' },
  navButton: { backgroundColor: '#16a34a', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' },
  logoutButton: { backgroundColor: '#dc2626', border: 'none', color: '#fff', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' },
  main: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflowX: 'auto' },
  sectionTitle: { marginTop: 0, marginBottom: '16px', color: '#0f172a' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' },
  primaryButton: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  secondaryButton: { backgroundColor: '#475569', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', backgroundColor: '#eff6ff', color: '#0f172a', textAlign: 'left', borderBottom: '1px solid #cbd5e1' },
  td: { padding: '12px', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#334155' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600' },
  actions: { display: 'flex', gap: '8px' },
  editButton: { backgroundColor: '#0ea5e9', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  deleteButton: { backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }
};

export default Users;
