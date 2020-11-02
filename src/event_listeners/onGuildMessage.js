/**
 * @file message listener (2/2)
 */
const { DMChannel } = require("discord.js");

const fs = require("fs");

const { defaultPrefix } = require("../../botprefix.json");

module.exports = (bot) => {
    bot.on("message", async (message) => {
        // console.log(defaultPrefix);
        if (message.channel instanceof DMChannel) return;

        const prefixes = JSON.parse(
            fs.readFileSync(`${__dirname}/../../prefixes.json`, "utf8")
        );

        if (!prefixes[message.guild.id]) {
            prefixes[message.guild.id] = {
                prefix: defaultPrefix,
            };

            fs.writeFileSync(
                `${__dirname}/../../prefixes.json`,
                JSON.stringify(prefixes, null, "\t")
            );
        }

        const lsprfxes = [
            prefixes[message.guild.id].prefix,
            `<@${bot.user.id}>`,
            `<@&${bot.user.id}>`,
            `<@!${bot.user.id}>`,
        ];

        const prefix = lsprfxes
            .filter((prfx) => message.content.startsWith(prfx))
            .join("");

        if (message.author.bot || !message.guild || !prefix.length >= 1) return;

        // If message.member is uncached, cache it.
        if (!message.member)
            message.member = await message.guild.fetchMember(message);

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        if (prefix.includes(bot.user.id) && cmd.length === 0)
            message.channel.send("Hello");

        if (cmd.length === 0) return;

        // Get the command
        let command = bot.commands.get(cmd);

        // If none is found, try to find it by alias
        if (!command) command = bot.commands.get(bot.aliases.get(cmd));

        // If a command is finally found, run the command
        if (command) {
            bot.messageCache.push(message.id);

            if (!bot.servers[message.guild.id])
                bot.servers[message.guild.id] = {
                    name: message.guild.name,
                    channel: {
                        text: message.channel,
                    },
                    loop: {
                        song: false,
                        queue: false,
                    },
                    queue: [],
                };
            command.run(bot, message, args, lsprfxes[0]);
        }
    });
};
