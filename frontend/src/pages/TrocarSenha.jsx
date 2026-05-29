import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

function TrocarSenha() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmar) {
      toast.error('As senhas não coincidem.');
      return;
    }
    try {
      await api.put('/auth/trocar-senha', { novaSenha }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Senha alterada com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>LeitoSystem</h1>
        <div style={styles.alertBox}>
          <strong>Troca de senha obrigatória</strong>
          <p style={styles.alertText}>Olá, {usuario?.nome}. Por segurança, você precisa definir uma nova senha antes de continuar.</p>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="Nova senha (mínimo 6 caracteres)"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            style={styles.input}
            autoFocus
          />
          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Salvar e continuar</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  title: {
    margin: '0 0 24px 0',
    color: '#1d4ed8',
    textAlign: 'center',
    fontSize: '28px'
  },
  alertBox: {
    backgroundColor: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    color: '#92400e'
  },
  alertText: {
    margin: '8px 0 0 0',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    marginTop: '8px'
  }
};

export default TrocarSenha;
