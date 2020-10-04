module.exports = {
    name: "leave",
    aliases: [""],
    category: "music",
    description: "",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
        if (message.member.voice.channel) {
            const server = await bot.servers[message.guild.id];
            if (!server.dispatcher) {
                server.queue.length = 0;
                message.member.voice.channel.leave();
                console.log("No Server\n", server);
                message.channel.send("**👋 Successfully Disconnected!**");
            } else if (server.dispatcher) {
                await server.dispatcher.end();
                server.queue.length = 0;
                console.log("Server\n", server.queue);
                message.member.voice.channel.leave();
                message.channel.send("**👋 Successfully Disconnected!**");
            }
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
