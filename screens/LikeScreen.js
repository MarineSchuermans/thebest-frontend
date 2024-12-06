import { Button, Text, View, StyleSheet} from 'react-native';

export default function LikeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text> Like Screen </Text>
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