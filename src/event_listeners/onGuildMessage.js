/**
 * @file message listener (2/2)
 */
const { DMChannel } = require("discord.js");

const fs = require("fs");

const { defaultPrefix } = require(`${__dirname}/../../botprefix.json`);

module.exports = (bot) => {
    bot.on("message", async (message) => {
        // console.log("message received");
        if (message.channel instanceof DMChannel) return;

        const prefixes = JSON.parse(
            fs.readFileSync(`${__dirname}/../../prefixes.json`, "utf8")
        );

        if (!prefixes[message.guild.id]) {
            prefixes[message.guild.id] = {
                prefixes: defaultPrefix,
            };

            fs.writeFileSync(
                `${__dirname}/../../prefixes.json`,
                JSON.stringify(prefixes)
            );
        }

        const prefix = prefixes[message.guild.id].prefixes;
        if (
            message.author.bot ||
            !message.guild ||
            !message.content.startsWith(prefix)
        )
            return;
        // If message.member is uncached, cache it.
        if (!message.member)
            message.member = await message.guild.fetchMember(message);

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        if (cmd.length === 0) return;

        // Get the command
        let command = bot.commands.get(cmd);

        // If none is found, try to find it by alias
        if (!command) command = bot.commands.get(bot.aliases.get(cmd));

        // If a command is finally found, run the command
        if (command) command.run(bot, message, args, prefix);
    });
};
