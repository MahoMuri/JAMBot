const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "loop",
    aliases: ["l"],
    category: "music",
    description: "Loops the queue",
    usage: ["`-<command | alias> `"],
    async run(bot, message) {
        if (message.member.voice.channel) {
            const server = await bot.servers[message.guild.id];
            if (!server) return;
            else if (!server.loop) {
                message.react("🔁");
                server.loop = true;
                const embed = new MessageEmbed()
                    .setDescription("**✅ Loop enabled!**")
                    .setColor(colors.Green);
                message.channel.send(embed);
            } else {
                message.react("🔁");
                server.loop = false;
                const embed = new MessageEmbed()
                    .setDescription("**❌ Loop disabled!**")
                    .setColor(colors.Red);
                message.channel.send(embed);
            }

            console.log(server.loop);
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
