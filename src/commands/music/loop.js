module.exports = {
    name: "loop",
    aliases: [""],
    category: "music",
    description: "",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
        if (message.member.voice.channel) {
            const server = await bot.servers[message.guild.id];
            if (!server) return;
            else if (!server.loop) server.loop = true;
            else server.loop = false;

            console.log(server.loop);
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
