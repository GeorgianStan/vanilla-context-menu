const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = 'style-loader';

const config = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'vanilla-context-menu.js',
    library: {
      name: 'VanillaContextMenu',
      type: 'umd',
    },
  },
  devServer: {
    open: true,
    host: 'localhost',
    port: 8080,
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
  ],

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [stylesHandler, 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
};

module.exports = () => {
  if (isProduction) {
    config.mode = 'production';
    config.performance = {
      maxEntrypointSize: 10000,
      hints: 'error',
    };
  } else {
    config.mode = 'development';
    config.devtool = 'source-map';
  }
  return config;
};
