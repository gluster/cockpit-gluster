const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')

// const htmlPlugin = new HtmlWebPackPlugin({
//   template: "./src/index.html",
//   filename: "./index.html"
// })
module.exports = {
  mode:"development",
  entry: [
    './src/app.jsx'
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
        test: /.jsx?$/,
        include: path.resolve(__dirname, 'src'),
        use: [
          // 'cache-loader',
          { loader: "babel-loader" }
      ]
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  plugins: [
    // new CleanWebpackPlugin(['dist']),
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
