const CommandUsage = require('../usage/CommandUsage');

class SubCommand {
  constructor(client, name, command, usageString, options = {}) {
    this.name = name;

    this.parent = command;

    this.aliases = options.aliases || [];

    this.usage = new CommandUsage(client, usageString, options.friendlyUsage || '', options.usageDelim || this.parent.usage.usageDelim, this);
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      usage: {
        fullUsage: this.usage.fullUsage
      }
    }
  }
}

module.exports = SubCommand;
