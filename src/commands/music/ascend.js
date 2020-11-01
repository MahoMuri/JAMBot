const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "ascend",
    aliases: ["asc"],
    category: "music",
    description: "Brings the selected song to the top of the queue.",
    usage: ["`-<command | alias> < Number of song >`"],
    async run(bot, message, args, prefix) {
        if (message.member.voice.channel) {
            const server = await bot.servers[message.guild.id];
            if (server.queue.length === 0) {
                const embed = new MessageEmbed()
                    .setDescription(
                        `**❌ The Music Queue Is Empty! Use \`${prefix}play\` to add more!**`
                    )
                    .setColor(colors.Red);
                return message.channel.send(embed);
            } else if (isNaN(args[0]))
                return message.channel.send("❌ **Error, not a number!**");
            else {
                message.react("👌");
                const index = args[0] - 1;
                const songChoice = server.queue[index];
                server.queue.splice(index, 1);
                server.queue.splice(1, 0, songChoice);
                const embed = new MessageEmbed()
                    .setTitle("✅ Ascended! ")
                    .setColor(colors.Green)
                    .setDescription(
                        `Succefully ascended [${songChoice.title}](${songChoice.song}) to the top of the queue!`
                    );
                message.channel.send(embed);
            }
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
