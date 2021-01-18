const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const del = require('del');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackRTLPlugin = require('webpack-rtl-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackMessages = require('webpack-messages');
const ExcludeAssetsPlugin = require('webpack-exclude-assets-plugin');

// paths
const rootPath = path.resolve(__dirname, '..');

// arguments/params from the line command
const args = getParameters();
// get theme name
let theme = 'keen';
// get selected demo, default demo1
let demo = getDemos(rootPath)[0];

// under demo paths
const demoPath = rootPath + '/' + demo;
const distPath = demoPath + '/dist';
const assetDistPath = distPath + '/assets';
const srcPath = demoPath + '/src';

const extraPlugins = [];
const exclude = [];

const js = args.indexOf('js') !== -1;
const css = args.indexOf('css') !== -1 || args.indexOf('scss') !== -1;

addtionalSettings();

function addtionalSettings() {
  if (args.indexOf('rtl') !== -1) {
    // NOTE: at the moment, this plugin does not yet support for webpack 5
    // enable rtl for css
    // extraPlugins.push(new WebpackRTLPlugin({
    //   filename: '[name].rtl.css',
    // }));
  }

  if (!js && css) {
    // exclude js files
    exclude.push('\.js$');
  }

  if (js && !css) {
    // exclude css files
    exclude.push('\.s?css$');
  }

  if (exclude.length) {
    // add plugin for exclude assets (js/css)
    extraPlugins.push(new ExcludeAssetsPlugin({
      path: exclude,
    }));
  }
}

function getEntryFiles() {
  const entries = {
    // 3rd party plugins css/js
    'plugins/global/plugins.bundle': ['./webpack/plugins/plugins.js', './webpack/plugins/plugins.scss'],
    // Keen css/js
    'css/style.bundle': './' + path.relative('./', srcPath) + '/sass/style.scss',
    'js/scripts.bundle': './webpack/scripts.' + demo + '.js',
  };

  // Custom 3rd party plugins
  (glob.sync('./webpack/plugins/custom/**/*.+(js)') || []).forEach(file => {
    let loc = file.replace('webpack/', '').replace('./', '');
    if (path.basename(file) === 'gmaps.js') {
      loc = loc.replace('.js', '');
    }
    else {
      loc = loc.replace('.js', '.bundle');
    }
    entries[loc] = file;
  });

  // Keen css pages (single page use)
  (glob.sync(path.relative('./', srcPath) + '/sass/pages/**/!(_)*.scss') || []).forEach(file => {
    entries[file.replace(/.*sass\/(.*?)\.scss$/ig, 'css/$1')] = './' + file;
  });
  (glob.sync(path.relative('./', srcPath) + '/js/pages/**/!(_)*.js') || []).forEach(file => {
    entries[file.replace(/.*js\/(.*?)\.js$/ig, 'js/$1')] = './' + file;
  });

  // Keen theme
  (glob.sync(path.relative('./', srcPath) + '/sass/themes/**/!(_)*.scss') || []).forEach(file => {
    entries[file.replace(/.*sass\/(.*?)\.scss$/ig, 'css/$1')] = './' + file;
  });

  return entries;
}

function mainConfig() {
  return {
    // enabled/disable optimizations
    mode: args.indexOf('prod') === 0 ? 'production' : 'development',
    // console logs output, https://webpack.js.org/configuration/stats/
    stats: 'errors-warnings',
    performance: {
      // disable warnings hint
      hints: false,
    },
    optimization: {
      // js and css minimizer
      minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
    },
    entry: getEntryFiles(),
    output: {
      // main output path in assets folder
      path: assetDistPath,
      // output path based on the entries' filename
      filename: '[name].js',
    },
    resolve: {
      alias: {
        jquery: path.join(__dirname, 'node_modules/jquery/src/jquery'),
        '@': demoPath,
      },
      extensions: ['.js', '.scss'],
      fallback: {
        util: false
      }
    },
    devtool: 'source-map',
    plugins: [
      new WebpackMessages({
        name: theme,
        logger: str => console.log(`>> ${str}`),
      }),
      // create css file
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            // copy media
            from: srcPath + '/media',
            to: assetDistPath + '/media',
          },
          {
            // copy tinymce skins
            from: path.resolve(__dirname, 'node_modules') + '/tinymce/skins',
            to: assetDistPath + '/plugins/custom/tinymce/skins',
          },
          {
            // copy tinymce plugins
            from: path.resolve(__dirname, 'node_modules') + '/tinymce/plugins',
            to: assetDistPath + '/plugins/custom/tinymce/plugins',
          },
        ]
      }),
    ].concat(extraPlugins),
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              // options: {
              //   url: (url, resourcePath) => {
              //     // Don't handle local urls
              //     return !!url.includes('media');
              //   },
              // },
            },
            /*{
              loader: 'postcss-loader', // Run post css actions
              options: {
                postcssOptions: {
                  plugins: function () { // post css plugins, can be exported to postcss.config.js
                    return [
                      // require('precss'),
                      require('autoprefixer'),
                    ];
                  },
                }
              },
            },*/
            {
              loader: 'sass-loader',
              options: {
                sourceMap: false,
                sassOptions: {
                  includePaths: [
                    demoPath,
                    path.resolve(__dirname, 'node_modules')
                  ],
                }
              },
            },
          ],
        },
        {
          test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
          include: [
            path.resolve(__dirname, 'node_modules'),
            rootPath,
          ],
          use: [
            {
              loader: 'file-loader',
              options: {
                // prevent name become hash
                name: '[name].[ext]',
                // move files
                outputPath: 'plugins/global/fonts',
                // rewrite path in css
                publicPath: 'fonts',
                esModule: false,
              },
            },
          ],
        },
        {
          test: /\.(gif|png|jpe?g)$/,
          include: [
            path.resolve(__dirname, 'node_modules'),
          ],
          use: [
            {
              loader: 'file-loader',
              options: {
                // emitFile: false,
                name: '[path][name].[ext]',
                publicPath: (url, resourcePath, context) => {
                  return path.basename(url);
                },
                outputPath: (url, resourcePath, context) => {
                  var plugin = url.match(/node_modules\/(.*?)\//i);
                  if (plugin) {
                    return `plugins/custom/${plugin[1]}/${path.basename(url)}`;
                  }
                  return url;
                },
              },
            },
          ],
        },
      ],
    },
    // webpack dev server config
    devServer: {
      contentBase: demoPath + '/dist',
      compress: true,
      port: 3000,
    },
  };
}

function getParameters() {
  // remove first 2 unused elements from array
  let argv = JSON.parse(process.env.npm_config_argv).cooked.slice(2);
  argv = argv.map((arg) => {
    return arg.replace(/--/i, '');
  });
  return argv;
}

function getDemos(pathDemos) {
  // get possible demo from parameter command
  let demos = [];
  args.forEach((arg) => {
    const demo = arg.match(/^demo.*/g);
    if (demo) {
      demos.push(demo[0]);
    }
  });

  if (demos.length === 0) {
    demos = ['demo1'];
    if (args.indexOf('alldemos') !== -1) {
      try {
        // sync reusable source code with demo1 for all other demos
        demos = fs.readdirSync(pathDemos).filter((file) => {
          return !/(^|\/)\.[^\/\.]/g.test(file) && /^demo\d+$/g.test(file) && file !== 'demo0';
        });
      }
      catch (err) {
        console.error('Failed to read demo folder: ' + pathDemos);
      }
    }
  }

  return demos;
}

module.exports = () => {
  return [mainConfig()];
};
