const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "pause",
    aliases: ["stop"],
    category: "music",
    description: "Pauses the song.",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
        const server = await bot.servers[message.guild.id];

        if (message.member.voice.channel)
            if (server.dispatcher) {
                server.dispatcher.pause();
                const embed = new MessageEmbed()
                    .setDescription("**⏸ Paused!**")
                    .setColor(colors.Green);
                message.channel.send(embed);
            } else {
                const embed = new MessageEmbed()
                    .setDescription("**❌ I'm not playing anything!**")
                    .setColor(colors.Green);
                message.channel.send(embed);
            }
        else {
            const embed = new MessageEmbed()
                .setDescription("**❌ You're not in a Voice Channel!**")
                .setColor(colors.Green);
            message.channel.send(embed);
        }
    },
};
