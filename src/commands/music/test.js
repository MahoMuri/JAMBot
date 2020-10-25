const { MessageEmbed } = require("discord.js");
const { google } = require("googleapis");
const Entities = require("html-entities").AllHtmlEntities;
const ms = require("ms");
const timer = require("timer");

const colors = require("../../../functions");
const { playlistInfo, convertDuration } = require("../../../functions");

module.exports = {
    name: "test",
    aliases: [""],
    category: "",
    description: "",
    usage: ["`-<command | alias> `"],
    async run(bot, message, ars, prefix) {
        const server = await bot.servers[message.guild.id];
        const arr = [1, 2, 3, 4, 5];
        const arr2 = [6, 7, 8, 9, 10];
        arr.reverse().forEach((num) => {
            arr2.unshift(num);
        });
        // console.log(arr2);

        const totalDuration = server.queue
            .slice(1)
            .reduce((a, b) => a.duration + b.duration);

        console.log(ms("3:20"));
    },
};
