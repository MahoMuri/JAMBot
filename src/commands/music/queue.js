const Pagination = require("discord-paginationembed");
const { MessageEmbed } = require("discord.js");
const ms = require("ms");

const colors = require("../../../colors.json");
const { convertDuration } = require("../../../functions");

module.exports = {
    name: "queue",
    aliases: ["q"],
    category: "music",
    description: "Displays the queue of this server",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
        if (!bot.servers[message.guild.id])
            bot.servers[message.guild.id] = {
                name: message.guild.name,
                loop: false,
                queue: [],
            };

        const server = await bot.servers[message.guild.id];
        if (server.queue.length === 0)
            message.channel.send(
                "**The Music Queue Is Empty! Use `-play` to add more!**"
            );
        else if (server.queue.length > 0) {
            // Sets the format for the Music queue to be displayed in MessageEmbed#setDescription
            const songList = [];
            server.queue.forEach((item, iterator) => {
                let song;
                if (server.jump) {
                    const index = server.jump;
                    song = `__**Now Playing:**__\n${iterator + 1}. [${
                        server.queue[index].title
                    }](${server.queue[index].song}) | \`${convertDuration(
                        server.queue[iterator].duration
                    )}\` | \`Requested by: ${item.owner.tag}\n\`\n`;
                    server.jump = null;
                } else if (songList.length === 0)
                    song = `__**Now Playing:**__\n${iterator + 1}. [${
                        item.title
                    }](${item.song}) | \`${convertDuration(
                        server.queue[iterator].duration
                    )}\` | \`Requested by: ${item.owner.tag}\n\`\n`;
                else if (songList.length === 1)
                    song = `__**Up next:**__\n${iterator + 1}. [${
                        item.title
                    }](${item.song}) | \`${convertDuration(
                        server.queue[iterator].duration
                    )}\` | \`Requested by: ${item.owner.tag}\n\``;
                else
                    song = `${iterator + 1}. [${item.title}](${
                        item.song
                    }) | \`${convertDuration(
                        server.queue[iterator].duration
                    )}\` | \`Requested by: ${item.owner.tag}\n\``;

                songList.push(song);
            });

            // console.log(songList);

            const embeds = [];
            const pages = Math.ceil(server.queue.length / 10); // Rounds off to the smallest interger greater than or equal to its numeric argument.
            // Page items
            let start = 0;
            let end = 10;

            // limits the description to 10 items per page
            for (let i = 0; i < pages; i++)
                if (i < 1)
                    embeds.push(
                        new MessageEmbed().setDescription(
                            songList.slice(start, end)
                        )
                    );
                else
                    embeds.push(
                        new MessageEmbed().setDescription(
                            songList.slice((start += 10), (end += 10))
                        )
                    );

            // Creates and Builds new embed for pagination.
            new Pagination.Embeds()
                .setArray(embeds)
                .setChannel(message.channel)
                .setPageIndicator(true)
                .setPage(1)
                .setTimeout(ms("5m"))
                .setDeleteOnTimeout(true)
                // Methods below are for customising all embeds
                .setTitle(
                    `Music Queue for ${message.guild.name} | Loop is: ${
                        server.loop ? "Enabled" : "Disabled"
                    }`
                )
                .setColor(colors.Lavander_Purple)
                .build();
        }
    },
};
