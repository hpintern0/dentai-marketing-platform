const fs = require('fs');
const path = require('path');

class PipelineLogger {
  constructor(taskName, agentName) {
    this.taskName = taskName;
    this.agentName = agentName;
    this.logDir = path.resolve(__dirname, `../../outputs/${taskName}/logs`);
    this.logFile = path.join(this.logDir, `${agentName}.log`);
    this.entries = [];

    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(level, message, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      agent: this.agentName,
      message,
      ...(data ? { data } : {}),
    };

    this.entries.push(entry);
    const line = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.agentName}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;

    console[level === 'error' ? 'error' : 'log'](line);
    fs.appendFileSync(this.logFile, line + '\n');

    return entry;
  }

  info(message, data) { return this.log('info', message, data); }
  warn(message, data) { return this.log('warn', message, data); }
  error(message, data) { return this.log('error', message, data); }
  debug(message, data) { return this.log('debug', message, data); }

  getEntries() { return this.entries; }

  summary() {
    return {
      agent: this.agentName,
      total_entries: this.entries.length,
      errors: this.entries.filter(e => e.level === 'error').length,
      warnings: this.entries.filter(e => e.level === 'warn').length,
    };
  }
}

module.exports = { PipelineLogger };
