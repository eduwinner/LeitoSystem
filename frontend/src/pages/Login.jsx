import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await api.post('/auth/login', {
        email,
        senha
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));

      navigate('/dashboard');
    } catch (error) {
      setMensagem('Email ou senha inválidos');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* LOGO */}
        <img src={logo} alt="LeitoSystem" style={styles.logo} />

        <h2 style={styles.title}>Bem-vindo</h2>
        <p style={styles.subtitle}>Acesse sua conta</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={styles.input}
          />

          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            Entrar
          </button>
        </form>

        {mensagem && <p style={styles.error}>{mensagem}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },

  card: {
    backgroundColor: '#ffffff',
    padding: '40px 30px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '380px',
    textAlign: 'center'
  },

  logo: {
  width: '280px',
  height: 'auto',
  marginBottom: '16px'
},

  title: {
    margin: 0,
    fontSize: '24px',
    color: '#0f172a'
  },

  subtitle: {
    marginBottom: '20px',
    color: '#64748b',
    fontSize: '14px'
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

  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: '0.2s'
  },

  error: {
    marginTop: '10px',
    color: '#dc2626',
    fontSize: '14px'
  }
};

export default Login;