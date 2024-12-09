import React, { useState, useEffect, useRef } from 'react';
import { Button, Text, View, StyleSheet, TouchableOpacity, Linking, Share, Image, Modal, TextInput, FlatList, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CameraView, Camera } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons'; 
import { KeyboardAvoidingView, Platform } from 'react-native';

const ReviewModal = ({ visible, onClose, onSubmit, photo }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        onSubmit({ rating, comment, photo });
        setRating(0);
        setComment('');
        onClose();
    };

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.modalContainer} activeOpacity={1} onPress={onClose}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalContent}
                >
                    <Text style={styles.modalTitle}>Add a Review</Text>
                    {photo && <Image source={{ uri: photo }} style={styles.reviewPhoto} />}
                    <View style={styles.ratingContainer}>
                    {[...Array(5)].map((_, index) => (
                            <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
                                <FontAwesome
                                    name={index < rating ? "star" : "star-o"}
                                    size={30}
                                    color="#FFD700"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Write your review"
                        value={comment}
                        onChangeText={setComment}
                        multiline
                    />
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity style={styles.modalButton} onPress={handleSubmit}>
                            <Text style={styles.modalButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </TouchableOpacity>
        </Modal>
    );
};

export default function RestoScreen({ route, navigation }) {
    const { title, description, rating, image, phoneNumber, location } = route.params;
    const [hasPermission, setHasPermission] = useState(false);
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false); // State for favorite
    const cameraRef = useRef(null);
    const isFocused = useIsFocused();
    const [photoUri, setPhotoUri] = useState(null);
    const [userReview, setUserReview] = useState(null);

    useEffect(() => {
        (async () => {
            const result = await Camera.requestCameraPermissionsAsync();
            setHasPermission(result && result.status === 'granted');
        })();
    }, []);

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
            setIsCameraVisible(false);
            setPhotoUri(photo.uri);
            setModalVisible(true);
        }
    };

    const handleAddReview = (review) => {
        const newReview = {
            ...review,
            date: new Date().toISOString(),
            isUserReview: true
        };
        if (userReview) {
            // Modifier l'avis existant
            setReviews(reviews.map(r => r.isUserReview ? newReview : r));
        } else {
            // Ajouter un nouvel avis
            setReviews([...reviews, newReview]);
        }
        setUserReview(newReview);
        setPhotoUri(null);
    };

    const handleEditReview = () => {
        if (userReview) {
            setPhotoUri(userReview.photo);
            setModalVisible(true);
        }
    };

    const uploadPhoto = async (uri) => {
        // Implémentation de l'upload de la photo
        console.log('Photo uploaded:', uri);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${title} - ${description}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const navigateToMap = () => {
        navigation.navigate('MapScreen', { location });
    };

    if (!hasPermission || !isFocused) {
        return <View />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <View>
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: image }} style={styles.image} />
                            <TouchableOpacity style={styles.favoriteIcon} onPress={() => setIsFavorite(!isFavorite)}>
                                <Feather name="heart" size={24} color={isFavorite ? "#FF0000" : "#FFFFFF"} />
                            </TouchableOpacity>
                            <View style={styles.imageOverlay}>
                                <Text style={styles.overlayTitle}>{title}</Text>
                                <Text style={styles.overlayLocation}>{location}</Text>
                            </View>
                        </View>
                        <View style={styles.contentContainer}>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.actionButton} onPress={() => setIsCameraVisible(true)}>
                                    <Feather name="camera" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Photo</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                    <Feather name="share-2" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Partager</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={() => setModalVisible(true)}>
                                    <Feather name="edit" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Avis</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={navigateToMap}>
                                    <Feather name="map" size={20} color="#FFFFFF" />
                                    <Text style={styles.actionButtonText}>Carte</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.description}>{description}</Text>
                            <View style={styles.ratingContainer}>
                                {[...Array(5)].map((_, index) => (
                                    <FontAwesome
                                        key={index}
                                        name={index < Math.floor(rating) ? "star" : "star-o"}
                                        size={24}
                                        color="#FFD700"
                                    />
                                ))}
                                <Text style={styles.rating}>{rating}/5</Text>
                            </View>
                            <TouchableOpacity style={styles.phoneButton} onPress={() => Linking.openURL(`tel:${phoneNumber}`)}>
                                <Feather name="phone" size={20} color="#FFFFFF" />
                                <Text style={styles.phoneNumber}>{phoneNumber}</Text>
                            </TouchableOpacity>
                            <Text style={styles.reviewsTitle}>Avis</Text>
                        </View>
                    </View>
                }
                data={reviews}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={styles.reviewItem}>
                        {item.photo && <Image source={{ uri: item.photo }} style={styles.reviewPhoto} />}
                        <View style={styles.reviewRating}>
                        {[...Array(5)].map((_, index) => (
                                <FontAwesome
                                    key={index}
                                    name={index < item.rating ? "star" : "star-o"}
                                    size={16}
                                    color="#FFD700"
                                />
                            ))}
                        </View>
                        <Text style={styles.reviewComment}>{item.comment}</Text>
                        <Text style={styles.reviewDate}>
                            {new Date(item.date).toLocaleDateString()}
                        </Text>
                        {item.isUserReview && (
                            <TouchableOpacity onPress={handleEditReview}>
                                <Text style={styles.editReview}>Edit</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />
            <ReviewModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleAddReview}
                photo={photoUri}
            />
            {isCameraVisible && (
                <View style={styles.cameraContainer}>
                    <CameraView style={styles.camera} ref={(ref) => (cameraRef.current = ref)}>
                        <View style={styles.cameraButtonContainer}>
                            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                                <Feather name="camera" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </CameraView>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 30,
        resizeMode: 'cover',
        marginTop: 10,
    },
    favoriteIcon: {
        position: 'absolute',
        top: 30,
        right: 20,
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 10,
    },
    overlayTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    overlayLocation: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    rating: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFAA00',
        marginLeft: 5,
    },
    phoneButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2D9CDB',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: 'center',
    },
    phoneNumber: {
        fontSize: 16,
        color: '#FFFFFF',
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#C44949',
        padding: 12,
        borderRadius: 12,
        width: '40%',
        marginVertical: 10,
    },
    actionButtonText: {
        color: '#FFFFFF',
        marginTop: 5,
        fontSize: 14,
    },
    reviewsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 10,
    },
    reviewItem: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reviewRating: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    reviewRatingText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        color: '#FFAA00',
    },
    reviewComment: {
        fontSize: 14,
        color: '#666666',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 15,
        width: '90%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#C44949',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        padding: 12,
        backgroundColor: '#FAFAFA',
        marginBottom: 15,
        fontSize: 14,
    },
    commentInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    modalButton: {
        backgroundColor: '#C44949',
        padding: 10,
        borderRadius: 25,
        width: '40%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    cameraContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    camera: {
        flex: 1,
    },
    cameraButtonContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
        margin: 20,
    },
    captureButton: {
        alignSelf: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#F2994A',
        padding: 15,
        borderRadius: 50,
    },
    reviewPhoto: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    reviewDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 5,
    },
    editReview: {
        color: '#C44949',
        fontWeight: 'bold',
        marginTop: 5,
    },
});