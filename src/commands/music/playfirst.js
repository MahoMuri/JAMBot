const { MessageEmbed } = require("discord.js");
const { google } = require("googleapis");
const ytfps = require("ytfps");

const colors = require("../../../colors.json");
const { play, addCommas, convertISO } = require("../../../functions");

let channelsCache = {
    connected: false,
};
module.exports = {
    name: "playfirst",
    aliases: ["pf"],
    category: "music",
    description: "Puts song at the top of the queue and plays it.",
    usage: ["`-<command | alias> [YouTube link | Search query]`"],
    async run(bot, message, args) {
        let connection;
        const youtube = google.youtube("v3");
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

        if (message.member.voice.channel) {
            if (!channelsCache.connected) {
                connection = await message.member.voice.channel.join();
                message.channel.send(
                    `✅ **Joined ${connection.channel.name} Voice Channel!**`
                );
                channelsCache = {
                    guild: message.guild.name,
                    channel: connection.channel.name,
                    connected: true,
                };
            } else connection = await message.member.voice.channel.join();
            const song = args.join(" ");
            if (!song) {
                if (server.queue.length === 0)
                    return message.channel.send(
                        "**The Music Queue Is Empty! Use `-play` to add more!**"
                    );
            } else
                try {
                    message.channel.send(`${ytreply}\`${song}\``);
                    // First check if song is a search query
                    const checkWord = "https";
                    if (!song.toString().includes(checkWord)) {
                        const songURLs = [];

                        // Searches for the song by query
                        await youtube.search
                            .list({
                                part: "snippet",
                                maxResults: 10,
                                q: song,
                                type: "video",
                                auth: process.env.YT_API,
                            })
                            .then((res) => {
                                if (res.data.items.length === 0)
                                    return message.channel.send(
                                        `❌ Could not find \`${song}\`, are you sure that's the right song?`
                                    );

                                res.data.items.forEach((item) => {
                                    songURLs.push({
                                        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                                        id: item.id.videoId,
                                    });
                                });
                            });

                        // Attempts to fetch the first song from the list
                        const res = await youtube.videos.list({
                            part: "snippet,contentDetails,statistics",
                            id: songURLs[0].id,
                            auth: process.env.YT_API,
                        });
                        server.queue.unshift({
                            song: songURLs[0].url,
                            info: {
                                channelTitle:
                                    res.data.items[0].snippet.channelTitle,
                                totalViews:
                                    res.data.items[0].statistics.viewCount,
                            },
                            title: res.data.items[0].snippet.title,
                            thumbnail:
                                res.data.items[0].snippet.thumbnails.medium.url,
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
                                    if (server.queue.length !== 0)
                                        playlist.videos
                                            .reverse()
                                            .forEach((item) => {
                                                server.queue.unshift({
                                                    song: item.url,
                                                    info: {
                                                        channelTitle:
                                                            playlist.author,
                                                        totalViews:
                                                            playlist.view_count,
                                                    },
                                                    title: item.title,
                                                    thumbnail:
                                                        item.thumbnail_url,
                                                    owner: message.author,
                                                    duration:
                                                        item.milis_length /
                                                        1000,
                                                });
                                            });
                                    else
                                        playlist.videos.forEach((item) => {
                                            server.queue.push({
                                                song: item.url,
                                                info: {
                                                    channelTitle:
                                                        playlist.author,
                                                    totalViews:
                                                        playlist.view_count,
                                                },
                                                title: item.title,
                                                thumbnail: item.thumbnail_url,
                                                owner: message.author,
                                                duration:
                                                    item.milis_length / 1000,
                                            });
                                        });
                                })
                                .catch(console.error);
                            // console.log(server.queue[0]);
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
                            const res = await youtube.videos.list({
                                part: "snippet,contentDetails,statistics",
                                id: url.searchParams.get("v"),
                                auth: process.env.YT_API,
                            });
                            server.queue.unshift({
                                song,
                                info: {
                                    channelTitle:
                                        res.data.items[0].snippet.channelTitle,
                                    totalViews:
                                        res.data.items[0].statistics.viewCount,
                                },
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

                    // Since playfirst skips to the song recently queued, it calls the play function no matter what.
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
