const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "next",
    aliases: ["n", "skip"],
    category: "music",
    description: "Skips to the next song",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args, prefix) {
        const server = await bot.servers[message.guild.id];

        if (server.queue.length === 0) {
            const embed = new MessageEmbed()
                .setDescription(
                    `❌ **The Music Queue Is Empty! Use \`${prefix}play\` to add more!**`
                )
                .setColor(colors.Red);
            return message.channel.send(embed);
        } else {
            await message.channel.send("**⏭ Skipping!**");
            server.dispatcher.end();
            server.loop.next = true;
        }
    },
};
