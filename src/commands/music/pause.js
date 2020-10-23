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

        if (server.dispatcher) {
            server.dispatcher.pause(true);
            const embed = new MessageEmbed()
                .setDescription("**⏸ Paused!**")
                .setColor(colors.Green);
            message.channel.send(embed);
        }
    },
};
