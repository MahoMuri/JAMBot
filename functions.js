const { stripIndents } = require("common-tags");
const ytdl = require("discord-ytdl-core");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");
const parseSecs = require("parse-seconds");
const sf = require("seconds-formater");
const { parse } = require("tinyduration");

const colors = require("./colors.json");

function getMember(message, toFind = "") {
    toFind = toFind.toLowerCase();

    let target = message.guild.roles.cache.get(toFind);

    if (!target && message.mentions.members)
        target = message.mentions.members.first();

    if (!target && toFind)
        target = message.guild.roles.cache.find(
            (member) =>
                member.displayName.toLowerCase().includes(toFind) ||
                member.user.tag.toLowerCase().includes(toFind)
        );

    if (!target) target = message.member;

    return target;
}

function formatDate(date) {
    return new Intl.DateTimeFormat("en-US").format(date);
}
async function promptMessage(message, author, time, validReactions) {
    // We put in the time as seconds, with this it's being transfered to MS
    time *= 1000;

    // For every emoji in the function parameters, react in the good order.
    for (const reaction of validReactions) await message.react(reaction);

    // Only allow reactions from the author,
    // and the emoji must be in the array we provided.
    const filter = (reaction, user) =>
        validReactions.includes(reaction.emoji.name) && user.id === author.id;

    // And ofcourse, await the reactions
    return message
        .awaitReactions(filter, { max: 1, time })
        .then((collected) => collected.first() && collected.first().emoji.name);
}
function addCommas(nStr) {
    nStr = String(nStr);
    const x = nStr.split(".");
    let x1 = x[0];
    const x2 = x.length > 1 ? `.${x[1]}` : "";
    const rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) x1 = x1.replace(rgx, "$1" + "," + "$2");

    return x1 + x2;
}

function play(connection, message, server, bot, seek) {
    const seekTime = seek || 0;

    // Initialize Opus Encoder
    const stream = ytdl(server.queue[0].song.toString(), {
        quality: "highestaudio",
        seek: seekTime,
        opusEncoded: true,
        highWaterMark: 1 << 25,
    });

    server.dispatcher = connection.play(stream, {
        type: "opus",
        seek: seekTime,
        fec: true,
    });

    server.dispatcher.on("start", () => {
        console.log("Playing Music!");
        if (seekTime) {
            const embed = new MessageEmbed()
                .setDescription(
                    `✅ **Set track time to \`${convertDuration(seekTime)}\`!**`
                )
                .setColor(colors.Green);
            return message.channel.send(embed);
        }
        if (bot.embedMessage)
            if (!server.channel.text.deleted) {
                if (server.channel.text.messages.resolve(bot.embedMessage))
                    server.channel.text.messages
                        .delete(bot.embedMessage)
                        .catch(console.error);
            } else bot.embedMessage = null;

        const embed = new MessageEmbed()
            .setAuthor("Now Playing:", bot.logo)
            .setColor(colors.Turquoise)
            .setDescription(
                stripIndents`[${server.queue[0].title}](${
                    server.queue[0].song
                }) | \`${convertDuration(
                    server.queue[0].duration
                )}\`\nRequested by: ${server.queue[0].owner}`
            )
            .setThumbnail(server.queue[0].thumbnail);
        server.channel.text.send(embed).then((msg) => {
            bot.embedMessage = msg.id;
        });
    });

    server.dispatcher.on("finish", async () => {
        // If both loops are false
        if (!server.loop.queue && !server.loop.song) {
            await server.queue.shift();
            console.log("Stopped Playing!");
        } else if (server.loop.queue) {
            const lastSong = server.queue[0];
            if (!server.loop.next && !server.loop.song) {
                // If Loop song is disabled and Next is not invoked
                await server.queue.shift();
                server.queue.push(lastSong);
            } else if (server.loop.next) {
                // If next is invoked
                await server.queue.shift();
                server.queue.push(lastSong);
                server.loop.next = false;
            }
        }

        console.log(server.queue);

        if (server.queue.length > 0 && server.queue[0] !== undefined)
            play(connection, message, server, bot);
        else console.log("Queue is empty!");
    });

    server.dispatcher.on("error", (error) => {
        console.log(error.message);
        if (error.message.includes("Video unavailable")) {
            message.channel
                .send(
                    "❌ **Could not play song! Video unavailable, skipping to the next song.**"
                )
                .then((msg) => {
                    msg.delete({ timeout: 5000 });
                });
            server.queue.shift();
            if (server.queue.length > 0 && server.queue[0] !== undefined)
                play(connection, message, server, bot);
        } else if (error.message.includes("Error parsing info:")) {
            if (server.queue.length > 0 && server.queue[0] !== undefined)
                play(connection, message, server, bot);
        } else if (error.message.includes("Could not find player config")) {
            if (server.queue.length > 0 && server.queue[0] !== undefined)
                play(connection, message, server, bot);
        } else if (
            error.message.includes(
                'The "url" argument must be of type string. Received undefined'
            )
        )
            console.log(server.queue);
    });
}

function convertDuration(seconds) {
    const parsed = parseSecs(seconds);
    let duration;
    if (parsed.days) duration = sf.convert(seconds).format("D:HH:MM:SS");
    else if (parsed.hours) duration = sf.convert(seconds).format("H:MM:SS");
    else duration = sf.convert(seconds).format("M:SS");

    return duration;
}

function convertISO(iso) {
    const parsed = parse(iso);
    const duration =
        (ms(`${parsed.hours || 0}h`) +
            ms(`${parsed.minutes || 0}m`) +
            ms(`${parsed.seconds || 0}s`)) /
        1000;
    return duration;
}

async function joinVC(bot, message) {
    let connection;
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

    const connectedChannel = bot.voice.connections.map(
        (connection) => connection.channel
    );
    const guildCheck = bot.voice.connections.map(
        (connection) => connection.channel.guild.id
    );
    // console.log(guildCheck);

    if (!guildCheck.includes(message.guild.id)) {
        connection = await message.member.voice.channel.join();
        server.channel = {
            text: message.channel,
            voice: connection.channel,
        };
    } else if (!connectedChannel.includes(message.member.voice.channel)) {
        const guilds = connectedChannel.map((channel) => {
            let servers = {};
            const guild = channel.guild.name;
            const members = channel.members.map(
                (member) => member.user.username
            );
            servers = {
                guild,
                members: members.filter((name) => name !== bot.user.username),
            };
            return servers;
        });

        const guild = guilds.find(
            (member) => member.guild === message.guild.name
        );

        console.log(guild);

        if (guild && guild.members.length === 0) {
            connection = await message.member.voice.channel.join();
            server.channel = {
                text: message.channel,
                voice: connection.channel,
            };
        } else if (guild && guild.members.length > 0) connection = false;
    } else {
        connection = await message.member.voice.channel.join();
        server.channel = {
            text: message.channel,
            voice: connection.channel,
        };
    }
    return connection;
}

module.exports = {
    getMember,
    formatDate,
    promptMessage,
    addCommas,
    play,
    convertDuration,
    convertISO,
    joinVC,
};
