import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const navigate = useNavigate();

  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [filtroSelecionado, setFiltroSelecionado] = useState(null);
  const [leitos, setLeitos] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    carregarDashboard();
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

  const carregarLeitos = async (status) => {
    try {
      const response = await api.get('/beds', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      let filtrados = response.data;

      if (status) {
        filtrados = filtrados.filter((b) => b.status === status);
      }

      setLeitos(filtrados);
      setFiltroSelecionado(status);
    } catch (error) {
      console.log(error);
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
        <h1 style={styles.title}>Dashboard</h1>

        <div style={styles.actions}>
          <button onClick={() => navigate('/beds')} style={styles.navButton}>
            Leitos
          </button>

          <button onClick={() => navigate('/patients')} style={styles.navButton}>
            Pacientes
          </button>

          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </div>
      </header>

      {erro && <p style={styles.error}>{erro}</p>}

      {dados && (
        <div style={styles.grid}>
          <Card
            title="Total de Leitos"
            value={dados.total}
            onClick={() => carregarLeitos(null)}
            ativo={filtroSelecionado === null}
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
        </div>
      )}

      {filtroSelecionado !== null && (
        <div style={styles.listaContainer}>
          <h2 style={styles.subTitle}>
            Leitos {filtroSelecionado}
          </h2>

          {leitos.length === 0 ? (
            <p>Nenhum leito encontrado.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Número</th>
                  <th style={styles.th}>Setor</th>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Status</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
    margin: 0
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
    borderBottom: '2px solid #e2e8f0'
  },

  td: {
    padding: '12px',
    borderBottom: '1px solid #e2e8f0'
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
  }
};

export default Dashboard;