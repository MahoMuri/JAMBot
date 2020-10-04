module.exports = {
    name: "pause",
    aliases: [""],
    category: "music",
    description: "",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
        const server = await bot.servers[message.guild.id];

        if (server.dispatcher) server.dispatcher.pause();
    },
};
