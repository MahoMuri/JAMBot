const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");
const { play, convertDuration } = require("../../../functions");

module.exports = {
    name: "jump",
    aliases: ["jmp"],
    category: "music",
    description: "Jumps to the selected song in the queue.",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args, prefix) {
        if (message.member.voice.channel) {
            const server = await bot.servers[message.guild.id];
            const connection = await message.member.voice.channel.join();
            if (server.queue.length === 0)
                message.channel.send(
                    `**The Music Queue Is Empty! Use \`${prefix}play\` to add more!**`
                );
            else if (isNaN(args[0]))
                return message.channel.send("❌ **Error, not a number!**");
            else {
                message.react("👌");
                const index = args[0] - 1;
                server.jump = index;
                const embed = new MessageEmbed()
                    .setTitle("✅ Jumped to: ")
                    .setColor(colors.Green)
                    .setDescription(
                        stripIndents`[${server.queue[index].title}](${
                            server.queue[index].song
                        }) | \`${convertDuration(
                            server.queue[index].duration
                        )}\`\nRequested by: ${server.queue[index].owner}`
                    );
                message.channel.send(embed);
                play(connection, message, server, bot, server.jump);
            }
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
