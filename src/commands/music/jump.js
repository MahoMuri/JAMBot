const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");
const { play, convertDuration } = require("../../../functions");

module.exports = {
    name: "jump",
    aliases: ["jmp"],
    category: "music",
    description: "Jumps to the selected song in the queue.",
    usage: ["`-<command | alias> < Number of song >`"],
    async run(bot, message, args, prefix) {
        if (message.member.voice.channel) {
            const server = await bot.servers[message.guild.id];
            const connection = await message.member.voice.channel.join();
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
                const jump = server.queue[index];
                server.queue.splice(index, 1);
                server.queue.unshift(jump);
                const embed = new MessageEmbed()
                    .setTitle("✅ Jumped to: ")
                    .setColor(colors.Green)
                    .setDescription(
                        stripIndents`[${jump.title}](${
                            jump.song
                        }) | \`${convertDuration(
                            jump.duration
                        )}\`\nRequested by: ${jump.owner}`
                    );
                message.channel.send(embed);
                play(connection, message, server, bot);
            }
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
