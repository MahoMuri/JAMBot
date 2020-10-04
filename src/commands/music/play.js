const { google } = require("googleapis");
const { parse } = require("tinyduration");
const ytlist = require("youtube-playlist");

const { play } = require("../../../functions");

module.exports = {
    name: "play",
    aliases: [""],
    category: "",
    description: "",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args) {
        const youtube = google.youtube("v3");

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
                        "**The Music Queue Is Empty! Use `_play` to add more!**"
                    );
                else if (server.dispatcher) server.dispatcher.resume();
            } else
                try {
                    // First check if song is a search query
                    const checkWord = "https";
                    if (!song.toString().includes(checkWord)) {
                        const res = await youtube.search.list({
                            part: "snippet",
                            maxResults: 10,
                            q: song,
                            auth: process.env.YT_API,
                        });
                        // console.log(res.data);
                        const songURL = `https://www.youtube.com/watch?v=${res.data.items[0].id.videoId}`;
                        server.queue.push({
                            song: songURL,
                            info: res.data.items[0].snippet.title,
                            owner: message.author,
                        });
                    } else {
                        // If not, then assume it is a URL
                        const url = new URL(song);

                        if (url.searchParams.get("list")) {
                            // Execute this if the URL is a playlist URL
                            await ytlist(song, [
                                "id",
                                "name",
                                "url",
                                "duration",
                            ])
                                .then((items) => {
                                    // console.log(items.data.playlist);
                                    items.data.playlist.forEach((item) => {
                                        const song = `https://www.youtube.com/watch?v=${item.id}`;
                                        server.queue.push({
                                            song,
                                            title: item.name,
                                            duration: item.duration,
                                            owner: message.author,
                                        });
                                    });
                                })
                                .catch(console.error);
                            console.log(server.queue[0]);
                        } else {
                            // Execute this if its a video URL
                            const res = await youtube.videos.list({
                                part: "snippet,contentDetails,statistics",
                                id: url.searchParams.get("v"),
                                auth: process.env.YT_API,
                            });
                            const duration = parse(
                                res.data.items[0].contentDetails.duration
                            );
                            // server.queue.push({
                            //     song,
                            //     name: res.data.items[0].snippet.title,
                            //     duration:
                            //         res.data.items[0].contentDetails.duration,
                            //     owner: message.author,
                            // });
                            console.log(duration);
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
