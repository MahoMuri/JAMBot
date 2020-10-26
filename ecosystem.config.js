module.exports = {
    apps: [
        {
            name: "JAMBot",
            script: "./src/index.js",
        },
    ],

    deploy: {
        production: {
            user: "kaito",
            host: "192.168.1.10",
            ref: "origin/master",
            repo: "git@github.com:MahoMuri/JAMBot.git",
            path: "/home/kaito/Discord-Bots/JAMBot",
            "post-deploy":
                "npm install && pm2 startOrRestart ecosystem.config.js --env production",
            env: {
                NODE_ENV: "production",
            },
        },
    },
};
