// webpack.config.js
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/script.ts', // Entry point for your TypeScript file
  output: {
    filename: 'script.min.js',
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  resolve: {
    extensions: ['.ts', '.js'], // Allow importing .ts and .js files without specifying extensions
  },
  module: {
    rules: [
      {
        test: /\.ts$/,          // Apply this rule to .ts files
        use: 'ts-loader',       // Use ts-loader to transpile TypeScript files
        exclude: /node_modules/ // Exclude node_modules from processing
      },
    ],
  },
  optimization: {
    minimize: true,             // Enable minification
    minimizer: [new TerserPlugin()], // Use Terser for minification
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'), // Set NODE_ENV to 'production'
      'process.env': JSON.stringify({}),                    // Define process.env as an empty object
      'process': JSON.stringify({}),                        // Define process as an empty object
    }),
  ],
};
