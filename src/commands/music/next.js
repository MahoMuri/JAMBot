module.exports = {
    name: "next",
    aliases: ["n"],
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

        if (!server.dispatcher)
            return message.channel.send(
                "**The Music Queue Is Empty! Use `_play` to add more!**"
            );
        else server.dispatcher.end();
    },
};
