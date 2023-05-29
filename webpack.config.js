const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

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
        use: [
          {
            loader: 'style-loader',
            options: {
              injectType: 'lazyStyleTag',
              insert: function insertIntoTarget(element, options) {
                var parent = options.target || document.head;

                parent.appendChild(element);
              },
            },
          },
          'css-loader',
          'sass-loader',
        ],
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
