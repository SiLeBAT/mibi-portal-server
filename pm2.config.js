module.exports = {
    apps: [{
        name: 'mibi-parse-proxy',
        script: "./lib/ui/server/internal-proxy.server.js",
        exp_backoff_restart_delay: 500,
        out_file: process.env['MIBI_LOG'],
        error_file: process.env['MIBI_LOG'],
        log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    }, {
        name: "mibi-portal",
        script: "./lib/main.js",
        exp_backoff_restart_delay: 500,
        out_file: process.env['MIBI_LOG'],
        error_file: process.env['MIBI_LOG'],
        log_date_format: "YYYY-MM-DD HH:mm:ss Z",
        wait_ready: true,
        listen_timeout: 5000,
        env: {
            NODE_APP_INSTANCE: ""
        }
    }]
}
