const { Monitor, Stopwatch } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, { ignoreOthers: false });
		this.ignoreEdits = !this.client.options.commandEditing;
	}

	async run(message) {
		if (message.guild && !message.guild.me) await message.guild.members.fetch(this.client.user);
		if (!message.channel.postable) return undefined;
		if (!message.commandText && message.prefix === this.client.mentionPrefix) {
			const prefix = message.guildSettings.get('prefix');
			return message.sendLocale('PREFIX_REMINDER', [prefix.length ? prefix : undefined]);
		}
		if (!message.commandText) return undefined;
		if (!message.command) return this.client.emit('commandUnknown', message, message.commandText, message.prefix, message.prefixLength);
		this.client.emit('commandRun', message, message.command, message.args);

		return this.runCommand(message);
	}

	async runCommand(message) {
		const { command, params } = message;
		const timer = new Stopwatch();
		if (this.client.options.typing) message.channel.startTyping();
		try {
			await this.client.inhibitors.run(message, command);
			try {
				await message.prompter.run();
				try {
					const subcommand = message.subcommand ? message.subcommand.name : undefined;
          				const defaultCommand = !subcommand && command.usage.parsedUsage.length && command.usage.parsedUsage[0].possibles.find(p => p.name === params[0]) ? params[0] : undefined;
          				const commandRun = subcommand || defaultCommand ? command[subcommand || defaultCommand](message, params) : command.run(message, params);
          				timer.stop();
					const response = await commandRun;
					this.client.finalizers.run(message, command, response, timer);
					this.client.emit('commandSuccess', message, command, params, response);
				} catch (error) {
					this.client.emit('commandError', message, command, params, error);
				}
			} catch (argumentError) {
				this.client.emit('argumentError', message, command, params, argumentError);
			}
		} catch (response) {
			this.client.emit('commandInhibited', message, command, response);
		}
		if (this.client.options.typing) message.channel.stopTyping();
	}

};
