const { MessageEmbed } = require("discord.js");
const { google } = require("googleapis");
const Entities = require("html-entities").AllHtmlEntities;
const ms = require("ms");

const colors = require("../../../colors.json");
const { play, convertISO } = require("../../../functions");

module.exports = {
    name: "search",
    aliases: ["s"],
    category: "music",
    description: "Searches for the specifies song.",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args) {
        const youtube = google.youtube("v3");
        const entities = new Entities();

        if (message.member.voice.channel) {
            if (!bot.servers[message.guild.id])
                bot.servers[message.guild.id] = {
                    name: message.guild.name,
                    loop: {
                        song: false,
                        queue: false,
                    },
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
                message.channel.send(
                    `**🔎 Searching YouTube for \`${song}\`**`
                );
                const res = await youtube.search.list({
                    part: "snippet",
                    maxResults: 10,
                    q: song,
                    type: "video",
                    auth: process.env.YT_API,
                });
                if (res.data.items.length === 0)
                    return message.channel.send(
                        `❌ Could not find \`${song}\`, are you sure that's the right song?`
                    );
                // console.log(res.data);
                const songList = [];
                const songChoices = [];
                res.data.items.forEach((item, iterator) => {
                    const songURL = `https://www.youtube.com/watch?v=${item.id.videoId}`;
                    const song = `${iterator + 1}. [${entities.decode(
                        item.snippet.title
                    )}](${songURL})\n`;
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
                    .setFooter(
                        `Searched by: ${message.author.username}`,
                        message.author.displayAvatarURL()
                    );

                message.channel.send(embed).then((msg) => {
                    const filter = (msg) => msg.author.id !== bot.user.id;
                    msg.channel
                        .awaitMessages(filter, {
                            max: 1,
                            time: ms("5m"),
                            errors: ["time"],
                        })
                        .then(async (collected) => {
                            if (collected.first().content === "cancel") {
                                message.react("👌");
                                bot.messageCache.push(collected.first());
                                return message.channel.send(
                                    "✅ **Cancelled!**"
                                );
                            }
                            if (isNaN(collected.first().content))
                                return message.channel.send(
                                    "❌ **Not a number! Please try again.**"
                                );

                            const index = collected.first().content;
                            // console.log(songList[index - 1]);
                            // console.log(songChoices[index - 1].id);
                            const res = await youtube.videos.list({
                                part: "snippet,contentDetails,statistics",
                                id: songChoices[index - 1].id,
                                auth: process.env.YT_API,
                            });
                            const songURL = `https://www.youtube.com/watch?v=${res.data.items[0].id}`;
                            server.queue.push({
                                song: songURL,
                                info: {
                                    channelTitle:
                                        res.data.items[0].snippet.channelTitle,
                                    totalViews:
                                        res.data.items[0].statistics.viewCount,
                                },
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

                            await msg.delete();
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
                    message.reply(
                        "Please type the number of your choice, type `cancel` to exit."
                    );
                });
            }
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
