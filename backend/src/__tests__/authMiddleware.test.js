const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

process.env.JWT_SECRET = 'test_secret';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  it('retorna 401 quando Authorization header está ausente', () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token não informado.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 401 quando token é inválido', () => {
    const req = { headers: { authorization: 'Bearer token_invalido' } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('chama next() e define req.user com token válido', () => {
    const payload = { id: 1, email: 'admin@test.com', perfil: 'admin' };
    const token = jwt.sign(payload, 'test_secret', { expiresIn: '1h' });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 1, email: 'admin@test.com', perfil: 'admin' });
  });

  it('retorna 401 quando token está expirado', () => {
    const token = jwt.sign({ id: 1 }, 'test_secret', { expiresIn: '-1s' });

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token expirado ou inválido.' });
  });
});
