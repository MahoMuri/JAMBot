const ms = require("ms");

module.exports = (bot) => {
    bot.on("voiceStateUpdate", (oldState, newState) => {
        if (oldState.member.user === bot.user) {
            const server = bot.servers[newState.guild.id || oldState.guild.id];
            const message = bot.bind[newState.guild.id || oldState.guild.id];

            if (!message) return;

            if (!oldState.channel && newState.channel) {
                console.log("this one");
                message.msg.channel.send(
                    `✅ **Joined ${newState.channel.name} Channel!**`
                );
            } else if (oldState.channel && !newState.channel) {
                console.log("that one");
                if (server && server.dispatcher) {
                    if (server.dispatcher && server.queue.length !== 0) {
                        server.queue.length = 0;
                        server.dispatcher.end();
                    } else if (server.queue.length !== 0)
                        server.queue.length = 0;
                    message.msg.channel.send(
                        "**👋 Successfully Disconnected!**"
                    );
                    console.log(
                        "**👋 Successfully Disconnected!**",
                        server.queue
                    );
                }
            } else if (
                oldState.channel !== newState.channel &&
                newState !== null
            )
                if (server && server.dispatcher) {
                    if (server.dispatcher && server.queue.length !== 0) {
                        server.queue.length = 0;
                        server.dispatcher.end();
                    } else if (server.queue.length !== 0)
                        server.queue.length = 0;
                    message.msg.channel.send(
                        `✅ **Joined ${newState.channel.name} Channel!**`
                    );
                }
        } else if (
            oldState.member.user !== bot.user &&
            oldState.channel &&
            !newState.channel
        )
            if (oldState && oldState.channel)
                setInterval(() => {
                    const members = oldState.channel.members.map(
                        (member) => member
                    );
                    if (members.length === 1)
                        if (members[0].user === bot.user)
                            members[0].voice.channel.leave();
                }, ms("5m"));
    });
};
