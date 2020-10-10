module.exports = {
    name: "ping",
    description: "Returns latency and API ping",
    category: "general",
    usage: "`-<command | alias>`",
    async run(bot, message) {
        const msg = await message.channel.send("🏓 Pinging....");

        msg.edit(`🏓 Pong!
        Latency is ${Math.floor(msg.createdAt - message.createdAt)}ms
        API Latency is ${Math.round(bot.ws.ping)}ms`);
    },
};
