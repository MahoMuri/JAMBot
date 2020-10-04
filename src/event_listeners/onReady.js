/**
 * @file ready listener
 */
const ms = require("ms");

module.exports = (bot) => {
    const statuses = [
        "laugh at your problems, everybody else does.",
        "worrying works! 90% of the things I worry about never happen.",
        "I thought I wanted a career, turns out I just wanted paychecks.",
        "never get into fights with ugly people, they have nothing to lose.",
        "artificial intelligence is no match for natural stupidity.",
        "the longer the title the less important the job.",
        "just remember…if the world didn’t suck, we’d all fall off.",
        "if I agreed with you we’d both be wrong.",
        "eat right, exercise, die anyway.",
        "I may be fat, but you’re ugly – I can lose weight!",
        "without ME, it’s just AWESO.",
        "-help | with you",
    ];
    bot.on("ready", () => {
        const logMsg = `✅ ${bot.user.username} is online on ${
            bot.guilds.cache.size
        } server${bot.guilds.cache.size > 1 ? "s" : ""}!`;

        console.log(logMsg);

        bot.user
            .setActivity("-help | with you", {
                type: "PLAYING",
            })
            .then(() => {
                setInterval(() => {
                    const status =
                        statuses[Math.floor(Math.random() * statuses.length)];

                    bot.user.setActivity(status, {
                        type: "PLAYING",
                    });
                }, ms("10m"));
            });
    });
};
