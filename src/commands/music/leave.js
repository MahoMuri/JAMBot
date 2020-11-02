module.exports = {
    name: "leave",
    aliases: ["dc", "disconnect", "yeet"],
    category: "music",
    description: "Leaves the voice channel",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
        if (message.member.voice.channel) {
            const server = await bot.servers[message.guild.id];
            if (server.dispatcher && server.queue.length !== 0) {
                await server.dispatcher.end();
                server.queue.length = 0;
                server.channel.voice.leave();
            } else if (server.channel.voice) server.channel.voice.leave();
            else
                message.channel
                    .send("**❌ I'm not in a voice channel!**")
                    .then((msg) => {
                        bot.messageCache.push(msg.id);
                    });
        } else
            return message.channel
                .send("**❌ You're not in a voice channel!**")
                .then((msg) => {
                    bot.messageCache.push(msg.id);
                });
    },
};
