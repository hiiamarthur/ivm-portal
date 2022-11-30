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
      "NODE_ENV": "test"
    },
    env_prod: {
      "NODE_ENV": "prod"
    }
  }]
}
