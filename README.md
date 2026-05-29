# LeitoSystem

![CI](https://github.com/eduwinner/LeitoSystem/actions/workflows/ci.yml/badge.svg)

Sistema web para gerenciamento de leitos hospitalares desenvolvido como **Projeto de Finalização de Curso (PFC II)** da **UniEvangélica — Engenharia de Software**.

---

## Sobre o Projeto

O **LeitoSystem** é uma aplicação full stack que permite a gestão completa do ciclo de vida de leitos hospitalares: cadastro, alocação de pacientes, controle de manutenção, histórico de movimentação e métricas em tempo real via dashboard operacional.

---

## Funcionalidades

### Autenticação e Segurança
- Login com JWT (expira em 8h)
- Senhas armazenadas com bcrypt (hash + salt)
- Troca de senha obrigatória no primeiro acesso
- Controle de acesso por perfil (RBAC)
- Rate limiting na rota de login (10 tentativas / 15 min)
- CORS restrito por origem via variável de ambiente
- Headers de segurança HTTP com Helmet

### Perfis de Acesso

| Ação | Admin | Médico | Enfermeiro | Recepcionista |
|---|:---:|:---:|:---:|:---:|
| Gerenciar usuários | ✅ | ❌ | ❌ | ❌ |
| CRUD leitos | ✅ | ❌ | ❌ | ❌ |
| Alocar paciente | ✅ | ✅ | ✅ | ✅ |
| Manutenção / Liberar | ✅ | ✅ | ✅ | ❌ |
| CRUD pacientes | ✅ | ✅ | ❌ | ✅ |
| Ver leitos / dashboard | ✅ | ✅ | ✅ | ✅ |

### Gestão de Leitos
- CRUD completo (admin)
- Status: Disponível · Ocupado · Manutenção
- Inativação com preservação de histórico (leitos usados não são excluídos)
- Reativação de leitos inativos
- Listagem com filtros por setor e status (server-side)
- Paginação server-side (20 leitos por página)
- Ordenação alfabética por número

### Gestão de Pacientes
- Cadastro com validação de CPF (algoritmo oficial)
- Máscara de CPF e telefone no formulário
- CPF exibido mascarado na listagem (LGPD: `123.***.***-90`)
- Data de nascimento em formato brasileiro
- Número de prontuário autoincrement (`PRN-000001`)
- Proteção de edição: CPF não exposto ao clicar em editar

### Alocação de Leitos
- Modal de alocação com seleção de paciente por nome e data de nascimento
- Filtragem automática de pacientes já alocados
- Confirmação com SweetAlert2 antes de liberar

### Dashboard Operacional
- Cards clicáveis: Total · Disponíveis · Ocupados · Manutenção · Taxa de Ocupação
- Ações diretas na listagem (alocar, manutenção, liberar) sem sair do dashboard
- Histórico completo de movimentação (alocações, liberações, manutenções)
- Gerenciamento de usuários inline (admin)
- Paginação na listagem de leitos do dashboard

### Histórico de Movimentação
- Registro automático de cada alocação, liberação e manutenção
- Dados: leito, paciente, ação, responsável, data/hora
- Consultável diretamente no dashboard

---

## Tecnologias

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 4.x | Framework HTTP |
| Sequelize | 6.x | ORM |
| PostgreSQL | — | Banco de dados |
| JWT | — | Autenticação |
| bcryptjs | — | Hash de senhas |
| Helmet | — | Headers de segurança |
| express-rate-limit | — | Rate limiting |

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19.x | UI |
| Vite | 5.x | Build tool |
| React Router DOM | 7.x | Navegação |
| Axios | 1.x | HTTP client |
| React Toastify | — | Notificações |
| SweetAlert2 | — | Diálogos de confirmação |

### Qualidade e CI
| Ferramenta | Uso |
|---|---|
| Jest | Testes unitários backend |
| Vitest | Testes unitários frontend |
| ESLint 9 | Lint frontend |
| GitHub Actions | Pipeline de CI |

---

## Testes

### Backend (Jest) — 12 testes
```bash
cd backend
npm test
```
Cobre: `authMiddleware`, `roleMiddleware`, `adminMiddleware`

### Frontend (Vitest) — 27 testes
```bash
cd frontend
npm test
```
Cobre: `mascararCpf`, `ocultarCpf`, `mascararTelefone`, `formatarData`, `formatarProntuario`, `formatarTipo`, `formatarStatus`, `validarCpf`

---

## Arquitetura

```
LeitoSystem/
├── .github/workflows/ci.yml   # Pipeline CI (GitHub Actions)
├── backend/
│   └── src/
│       ├── __tests__/         # Testes Jest
│       ├── config/            # Conexão banco
│       ├── controllers/       # Lógica de negócio
│       ├── middlewares/       # auth, role, admin
│       ├── models/            # User, Bed, Patient, BedHistory
│       └── routes/            # auth, beds, patients, users
└── frontend/
    └── src/
        ├── pages/             # Login, Dashboard, Beds, Patients, Users, TrocarSenha
        ├── services/          # api.js (Axios), swal.js (SweetAlert2)
        └── utils/             # formatters.js, validators.js (+ testes)
```

---

## Como Executar

### Pré-requisitos
- Node.js 20+
- PostgreSQL

### Backend

```bash
cd backend
npm install
```

Crie `backend/.env`:

```env
DB_NAME=leitosystem
DB_USER=postgres
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=sua_chave_secreta
PORT=3001
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

Crie o banco no PostgreSQL:
```sql
CREATE DATABASE leitosystem;
```

Inicie o servidor (sincroniza tabelas automaticamente):
```bash
npm run dev
```

Crie o usuário admin inicial:
```bash
npm run seed
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação disponível em `http://localhost:5173`

---

## Credenciais de Teste

| Campo | Valor |
|---|---|
| E-mail | `admin@leitosystem.com` |
| Senha | `123456` |

> Na primeira vez que um usuário criado pelo admin fizer login, será solicitada a troca de senha.

---

## Banco de Dados

| Tabela | Descrição |
|---|---|
| `users` | Usuários do sistema com perfil de acesso |
| `beds` | Leitos com status e FK para paciente alocado |
| `patients` | Pacientes com CPF único e número de prontuário |
| `bed_history` | Histórico de movimentação dos leitos |

---

## CI/CD

O pipeline executa automaticamente a cada push ou pull request para `main`:

1. **Backend Tests** — Jest com cobertura
2. **Frontend Tests** — Vitest com cobertura
3. **Lint** — ESLint 9

---

## Autores

**Wagdo Junior · Windson · Diego**
Estudantes de Engenharia de Software — UniEvangélica

## Orientadores

**Eduardo Dias Pereira · Vinicius Siqueira · Renato Luan**

---

*Projeto acadêmico — UniEvangélica 2026*
