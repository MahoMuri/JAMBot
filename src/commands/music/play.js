const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");
const { joinVC } = require("../../../functions");
const youtube = require("../../fetchers/youtube");

let connection;
module.exports = {
    name: "play",
    aliases: ["p", "resume"],
    category: "music",
    description: "Plays the song or from a YouTube Link or query.",
    usage: ["`-<command | alias> < YouTube link | Search query >`"],
    async run(bot, message, args, prefix) {
        const ytreply = "**🔎 Searching YouTube for  **";

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
                if (server.queue.length === 0) {
                    const embed = new MessageEmbed()
                        .setDescription(
                            `**❌ The Music Queue Is Empty! Use \`${prefix}play\` to add more!**`
                        )
                        .setColor(colors.Red);
                    return message.channel.send(embed);
                } else if (server.dispatcher.paused) {
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
