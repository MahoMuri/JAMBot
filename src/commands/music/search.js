const { MessageEmbed } = require("discord.js");
const { google } = require("googleapis");
const Entities = require("html-entities").AllHtmlEntities;
const ms = require("ms");

const colors = require("../../../colors.json");
const { joinVC } = require("../../../functions");
const youTube = require("../../fetchers/youtube");

let connection;
module.exports = {
    name: "search",
    aliases: ["s"],
    category: "music",
    description: "Searches for the specifies song.",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args) {
        const youtube = google.youtube("v3");
        const entities = new Entities();
        const server = await bot.servers[message.guild.id];

        if (message.member.voice.channel)
            await joinVC(bot, message).then((connected) => {
                connection = connected;
            });
        else
            return message.channel.send(
                "❌ **Please join a Voice Channel first!**"
            );

        if (connection) {
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
                    msg.channel
                        .send(
                            `${message.author}, Please type the number of your choice, type \`cancel\` to exit.`
                        )
                        .then((choice) => {
                            const filter = (choice) =>
                                (!choice.author.bot &&
                                    choice.author &&
                                    choice.conent !== "cancel") ||
                                parseInt(choice.conent);
                            choice.channel
                                .awaitMessages(filter, {
                                    max: 1,
                                    time: ms("5m"),
                                    errors: ["time"],
                                })
                                .then(async (collected) => {
                                    if (
                                        collected.first().content === "cancel"
                                    ) {
                                        message.react("👌");
                                        bot.messageCache.push(
                                            collected.first()
                                        );
                                        await collected.first().delete();
                                        await msg.delete();
                                        await choice.delete();
                                        return message.channel.send(
                                            "✅ **Cancelled!**"
                                        );
                                    }
                                    if (isNaN(collected.first().content))
                                        return message.channel.send(
                                            "❌ **Not a number! Please try again.**"
                                        );

                                    const index = collected.first().content;
                                    console.log(songList[index - 1]);
                                    console.log(songChoices[index - 1].song);
                                    youTube(
                                        songChoices[index - 1].song,
                                        message,
                                        connection,
                                        server,
                                        bot
                                    );
                                    // console.log(server.queue[0]);
                                    await collected.first().delete();
                                    await msg.delete();
                                    await choice.delete();
                                })
                                .catch((collected) => {
                                    console.log(collected);
                                    console.log(`Timeout: ${collected.size}`);
                                    choice.delete();
                                });
                        });
                });
            }
        } else
            return message.channel.send(
                "❌ **I'm being used in a different channel!**"
            );
    },
};
