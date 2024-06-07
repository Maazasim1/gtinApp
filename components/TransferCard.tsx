import React from 'react'
import {View,Text} from 'react-native'
export default function TransferCard(props:any) {
  return (
    <View style={{backgroundColor:'white',width:'100%' ,height:100,borderRadius:30,flexDirection:'row',alignItems:'center',justifyContent:'space-around',marginVertical:10}}>
        <View 
            style={{
                height:'70%',
                aspectRatio:'1',
                backgroundColor:props.index===0?'#009959':'#d02f2f',
                borderRadius:40,
                alignItems:'center',
                justifyContent:'center'
            }}
        >
            <Text style={{color:'white',fontWeight:600,fontSize:25}}>
                X{props.index}
            </Text>
        </View>
        <View style={{width:'70%'}}>

            <Text>Item Code : {props.code}</Text>
            <Text>Name : {props.name}</Text>
        </View>


    </View>
  )
}
