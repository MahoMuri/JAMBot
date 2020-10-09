const { MessageEmbed } = require("discord.js");
const { google } = require("googleapis");
const ytfps = require("ytfps");

const { play, addCommas, convertISO } = require("../../../functions");

module.exports = {
    name: "play",
    aliases: ["p"],
    category: "music",
    description: "",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args) {
        const youtube = google.youtube("v3");
        const ytreply = "**🔎 Searching youtube for  **";

        if (!bot.servers[message.guild.id])
            bot.servers[message.guild.id] = {
                name: message.guild.name,
                loop: false,
                queue: [],
            };

        const server = bot.servers[message.guild.id];

        if (message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            const song = args.join(" ");
            if (!song) {
                if (server.queue.length === 0)
                    return message.channel.send(
                        "**The Music Queue Is Empty! Use `-play` to add more!**"
                    );
                else if (server.dispatcher) server.dispatcher.resume();
            } else
                try {
                    // First check if song is a search query
                    const checkWord = "https";
                    if (!song.toString().includes(checkWord)) {
                        const songURLs = [];

                        // Searches for the song by query
                        await message.channel.send(
                            `✅ **Joined ${connection.channel.name} Voice Channel!**`
                        );
                        await message.channel.send(`${ytreply}\`${song}\``);
                        await youtube.search
                            .list({
                                part: "snippet",
                                maxResults: 10,
                                q: song,
                                auth: process.env.YT_API,
                            })
                            .then((res) => {
                                res.data.items.forEach((item) => {
                                    songURLs.push({
                                        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                                        id: item.id.videoId,
                                    });
                                });
                            });

                        // Attempts to fetch the first song from the list
                        const res = await youtube.videos.list({
                            part: "snippet,contentDetails",
                            id: songURLs[0].id,
                            auth: process.env.YT_API,
                        });
                        server.queue.push({
                            song: songURLs[0].url,
                            title: res.data.items[0].snippet.title,
                            thumbnails: res.data.items[0].snippet.thumbnails,
                            owner: message.author,
                            duration: convertISO(
                                res.data.items[0].contentDetails.duration
                            ),
                        });

                        // Sends confirmation message that the song has been added to the queue.
                        const embed = new MessageEmbed()
                            .setTitle("Song added to the Queue!")
                            .setAuthor(
                                `${message.author.username}`,
                                message.author.displayAvatarURL()
                            )
                            .setDescription(
                                `[${res.data.items[0].snippet.title}](
                                    ${songURLs[0].url}
                                )`
                            )
                            .setThumbnail(
                                res.data.items[0].snippet.thumbnails.medium.url
                            )
                            .setFooter(
                                `${bot.user.username} | MahoMuri`,
                                bot.user.displayAvatarURL()
                            );
                        message.channel.send(embed);
                    } else {
                        // If not, then assume it is a URL
                        const url = new URL(song);

                        // If it's a Playlist URL
                        // eslint-disable-next-line curly
                        await message.channel.send(
                            `✅ **Joined ${connection.channel.name} Voice Channel!**`
                        );
                        await message.channel.send(`${ytreply}\`${song}\``);
                        if (url.searchParams.get("list")) {
                            // Execute this if the URL is a playlist URL
                            let playlistInfo = {};
                            await ytfps(url.searchParams.get("list"))
                                .then((playlist) => {
                                    playlistInfo = {
                                        title: playlist.title,
                                        url: playlist.url,
                                        songs: playlist.video_count,
                                        views: playlist.view_count,
                                        thumbnail: playlist.thumbnail_url,
                                    };
                                    playlist.videos.forEach((item) => {
                                        server.queue.push({
                                            song: item.url,
                                            title: item.title,
                                            thumbnail: item.thumbnail_url,
                                            owner: message.author,
                                            duration: item.milis_length / 1000,
                                        });
                                    });
                                })
                                .catch(console.error);
                            console.log(server.queue[0]);
                            // Sends confirmation message
                            const embed = new MessageEmbed()
                                .setTitle("Playlist added to the Queue!")
                                .setAuthor(
                                    `${message.author.username} `,
                                    message.author.displayAvatarURL()
                                )
                                .setDescription(
                                    `**[${playlistInfo.title}](${playlistInfo.url})**`
                                )
                                .addFields(
                                    {
                                        name: "Number of songs:",
                                        value: playlistInfo.songs,
                                        inline: true,
                                    },
                                    {
                                        name: "Number of views:",
                                        value: addCommas(playlistInfo.views),
                                        inline: true,
                                    }
                                )
                                .setThumbnail(server.queue[0].thumbnail)
                                .setFooter(
                                    `${bot.user.username} | MahoMuri`,
                                    bot.user.displayAvatarURL()
                                );
                            message.channel.send(embed);
                        } else {
                            // Execute this if its a video URL
                            await message.channel.send(
                                `✅ **Joined ${connection.channel.name} Voice Channel!**`
                            );
                            await message.channel.send(`${ytreply}\`${song}\``);
                            const res = await youtube.videos.list({
                                part: "snippet,contentDetails",
                                id: url.searchParams.get("v"),
                                auth: process.env.YT_API,
                            });
                            server.queue.push({
                                song,
                                title: res.data.items[0].snippet.title,
                                thumbnails:
                                    res.data.items[0].snippet.thumbnails.medium
                                        .url,
                                owner: message.author,
                                duration: convertISO(
                                    res.data.items[0].contentDetails.duration
                                ),
                            });
                            const embed = new MessageEmbed()
                                .setTitle("Song added to the Queue!")
                                .setAuthor(
                                    `${message.author}`,
                                    message.author.displayAvatarURL()
                                )
                                .setDescription(
                                    `[${res.data.items[0].snippet.title}](
                                ${song}
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
                        }
                    } // End of parameter check

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
                } catch (error) {
                    message.channel.send(
                        "❌ **Error: Something went wrong, please contact a member of the Tech Dev team for assistance!**"
                    );
                    console.log(error);
                }
        } else
            return message.channel.send(
                "❌ **Please join a Voice Channel first!**"
            );
    },
};
