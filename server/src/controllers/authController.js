import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Station from '../models/Station.js';
import User from '../models/User.js';

function issueToken(user) {
  return jwt.sign(
    { userId: user._id, stationId: user.stationId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Creates a new station tenant plus its first admin user.
export async function signup(req, res) {
  const { stationName, location, ownerContact, adminName, email, password } = req.body;
  if (!stationName || !adminName || !email || !password) {
    return res.status(400).json({ error: 'stationName, adminName, email and password are required' });
  }

  const station = await Station.create({ name: stationName, location, ownerContact });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    stationId: station._id,
    name: adminName,
    email: email.toLowerCase(),
    passwordHash,
    role: 'admin',
  });

  res.status(201).json({ token: issueToken(user), station, user: { id: user._id, name: user.name, role: user.role } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ token: issueToken(user), user: { id: user._id, name: user.name, role: user.role, stationId: user.stationId } });
}
