const toMilliseconds = require("@sindresorhus/to-milliseconds");
const { MessageEmbed } = require("discord.js");

const colors = require("../../../colors.json");
const { convertDuration, joinVC, play } = require("../../../functions");

let connection;
module.exports = {
    name: "seek",
    aliases: ["sk"],
    category: "music",
    description: "Seeks to a specific time.",
    usage: ["`-<command | alias> < Minutes | Seconds >`"],
    async run(bot, message, args) {
        const server = bot.servers[message.guild.id];
        if (message.member.voice.channel)
            await joinVC(bot, message).then((connected) => {
                connection = connected;
            });
        else
            return message.channel.send(
                "❌ **Please join a Voice Channel first!**"
            );
        if (connection) {
            const regex = /\d+/g;
            if (args[0]) {
                const time = args[0].toString().match(regex);
                /**
                 * time[0] = hours
                 * time[1] = minutes
                 * time[2] = seconds
                 */
                // console.log(time.length);
                const intTime = [];
                await time.forEach((element) => {
                    intTime.push(parseInt(element));
                });
                let ms;
                if (time.length === 1) {
                    ms = toMilliseconds({
                        seconds: intTime[0],
                    });
                    console.log("Seconds:", ms);
                    console.log("Converted Time:", convertDuration(ms / 1000));
                } else if (time.length === 2) {
                    ms = toMilliseconds({
                        minutes: intTime[0],
                        seconds: intTime[1],
                    });
                    console.log("Minutes and Seconds:", ms);
                    console.log("Converted Time:", convertDuration(ms / 1000));
                } else if (time.length === 3) {
                    ms = toMilliseconds({
                        hours: intTime[0],
                        minutes: intTime[1],
                        seconds: intTime[2],
                    });
                    console.log("Hours, Minutes and Seconds:", ms);
                    console.log("Converted Time:", convertDuration(ms / 1000));
                }
                if (ms / 1000 > server.queue[0].duration) {
                    const embed = new MessageEmbed()
                        .setDescription(
                            "❌ **Seeked time cannot be longer than the song duration**"
                        )
                        .setColor(colors.Red);
                    message.channel.send(embed);
                } else play(connection, message, server, bot, ms / 1000);
            } else {
                const embed = new MessageEmbed()
                    .setDescription(
                        "❌ **Please provide a time to seek! Can be time in `minutes` or `seconds`.**"
                    )
                    .setColor(colors.Red);
                message.channel.send(embed);
            }
        } else
            return message.channel.send(
                "❌ **I'm being used in a different channel!**"
            );
    },
};
