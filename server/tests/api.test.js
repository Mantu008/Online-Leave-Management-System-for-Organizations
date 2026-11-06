const test = require('node:test');
const assert = require('node:assert/strict');
const { startTestServer, isoDay } = require('./helpers');
const User = require('../models/User');
const { signToken } = require('../middleware/auth');

let api;
const tokens = {};
const ids = {};

const baseUser = {
  password: 'secret123',
  position: 'Engineer',
  joiningDate: '2023-01-10',
};

async function seedUser(key, overrides) {
  const user = await User.create({ ...baseUser, name: key, email: `${key}@example.com`, ...overrides });
  ids[key] = String(user._id);
  tokens[key] = signToken(user);
  return user;
}

test.before(async () => {
  api = await startTestServer();
  await seedUser('admin', { role: 'admin', department: 'Administration' });
  await seedUser('itManager', { role: 'manager', department: 'IT' });
  await seedUser('hrManager', { role: 'manager', department: 'HR' });
  await seedUser('alice', { role: 'employee', department: 'IT', leaveBalance: { annual: 5, sick: 10, casual: 10 } });
});

test.after(async () => {
  if (api) await api.stop();
});

test('public registration cannot grant elevated roles', async () => {
  const res = await api.request('POST', '/auth/register', {
    body: { ...baseUser, name: 'Mallory', email: 'Mallory@Example.com', department: 'IT', role: 'admin' },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.user.role, 'employee');
  assert.equal(res.body.user.email, 'mallory@example.com');
  assert.equal(res.body.user.password, undefined);
});

test('registration rejects duplicates and invalid input', async () => {
  const dup = await api.request('POST', '/auth/register', {
    body: { ...baseUser, name: 'Again', email: 'MALLORY@example.com', department: 'IT' },
  });
  assert.equal(dup.status, 409);

  const invalid = await api.request('POST', '/auth/register', {
    body: { ...baseUser, name: 'Future', email: 'future@example.com', department: 'IT', joiningDate: '2999-01-01' },
  });
  assert.equal(invalid.status, 400);
  assert.match(invalid.body.message, /future/i);
});

test('login is case-insensitive on email and blocks deactivated accounts', async () => {
  const ok = await api.request('POST', '/auth/login', { body: { email: 'ALICE@example.com', password: 'secret123' } });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.token);
  assert.equal(ok.body.user.position, 'Engineer');

  const wrong = await api.request('POST', '/auth/login', { body: { email: 'alice@example.com', password: 'nope' } });
  assert.equal(wrong.status, 400);

  await seedUser('inactive', { role: 'employee', department: 'IT', isActive: false });
  const blocked = await api.request('POST', '/auth/login', {
    body: { email: 'inactive@example.com', password: 'secret123' },
  });
  assert.equal(blocked.status, 403);
  const me = await api.request('GET', '/auth/me', { token: tokens.inactive });
  assert.equal(me.status, 401);
});

test('role restrictions return 403 without invalidating the session', async () => {
  const forbidden = await api.request('GET', '/users', { token: tokens.alice });
  assert.equal(forbidden.status, 403);
  const me = await api.request('GET', '/auth/me', { token: tokens.alice });
  assert.equal(me.status, 200);
  assert.equal(me.body.password, undefined);
});

test('leave days are computed on the server, not trusted from the client', async () => {
  const res = await api.request('POST', '/leaves', {
    token: tokens.alice,
    body: { startDate: isoDay(10), endDate: isoDay(12), leaveType: 'annual', reason: 'Family trip out of town', totalDays: 1 },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.totalDays, 3);
  ids.aliceLeave = res.body._id;
});

test('leave creation validates dates, overlap and balance', async () => {
  const reason = 'Personal errands to run';
  const past = await api.request('POST', '/leaves', {
    token: tokens.alice,
    body: { startDate: isoDay(-5), endDate: isoDay(-4), leaveType: 'sick', reason },
  });
  assert.equal(past.status, 400);

  const overlap = await api.request('POST', '/leaves', {
    token: tokens.alice,
    body: { startDate: isoDay(12), endDate: isoDay(13), leaveType: 'casual', reason },
  });
  assert.equal(overlap.status, 409);

  const tooLong = await api.request('POST', '/leaves', {
    token: tokens.alice,
    body: { startDate: isoDay(30), endDate: isoDay(40), leaveType: 'annual', reason },
  });
  assert.equal(tooLong.status, 400);
  assert.match(tooLong.body.message, /Not enough annual leave/);

  const managerTry = await api.request('POST', '/leaves', {
    token: tokens.itManager,
    body: { startDate: isoDay(30), endDate: isoDay(30), leaveType: 'sick', reason },
  });
  assert.equal(managerTry.status, 403);
});

test('recurring holidays block leave in later years', async () => {
  const lastYear = new Date().getUTCFullYear() - 1;
  const target = new Date(Date.UTC(new Date().getUTCFullYear() + 1, 4, 20)); // 20 May next year
  const created = await api.request('POST', '/holidays', {
    token: tokens.admin,
    body: { name: 'Founders Day', date: `${lastYear}-05-20`, type: 'company', isRecurring: true },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.isRecurring, true);

  const nextYear = await api.request('GET', `/holidays?year=${target.getUTCFullYear()}`, { token: tokens.alice });
  assert.equal(nextYear.status, 200);
  assert.ok(nextYear.body.some((h) => h.name === 'Founders Day' && h.date.startsWith(target.toISOString().slice(0, 10))));

  const day = target.toISOString().slice(0, 10);
  const blocked = await api.request('POST', '/leaves', {
    token: tokens.alice,
    body: { startDate: day, endDate: day, leaveType: 'sick', reason: 'Medical appointment' },
  });
  assert.equal(blocked.status, 400);
  assert.match(blocked.body.message, /Founders Day/);

  const employeeCreate = await api.request('POST', '/holidays', {
    token: tokens.alice,
    body: { name: 'Nope', date: '2030-01-01', type: 'public' },
  });
  assert.equal(employeeCreate.status, 403);
});

test('managers can only decide requests in their own department', async () => {
  const res = await api.request('PATCH', `/leaves/${ids.aliceLeave}`, {
    token: tokens.hrManager,
    body: { status: 'approved' },
  });
  assert.equal(res.status, 403);

  const list = await api.request('GET', '/leaves', { token: tokens.hrManager });
  assert.equal(list.body.length, 0);
});

test('approval deducts balance exactly once and keeps the manager note', async () => {
  const approve = await api.request('PATCH', `/leaves/${ids.aliceLeave}`, {
    token: tokens.itManager,
    body: { status: 'approved', managerNote: 'Enjoy the trip' },
  });
  assert.equal(approve.status, 200);
  assert.equal(approve.body.status, 'approved');
  assert.equal(approve.body.managerNote, 'Enjoy the trip');
  assert.equal(approve.body.employee.leaveBalance.annual, 2);

  const again = await api.request('PATCH', `/leaves/${ids.aliceLeave}`, {
    token: tokens.itManager,
    body: { status: 'approved' },
  });
  assert.equal(again.status, 409);

  const alice = await User.findById(ids.alice);
  assert.equal(alice.leaveBalance.annual, 2);
});

test('concurrent approvals cannot overdraw a balance', async () => {
  const reason = 'Short break to recharge';
  const a = await api.request('POST', '/leaves', {
    token: tokens.alice,
    body: { startDate: isoDay(50), endDate: isoDay(51), leaveType: 'annual', reason },
  });
  const b = await api.request('POST', '/leaves', {
    token: tokens.alice,
    body: { startDate: isoDay(60), endDate: isoDay(61), leaveType: 'annual', reason },
  });
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);

  const results = await Promise.all(
    [a.body._id, b.body._id].map((id) =>
      api.request('PATCH', `/leaves/${id}`, { token: tokens.itManager, body: { status: 'approved' } })
    )
  );
  const statuses = results.map((r) => r.status).sort();
  assert.deepEqual(statuses, [200, 400]);

  const alice = await User.findById(ids.alice);
  assert.equal(alice.leaveBalance.annual, 0);

  // The request that could not be funded goes back to pending, not lost.
  const pending = await api.request('GET', '/leaves?status=pending', { token: tokens.alice });
  assert.equal(pending.body.length, 1);
});

test('rejection leaves the balance untouched', async () => {
  const created = await api.request('POST', '/leaves', {
    token: tokens.alice,
    body: { startDate: isoDay(70), endDate: isoDay(70), leaveType: 'sick', reason: 'Dentist appointment' },
  });
  const res = await api.request('PATCH', `/leaves/${created.body._id}`, {
    token: tokens.itManager,
    body: { status: 'rejected', managerNote: 'Release week' },
  });
  assert.equal(res.status, 200);
  const alice = await User.findById(ids.alice);
  assert.equal(alice.leaveBalance.sick, 10);
});

test('admin user management never exposes password hashes and protects the admin account', async () => {
  const created = await api.request('POST', '/users', {
    token: tokens.admin,
    body: { ...baseUser, name: 'Bob', email: 'bob@example.com', role: 'manager', department: 'Finance', position: 'Lead', joiningDate: '2022-05-01' },
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.position, 'Lead');
  assert.equal(created.body.password, undefined);

  const updated = await api.request('PUT', `/users/${created.body._id}`, {
    token: tokens.admin,
    body: { isActive: false, department: 'HR' },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.body.password, undefined);
  assert.equal(updated.body.isActive, false);

  const duplicate = await api.request('PUT', `/users/${created.body._id}`, {
    token: tokens.admin,
    body: { email: 'alice@example.com' },
  });
  assert.equal(duplicate.status, 409);

  const demoteSelf = await api.request('PUT', `/users/${ids.admin}`, { token: tokens.admin, body: { role: 'employee' } });
  assert.equal(demoteSelf.status, 400);
  const deleteSelf = await api.request('DELETE', `/users/${ids.admin}`, { token: tokens.admin });
  assert.equal(deleteSelf.status, 400);

  const badId = await api.request('DELETE', '/users/not-an-id', { token: tokens.admin });
  assert.equal(badId.status, 400);
});

test('statistics endpoints return complete series', async () => {
  const employee = await api.request('GET', '/leaves/employee/stats', { token: tokens.alice });
  assert.equal(employee.status, 200);
  assert.equal(employee.body.monthly.length, 12);
  assert.equal(employee.body.counts.total, 4);
  assert.equal(employee.body.daysTaken.annual, 5);

  const manager = await api.request('GET', '/leaves/manager/stats', { token: tokens.itManager });
  assert.equal(manager.status, 200);
  assert.equal(manager.body.monthly.length, 6);
  assert.equal(manager.body.department, 'IT');

  const admin = await api.request('GET', '/admin/stats', { token: tokens.admin });
  assert.equal(admin.status, 200);
  assert.equal(admin.body.monthly.length, 6);
  assert.ok(admin.body.users.total >= 5);

  const forbidden = await api.request('GET', '/admin/stats', { token: tokens.itManager });
  assert.equal(forbidden.status, 403);
});

test('demo login signs in as each role and repairs tampered demo accounts', async () => {
  for (const role of ['employee', 'manager', 'admin']) {
    const res = await api.request('POST', '/auth/demo', { body: { role } });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, role);
    assert.ok(res.body.token);
    assert.equal(res.body.user.password, undefined);
  }

  await User.updateOne({ email: 'demo.manager@leave-demo.com' }, { $set: { isActive: false, role: 'employee' } });
  const repaired = await api.request('POST', '/auth/demo', { body: { role: 'manager' } });
  assert.equal(repaired.status, 200);
  assert.equal(repaired.body.user.role, 'manager');
  assert.equal(repaired.body.user.isActive, true);

  const bad = await api.request('POST', '/auth/demo', { body: { role: 'superuser' } });
  assert.equal(bad.status, 400);

  process.env.DEMO_LOGIN = 'false';
  try {
    const off = await api.request('POST', '/auth/demo', { body: { role: 'admin' } });
    assert.equal(off.status, 404);
  } finally {
    delete process.env.DEMO_LOGIN;
  }
});
