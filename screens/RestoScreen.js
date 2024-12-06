import { Button, Text, View, StyleSheet} from 'react-native';

export default function MapScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text> Resto Screen </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });