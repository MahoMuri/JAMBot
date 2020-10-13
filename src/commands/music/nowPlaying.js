const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");
const { convertDuration, addCommas } = require(".././../../functions");

module.exports = {
    name: "nowplaying",
    aliases: ["np"],
    category: "",
    description: "",
    usage: ["`-<command | alias> `"],
    run(bot, message, args, prefix) {
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
        const index = 0;

        if (server.queue.length === 0) {
            const embed = new MessageEmbed()
                .setColor("RED")
                .setDescription(
                    `❌ **The queue is empty! Use \`${prefix}play\` to add more songs!**`
                );
            return message.channel.send(embed);
        }

        const songLength = server.queue[index].duration;
        const curTime = Math.floor(server.dispatcher.streamTime / 1000);
        const charArray = "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬";
        const trackLine = charArray.split("");
        const curPos = Math.floor((curTime / songLength) * trackLine.length);
        trackLine.splice(curPos, 1, "🔘");

        // Loop message
        let loopMessage;
        if (server.loop.song && server.loop.queue) loopMessage = "Song & Queue";
        else if (server.loop.song) loopMessage = "Song";
        else if (server.loop.queue) loopMessage = "Queue";
        else loopMessage = "Disabled";

        const embed = new MessageEmbed()
            .setAuthor("Now Playing:", bot.logo)
            .setColor(colors.Turquoise)
            .setDescription(
                stripIndents`**[${server.queue[index].title}](${
                    server.queue[index].song
                })**\n\n${trackLine.join("")}\n\u2800`
            )
            .addFields(
                {
                    name: "Song Duration:",
                    value: `\`${convertDuration(curTime)}/${convertDuration(
                        songLength
                    )}\``,
                    inline: true,
                },
                {
                    name: "Requested by:",
                    value: server.queue[index].owner,
                    inline: true,
                },
                {
                    name: "Paused:",
                    value: server.dispatcher.paused ? "Yes" : "No",
                    inline: true,
                },
                {
                    name: "Loop mode:",
                    value: loopMessage,
                    inline: true,
                },
                {
                    name: "Channel:",
                    value: server.queue[index].info.channelTitle,
                    inline: true,
                },
                {
                    name: "Views:",
                    value: addCommas(server.queue[index].info.totalViews),
                    inline: true,
                }
            )
            .setThumbnail(server.queue[index].thumbnail);
        message.channel.send(embed);
    },
};
