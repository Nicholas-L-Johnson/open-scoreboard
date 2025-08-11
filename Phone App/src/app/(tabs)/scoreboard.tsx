import { View, Text, SafeAreaView, NativeModules, NativeEventEmitter, ImageBackground, ScrollView } from 'react-native'
import React from 'react'
import { useGlobalContext } from "../../../context/GlobalProvider";
import CustomButton from "../../../components/CustomButton"
// import { BleManager, Device } from 'react-native-ble-plx'
import { useState } from "react";
import base64 from 'react-native-base64'
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
  PeripheralInfo,
} from 'react-native-ble-manager';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const BleManagerModule = NativeModules.BleManager;

const Buffer = require("buffer").Buffer;
const charactaristicRX = (error, characteristic) => {
  console.log(characteristic)
}
const Scoreboard = () => {
  const {
    peripheralId, setPeripheralId,
    rightScore, leftScore, setRightScore, setLeftScore, peripherals, expectedLeftScore, setExpectedLeftScore, expectedRightScore, setExpectedRightScore } = useGlobalContext();


  return (
    <SafeAreaView className='bg-primary h-full w-full '>
      <View className='flex-row items-center mt-7'>
        <CustomButton
          title="Reset scores (Longpress)"
          handleLongPress={() => {
            setRightScore(0);
            setLeftScore(0);
            BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x04]);
          } }
          containerStyles='mt-7 mx-4 bg-white flex-[90%]'
          textStyles={'text-3xl'} handlePress={undefined} isLoading={undefined}        />
      </View>

      <View className='w-full flex-row items-start'>
        <View className="space-y-3 flex-[40%]">
          <CustomButton
            title="+"
            handlePress={() => {
              if (leftScore < 199) {
                BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x00]);
                setLeftScore(leftScore + 1);
              }
            } }
            containerStyles='mt-7 mx-4 bg-red-500'
            textStyles={'text-3xl'} isLoading={undefined} handleLongPress={undefined}          />
          <Text className={`text-gray-100 ${leftScore > 99 ? 'text-8xl top-5' : 'text-9xl top-2'} text-center  min-h-[16%]`}>
            {leftScore < 10 ? '0' : ''}{leftScore}
          </Text>

          <CustomButton
            title="-"
            handlePress={() => {
              if (leftScore > 0) {
                BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x01]);
                setLeftScore(leftScore - 1);
              }
            } }
            containerStyles='mx-4 bg-red-500'
            textStyles={'text-3xl'} isLoading={undefined} handleLongPress={undefined}          />
        </View>
        <View className="space-y-3 flex-[40%]">
          <CustomButton
            title="+"
            handlePress={() => {
              if (rightScore < 199) {
                BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x02]);
                setRightScore(rightScore + 1);
              }
            } }
            containerStyles='mt-7 mx-4 bg-blue-500'
            textStyles={'text-3xl'} isLoading={undefined} handleLongPress={undefined}          />
          <Text className={`text-gray-100 ${rightScore > 99 ? 'text-8xl top-5' : 'text-9xl top-2'} text-center  min-h-[16%]`}>
            {rightScore < 10 ? '0' : ''}{rightScore}
          </Text>
          <CustomButton
            title="-"
            handlePress={() => {
              if (rightScore > 0) {
                BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x03]);

                setRightScore(rightScore - 1);
              }
            } }
            containerStyles='mx-4 bg-blue-500'
            textStyles={'text-3xl'} isLoading={undefined} handleLongPress={undefined}          />
        </View>
      </View>
      <View className='h-[30%] flex-row items-end'>
        <CustomButton
          title="Show Scoreboard"
          handlePress={() => {
            BleManager.write(peripheralId, "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", "ef7cfdb8-d2de-487b-8ffb-b92fb304f351", [0x05, 0x00]); //set mode scoreboard
          } }
          containerStyles='mt-7 w-[90%] mx-4 bg-blue-500'
          textStyles={'text-3xl'} isLoading={undefined} handleLongPress={undefined}        />
      </View>

      {/* <View className='w-[100%] h-[5%] mb-10 flex-1'>
        <LinearGradient className='flex-1 items-center' colors={['white', 'transparent']} end={[]} />
      </View> */}
      {/* <MaskedView className='h-[10%] w-10 flex-1 items-center justify-center bg-white'
        maskElement={
          <LinearGradient className='flex-1 h-[100%] w-[100%]  items-center' colors={['white', 'transparent']} />
        }
      >
        <CustomButton
          title="-"
          handlePress={() => {
            console.log(JSON.stringify(peripherals, null, 4))
          }}
          containerStyles='mt-7 mx-4 bg-blue-500 w-10 h-[20%]'
          textStyles={'text-3xl'}
        />
      </MaskedView> */}


    </SafeAreaView>
  )
}

export default Scoreboard