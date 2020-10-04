const { play } = require("../../../functions");

module.exports = {
    name: "jump",
    aliases: [""],
    category: "",
    description: "",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args) {
        if (message.member.voice.channel) {
            if (!bot.servers[message.guild.id])
                bot.servers[message.guild.id] = {
                    name: message.guild.name,
                    loop: false,
                    queue: [],
                };

            const server = await bot.servers[message.guild.id];
            const connection = await message.member.voice.channel.join();
            if (server.queue.length === 0)
                message.channel.send(
                    "**The Music Queue Is Empty! Use `_play` to add more!**"
                );
            else if (isNaN(args[0]))
                return message.channel.send("❌ **Error, not a number!**");
            else {
                server.jump = args[0] - 1;
                play(connection, message, server, bot, server.jump);
            }
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
