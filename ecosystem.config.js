module.exports = {
  apps: [
    {
      name: "greenhouse-monitoring",
      script: "npm",
      args: "start",
      cwd: "/home/bevan1/code/greenhouse-monitoring",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "200M",
    },
  ],
};