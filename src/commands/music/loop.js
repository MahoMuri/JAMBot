const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");

module.exports = {
    name: "loop",
    aliases: ["l"],
    category: "music",
    description: "Loops the queue",
    usage: ["`-<command | alias> < song | queue >`"],
    async run(bot, message, args, prefix) {
        if (message.member.voice.channel) {
            const server = await bot.servers[message.guild.id];
            if (server.queue.length === 0) {
                const embed = new MessageEmbed()
                    .setDescription(
                        `**The Music Queue Is Empty! Use \`${prefix}play\` to add more!**`
                    )
                    .setColor(colors.Red);
                return message.channel.send(embed);
            }

            if (args) {
                const option = args.join(" ").toString();
                option.toLowerCase();
                if (option === "song")
                    if (!server.loop.song) {
                        message.react("🔂");
                        server.loop.song = true;
                        const embed = new MessageEmbed()
                            .setDescription("**✅ Looping song!!**")
                            .setColor(colors.Green);
                        message.channel.send(embed);
                    } else {
                        message.react("🔂");
                        server.loop.song = false;
                        const embed = new MessageEmbed()
                            .setDescription("**❌ Stopped looping song!**")
                            .setColor(colors.Red);
                        message.channel.send(embed);
                    }
                else if (option === "queue")
                    if (!server.loop.queue) {
                        message.react("🔁");
                        server.loop.queue = true;
                        const embed = new MessageEmbed()
                            .setDescription("**✅ Looping queue!**")
                            .setColor(colors.Green);
                        message.channel.send(embed);
                    } else {
                        message.react("🔁");
                        server.loop.queue = false;
                        const embed = new MessageEmbed()
                            .setDescription("**❌ Stopped looping queue!**")
                            .setColor(colors.Red);
                        message.channel.send(embed);
                    }
                else {
                    const embed = new MessageEmbed()
                        .setDescription(
                            "**❌ Please specify the loop option:\n `song` or `queue`**"
                        )
                        .setColor(colors.Red);
                    message.channel.send(embed);
                }
            }

            console.log(server.loop.song, server.loop.queue);
        } else
            return message.channel.send(
                "**❌ You're not in a voice channel!**"
            );
    },
};
