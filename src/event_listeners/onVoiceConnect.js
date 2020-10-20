module.exports = (bot) => {
    bot.on("voiceStateUpdate", (oldState, newState) => {
        if (oldState.member.user === bot.user) {
            const message = bot.bind[newState.guild.id || oldState.guild.id];

            if (!message) return;

            if (!oldState.channel && newState.channel) {
                console.log("this one");
                message.msg.channel.send(
                    `✅ **Joined ${newState.channel.name} Channel!**`
                );
            } else if (oldState.channel && !newState.channel) {
                console.log("that one");
                message.msg.channel.send("**👋 Successfully Disconnected!**");
            } else if (
                oldState.channel !== newState.channel &&
                newState !== null
            )
                message.msg.channel.send(
                    `✅ **Joined ${newState.channel.name} Channel!**`
                );
        }
    });
};
