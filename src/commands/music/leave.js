module.exports = {
    name: "leave",
    aliases: ["dc", "disconnect"],
    category: "music",
    description: "Leaves the voice channel",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
        if (message.member.voice.channel) {
            const server = await bot.servers[message.guild.id];
            if (!server.dispatcher) {
                server.queue.splice(0, server.queue.length);
                server.channel.voice.leave();
            } else if (
                server.dispatcher &&
                server.channel.text === message.channel
            ) {
                await server.dispatcher.end();
                server.queue.splice(0, server.queue.length);
                server.channel.voice.leave();
            }
        } else
            return message.channel
                .send("**❌ You're not in a voice channel!**")
                .then((msg) => {
                    bot.messageCache.push(msg.id);
                });
    },
};
