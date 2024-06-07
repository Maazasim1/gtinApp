import React from 'react'
import {View,Text} from 'react-native'
import SlidingText from './SlidingText'
export default function LastItemCard(props:any) {
  return (
    <View style={{backgroundColor:'white',width:'100%' ,height:30,borderRadius:10,flexDirection:'row',alignItems:'center',justifyContent:'space-around',overflow:'hidden'}}>
        {/* <View 
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
        </View> */}
        <View style={{width:'100%',flexDirection:'row',alignItems:'center'}}>
            <Text 
                style={{
                    backgroundColor:'white',
                    zIndex:3,
                    paddingLeft:10
                }}
            >Last Scanned Item :</Text><SlidingText text={` ${props.name}`}/>
        </View>


    </View>
  )
}
