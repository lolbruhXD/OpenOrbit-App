import fs from 'fs';
import path from 'path';

const logsDir = path.resolve(process.cwd(), 'logs');

export const logEvent = async (req, res) => {
  try {
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const filePath = path.join(logsDir, 'events.log');
    const entry = {
      timestamp: new Date().toISOString(),
      ...req.body,
    };
    fs.appendFileSync(filePath, JSON.stringify(entry) + '\n');
    res.status(200).json({ message: 'Event logged' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to log event' });
  }
};