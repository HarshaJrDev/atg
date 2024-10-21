import React, { useState, useEffect } from 'react';
import { View, Image, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Snackbar } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Search from '../app/SearchScreen'

const FLICKR_API_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=';
const FLICKR_SEARCH_API_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&per_page=20&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s&text=';
const CACHE_KEY = 'FLICKR_IMAGES';
const API_KEY = '6f102c62f41998d151e5a1b48713cf13';

const Drawer = createDrawerNavigator();

const HomeScreen = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [showRetrySnackbar, setShowRetrySnackbar] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [currentPage]);

  const fetchImages = async () => {
    try {
      const cachedImages = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedImages && currentPage === 1) {
        const parsedCachedImages = JSON.parse(cachedImages);
        console.log('Loading images from cache:', parsedCachedImages);
        setImages(parsedCachedImages);
      }
  
      const response = await fetch(`${FLICKR_API_URL}${currentPage}&api_key=${API_KEY}&format=json&nojsoncallback=1&extras=url_s,date_taken,tags,owner,description`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
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
  
      if (currentPage === 1) {
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(newImages));
      }
  
      setImages((prevImages) => [...prevImages, ...newImages]);
    } catch (error) {
      console.error('Error fetching images:', error);
      setShowRetrySnackbar(true);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };
  

  const handleLoadMore = () => {
    if (!isFetchingMore && currentPage < 3) {
      setIsFetchingMore(true);
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${FLICKR_SEARCH_API_URL}${searchText}`);
      const data = await response.json();
      const searchedImages = data.photos.photo.map(photo => ({
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
      
      // Log the search results
      console.log('Search results:', searchedImages);
  
      setImages(searchedImages);
    } catch (error) {
      console.error('Error searching images:', error);
      setShowRetrySnackbar(true);
    } finally {
      setLoading(false);
    }
  };
  

  const renderItem = ({ item }) => (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item.url }} style={styles.photo} />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search photos"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: 10 }}
          ListFooterComponent={
            isFetchingMore && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#6200ee" />
              </View>
            )
          }
        />
      )}

      <Snackbar
        visible={showRetrySnackbar}
        onDismiss={() => setShowRetrySnackbar(false)}
        action={{
          label: 'Retry',
          onPress: fetchImages,
        }}
        style={styles.snackbar}
      >
        <Text style={styles.snackbarText}>Failed to fetch images. Please try again.</Text>
      </Snackbar>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer independent>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Search" component={Search} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  photoContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  photo: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  loaderContainer: {
    paddingVertical: 20,
  },
  snackbar: {
    backgroundColor: '#f44336',
    borderRadius: 8,
  },
  snackbarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default App;
