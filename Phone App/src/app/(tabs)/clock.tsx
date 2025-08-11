import { View, Text, SafeAreaView, NativeModules, NativeEventEmitter, ImageBackground, ScrollView, StyleSheet, Image } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { useGlobalContext } from "../../../context/GlobalProvider";
import CustomButton from "../../../components/CustomButton"
// import { BleManager, Device } from 'react-native-ble-plx'
import { useState } from "react";
import base64 from 'react-native-base64'
import WheelPicker from '../../../components/WheelPicker';
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
  PeripheralInfo,
} from 'react-native-ble-manager';
import { icons } from '../../../constants'
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const BleManagerModule = NativeModules.BleManager;

const Buffer = require("buffer").Buffer;
const charactaristicRX = (error, characteristic) => {
  console.log(characteristic)
}

const getDateString = () => {
  let hours: number = new Date().getHours();
  let minutes: number = new Date().getMinutes();
  let seconds: number = new Date().getSeconds();
}

const range = (start: number, end: number, step = 1, isLeftSide: boolean = true) => {
  let output = [];
  if (typeof end === 'undefined') {
    end = start;
    start = 0;
  }
  for (let i: number = start; i < end; i += step) {
    if (isLeftSide) {
      if (i > 99) { output.push(i.toString()); }
      else if (i > 9) { output.push(" " + i.toString()); }
      else {
        output.push(" 0" + i.toString());
      }
    }
    else {
      if (i > 99) { output.push(i.toString()); }
      else if (i > 9) { output.push(i.toString() + " "); }
      else {
        output.push("0" + i.toString() + " ");
      }
    }
  }
  return output;
};



