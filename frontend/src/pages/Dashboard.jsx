import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { confirmarLiberar, confirmarExcluir } from '../services/swal';

function Dashboard() {
  const navigate = useNavigate();

  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [filtroSelecionado, setFiltroSelecionado] = useState(undefined);
  const [leitos, setLeitos] = useState([]);
  const [paginaLeitos, setPaginaLeitos] = useState(1);
  const [totalPaginasLeitos, setTotalPaginasLeitos] = useState(1);
  const [totalLeitos, setTotalLeitos] = useState(0);
  const LIMITE_DASH = 10;
  const [pacientes, setPacientes] = useState([]);
  const [modalOcupar, setModalOcupar] = useState(null);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(null);
  const [formUser, setFormUser] = useState({ nome: '', email: '', senha: '', perfil: 'enfermeiro' });
  const [historico, setHistorico] = useState([]);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    carregarDashboard();
    carregarPacientes();
    if (usuario?.perfil === 'admin') carregarUsuarios();
  }, []);

  const carregarDashboard = async () => {
    try {
      setCarregando(true);
      setErro('');

      const response = await api.get('/beds/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setDados(response.data);
    } catch (error) {
      setErro('Erro ao carregar dashboard');

      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setCarregando(false);
    }
  };

  const carregarLeitos = async (status, pag = 1) => {
    try {
      const params = new URLSearchParams({ limit: LIMITE_DASH, page: pag });
      if (status) params.append('status', status);

      const response = await api.get(`/beds?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setLeitos(response.data.dados);
      setPaginaLeitos(response.data.pagina);
      setTotalPaginasLeitos(response.data.totalPaginas);
      setTotalLeitos(response.data.total);
      setFiltroSelecionado(status);
      setMostrarUsuarios(false);
      setMostrarHistorico(false);
    } catch (error) {
      console.log(error);
    }
  };

  const carregarHistorico = async () => {
    try {
      const response = await api.get('/beds/historico', { headers: { Authorization: `Bearer ${token}` } });
      setHistorico(response.data);
    } catch {}
  };

  const handleCardHistorico = () => {
    if (!mostrarHistorico) carregarHistorico();
    setMostrarHistorico((v) => !v);
    setFiltroSelecionado(undefined);
    setMostrarUsuarios(false);
  };

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsuarios(response.data);
    } catch {}
  };

  const handleCardUsuarios = () => {
    setMostrarUsuarios((v) => !v);
    setFiltroSelecionado(undefined);
    setMostrarHistorico(false);
  };

  const abrirModalUsuario = (user) => {
    setFormUser({ nome: user.nome, email: user.email, senha: '', perfil: user.perfil });
    setModalUsuario(user);
  };

  const salvarUsuario = async () => {
    try {
      const dados = { nome: formUser.nome, email: formUser.email, perfil: formUser.perfil };
      if (formUser.senha) dados.senha = formUser.senha;
      await api.put(`/users/${modalUsuario.id}`, dados, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Usuário atualizado com sucesso!');
      setModalUsuario(null);
      carregarUsuarios();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar usuário.');
    }
  };

  const excluirUsuario = async (id) => {
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

  const carregarPacientes = async () => {
    try {
      const response = await api.get('/patients');
      setPacientes(response.data);
    } catch {}
  };

  const recarregar = async () => {
    await carregarDashboard();
    if (filtroSelecionado !== undefined) await carregarLeitos(filtroSelecionado, paginaLeitos);
  };

  const handleOcupar = (bed) => {
    setPacienteSelecionado('');
    setBuscaPaciente('');
    setModalOcupar(bed);
  };

  const pacientesDisponiveis = pacientes.filter(
    (p) => !leitos.some((b) => b.status === 'ocupado' && b.patientId === p.id)
  );

  const confirmarOcupar = async () => {
    if (!pacienteSelecionado) { toast.warning('Selecione um paciente.'); return; }
    try {
      await api.put(`/beds/${modalOcupar.id}/ocupar`, { patientId: pacienteSelecionado }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Leito alocado com sucesso!');
      setModalOcupar(null);
      recarregar();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao alocar leito.');
    }
  };

  const handleManutenção = async (bed) => {
    try {
      await api.put(`/beds/${bed.id}`, { numero: bed.numero, setor: bed.setor, tipo: bed.tipo, status: 'manutencao' }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Leito colocado em manutenção.');
      recarregar();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar leito.');
    }
  };

  const handleLiberar = async (bed) => {
    const { isConfirmed } = await confirmarLiberar(bed.numero, bed.patient?.nome);
    if (!isConfirmed) return;
    try {
      await api.put(`/beds/${bed.id}/liberar`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Leito liberado com sucesso!');
      recarregar();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao liberar leito.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  if (carregando) {
    return <p style={styles.loading}>Carregando dashboard...</p>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>LeitoSystem</h1>
          <p style={styles.titleSub}>Dashboard · {usuario?.nome} ({LABEL_PERFIL[usuario?.perfil] || usuario?.perfil})</p>
        </div>

        <div style={styles.actions}>
          <button onClick={() => navigate('/beds')} style={styles.navButton}>Leitos</button>
          <button onClick={() => navigate('/patients')} style={styles.navButton}>Pacientes</button>
          {usuario?.perfil === 'admin' && (
            <button onClick={() => navigate('/users')} style={styles.navButton}>Usuários</button>
          )}
          <button onClick={handleLogout} style={styles.logoutButton}>Sair</button>
        </div>
      </header>

      {erro && <p style={styles.error}>{erro}</p>}

      {dados && (
        <div style={styles.grid}>
          <Card
            title="Total de Leitos"
            value={dados.total}
            onClick={() => carregarLeitos(null)}
            ativo={filtroSelecionado === null || filtroSelecionado === undefined}
          />

          <Card
            title="Disponíveis"
            value={dados.disponiveis}
            cor="#22c55e"
            onClick={() => carregarLeitos('disponivel')}
            ativo={filtroSelecionado === 'disponivel'}
          />

          <Card
            title="Ocupados"
            value={dados.ocupados}
            cor="#ef4444"
            onClick={() => carregarLeitos('ocupado')}
            ativo={filtroSelecionado === 'ocupado'}
          />

          <Card
            title="Manutenção"
            value={dados.manutencao}
            cor="#f59e0b"
            onClick={() => carregarLeitos('manutencao')}
            ativo={filtroSelecionado === 'manutencao'}
          />

          <Card
            title="Taxa de Ocupação"
            value={`${dados.taxaOcupacao}%`}
          />
          {usuario?.perfil === 'admin' && (
            <Card
              title="Usuários"
              value={usuarios.length}
              cor="#6d28d9"
              onClick={handleCardUsuarios}
              ativo={mostrarUsuarios}
            />
          )}
          <Card
            title="Histórico"
            value="Ver"
            cor="#0891b2"
            onClick={handleCardHistorico}
            ativo={mostrarHistorico}
          />
        </div>
      )}

      {mostrarHistorico && (
        <div style={styles.listaContainer}>
          <h2 style={styles.subTitle}>Histórico de Movimentação</h2>
          {historico.length === 0 ? <p>Nenhum registro encontrado.</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Data/Hora</th>
                  <th style={styles.th}>Leito</th>
                  <th style={styles.th}>Ação</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Responsável</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h) => (
                  <tr key={h.id} style={styles.tr}>
                    <td style={styles.td}>{new Date(h.createdAt).toLocaleString('pt-BR')}</td>
                    <td style={styles.td}>{h.bedNumero}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...badgeAcao(h.acao) }}>{labelAcao(h.acao)}</span>
                    </td>
                    <td style={styles.td}>{h.patientNome || '—'}</td>
                    <td style={styles.td}>{h.userNome || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {mostrarUsuarios && usuario?.perfil === 'admin' && (
        <div style={styles.listaContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={styles.subTitle}>Usuários Cadastrados</h2>
            <button onClick={() => navigate('/users')} style={styles.btnAlocar}>+ Novo Usuário</button>
          </div>
          {usuarios.length === 0 ? <p>Nenhum usuário encontrado.</p> : (
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
                {usuarios.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{u.nome}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...badgeUsuario(u.perfil) }}>
                        {LABEL_PERFIL[u.perfil] || u.perfil}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.acoes}>
                        <button onClick={() => abrirModalUsuario(u)} style={styles.btnManutencao}>Editar</button>
                        {u.id !== usuario?.id && (
                          <button onClick={() => excluirUsuario(u.id)} style={{ ...styles.btnLiberar, backgroundColor: '#dc2626' }}>Excluir</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modalUsuario && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Editar Usuário</h3>
            <input type="text" placeholder="Nome" value={formUser.nome} onChange={(e) => setFormUser({ ...formUser, nome: e.target.value })} style={styles.modalSelect} />
            <input type="email" placeholder="E-mail" value={formUser.email} onChange={(e) => setFormUser({ ...formUser, email: e.target.value })} style={styles.modalSelect} />
            <input type="password" placeholder="Nova senha (deixe em branco para manter)" value={formUser.senha} onChange={(e) => setFormUser({ ...formUser, senha: e.target.value })} style={styles.modalSelect} />
            <select value={formUser.perfil} onChange={(e) => setFormUser({ ...formUser, perfil: e.target.value })} style={styles.modalSelect}>
              {['admin','medico','enfermeiro','recepcionista'].map((p) => (
                <option key={p} value={p}>{LABEL_PERFIL[p]}</option>
              ))}
            </select>
            <div style={styles.modalAcoes}>
              <button onClick={salvarUsuario} style={styles.btnAlocar}>Salvar</button>
              <button onClick={() => setModalUsuario(null)} style={styles.btnCancelar}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {modalOcupar && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Alocar Leito {modalOcupar.numero}</h3>
            <p style={styles.modalSub}>{modalOcupar.setor} — {modalOcupar.tipo}</p>
            <select
              value={pacienteSelecionado}
              onChange={(e) => setPacienteSelecionado(e.target.value)}
              style={styles.modalSelect}
            >
              <option value="">Selecione um paciente</option>
              {pacientesDisponiveis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {formatarDataNasc(p.dataNascimento)}
                </option>
              ))}
            </select>
            <div style={styles.modalAcoes}>
              <button onClick={confirmarOcupar} style={styles.btnAlocar}>Confirmar</button>
              <button onClick={() => setModalOcupar(null)} style={styles.btnCancelar}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {filtroSelecionado !== undefined && (
        <div style={styles.listaContainer}>
          <h2 style={styles.subTitle}>
            {labelFiltro(filtroSelecionado)}
          </h2>

          {leitos.length === 0 ? (
            <p>Nenhum leito encontrado.</p>
          ) : (<>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Número</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Paciente</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {leitos.map((bed) => (
                  <tr key={bed.id} style={styles.tr}>
                    <td style={styles.td}>{bed.numero}</td>
                    <td style={styles.td}>{bed.setor}</td>
                    <td style={styles.td}>{bed.tipo}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: getStatusBg(bed.status),
                        color: getStatusColor(bed.status)
                      }}>
                        {bed.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {bed.patient ? bed.patient.nome : '—'}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.acoes}>
                        {bed.status === 'disponivel' && ['admin','medico','enfermeiro','recepcionista'].includes(usuario?.perfil) && (
                          <button onClick={() => handleOcupar(bed)} style={styles.btnAlocar}>Alocar</button>
                        )}
                        {bed.status === 'disponivel' && ['admin','medico','enfermeiro'].includes(usuario?.perfil) && (
                          <button onClick={() => handleManutenção(bed)} style={styles.btnManutencao}>Manutenção</button>
                        )}
                        {(bed.status === 'ocupado' || bed.status === 'manutencao') && ['admin','medico','enfermeiro'].includes(usuario?.perfil) && (
                          <button onClick={() => handleLiberar(bed)} style={styles.btnLiberar}>Liberar</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPaginasLeitos > 1 && (
              <div style={styles.paginacao}>
                <button
                  onClick={() => carregarLeitos(filtroSelecionado, paginaLeitos - 1)}
                  disabled={paginaLeitos === 1}
                  style={{ ...styles.btnPagina, opacity: paginaLeitos === 1 ? 0.4 : 1 }}
                >← Anterior</button>

                <span style={{ fontSize: '13px', color: '#334155' }}>
                  Página {paginaLeitos} de {totalPaginasLeitos} — {totalLeitos} leitos
                </span>

                <button
                  onClick={() => carregarLeitos(filtroSelecionado, paginaLeitos + 1)}
                  disabled={paginaLeitos === totalPaginasLeitos}
                  style={{ ...styles.btnPagina, opacity: paginaLeitos === totalPaginasLeitos ? 0.4 : 1 }}
                >Próxima →</button>
              </div>
            )}
          </>)}
        </div>
      )}
    </div>
  );
}

function Card({ title, value, onClick, ativo, cor }) {
  return (
    <div
      style={{
        ...styles.card,
        borderLeft: cor ? `6px solid ${cor}` : 'none',
        border: ativo ? '2px solid #2563eb' : 'none',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardValue}>{value}</p>
    </div>
  );
}

const LABEL_PERFIL = {
  admin: 'Administrador',
  medico: 'Médico',
  enfermeiro: 'Enfermeiro',
  recepcionista: 'Recepcionista'
};

function labelAcao(acao) {
  if (acao === 'alocado')   return 'Alocado';
  if (acao === 'liberado')  return 'Liberado';
  if (acao === 'manutencao') return 'Manutenção';
  return acao;
}

function badgeAcao(acao) {
  if (acao === 'alocado')    return { backgroundColor: '#dcfce7', color: '#166534' };
  if (acao === 'liberado')   return { backgroundColor: '#ede9fe', color: '#5b21b6' };
  if (acao === 'manutencao') return { backgroundColor: '#fef3c7', color: '#92400e' };
  return { backgroundColor: '#e2e8f0', color: '#334155' };
}

function badgeUsuario(perfil) {
  const map = {
    admin:         { backgroundColor: '#dbeafe', color: '#1e40af' },
    medico:        { backgroundColor: '#dcfce7', color: '#166534' },
    enfermeiro:    { backgroundColor: '#fef9c3', color: '#854d0e' },
    recepcionista: { backgroundColor: '#f3e8ff', color: '#6b21a8' }
  };
  return map[perfil] || { backgroundColor: '#e2e8f0', color: '#334155' };
}

function formatarDataNasc(data) {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function labelFiltro(filtro) {
  if (filtro === 'disponivel') return 'Leitos Disponíveis';
  if (filtro === 'ocupado') return 'Leitos Ocupados';
  if (filtro === 'manutencao') return 'Leitos em Manutenção';
  return 'Todos os Leitos';
}

function getStatusColor(status) {
  if (status === 'disponivel') return '#166534';
  if (status === 'ocupado') return '#991b1b';
  if (status === 'manutencao') return '#92400e';
}

function getStatusBg(status) {
  if (status === 'disponivel') return '#dcfce7';
  if (status === 'ocupado') return '#fee2e2';
  if (status === 'manutencao') return '#fef3c7';
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    padding: '24px',
    color: '#fff'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },

  title: {
    margin: 0,
    fontSize: '28px'
  },
  titleSub: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    opacity: 0.85
  },

  actions: {
    display: 'flex',
    gap: '10px'
  },

  navButton: {
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  logoutButton: {
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },

  card: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '16px',
    textAlign: 'center',
    color: '#0f172a',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease'
  },

  cardTitle: {
    marginBottom: '8px'
  },

  cardValue: {
    fontSize: '28px',
    fontWeight: 'bold'
  },

  listaContainer: {
    marginTop: '32px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '16px',
    color: '#000'
  },

  subTitle: {
    marginBottom: '16px'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  th: {
    padding: '12px',
    borderBottom: '2px solid #e2e8f0',
    textAlign: 'left'
  },

  td: {
    padding: '12px',
    borderBottom: '1px solid #e2e8f0',
    textAlign: 'left'
  },

  tr: {
    transition: 'background 0.2s'
  },

  badge: {
    padding: '6px 10px',
    borderRadius: '999px',
    fontWeight: 'bold'
  },

  error: {
    color: '#fecaca'
  },

  loading: {
    padding: '24px'
  },

  paginacao: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '16px',
    flexWrap: 'wrap'
  },

  btnPagina: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '6px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },

  acoes: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },

  btnAlocar: {
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },

  btnManutencao: {
    backgroundColor: '#d97706',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },

  btnLiberar: {
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },

  btnCancelar: {
    backgroundColor: '#475569',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },

  modalCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  modalTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '18px'
  },

  modalSub: {
    margin: 0,
    color: '#64748b',
    fontSize: '14px'
  },

  modalSelect: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px'
  },

  modalAcoes: {
    display: 'flex',
    gap: '12px'
  },
  listaPacientes: {
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    maxHeight: '200px',
    overflowY: 'auto',
    backgroundColor: '#fff'
  },
  itemPaciente: {
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    color: '#0f172a'
  },
  pacienteSelecionadoBox: {
    padding: '10px 12px',
    backgroundColor: '#dcfce7',
    border: '1px solid #86efac',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#166534',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  btnLimparPaciente: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#166534',
    fontWeight: 'bold'
  },
  prontuarioTag: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600'
  }
};

export default Dashboard;