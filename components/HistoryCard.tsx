import React from 'react'
import { Text, View } from 'react-native'

export default function HistoryCard(props: any) {
    const totalItem = (array: any[]): number => {
        const summation = array.reduce((prevItem: number, nextItem: any) => {
            return prevItem + parseInt(nextItem["Order Qty."]);
        }, 0);
        return summation;
    };


    return (
        <View style={{marginVertical:15}}>
            <View style={{ backgroundColor: 'white', width: '100%', height: 200, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',borderBottomLeftRadius:0,borderBottomRightRadius:0,padding:10 }}>
                <View
                    style={{
                        height: '30%',
                        aspectRatio: '1',
                        backgroundColor: props.status === "finished" ? '#009959' : '#d02f2f',
                        borderRadius: 40,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: 600, fontSize: 25 }}>
                        {props.index}
                    </Text>
                </View>
                <View style={{ width: '70%' }}>

                    <Text>Transfer Number : {props.transferNo}</Text>
                    <Text>date : {props.date}</Text>
                    <Text>Location : {props.location}</Text>
                    <Text>Received By : {props.receivedBy}</Text>
                    <Text>Checked By : {props.checkedBy}</Text>
                    <Text>Checked By : {props.checkedBy}</Text>



                </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly',backgroundColor:'black',borderBottomEndRadius:20,borderBottomStartRadius:20,height:50,padding:8 }}>
                <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: 600,color:'white' }}>Items to scan</Text>
                    <Text style={{color:'white'}}>{totalItem(props.transferData)}</Text>
                </View>
                <View style={{ height: '100%', width: 2, backgroundColor: 'gray' }}>

                </View>
                <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontWeight: 600,color:'white' }}>Items scanned</Text>
                    <Text style={{color:'white'}}>{totalItem(props.originalData) - totalItem(props.transferData)}</Text>
                </View>

            </View>
        </View>
    )
}
