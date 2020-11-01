const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "clear",
    aliases: ["clr"],
    category: "music",
    description: "Clears the queue",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args, prefix) {
        const server = await bot.servers[message.guild.id];

        if (message.member.voice.channel)
            if (server && server.queue.length === 0) {
                const embed = new MessageEmbed()
                    .setDescription(
                        `**❌ The Music Queue Is Empty! Use \`${prefix}play\` to add more!**`
                    )
                    .setColor(colors.Red);
                return message.channel.send(embed);
            } else {
                const queueLength = server.queue.length - 1;
                server.queue.splice(1, server.queue.length - 1);
                const embed = new MessageEmbed()
                    .setColor(colors.Green)
                    .setDescription(
                        `✅ **Successfully cleared ${queueLength} song${
                            queueLength === 1 ? "" : "s"
                        }**`
                    );
                message.channel.send(embed);
            }
        else
            return message.channel.send(
                "❌ **Please join a Voice Channel first!**"
            );
    },
};
