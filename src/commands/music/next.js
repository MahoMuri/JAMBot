module.exports = {
    name: "next",
    aliases: ["n", "skip"],
    category: "music",
    description: "Skips to the next song",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
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

        if (!server.dispatcher)
            return message.channel.send(
                "**The Music Queue Is Empty! Use `-play` to add more!**"
            );
        else {
            await message.channel.send("**⏭ Skipping!**");
            server.dispatcher.end();
            server.loop.next = true;
        }
    },
};
