import React, { useState, useEffect } from 'react';
import { View, Image, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

const FLICKR_API_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s,date_taken,tags,owner,description';
const CACHE_KEY = 'FLICKR_IMAGES';

const Drawer = createDrawerNavigator();

const HomeScreen = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const cachedImages = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedImages) {
        const parsedCachedImages = JSON.parse(cachedImages);
        console.log('Loading images from cache:', parsedCachedImages);
        setImages(parsedCachedImages);
      }

      const response = await fetch(FLICKR_API_URL);
      const data = await response.json();
      const newImages = data.photos.photo.map(photo => ({
        id: photo.id,
        title: photo.title,
        url: photo.url_s,
        owner: {
          id: photo.owner,
          username: photo.ownername,
        },
        date_taken: photo.datetaken,
        tags: photo.tags ? photo.tags.split(' ') : [],
        description: photo.description || 'No description available',
      }));

      console.log('Fetched images from API:', newImages);

      if (JSON.stringify(newImages) !== cachedImages) {
        setImages(newImages);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newImages));
        console.log('New images fetched from API and cached:', newImages);
      } else {
        console.log('Cached images are up to date');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{
      flex: 1,
      margin: 5,
      borderRadius: 10,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    }}>
      <Image source={{ uri: item.url }} style={{
        width: '100%',
        height: undefined,
        aspectRatio: 1,
      }} />
    </View>
  );

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#f5f5f5',
      padding: 10,
    }}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{
          paddingBottom: 10,
        }}
      />
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer independent>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;
