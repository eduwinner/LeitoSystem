import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { confirmarExcluir } from '../services/swal';
import { mascararCpf, ocultarCpf, mascararTelefone, formatarData, formatarProntuario } from '../utils/formatters';
import { validarCpf } from '../utils/validators';


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
  const [cpfOriginal, setCpfOriginal] = useState('');
  const [cpfMascarado, setCpfMascarado] = useState(false);

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const podeCrud = ['admin', 'medico', 'recepcionista'].includes(usuario?.perfil);

  const carregarPacientes = async () => {
    try {
      const response = await api.get('/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(response.data);
    } catch {
      setMensagem('Erro ao carregar pacientes.');
    }
  };

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    carregarPacientes();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const cpfLimpo = cpfMascarado ? cpfOriginal : cpf.replace(/\D/g, '');
    if (!cpfMascarado && !validarCpf(cpfLimpo)) {
      toast.error('CPF inválido. Verifique os dígitos informados.');
      return;
    }
    const telefoneLimpo = telefone.replace(/\D/g, '');
    if (editandoId) {
      await api.put(
        `/patients/${editandoId}`,
        {
          nome,
          cpf: cpfLimpo,
          dataNascimento,
          sexo,
          telefone: telefoneLimpo
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
          cpf: cpfLimpo,
          dataNascimento,
          sexo,
          telefone: telefoneLimpo
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
    setCpfOriginal('');
    setCpfMascarado(false);

    carregarPacientes();

  } catch (error) {
    const erroBackend = error.response?.data?.message;

    toast.error(erroBackend || 'Erro ao salvar paciente.');
  }
};

  const handleEditar = (patient) => {
  setNome(patient.nome);
  setCpfOriginal(patient.cpf);
  setCpf(ocultarCpf(patient.cpf));
  setCpfMascarado(true);
  setDataNascimento(patient.dataNascimento);
  setSexo(patient.sexo);
  setTelefone(mascararTelefone(patient.telefone || ''));
  setEditandoId(patient.id);
};


const handleExcluir = async (id) => {
  const { isConfirmed } = await confirmarExcluir('Excluir paciente?', 'Esta ação não pode ser desfeita.');
  if (!isConfirmed) return;

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
        {podeCrud && <section style={styles.card}>
          <h2 style={styles.sectionTitle}>{editandoId ? 'Editar Paciente' : 'Cadastrar Paciente'}</h2>

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
              placeholder="CPF (000.000.000-00)"
              value={cpf}
              onFocus={() => { if (cpfMascarado) { setCpf(''); setCpfMascarado(false); } }}
              onChange={(e) => setCpf(mascararCpf(e.target.value))}
              maxLength={14}
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
              placeholder="Telefone ((00) 00000-0000)"
              value={telefone}
              onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
              maxLength={15}
              style={styles.input}
            />

            <button type="submit" style={styles.primaryButton}>
              Cadastrar
            </button>
          </form>

          {mensagem && <p style={styles.message}>{mensagem}</p>}
        </section>}

        <section style={{ ...styles.card, gridColumn: !podeCrud ? '1 / -1' : 'auto' }}>
          <h2 style={styles.sectionTitle}>Lista de Pacientes</h2>

          {patients.length === 0 ? (
            <p>Nenhum paciente encontrado.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Prontuário</th>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>CPF</th>
                  <th style={styles.th}>Data Nasc.</th>
                  <th style={styles.th}>Sexo</th>
                  <th style={styles.th}>Telefone</th>
                  {podeCrud && <th style={styles.th}>Ações</th>}
                </tr>
              </thead>

              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}>
                    <td style={styles.td}>{formatarProntuario(p.numeroProntuario)}</td>
                    <td style={styles.td}>{p.nome}</td>
                    <td style={styles.td}>{ocultarCpf(p.cpf)}</td>
                    <td style={styles.td}>{formatarData(p.dataNascimento)}</td>
                    <td style={styles.td}>{p.sexo}</td>
                    <td style={styles.td}>{mascararTelefone(p.telefone || '')}</td>

                    
                    {podeCrud && (
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          <button onClick={() => handleEditar(p)} style={styles.editButton}>Editar</button>
                          <button onClick={() => handleExcluir(p.id)} style={styles.deleteButton}>Excluir</button>
                        </div>
                      </td>
                    )}
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
    backgroundColor: '#eff6ff',
    textAlign: 'left'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    textAlign: 'left'
  },
  message: {
    marginTop: '12px'
  }
};



export default Patients;