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



const Timer = () => {
  const {
    rightScore, setRightScore,
    leftScore, setLeftScore,
    peripherals,
    expectedLeftScore, setExpectedLeftScore,
    expectedRightScore, setExpectedRightScore,
    timerSeconds, setTimerSeconds,
    timerMinutes, setTimerMinutes,
    timerStarted, setTimerStarted,
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
  //       return 59;
  //     } else {
  //       return 0;
  //     }
  //   });
  //   setTimerMinutes(prevMinutes => {
  //     if (!timerStarted || prevMinutes == 0 || timerSeconds != 0) { return prevMinutes; }
  //     else { return prevMinutes - 1; }
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
    <SafeAreaView className='bg-primary h-full w-full flex justify-between'>
      <View className='mt-[60px]'>
        <CustomButton
          title="Reset Timer (Longpress)"
          handleLongPress={async () => {
            await BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x0B]);
            await BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x08, 0, 0]);
            setTimerStarted(0);
            setTimerMinutes(0);
            setTimerSeconds(0);
          } }
          containerStyles='bg-gray-400'
          textStyles={'text-3xl'} handlePress={undefined} isLoading={undefined}        />

        <View className='flex-row justify-center items-center'>
          <WheelPicker
            itemStyle={styles.item}
            containerStyle={styles.containerLeft}
            selectedIndicatorStyle={styles.indicator}
            selectedIndex={timerMinutes}
            itemTextStyle={styles.text}
            flatListProps={styles.flatList}
            options={range(0, 200, 1, true)}
            onChange={async (index) => {
              await setTimerMinutes(index);
              BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x08, index, timerSeconds]);
            }}
            decelerationRate={"normal"}
            itemHeight={180}
            visibleRest={0}
            scrollEnabled={!timerStarted}
          />
          <Text className='text-[100px] text-white -ml-6 -mr-6 pb-6'> : </Text>
          <WheelPicker
            itemStyle={styles.item}
            containerStyle={styles.containerRight}
            selectedIndicatorStyle={styles.indicator}
            selectedIndex={timerSeconds}
            itemTextStyle={styles.text}
            options={range(0, 60, 1, false)}
            onChange={async (index) => {
              await setTimerSeconds(index)
              BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x08, timerMinutes, index]);
            }}
            decelerationRate={"normal"}
            itemHeight={180}
            visibleRest={0}
            scrollEnabled={!timerStarted}
          />
          {!timerStarted ? (
            <Image className='absolute right-[1%] h-[110px] w-[56px]'
              source={icons.scroll}
            />
          ) : null}

          {!timerStarted ? (<Image className='absolute right-[22%] -top-[8%] scale-y-50 h-[70px] w-[70px] scale-x-100 opacity-10 -z-10'
            source={icons.doubleArrowGray}
          />) : null}
          {!timerStarted ? (<Image className='absolute rotate-180 right-[22%] top-[68%] scale-y-50 h-[70px] w-[70px] scale-x-100 opacity-10 -z-10'
            source={icons.doubleArrowGray}

          />) : null}
          {!timerStarted ? (<Image className='absolute left-[22%] -top-[8%] scale-y-50 h-[70px] w-[70px] scale-x-100 opacity-10 -z-10'
            source={icons.doubleArrowGray}

          />) : null}
          {!timerStarted ? (<Image className='absolute rotate-180 left-[22%] top-[68%] scale-y-50 h-[70px] w-[70px] scale-x-100 opacity-10 -z-10'
            source={icons.doubleArrowGray}

          />) : null}

          {!timerStarted ? (<View className='absolute right-[15%] w-[32%] h-[95%] border-[1px] border-gray-700 -z-20 rounded-2xl'></View>) : null}
          {!timerStarted && timerMinutes < 100 ? (<View className='absolute left-[15%] w-[32%] h-[95%] border-[1px] border-gray-700  -z-20 rounded-2xl'></View>) : null}
          {!timerStarted && timerMinutes > 99 ? (<View className='absolute left-[1%] w-[46%] h-[95%] border-[1px] border-gray-700  -z-20 rounded-2xl'></View>) : null}
        </View>

        <CustomButton
          title={timerStarted ? "Pause Timer" : "Start Timer"}
          handlePress={() => {
            if (timerStarted == 0) {
              console.log("start Timer");
              BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x09]);
              setTimerStarted(0x01);
            }
            else {
              console.log("Stop Timer");
              BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x0B]);
              setTimerStarted(0x00);
            }

          } }
          containerStyles={timerStarted ? "bg-red-800" : "bg-green-900"}
          textStyles={'text-3xl'} isLoading={undefined} handleLongPress={undefined}        />
      </View>
      <CustomButton
        title="Show Timer"
        handlePress={() => {
          BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x05, 0x04]); //set mode timer
        } }
        containerStyles='bg-blue-500'
        textStyles={'text-3xl'} isLoading={undefined} handleLongPress={undefined}      />
    </SafeAreaView>
  )
}

export default Timer

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
  text: {
    fontSize: 115,
    color: 'white',
  }
})