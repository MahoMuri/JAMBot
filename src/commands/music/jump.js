const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");
const { play, convertDuration } = require("../../../functions");

module.exports = {
    name: "jump",
    aliases: ["j"],
    category: "music",
    description: "",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args) {
        if (message.member.voice.channel) {
            if (!bot.servers[message.guild.id])
                bot.servers[message.guild.id] = {
                    name: message.guild.name,
                    loop: false,
                    queue: [],
                };

            const server = await bot.servers[message.guild.id];
            const connection = await message.member.voice.channel.join();
            if (server.queue.length === 0)
                message.channel.send(
                    "**The Music Queue Is Empty! Use `_play` to add more!**"
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
