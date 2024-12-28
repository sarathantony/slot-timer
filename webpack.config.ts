module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.ts$/,
        use: { loader: "worker-loader" },
      },
      {
        test: /\.ts$/,
        use: 'ts-loader', // Compile TypeScript files
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  entry: './src/index.ts',
  externals: {
    // Exclude dependencies from the bundle
    worker_threads: 'commonjs worker_threads',
  },
  mode: 'production', // Optimize output for production
};
