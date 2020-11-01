/**
 * @file main(): basically where everything is initialized
 */

// Imports
const Ascii = require("ascii-table");
const { Client, Collection } = require("discord.js");
const { config } = require("dotenv");

const { readdirSync } = require("fs");

// Setup bot
const bot = new Client({
    disableEveryone: true,
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

bot.aliases = new Collection();
bot.categories = readdirSync(`${__dirname}/commands/`);
bot.commands = new Collection();
bot.messageCache = [];
bot.embedMessage = null;
bot.servers = {};
bot.logo = "https://media2.giphy.com/media/7pDcO2wqoADoGwr504/giphy.gif";

// Setup configuration
config({
    path: `${__dirname}/../.env`,
});

// Setup listeners
const lstTable = new Ascii("listeners");
lstTable.setHeading("Listener", "Status");
const listeners = readdirSync(`${__dirname}/event_listeners`).filter((v) =>
    v.endsWith(".js")
);
listeners.forEach((v) => {
    require(`${__dirname}/event_listeners/${v}`)(bot);
    lstTable.addRow(v, "Loaded");
});
console.log(lstTable.toString());

// Setup commands
const cmdTable = new Ascii("commands");
cmdTable.setHeading("Command", "Load status");
bot.categories.forEach((dir) => {
    const commands = readdirSync(`${__dirname}/commands/${dir}`).filter((f) =>
        f.endsWith(".js")
    );
    commands.forEach((file) => {
        const pull = require(`${__dirname}/commands/${dir}/${file}`);
        if (pull.name) {
            bot.commands.set(pull.name, pull);
            cmdTable.addRow(file, "Loaded");
            if (pull.aliases && Array.isArray(pull.aliases))
                pull.aliases.forEach((alias) =>
                    bot.aliases.set(alias, pull.name)
                );
        } else cmdTable.addRow(file, "Error -> No name defined");
    });
});
console.log(cmdTable.toString());

// Now login
bot.login(process.env.TOKEN);
