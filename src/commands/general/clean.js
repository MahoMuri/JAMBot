const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "clean",
    aliases: ["cln"],
    category: "general",
    description: "Cleans the channel of JAMBot's messages and commands.",
    usage: ["`-<command | alias>`"],
    async run(bot, message, args) {
        if (!message.member.hasPermission("MANAGE_MESSAGES")) {
            const embed = new MessageEmbed()
                .setDescription("**❌ You cannot delete messages!**")
                .setColor(colors.Red);
            return message.channel.send(embed).then((msg) => {
                if (message.channel.messages.resolve(msg.id))
                    msg.delete({ timeout: 5000 }).catch(console.error);
            });
        }

        const MESSAGES = message.channel.messages.cache.filter(
            (m) => m.author.id === bot.user.id && m.id !== bot.embedMessage
        );

        MESSAGES.forEach((msg) => {
            bot.messageCache.push(msg.id);
        });

        if (
            bot.messageCache.includes(message.id) &&
            bot.messageCache.length === 1
        ) {
            const embed = new MessageEmbed()
                .setDescription("**❌ Nothing to delete!**")
                .setColor(colors.Red);
            message.channel.send(embed).then((msg) => {
                if (message.channel.messages.resolve(msg.id))
                    msg.delete({ timeout: 5000 }).catch(console.error);
            });
        } else {
            await message.channel
                .bulkDelete(bot.messageCache)
                .catch(console.error);
            const embed = new MessageEmbed()
                .setDescription(
                    `**✅ Deleted ${bot.messageCache.length} message${
                        bot.messageCache.length === 1 ? "" : "s"
                    }**`
                )
                .setColor(colors.Red);
            message.channel.send(embed).then((msg) => {
                if (message.channel.messages.resolve(msg.id))
                    msg.delete({ timeout: 5000 }).catch(console.error);
            });
            bot.messageCache.length = 0;
        }
    },
};
