const { MessageEmbed } = require("discord.js");
const { google } = require("googleapis");
const ms = require("ms");

const colors = require("../../../colors.json");
const { play, convertISO } = require("../../../functions");

module.exports = {
    name: "search",
    aliases: ["s"],
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
                        id: item.id.videoId,
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
                        .then(async (collected) => {
                            const index = collected.first().content;
                            // console.log(songList[index - 1]);
                            // console.log(songChoices[index - 1].id);
                            const res = await youtube.videos.list({
                                part: "snippet,contentDetails",
                                id: songChoices[index - 1].id,
                                auth: process.env.YT_API,
                            });
                            const songURL = `https://www.youtube.com/watch?v=${res.data.items[0].id}`;
                            server.queue.push({
                                song: songURL,
                                title: res.data.items[0].snippet.title,
                                thumbnail:
                                    res.data.items[0].snippet.thumbnails.medium
                                        .url,
                                owner: message.author,
                                duration: convertISO(
                                    res.data.items[0].contentDetails.duration
                                ),
                            });
                            // console.log(server.queue[0]);

                            // Sends confirmation for Qeueue
                            const embed = new MessageEmbed()
                                .setTitle("Song added to the Queue!")
                                .setAuthor(
                                    `${message.author.username}`,
                                    message.author.displayAvatarURL()
                                )
                                .setDescription(
                                    `[${res.data.items[0].snippet.title}](
                                        ${songURL}
                                    )`
                                )
                                .setThumbnail(
                                    res.data.items[0].snippet.thumbnails.medium
                                        .url
                                )
                                .setFooter(
                                    `${bot.user.username} | MahoMuri`,
                                    bot.user.displayAvatarURL()
                                );
                            message.channel.send(embed);

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
                            console.log(collected);
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
