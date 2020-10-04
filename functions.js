const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");

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

function play(connection, message, server, bot, jump) {
    const index = jump || 0;

    server.dispatcher = connection.play(
        ytdl(server.queue[index].song.toString(), {
            quality: "highestaudio",
            highWaterMark: 1 << 25,
        })
    );

    server.dispatcher.on("start", () => {
        console.log("Playing Music!");
        // console.log(server.dispatcher._writableState);
        if (
            !message.channel.messages.cache.find(
                (message) =>
                    message.author.id === bot.user.id &&
                    message.embeds.find(
                        (embed) => embed.title === "**Now playing:**"
                    )
            )
        ) {
            const embed = new MessageEmbed()
                .setTitle("**Now playing:**")
                .setColor(colors.Turquoise)
                .setDescription(
                    stripIndents`[${server.queue[index].info}](${server.queue[index].song})\nRequested by: ${server.queue[index].owner}`
                );
            message.channel.send(embed);
        } else {
            const oldMessage = message.channel.messages.cache.find(
                (message) =>
                    message.author.id === bot.user.id &&
                    message.embeds.find(
                        (embed) => embed.title === "**Now playing:**"
                    )
            );
            oldMessage.delete();
            const embed = new MessageEmbed()
                .setTitle("**Now playing:**")
                .setColor(colors.Turquoise)
                .setDescription(
                    stripIndents`[${server.queue[index].info}](${server.queue[index].song})\nRequested by: ${server.queue[index].owner}`
                );
            message.channel.send(embed);
        }
    });

    server.dispatcher.on("finish", async () => {
        if (!server.loop) {
            await server.queue.shift();
            console.log("Stopped Playing!");
        } else {
            const lastSong = server.queue[index];
            server.queue.shift();
            server.queue.push(lastSong);
        }

        if (server.queue[index]) play(connection, message, server, bot);
    });

    server.dispatcher.on("error", console.error);
}

module.exports = {
    getMember,
    formatDate,
    promptMessage,
    addCommas,
    play,
};
