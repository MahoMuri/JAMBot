const { MessageEmbed } = require("discord.js");
const { shuffle } = require("fast-shuffle");

const colors = require("../../../colors.json");

module.exports = {
    name: "shuffle",
    aliases: ["shfl"],
    category: "music",
    description: "",
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
                "**The Music Queue Is Empty! Use `_play` to add more!**"
            );
        else {
            message.react("🔀");
            const nowPlaying = server.queue[0];
            server.queue = shuffle(server.queue.slice(1));
            server.queue[0] = nowPlaying;
            const embed = new MessageEmbed()
                .setTitle("**✅ Shuffled the queue!**")
                .setColor(colors.Green);
            message.channel.send(embed);
        }
    },
};
