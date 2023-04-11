module.exports = {
    apps: [{
        name: "mibi-portal",
        script: "./lib/main.js",
        exp_backoff_restart_delay: 500,
        out_file: process.env['MIBI_LOG'],
        error_file: process.env['MIBI_LOG'],
        log_date_format: "YYYY-MM-DD HH:mm:ss Z",
        env: {
            NODE_APP_INSTANCE: ""
        }
    }]
}
