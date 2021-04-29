const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
//mode watcher
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
//paths
const Paths = {
	src: path.resolve(__dirname, 'src'),
	dist: path.resolve(__dirname, 'dist'),
	srcAssets: path.resolve(__dirname, 'src/assets'),
	distAssets: path.resolve(__dirname, 'dist/assets')
};
// optimiztion config for prod and dev
const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all'
		}
	};
	if (isProd) {
		config.minimizer = [
			new OptimizeCSSAssetsWebpackPlugin(),
			new TerserPlugin()
		];
	}
	return config;
};
//sourcemaps for prod and dev
const sourcemaps = () => {
	isDev ? 'source-map' : '';
};
//filename for prod and dev
const filename = (ext) =>
	isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;
module.exports = {
	context: Paths.src,
	mode: 'development',
	entry: {
		main: ['@babel/polyfill', './js/index.js']
	},
	output: {
		filename: `./js/${filename('js')}`,
		path: Paths.dist
		// publicPath: '',
		// clean: true,
	},
	optimization: optimization(),
	devtool: sourcemaps(),
	plugins: [
		new HTMLWebpackPlugin({
			template: './index.html',
			filename: 'index.html',
			inject: true,
			minify: {
				collapseWhitespace: isProd
			}
		}),
		new CleanWebpackPlugin(),
		new MiniCssExtractPlugin({
			filename: `./styles/${filename('css')}`
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: Paths.srcAssets,
					to: Paths.distAssets
				}
			]
		})
	],
	module: {
		rules: [
			{
				test: /\.html$/i,
				use: {
					loader: 'html-loader',
					options: {}
				}
			},
			{
				test: /\.css$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							hmr: isDev
						}
					},
					'css-loader'
				]
			},
			{
				test: /\.s[ac]ss$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {}
					},
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.(?:|jpg|jpeg|png|webp|gif|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: `./img/${filename('[ext]')}`
						}
					}
				]
			},
			{
				test: /\.(ttf|woff|woff2|eot)$/,
				use: [
					{
						loader: 'file-loader'
					}
				]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-proposal-class-properties']
					}
				}
			}
		]
	},
	target: 'web',
	devServer: {
		historyApiFallback: true,
		contentBase: Paths.dist,
		open: true,
		compress: true,
		port: 999,
		hot: isDev,
		inline: true
		//watchContentBase: true
	}
};
