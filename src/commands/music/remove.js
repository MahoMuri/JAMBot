const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "remove",
    aliases: ["rmv"],
    category: "music",
    description: "Removes a certain song",
    usage: ["`-<command | alias> `"],
    async run(bot, message, args, prefix) {
        const server = await bot.servers[message.guild.id];

        if (message.member.voice.channel)
            if (args[0]) {
                const index = parseInt(args[0]) - 1;
                if (!isNaN(index))
                    if (server && server.queue.length > 0) {
                        const toDelete = server.queue[index];
                        await server.queue.splice(index, 1);
                        const embed = new MessageEmbed()
                            .setColor(colors.Green)
                            .setDescription(
                                `✅ **Successfully removed [${toDelete.title}](${toDelete.url}) from the queue!**`
                            );
                        message.channel.send(embed);
                    } else {
                        const embed = new MessageEmbed()
                            .setDescription(
                                `**❌ The Music Queue Is Empty! Use \`${prefix}play\` to add more!**`
                            )
                            .setColor(colors.Red);
                        return message.channel.send(embed);
                    }
                else {
                    const embed = new MessageEmbed()
                        .setDescription(`**❌ \`${index}\` is not a number!**`)
                        .setColor(colors.Red);
                    return message.channel.send(embed);
                }
            } else {
                const embed = new MessageEmbed()
                    .setDescription(
                        "**❌ Please provide the number of the song in the queue!**"
                    )
                    .setColor(colors.Red);
                return message.channel.send(embed);
            }
        else
            return message.channel.send(
                "❌ **Please join a Voice Channel first!**"
            );
    },
};
