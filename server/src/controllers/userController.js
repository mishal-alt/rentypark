import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { scopedFind, withStation } from '../utils/tenantScope.js';

export async function listUsers(req, res) {
  const users = await scopedFind(User, req.auth.stationId).select('-passwordHash');
  res.json(users);
}

export async function createOperator(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create(
    withStation(req.auth.stationId, { name, email: email.toLowerCase(), passwordHash, role: 'operator' })
  );
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
}
