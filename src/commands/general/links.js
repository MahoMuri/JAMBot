const { stripIndents } = require("common-tags");
const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "links",
    aliases: ["link", "inv", "invite"],
    category: "general",
    description: "Links!",
    usage: ["`-<command | alias> `"],
    run(bot, message, args) {
        bot.generateInvite({
            permissions: "ADMINISTRATOR",
        })
            .then((link) => {
                console.log(link);
                const embed = new MessageEmbed()
                    .setColor(colors.Turquoise)
                    .setTitle("Links!")
                    .setDescription(
                        stripIndents`[Click this](${link}) to invite me to your server!
                        __*Support Server coming soon:tm:*__\n\n`
                    )
                    .setFooter(
                        `${bot.user.username} | MahoMuri`,
                        bot.user.displayAvatarURL()
                    );
                message.channel.send(embed);
            })
            .catch(console.error);
    },
};
