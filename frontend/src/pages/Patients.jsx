import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';


function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [telefone, setTelefone] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      const response = await api.get('/patients', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPatients(response.data);
    } catch (error) {
      setMensagem('Erro ao carregar pacientes.');
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    if (editandoId) {
      await api.put(
        `/patients/${editandoId}`,
        {
          nome,
          cpf,
          dataNascimento,
          sexo,
          telefone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Paciente atualizado com sucesso!');
    } else {
      await api.post(
        '/patients',
        {
          nome,
          cpf,
          dataNascimento,
          sexo,
          telefone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Paciente cadastrado com sucesso!');
    }

    // limpar formulário
    setNome('');
    setCpf('');
    setDataNascimento('');
    setSexo('');
    setTelefone('');
    setEditandoId(null);

    carregarPacientes();

  } catch (error) {
    const erroBackend = error.response?.data?.message;

    toast.error(erroBackend || 'Erro ao salvar paciente.');
  }
};

  const handleEditar = (patient) => {
  setNome(patient.nome);
  setCpf(patient.cpf);
  setDataNascimento(patient.dataNascimento);
  setSexo(patient.sexo);
  setTelefone(patient.telefone);
  setEditandoId(patient.id);
};

const handleExcluir = async (id) => {
  const confirmar = window.confirm('Deseja excluir este paciente?');

  if (!confirmar) return;

  try {
    await api.delete(`/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setMensagem('Paciente excluído com sucesso');
    carregarPacientes();
  } catch (error) {
    setMensagem('Erro ao excluir paciente');
  }
};

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>LeitoSystem</h1>
          <p style={styles.subtitle}>Gestão de Pacientes</p>
        </div>

        <div style={styles.headerRight}>
          <button
            onClick={() => navigate('/beds')}
            style={styles.navButton}
          >
            Voltar para Leitos
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Cadastrar Paciente</h2>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={styles.input}
            />

            <input
              type="text"
              placeholder="CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              style={styles.input}
            />

            <input
              type="date"
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              style={styles.input}
            />

            <select
              value={sexo}
              onChange={(e) => setSexo(e.target.value)}
              style={styles.input}
            >
              <option value="">Selecione o sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>

            <input
              type="text"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              style={styles.input}
            />

            <button type="submit" style={styles.primaryButton}>
              Cadastrar
            </button>
          </form>

          {mensagem && <p style={styles.message}>{mensagem}</p>}
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Lista de Pacientes</h2>

          {patients.length === 0 ? (
            <p>Nenhum paciente encontrado.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>CPF</th>
                  <th style={styles.th}>Data Nasc.</th>
                  <th style={styles.th}>Sexo</th>
                  <th style={styles.th}>Telefone</th>
                </tr>
              </thead>

              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.nome}</td>
                    <td style={styles.td}>{p.cpf}</td>
                    <td style={styles.td}>{p.dataNascimento}</td>
                    <td style={styles.td}>{p.sexo}</td>
                    <td style={styles.td}>{p.telefone}</td>

                    
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => handleEditar(p)}
                          style={styles.editButton}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleExcluir(p.id)}
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

const styles = {

  actions: {
  display: 'flex',
  gap: '8px'
},

editButton: {
  backgroundColor: '#0ea5e9',
  color: '#ffffff',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  transition: '0.2s'
},

deleteButton: {
  backgroundColor: '#dc2626',
  color: '#ffffff',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  transition: '0.2s'
},

  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '24px'
  },
  header: {
    backgroundColor: '#1d4ed8',
    color: '#fff',
    borderRadius: '16px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  headerRight: {
    display: 'flex',
    gap: '12px'
  },
  title: {
    margin: 0
  },
  subtitle: {
    margin: 0,
    fontSize: '14px'
  },
  navButton: {
    backgroundColor: '#16a34a',
    color: '#fff',
    border: 'none',
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
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
  },
  sectionTitle: {
    marginBottom: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    padding: '12px',
    backgroundColor: '#eff6ff'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee'
  },
  message: {
    marginTop: '12px'
  }
};



export default Patients;