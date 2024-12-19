import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import styles from '../styles';

const ActionsBar = ({ isConnected, setIsCameraVisible, dispatch, handleShare, setModalVisible, openGPS }) => (
  <View style={styles.buttonContainer}>
    <TouchableOpacity
      style={styles.actionButton}
      onPress={() => isConnected ? setIsCameraVisible(true) : dispatch(toggleModal())}
    >
      <Feather name="camera" size={20} color="#FFFFFF" />
      <Text style={styles.actionButtonText}>Photo</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
      <Feather name="share-2" size={20} color="#FFFFFF" />
      <Text style={styles.actionButtonText}>Partager</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles.actionButton}
      onPress={() => isConnected ? setModalVisible(true) : dispatch(toggleModal())}
    >
      <Feather name="edit" size={20} color="#FFFFFF" />
      <Text style={styles.actionButtonText}>Avis</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionButton} onPress={openGPS}>
      <Feather name="navigation" size={20} color="#FFFFFF" />
      <Text style={styles.actionButtonText}>GPS</Text>
    </TouchableOpacity>
  </View>
);

export default ActionsBar;