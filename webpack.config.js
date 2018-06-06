const HtmlWebPackPlugin = require("html-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')

// const htmlPlugin = new HtmlWebPackPlugin({
//   template: "./src/index.html",
//   filename: "./index.html"
// })
module.exports = {
  mode:"development",
  entry: [
    './src/app.js'
  ],
  output: {
    libraryTarget: 'var',
    library: 'Dashboard',
    path: __dirname + '/dist',
    filename: "app.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" }
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      filename: "./index.html"
    }),
    new CopyWebpackPlugin([
      {from: './src/app.css'},
      {from: 'static/manifest.json'},
    ]),
  ]
};
