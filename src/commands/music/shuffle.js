const { MessageEmbed } = require("discord.js");
const { shuffle } = require("fast-shuffle");

const colors = require("../../../colors.json");

module.exports = {
    name: "shuffle",
    aliases: ["shfl"],
    category: "music",
    description: "Shuffles the song",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args, prefix) {
        const server = await bot.servers[message.guild.id];

        if (server.queue.length === 0) {
            const embed = new MessageEmbed()
                .setDescription(
                    `**The Music Queue Is Empty! Use \`${prefix}play\` to add more!**`
                )
                .setColor(colors.Red);
            message.channel.send(embed);
        } else {
            message.react("🔀");
            const nowPlaying = server.queue[0];
            server.queue = shuffle(server.queue.slice(1));
            server.queue.unshift(nowPlaying);
            const embed = new MessageEmbed()
                .setDescription("**✅ Shuffled the queue!**")
                .setColor(colors.Green);
            message.channel.send(embed);
        }
    },
};
