const { MessageEmbed } = require("discord.js");
const { google } = require("googleapis");
const ms = require("ms");

const colors = require("../../../colors.json");
const { play } = require("../../../functions");

module.exports = {
    name: "search",
    aliases: [""],
    category: "music",
    description: "",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args) {
        const youtube = google.youtube("v3");

        if (message.member.voice.channel) {
            if (!bot.servers[message.guild.id])
                bot.servers[message.guild.id] = {
                    name: message.guild.name,
                    loop: false,
                    queue: [],
                };

            const server = await bot.servers[message.guild.id];
            const connection = await message.member.voice.channel.join();

            const song = args.join(" ").toString();
            if (!song)
                return message.channel.send(
                    "**❌ Please provide a search parameter!**"
                );
            else {
                const res = await youtube.search.list({
                    part: "snippet",
                    maxResults: 10,
                    q: song,
                    auth: process.env.YT_API,
                });
                // console.log(res.data);
                const songList = [];
                const songChoices = [];
                res.data.items.forEach((item, iterator) => {
                    const songURL = `https://www.youtube.com/watch?v=${item.id.videoId}`;
                    const song = `${iterator + 1}. [${
                        item.snippet.title
                    }](${songURL})\n`;
                    songList.push(song);
                    songChoices.push({
                        song: songURL,
                        info: item.snippet.title,
                        owner: message.author,
                    });
                });

                const embed = new MessageEmbed()
                    .setTitle(`Search Results for: ${song}`)
                    .setDescription(songList)
                    .setColor(colors.Beige)
                    .setFooter(`${bot.user.username} | MahoMuri`);

                message.channel.send(embed).then((msg) => {
                    const filter = (msg) =>
                        msg.author.id !== bot.user.id && !isNaN(msg.content);
                    msg.channel
                        .awaitMessages(filter, {
                            max: 1,
                            time: ms("5m"),
                            errors: ["time"],
                        })
                        .then((collected) => {
                            const index = collected.first().content;
                            console.log(songList[index - 1]);
                            console.log(songChoices[index - 1]);
                            server.queue.push(songChoices[index - 1]);
                            // console.log(message);

                            // Checks for instance of server dispatcher
                            if (!server.dispatcher)
                                // Execute this if no dispatcher is found
                                play(connection, message, server, bot);
                            else if (server.dispatcher._writableState.finished)
                                // Execute this if the dispatcher finished the readstream (the queue is finished)
                                play(connection, message, server, bot);
                            else if (server.dispatcher._writableState.ended)
                                // Execute this if the dispatcher ended the writestream (the bot left the channel)
                                play(connection, message, server, bot);
                        })
                        .catch((collected) => {
                            console.log(`Timeout: ${collected.size}`);
                            msg.delete();
                        });
                });
            }
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
