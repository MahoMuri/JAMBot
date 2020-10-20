const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");
const { joinVC } = require("../../../functions");
const youtube = require("../../fetchers/youtube");

module.exports = {
    name: "playfirst",
    aliases: ["pf"],
    category: "music",
    description: "Puts song at the top of the queue and plays it.",
    usage: ["`-<command | alias> [YouTube link | Search query]`"],
    async run(bot, message, args) {
        bot.messageCache.push(message.id);
        let connection;
        const ytreply = "**🔎 Searching YouTube for  **";

        if (!bot.servers[message.guild.id])
            bot.servers[message.guild.id] = {
                name: message.guild.name,
                loop: {
                    song: false,
                    queue: false,
                },
                queue: [],
            };

        const server = bot.servers[message.guild.id];

        if (message.member.voice.channel)
            await joinVC(bot, message).then((connected) => {
                connection = connected;
            });
        else
            return message.channel.send(
                "❌ **Please join a Voice Channel first!**"
            );

        if (connection) {
            const song = args.join(" ");
            if (!song) {
                if (server.queue.length === 0)
                    return message.channel.send(
                        "**The Music Queue Is Empty! Use `-play` to add more!**"
                    );
                else if (server.dispatcher) {
                    server.dispatcher.resume();
                    const embed = new MessageEmbed()
                        .setDescription("**▶ Playing!**")
                        .setColor(colors.Green);
                    message.channel.send(embed);
                }
            } else
                try {
                    await message.channel.send(`${ytreply}\`${song}\``);
                    youtube(song, message, connection, server, bot);
                } catch (error) {
                    message.channel.send(
                        "❌ **Error: Something went wrong, please contact a member of the Tech Dev team for assistance!**"
                    );
                    console.log(error);
                }
        } else
            return message.channel.send(
                "❌ **I'm being used in a different channel!**"
            );
    },
};
