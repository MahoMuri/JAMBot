const Discord = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "serverinfo",
    aliases: ["info", "aboutme"],
    category: "info",
    description: "Displays the Information of the Server",
    usage: "`-<command | alias>`",
    run(bot, message) {
        const online = message.guild.members.cache.filter(
            (m) =>
                m.user.presence.status === "online" ||
                m.user.presence.status === "idle" ||
                m.user.presence.status === "dnd"
        );
        const bots = message.guild.members.cache.filter((m) => m.user.bot).size;
        const textChannel = message.guild.channels.cache.filter(
            (c) => c.type === "text"
        ).size;
        const voiceChannel = message.guild.channels.cache.filter(
            (c) => c.type === "voice"
        ).size;

        const createdAt = new Date(message.guild.createdAt);
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };

        const sEmbed = new Discord.MessageEmbed()
            .setColor(colors.Turquoise)
            .setTitle(`Server Info for ${message.guild.name}`)
            .setThumbnail(bot.user.displayAvatarURL())
            .setAuthor(`${message.guild.name}`, bot.user.displayAvatarURL())
            .addFields(
                {
                    name: "**Users (Online/Total)**",
                    value: `${online.size}/${message.guild.memberCount - bots}`,
                    inline: true,
                },
                {
                    name: " **Created At:**",
                    value: `${createdAt.toLocaleDateString("en-US", options)}`,
                    inline: true,
                },
                {
                    name: "**Voice/Text Channels**",
                    value: `${voiceChannel}/${textChannel}`,
                    inline: true,
                },
                {
                    name: "**Server Owner:**",
                    value: `${message.guild.owner.user.tag}`,
                    inline: true,
                },
                {
                    name: "**Region**",
                    value: `${
                        message.guild.region[0].toUpperCase() +
                        message.guild.region.slice(1)
                    }`,
                    inline: true,
                },
                {
                    name: "**Role Count:**",
                    value: `${message.guild.roles.cache.size}`,
                    inline: true,
                }
            )
            .setTimestamp()
            .setFooter(
                "AGGRESSIVE GOODTALKER | By MahoMuri",
                bot.user.displayAvatarURL()
            );
        message.channel.send(sEmbed);
    },
};
