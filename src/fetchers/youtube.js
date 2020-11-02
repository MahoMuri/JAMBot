const { MessageEmbed } = require("discord.js");
const { google } = require("googleapis");
const ytfps = require("ytfps");

const youtube = google.youtube("v3");
const colors = require("../../colors.json");
const { play, convertISO, addCommas } = require("../../functions");

const YTURL = "https://www.youtube.com/watch?v=";

async function _YouTube(song, message, connection, server, bot, options) {
    try {
        // First check if song is a search query
        const checkWord = "https://";
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
                    if (res.data.items.length === 0) {
                        const embed = new MessageEmbed()
                            .setColor(colors.Red)
                            .setDescription(
                                `❌ Could not find \`${song}\`, are you sure that's the right song?`
                            );

                        return message.channel.send(embed);
                    }

                    res.data.items.forEach((item) => {
                        songURLs.push({
                            url: `${YTURL}${item.id.videoId}`,
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
            const track = {
                song: songURLs[0].url,
                info: {
                    channelTitle: res.data.items[0].snippet.channelTitle,
                    totalViews: res.data.items[0].statistics.viewCount,
                },
                title: res.data.items[0].snippet.title,
                thumbnail: res.data.items[0].snippet.thumbnails.medium.url,
                owner: message.author,
                duration: convertISO(res.data.items[0].contentDetails.duration),
            };

            // Checks options for method of putting song/s to the queue
            if (options.playnext) server.queue.splice(1, 0, track);
            else if (options.playfirst) server.queue.unshift(track);
            else server.queue.push(track);

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
                .setThumbnail(res.data.items[0].snippet.thumbnails.medium.url)
                .setFooter(
                    `${bot.user.username} | MahoMuri`,
                    bot.user.displayAvatarURL()
                );
            message.channel.send(embed);
        } else {
            // If not, then assume it is a URL
            const url = new URL(song);

            if (!url.hostname.includes("youtube")) {
                const embed = new MessageEmbed()
                    .setDescription(
                        "**❌ Sorry, I only support YouTube links for now.**"
                    )
                    .setColor(colors.Red);
                return message.channel.send(embed);
            }

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
                        const tracks = playlist.videos.map((item) => {
                            const trackInfo = {
                                song: item.url,
                                info: {
                                    channelTitle: playlist.author.name,
                                    totalViews: playlist.view_count,
                                },
                                title: item.title,
                                thumbnail: item.thumbnail_url,
                                owner: message.author,
                                duration: item.milis_length / 1000,
                            };
                            return trackInfo;
                        });

                        // Checks options for method of putting song/s to the queue
                        if (options.playnext) {
                            const nowPlaying = server.queue[0];
                            tracks.reverse().forEach((track) => {
                                server.queue.unshift(track);
                            });
                            server.queue.splice(0, 0, nowPlaying);
                        } else if (options.playfirst) {
                            const nowPlaying = server.queue[0];
                            tracks.reverse().forEach((track) => {
                                server.queue.unshift(track);
                            });
                            server.queue.splice(0, 0, nowPlaying);
                        } else
                            tracks.forEach((track) => {
                                server.queue.push(track);
                            });
                    })
                    .catch(() => {
                        const embed = new MessageEmbed()
                            .setColor(colors.Red)
                            .setDescription(
                                "**❌ Unable to load Playlist. Is it the right link?**"
                            );
                        message.channel.send(embed);
                    });
                if (server.queue.length === 0) return;

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
                const res = await youtube.videos.list({
                    part: "snippet,contentDetails,statistics",
                    id: url.searchParams.get("v"),
                    auth: process.env.YT_API,
                });

                if (res.data.items.length === 0) {
                    const embed = new MessageEmbed()
                        .setColor(colors.Red)
                        .setDescription(
                            `❌ Could not find \`${song}\`, are you sure that's the right song?`
                        );

                    return message.channel.send(embed);
                }

                const track = {
                    song: `${YTURL}${res.data.items[0].id}`,
                    info: {
                        channelTitle: res.data.items[0].snippet.channelTitle,
                        totalViews: res.data.items[0].statistics.viewCount,
                    },
                    title: res.data.items[0].snippet.title,
                    thumbnail: res.data.items[0].snippet.thumbnails.medium.url,
                    owner: message.author,
                    duration: convertISO(
                        res.data.items[0].contentDetails.duration
                    ),
                };

                // Checks options for method of putting song/s to the queue
                if (options.playnext) server.queue.splice(1, 0, track);
                else if (options.playfirst) server.queue.unshift(track);
                else server.queue.push(track);

                const embed = new MessageEmbed()
                    .setTitle("Song added to the Queue!")
                    .setAuthor(
                        `${message.author.username}`,
                        message.author.displayAvatarURL()
                    )
                    .setDescription(
                        `[${res.data.items[0].snippet.title}](
                ${song}
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
        else if (options.playfirst)
            // Execute this if the playfirst command is called
            play(connection, message, server, bot);
    } catch (error) {
        console.log(error.message);
        const embed = new MessageEmbed()
            .setColor(colors.Red)
            .setDescription("**❌ Something went wrong. Please try again.**");
        message.channel.send(embed);
    }
}

module.exports = function YouTube(
    song,
    message,
    connection,
    server,
    bot,
    options
) {
    if (!options)
        options = {
            playnext: false,
            playfirst: false,
        };
    _YouTube(song, message, connection, server, bot, options);
};
