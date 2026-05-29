import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { confirmar, confirmarExcluir, confirmarLiberar, confirmarInativar } from '../services/swal';
import { formatarTipo, formatarStatus } from '../utils/formatters';

function Beds() {
  const navigate = useNavigate();

  const [beds, setBeds] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [numero, setNumero] = useState('');
  const [setor, setSetor] = useState('');
  const [tipo, setTipo] = useState('enfermaria');
  const [status, setStatus] = useState('disponivel');
  const [mensagem, setMensagem] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMITE = 20;
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [modalOcupar, setModalOcupar] = useState(null);
  const [pacienteSelecionado, setPacienteSelecionado] = useState('');
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [mostrarInativos, setMostrarInativos] = useState(false);
  const [bedInativos, setBedInativos] = useState([]);

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    carregarLeitos(1);
    carregarPacientes();
  }, []);

  const carregarLeitos = async (pag = pagina, setor = filtroSetor, sts = filtroStatus) => {
    try {
      setCarregando(true);
      setMensagem('');

      const params = new URLSearchParams({ page: pag, limit: LIMITE });
      if (setor)  params.append('setor', setor);
      if (sts)    params.append('status', sts);

      const response = await api.get(`/beds?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBeds(response.data.dados);
      setTotal(response.data.total);
      setTotalPaginas(response.data.totalPaginas);
      setPagina(pag);
    } catch (error) {
      const erroBackend = error.response?.data?.message;
      setMensagem(erroBackend || 'Erro ao carregar leitos.');
      if (error.response?.status === 401) handleLogout();
    } finally {
      setCarregando(false);
    }
  };

  const carregarInativos = async () => {
    try {
      const response = await api.get('/beds/inativos', { headers: { Authorization: `Bearer ${token}` } });
      setBedInativos(response.data);
    } catch {
      toast.error('Erro ao carregar leitos inativos.');
    }
  };

  const toggleInativos = () => {
    if (!mostrarInativos) carregarInativos();
    setMostrarInativos((v) => !v);
  };

  const handleReativar = async (bed) => {
    const { isConfirmed } = await confirmar('Reativar leito?', `O leito ${bed.numero} voltará a ficar disponível.`, 'question');
    if (!isConfirmed) return;
    try {
      await api.put(`/beds/${bed.id}/reativar`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Leito reativado com sucesso!');
      carregarLeitos();
      carregarInativos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao reativar leito.');
    }
  };

  const carregarPacientes = async () => {
    try {
      const response = await api.get('/patients');
      setPacientes(response.data);
    } catch {
      // silently fail — pacientes são opcionais para listagem
    }
  };

  const handleOcupar = (bed) => {
    setPacienteSelecionado('');
    setBuscaPaciente('');
    setModalOcupar(bed);
  };

  const pacientesDisponiveis = pacientes.filter(
    (p) => !beds.some((b) => b.status === 'ocupado' && b.patientId === p.id)
  );

  const confirmarOcupar = async () => {
    if (!pacienteSelecionado) {
      toast.warning('Selecione um paciente.');
      return;
    }
    try {
      await api.put(
        `/beds/${modalOcupar.id}/ocupar`,
        { patientId: pacienteSelecionado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Leito alocado com sucesso!');
      setModalOcupar(null);
      carregarLeitos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao alocar leito.');
    }
  };

  const handleManutenção = async (bed) => {
    try {
      await api.put(
        `/beds/${bed.id}`,
        { numero: bed.numero, setor: bed.setor, tipo: bed.tipo, status: 'manutencao' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Leito colocado em manutenção.');
      carregarLeitos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar leito.');
    }
  };

  const handleLiberar = async (bed) => {
    const { isConfirmed } = await confirmarLiberar(bed.numero, bed.patient?.nome);
    if (!isConfirmed) return;
    try {
      await api.put(
        `/beds/${bed.id}/liberar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Leito liberado com sucesso!');
      carregarLeitos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao liberar leito.');
    }
  };

  const limparFormulario = () => {
    setNumero('');
    setSetor('');
    setTipo('enfermaria');
    setStatus('disponivel');
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMensagem('');

  if (!numero || !setor || !tipo || !status) {
    toast.warning('Preencha todos os campos!');
    return;
  }

  try {
    if (editandoId) {
      await api.put(
        `/beds/${editandoId}`,
        {
          numero,
          setor,
          tipo,
          status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Leito atualizado com sucesso!');
    } else {
      await api.post(
        '/beds',
        {
          numero,
          setor,
          tipo,
          status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Leito cadastrado com sucesso!');
    }

    limparFormulario();
    carregarLeitos();

  } catch (error) {
    const erroBackend = error.response?.data?.message;
    toast.error(erroBackend || 'Erro ao salvar leito.');
  }
};

  const handleEditar = (bed) => {
    setNumero(bed.numero);
    setSetor(bed.setor);
    setTipo(bed.tipo);
    setStatus(bed.status);
    setEditandoId(bed.id);
    setMensagem('');
  };

  const handleExcluir = async (id) => {
  const { isConfirmed } = await confirmarExcluir('Excluir leito?', 'Se o leito tiver histórico, será inativado em vez de excluído.');
  if (!isConfirmed) return;

  try {
    await api.delete(`/beds/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    toast.success('Leito excluído com sucesso!');

    if (editandoId === id) {
      limparFormulario();
    }

    carregarLeitos();

  } catch (error) {
    const data = error.response?.data;
    if (data?.podeInativar) {
      const { isConfirmed } = await confirmarInativar('Este leito possui histórico de movimentação e não pode ser excluído. Deseja inativá-lo?');
      if (isConfirmed) {
        try {
          await api.put(`/beds/${id}/inativar`, {}, { headers: { Authorization: `Bearer ${token}` } });
          toast.success('Leito inativado com sucesso.');
          carregarLeitos();
        } catch { toast.error('Erro ao inativar leito.'); }
      }
    } else {
      toast.error(data?.message || 'Erro ao excluir leito.');
    }
  }
};

  const handleCancelarEdicao = () => {
  limparFormulario();
  toast.info('Edição cancelada.');
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };


  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>LeitoSystem</h1>
          <p style={styles.subtitle}>Gestão de Leitos Hospitalares</p>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.userText}>
            {usuario ? `Olá, ${usuario.nome} (${usuario.perfil})` : 'Usuário'}
          </span>

          <button
            onClick={() => navigate('/patients')}
            style={styles.navButton}
          >
            Ir para Pacientes
          </button>

          <button onClick={() => navigate('/dashboard')} style={styles.navButton}>Dashboard</button>
          {usuario?.perfil === 'admin' && (
            <button onClick={() => navigate('/users')} style={styles.navButton}>Usuários</button>
          )}

          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {usuario?.perfil === 'admin' && <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
            {editandoId ? 'Editar Leito' : 'Cadastrar Leito'}
          </h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Número do leito"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Setor"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              style={styles.input}
            />

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={styles.input}
            >
              <option value="enfermaria">Enfermaria</option>
              <option value="uti">UTI</option>
              <option value="semi-intensivo">Semi-Intensivo</option>
              <option value="isolamento">Isolamento</option>
              <option value="pediatrico">Pediátrico</option>
              <option value="obstetrico">Obstétrico</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={styles.input}
            >
              <option value="disponivel">Disponível</option>
              <option value="ocupado">Ocupado</option>
              <option value="manutencao">Manutenção</option>
            </select>

            <button type="submit" style={styles.primaryButton}>
              {editandoId ? 'Salvar Alterações' : 'Cadastrar'}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={handleCancelarEdicao}
                style={styles.secondaryButton}
              >
                Cancelar Edição
              </button>
            )}
          </form>

          {mensagem && <p style={styles.message}>{mensagem}</p>}
        </section>}

        <section style={{ ...styles.card, gridColumn: usuario?.perfil !== 'admin' ? '1 / -1' : 'auto' }}>
          <h2 style={styles.sectionTitle}>Lista de Leitos</h2>

          <div style={styles.filters}>
            <input
              type="text"
              placeholder="Filtrar por setor"
              value={filtroSetor}
              onChange={(e) => {
                setFiltroSetor(e.target.value);
                carregarLeitos(1, e.target.value, filtroStatus);
              }}
              style={styles.filterInput}
            />

            <select
              value={filtroStatus}
              onChange={(e) => {
                setFiltroStatus(e.target.value);
                carregarLeitos(1, filtroSetor, e.target.value);
              }}
              style={styles.filterInput}
            >
              <option value="">Todos os status</option>
              <option value="disponivel">Disponível</option>
              <option value="ocupado">Ocupado</option>
              <option value="manutencao">Manutenção</option>
            </select>

            <span style={styles.totalLabel}>{total} leito{total !== 1 ? 's' : ''}</span>
          </div>

          {carregando ? (
            <p>Carregando leitos...</p>
          ) : beds.length === 0 ? (
            <p>Nenhum leito encontrado.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Número</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {beds.map((bed) => (
                  <tr key={bed.id}>
                    <td style={styles.td}>{bed.numero}</td>
                    <td style={styles.td}>{bed.setor}</td>
                    <td style={styles.td}>{formatarTipo(bed.tipo)}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: getStatusBackground(bed.status),
                          color: getStatusColor(bed.status)
                        }}
                      >
                        {formatarStatus(bed.status)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {bed.status === 'disponivel' && ['admin','medico','enfermeiro','recepcionista'].includes(usuario?.perfil) && (
                          <button onClick={() => handleOcupar(bed)} style={styles.ocuparButton}>Alocar</button>
                        )}
                        {bed.status === 'disponivel' && ['admin','medico','enfermeiro'].includes(usuario?.perfil) && (
                          <button onClick={() => handleManutenção(bed)} style={styles.manutencaoButton}>Manutenção</button>
                        )}
                        {(bed.status === 'ocupado' || bed.status === 'manutencao') && ['admin','medico','enfermeiro'].includes(usuario?.perfil) && (
                          <button onClick={() => handleLiberar(bed)} style={styles.liberarButton}>Liberar</button>
                        )}
                        {usuario?.perfil === 'admin' && (
                          <>
                            <button onClick={() => handleEditar(bed)} style={styles.editButton}>Editar</button>
                            <button onClick={() => handleExcluir(bed.id)} style={styles.deleteButton}>Excluir</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPaginas > 1 && (
            <div style={styles.paginacao}>
              <button
                onClick={() => carregarLeitos(pagina - 1)}
                disabled={pagina === 1}
                style={{ ...styles.btnPagina, opacity: pagina === 1 ? 0.4 : 1 }}
              >
                ← Anterior
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e${i}`} style={styles.ellipsis}>…</span>
                  : <button
                      key={p}
                      onClick={() => carregarLeitos(p)}
                      style={{ ...styles.btnPagina, ...(p === pagina ? styles.btnPaginaAtivo : {}) }}
                    >{p}</button>
                )}

              <button
                onClick={() => carregarLeitos(pagina + 1)}
                disabled={pagina === totalPaginas}
                style={{ ...styles.btnPagina, opacity: pagina === totalPaginas ? 0.4 : 1 }}
              >
                Próxima →
              </button>
            </div>
          )}
        </section>
      </main>

      {usuario?.perfil === 'admin' && (
        <div style={{ marginTop: '24px' }}>
          <button onClick={toggleInativos} style={styles.btnInativos}>
            {mostrarInativos ? 'Ocultar Leitos Inativos' : 'Ver Leitos Inativos'}
          </button>

          {mostrarInativos && (
            <div style={{ ...styles.card, marginTop: '16px' }}>
              <h2 style={styles.sectionTitle}>Leitos Inativos</h2>
              {bedInativos.length === 0 ? (
                <p style={{ color: '#64748b' }}>Nenhum leito inativo.</p>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Número</th>
                      <th style={styles.th}>Setor</th>
                      <th style={styles.th}>Tipo</th>
                      <th style={styles.th}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bedInativos.map((bed) => (
                      <tr key={bed.id}>
                        <td style={styles.td}>{bed.numero}</td>
                        <td style={styles.td}>{bed.setor}</td>
                        <td style={styles.td}>{formatarTipo(bed.tipo)}</td>
                        <td style={styles.td}>
                          <button onClick={() => handleReativar(bed)} style={styles.reativarButton}>
                            Reativar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {modalOcupar && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <h3 style={styles.modalTitle}>Alocar Leito {modalOcupar.numero}</h3>
            <p style={styles.modalSub}>{modalOcupar.setor} — {formatarTipo(modalOcupar.tipo)}</p>
            <select
              value={pacienteSelecionado}
              onChange={(e) => setPacienteSelecionado(e.target.value)}
              style={styles.input}
            >
              <option value="">Selecione um paciente</option>
              {pacientesDisponiveis.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {formatarDataNasc(p.dataNascimento)}
                </option>
              ))}
            </select>
            <div style={styles.modalActions}>
              <button onClick={confirmarOcupar} style={styles.ocuparButton}>
                Confirmar
              </button>
              <button onClick={() => setModalOcupar(null)} style={styles.secondaryButton}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatarDataNasc(data) {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}


function getStatusColor(status) {
  if (status === 'disponivel') return '#166534';
  if (status === 'ocupado') return '#991b1b';
  if (status === 'manutencao') return '#92400e';
  return '#334155';
}

function getStatusBackground(status) {
  if (status === 'disponivel') return '#dcfce7';
  if (status === 'ocupado') return '#fee2e2';
  if (status === 'manutencao') return '#fef3c7';
  return '#e2e8f0';
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '24px'
  },
  header: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    borderRadius: '16px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    gap: '16px',
    flexWrap: 'wrap'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  userText: {
    fontSize: '14px'
  },
  title: {
    margin: 0,
    fontSize: '28px'
  },
  subtitle: {
    margin: '4px 0 0 0',
    fontSize: '14px'
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    border: 'none',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  navButton: {
    backgroundColor: '#16a34a',
    border: 'none',
    color: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer'
  },

  main: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    overflowX: 'auto'
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '16px',
    color: '#0f172a'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  secondaryButton: {
    backgroundColor: '#475569',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  message: {
    marginTop: '14px',
    color: '#0f172a',
    fontSize: '14px'
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  filterInput: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    minWidth: '180px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    textAlign: 'left',
    borderBottom: '1px solid #cbd5e1',
    padding: '12px',
    backgroundColor: '#eff6ff',
    color: '#0f172a'
  },
  td: {
    borderBottom: '1px solid #e2e8f0',
    padding: '12px',
    color: '#334155',
    textAlign: 'left'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600'
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  editButton: {
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  ocuparButton: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  manutencaoButton: {
    backgroundColor: '#d97706',
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  liberarButton: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
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
  modalActions: {
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
    flexWrap: 'wrap'
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
  paginacao: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  btnPagina: {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    border: '1px solid #cbd5e1',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  btnPaginaAtivo: {
    backgroundColor: '#2563eb',
    color: '#fff',
    borderColor: '#2563eb',
    fontWeight: '600'
  },
  ellipsis: {
    padding: '6px 4px',
    color: '#64748b',
    fontSize: '13px'
  },
  totalLabel: {
    fontSize: '13px',
    color: '#64748b',
    alignSelf: 'center',
    marginLeft: 'auto'
  },
  btnInativos: {
    backgroundColor: '#475569',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  reativarButton: {
    backgroundColor: '#0891b2',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  prontuarioTag: {
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600'
  },
  accessDeniedContainer: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: '24px'
  },
  accessDeniedCard: {
    backgroundColor: '#ffffff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    textAlign: 'center',
    maxWidth: '420px',
    width: '100%'
  },
  accessDeniedTitle: {
    marginTop: 0,
    color: '#b91c1c'
  },
  accessDeniedText: {
    color: '#475569',
    marginBottom: '20px'
  }
};

export default Beds;