module.exports = {
  apps : [{
    name   : "webportal",
    script : "npm",
    args: "run start:prod",
    exec_mode: "fork",
    instances: 1,
    autorestart: true,
    watch: false,
    env: {
      "PORT": 3000,
      "NODE_ENV": "prod"
    },
    env_prod: {
      "PORT": 8443,
      "NODE_ENV": "prod"
    }
  }]
}
