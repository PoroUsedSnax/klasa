const CommandUsage = require('../usage/CommandUsage');

class SubCommand {
  constructor(client, name, command, usageString, options = {}) {
    this.name = name;

    this.parent = command;

    this.aliases = options.aliases || [];

    this.usage = new CommandUsage(client, usageString, options.friendlyUsage || '', options.usageDelim || this.parent.usage.usageDelim, this);
  }
}

module.exports = SubCommand;
