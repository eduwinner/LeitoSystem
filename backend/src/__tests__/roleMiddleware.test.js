const roleMiddleware = require('../middlewares/roleMiddleware');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('roleMiddleware', () => {
  it('chama next() quando perfil está na lista permitida', () => {
    const middleware = roleMiddleware('admin', 'medico');
    const req = { user: { perfil: 'admin' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('retorna 403 quando perfil não está na lista', () => {
    const middleware = roleMiddleware('admin', 'medico');
    const req = { user: { perfil: 'recepcionista' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('aceita qualquer perfil da lista', () => {
    const middleware = roleMiddleware('admin', 'medico', 'enfermeiro', 'recepcionista');
    const next = jest.fn();

    ['admin', 'medico', 'enfermeiro', 'recepcionista'].forEach((perfil) => {
      const req = { user: { perfil } };
      const res = mockRes();
      middleware(req, res, next);
    });

    expect(next).toHaveBeenCalledTimes(4);
  });

  it('rejeita perfil não cadastrado no sistema', () => {
    const middleware = roleMiddleware('admin');
    const req = { user: { perfil: 'hacker' } };
    const res = mockRes();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