const Clock = () => {
  const {
    rightScore, setRightScore,
    leftScore, setLeftScore,
    peripherals,
    expectedLeftScore, setExpectedLeftScore,
    expectedRightScore, setExpectedRightScore,
    alarmHour, setAlarmHour,
    alarmMinute, setAlarmMinute,
    alarmOn, setAlarmOn,
    hour, setHour,
    minute, setMinute,
    peripheralId, setPeripheralId,
  } = useGlobalContext();
  const [selectedIndex, setSelectedIndex] = useState(0);

  let intervalID: NodeJS.Timeout;

  // const tick = useCallback(() => {
  //   setTimerSeconds(prevSeconds => {
  //     if (!timerStarted) return prevSeconds;

  //     if (prevSeconds > 0) {
  //       return prevSeconds - 1;
  //     } else if (timerMinutes > 0) {
  //       setTimerMinutes(prevMinutes => prevMinutes - 1);
  //       return 59;
  //     } else {
  //       return 0;
  //     }
  //   });
  // }, [timerStarted]);

  // useEffect(() => {

  //   if (timerStarted) {
  //     intervalID = setInterval(tick, 1000);
  //   } else {
  //     // Optionally clear the interval if the timer is not started
  //     clearInterval(intervalID);
  //   }

  //   return () => clearInterval(intervalID);
  // }, [timerStarted, tick]);


  return (
    <SafeAreaView className='bg-primary h-full w-full flex justify-start'>
      <View className='items-center mt-20'>
        <Text className='text-white text-[130px]'>{hour}:{minute < 10 ? "0" + minute : minute}</Text>
      </View>

      <View className='mt-[30px]'>
        <CustomButton
          title="Reset Alarm (Longpress)"
          handleLongPress={async () => {
            await BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x0B]);
            await BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x08, 0, 0]);
            setAlarmHour(0);
            setAlarmMinute(0);
            setAlarmOn(0);
          } }
          containerStyles='bg-gray-400'
          textStyles={'text-3xl'} handlePress={undefined} isLoading={undefined}        />

        <View className='flex-row justify-center items-center'>
          <WheelPicker
            itemStyle={styles.item}
            containerStyle={styles.containerLeft}
            selectedIndicatorStyle={styles.indicator}
            selectedIndex={alarmHour}
            itemTextStyle={!alarmOn ? styles.onText : styles.offText}
            flatListProps={styles.flatList}
            options={range(0, 24, 1, true)}
            onChange={async (index) => {
              await setAlarmHour(index);
              BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x0C, index, alarmMinute]);
            }}
            decelerationRate={"normal"}
            itemHeight={180}
            visibleRest={0}
            scrollEnabled={true}
          />
          <Text className={`text-[100px] -ml-6 -mr-6 pb-6 ${!alarmOn ? 'text-gray-600' : 'text-green-600'}`}> : </Text>
          <WheelPicker
            itemStyle={styles.item}
            containerStyle={styles.containerRight}
            selectedIndicatorStyle={styles.indicator}
            selectedIndex={alarmMinute}
            itemTextStyle={!alarmOn ? styles.onText : styles.offText}
            options={range(0, 60, 1, false)}
            onChange={async (index) => {
              await setAlarmMinute(index)
              BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x0C, alarmHour, index]);
            }}
            decelerationRate={"normal"}
            itemHeight={180}
            visibleRest={0}
          />
          {!alarmOn ? (
            <Image className='absolute right-[1%] h-[110px] w-[56px]'
              source={icons.scroll}
            />
          ) : null}

          {!alarmOn ? (<Image className='absolute right-[22%] -top-[8%] scale-y-50 h-[70px] w-[70px] scale-x-100 opacity-10 -z-10'
            source={icons.doubleArrowGray}
          />) : null}
          {!alarmOn ? (<Image className='absolute rotate-180 right-[22%] top-[68%] scale-y-50 h-[70px] w-[70px] scale-x-100 opacity-10 -z-10'
            source={icons.doubleArrowGray}

          />) : null}
          {!alarmOn ? (<Image className='absolute left-[22%] -top-[8%] scale-y-50 h-[70px] w-[70px] scale-x-100 opacity-10 -z-10'
            source={icons.doubleArrowGray}

          />) : null}
          {!alarmOn ? (<Image className='absolute rotate-180 left-[22%] top-[68%] scale-y-50 h-[70px] w-[70px] scale-x-100 opacity-10 -z-10'
            source={icons.doubleArrowGray}

          />) : null}

          {!alarmOn ? (<View className='absolute right-[15%] w-[32%] h-[95%] border-[1px] border-gray-700 -z-20 rounded-2xl'></View>) : null}
          {!alarmOn ? (<View className='absolute left-[15%] w-[32%] h-[95%] border-[1px] border-gray-700  -z-20 rounded-2xl'></View>) : null}
        </View>

        <CustomButton
          title={alarmOn ? "Alarm is On" : "Alarm is Off"}
          handlePress={() => {
            if (alarmOn == 0) {
              BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x0D]);
              setAlarmOn(0x01);
            }
            else {
              BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x0E]);
              setAlarmOn(0x00);
            }

          } }
          containerStyles={alarmOn ? "bg-green-600" : "bg-gray-600"}
          textStyles={'text-3xl'} isLoading={undefined} handleLongPress={undefined}        />
      </View>
      <CustomButton
        title="Show Clock"
        handlePress={() => {
          BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x05, 0x01]); //set mode clock
        } }
        containerStyles='bg-blue-500'
        textStyles={'text-3xl'} isLoading={undefined} handleLongPress={undefined}      />
    </SafeAreaView>
  )
}

export default Clock

const styles = StyleSheet.create({
  containerLeft: {
    width: "48%",
    alignItems: 'flex-end',
    top: -6
  },
  containerRight: {
    width: "48%",
    alignItems: 'flex-start',
    top: -6
  },

  flatList: {

  },
  indicator: {
    backgroundColor: 'transparent',

  },
  item: {
    paddingHorizontal: 0,

  },
  onText: {
    fontSize: 115,
    color: 'rgb(22 163 74)',
  },
  offText: {
    fontSize: 115,
    color: 'rgb(75 85 99)',
  },
})