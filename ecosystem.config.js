module.exports = {
    apps: [
      {
        name: "chat_backend",       // Application name
        script: "src/app.js",       // Entry point of your application
        instances: "max",           // Number of instances to run (use 'max' for clustering)
        exec_mode: "cluster",       // Cluster mode
        watch: true,                // Watch for file changes
        env: {
          NODE_ENV: "development",  // Development environment variables
          PORT: 3020,               // Port to run the application
        },
        env_production: {
          NODE_ENV: "production",   // Production environment variables
          PORT: 3020,
        },
      },
    ],
  };
  