module.exports = {
  apps: [
    {
      name: "academy",
      cwd: "/home/kagla/academy",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "5002",
      },
    },
  ],
};
