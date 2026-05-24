import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

function Beds() {
  const navigate = useNavigate();

  const [beds, setBeds] = useState([]);
  const [numero, setNumero] = useState('');
  const [setor, setSetor] = useState('');
  const [tipo, setTipo] = useState('enfermaria');
  const [status, setStatus] = useState('disponivel');
  const [mensagem, setMensagem] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    if (usuario?.perfil !== 'admin') {
      setMensagem('Acesso restrito a administradores.');
      return;
    }

    carregarLeitos();
  }, [navigate]);

  const carregarLeitos = async () => {
    try {
      setCarregando(true);
      setMensagem('');

      const response = await api.get('/beds', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBeds(response.data);
    } catch (error) {
      const erroBackend = error.response?.data?.message;
      setMensagem(erroBackend || 'Erro ao carregar leitos.');

      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setCarregando(false);
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
  const confirmar = window.confirm('Deseja realmente excluir este leito?');

  if (!confirmar) return;

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
    const erroBackend = error.response?.data?.message;
    toast.error(erroBackend || 'Erro ao excluir leito.');
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

  const bedsFiltrados = useMemo(() => {
    return beds.filter((bed) => {
      const filtroSetorValido =
        filtroSetor === '' ||
        bed.setor.toLowerCase().includes(filtroSetor.toLowerCase());

      const filtroStatusValido =
        filtroStatus === '' || bed.status === filtroStatus;

      return filtroSetorValido && filtroStatusValido;
    });
  }, [beds, filtroSetor, filtroStatus]);

  if (usuario?.perfil !== 'admin') {
    return (
      <div style={styles.accessDeniedContainer}>
        <div style={styles.accessDeniedCard}>
          <h2 style={styles.accessDeniedTitle}>Acesso negado</h2>
          <p style={styles.accessDeniedText}>
            Esta tela é restrita para usuários administradores.
          </p>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Voltar para login
          </button>
        </div>
      </div>
    );
  }

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

          <button
            onClick={() => navigate('/dashboard')}
            style={styles.navButton}
          >
            Dashboard
          </button>

          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
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
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Lista de Leitos</h2>

          <div style={styles.filters}>
            <input
              type="text"
              placeholder="Filtrar por setor"
              value={filtroSetor}
              onChange={(e) => setFiltroSetor(e.target.value)}
              style={styles.filterInput}
            />

            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              style={styles.filterInput}
            >
              <option value="">Todos os status</option>
              <option value="disponivel">Disponível</option>
              <option value="ocupado">Ocupado</option>
              <option value="manutencao">Manutenção</option>
            </select>
          </div>

          {carregando ? (
            <p>Carregando leitos...</p>
          ) : bedsFiltrados.length === 0 ? (
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
                {bedsFiltrados.map((bed) => (
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
                        <button
                          onClick={() => handleEditar(bed)}
                          style={styles.editButton}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(bed.id)}
                          style={styles.deleteButton}
                        >
                          Excluir
                        </button>
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

function formatarStatus(status) {
  if (status === 'disponivel') return 'Disponível';
  if (status === 'ocupado') return 'Ocupado';
  if (status === 'manutencao') return 'Manutenção';
  return status;
}

function formatarTipo(tipo) {
  if (tipo === 'enfermaria') return 'Enfermaria';
  if (tipo === 'uti') return 'UTI';
  if (tipo === 'semi-intensivo') return 'Semi-Intensivo';
  if (tipo === 'isolamento') return 'Isolamento';
  if (tipo === 'pediatrico') return 'Pediátrico';
  if (tipo === 'obstetrico') return 'Obstétrico';
  return tipo;
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
    color: '#334155'
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