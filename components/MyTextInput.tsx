import {Text, TextInput, View} from 'react-native';

const MyTextInput = (props: any) => {
  return (
    <View style={{ flexDirection: 'column',marginVertical:10 }}>
      <Text
      style={{
        fontWeight:600,
        marginBottom:10
      }}
      >{props.label}</Text>
      <TextInput
       style={{ width: '100%', height: 40,padding: 10, borderRadius: 25, backgroundColor: '#E7E7E7' }}
        value={props.value}
        onChangeText={props.onChange}></TextInput>
    </View>
  );
};

export default MyTextInput;
