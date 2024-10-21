import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const FLICKR_RECENT_API_URL = 'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s';

const SearchScreen = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [showRetrySnackbar, setShowRetrySnackbar] = useState(false);

  // Fetch recent images from Flickr API
  const fetchRecentImages = async (nextPage = 1) => {
    setLoading(nextPage === 1); // Show main loader only for the first page
    setLoadingMore(nextPage > 1); // Show "loading more" indicator for pagination

    try {
      const response = await fetch(`${FLICKR_RECENT_API_URL}&page=${nextPage}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const fetchedImages = data.photos.photo.map(photo => ({
        id: photo.id,
        title: photo.title,
        url: photo.url_s,
      }));
      if (nextPage === 1) {
        setImages(fetchedImages); // Replace images for the first page
      } else {
        setImages(prevImages => [...prevImages, ...fetchedImages]); // Append new images for subsequent pages
      }
      setPage(nextPage); // Update the current page
    } catch (error) {
      console.error('Error fetching recent images:', error);
      setShowRetrySnackbar(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch first page when component mounts
  useEffect(() => {
    fetchRecentImages();
  }, []);

  // Retry fetch function for the snackbar
  const retryFetch = () => {
    setShowRetrySnackbar(false);
    fetchRecentImages(page); // Retry the same page
  };

  // Render each image in the FlatList
  const renderItem = ({ item }) => (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item.url }} style={styles.photo} />
      <Text style={styles.photoTitle}>{item.title}</Text>
    </View>
  );

  // Fetch the next page when the user scrolls to the end
  const loadMoreImages = () => {
    if (!loadingMore) {
      fetchRecentImages(page + 1); // Fetch the next page
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
      ) : (
        <FlatList
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.imageList}
          onEndReached={loadMoreImages} // Load more when scrolling to the bottom
          onEndReachedThreshold={0.5} // How close to the end before loading more
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color="#6200ee" /> : null // Show loading indicator at the end
          }
        />
      )}

      <Snackbar
        visible={showRetrySnackbar}
        onDismiss={() => setShowRetrySnackbar(false)}
        action={{
          label: 'Retry',
          onPress: retryFetch,
        }}
        style={styles.snackbar}
      >
        <Text style={styles.snackbarText}>Failed to fetch images. Please try again.</Text>
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    marginVertical: 20,
  },
  imageList: {
    paddingBottom: 10,
  },
  photoContainer: {
    flex: 1,
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 1,
  },
  photo: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
  },
  photoTitle: {
    padding: 5,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
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

export default SearchScreen;
