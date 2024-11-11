module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // Add this line
  };
};
//mongoose.connect('mongodb+srv://HarshaBackend:vfcdatabase@cluster1.vwvl8jx.mongodb.net/creditcards?retryWrites=true&w=majority&appName=Cluster1', {