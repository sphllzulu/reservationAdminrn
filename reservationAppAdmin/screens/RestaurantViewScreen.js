import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Clipboard from 'expo-clipboard';

const CloudinaryUploadPage = () => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);




  const CLOUDINARY_URL =process.env.EXPO_PUBLIC_CLOUDINARY_URL;
  const UPLOAD_PRESET =process.env.EXPO_PUBLIC_UPLOAD_PRESET; 

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      alert('Please pick an image first!');
      return;
    }

    setUploading(true);

    try {
      // Compress the image
      const compressedImage = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: compressedImage.uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      // Upload to Cloudinary
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = async () => {
    if (imageUrl) {
      await Clipboard.setStringAsync(imageUrl);
      Alert.alert('Copied!', 'The URL has been copied to your clipboard.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Uploader</Text>
      <Text style={styles.instructions}>
        1. Pick an image from your gallery{'\n'}
        2. Upload it{'\n'}
        3. Copy the hosted image URL
      </Text>

      <Button title="Pick an image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {image && (
        <Button
          title={uploading ? 'Uploading...' : 'Upload Image'}
          onPress={uploadImage}
          disabled={uploading}
        />
      )}
      {uploading && <ActivityIndicator size="large" color="#0000ff" />}
      {imageUrl && (
        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Hosted Image URL:</Text>
          <TouchableOpacity onPress={copyToClipboard}>
            <Text style={styles.link}>{imageUrl}</Text>
          </TouchableOpacity>
          <Text style={styles.copyHint}>(Tap to copy)</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  link: {
    fontSize: 16,
    color: 'blue',
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  copyHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});



export default CloudinaryUploadPage;