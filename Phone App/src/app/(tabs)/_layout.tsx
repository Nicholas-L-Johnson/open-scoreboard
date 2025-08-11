import { View, Text, Image} from 'react-native'
import React from 'react'
import {Tabs, Redirect} from 'expo-router'
import {icons} from '../../../constants'

const TabIcon = ({icon, color, name, focused}) => {
  return(
    <View className='items-center justify-center gap-2'>
      <Image
        source={icon}
        resizeMode="contain"
        tintColor ={color}
        className="w-6 h-6"
      />
      <Text className = {`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`} style={{color:color}}>
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#FFA001',
          tabBarInactiveTintColor: '#CDCDE0',
          tabBarStyle: {
            backgroundColor: '#161622',
            borderTopWidth: 1,
            borderTopColor: '#232533',
            height: 84,
          },
        }}
      >
        <Tabs.Screen 
          name = "scoreboard"
          options ={{
            title: 'Scoreboard',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name="Scoreboard"
                focused={focused}
              />
            )
          }}          
        />
        
        <Tabs.Screen 
          name = "timer"
          options ={{
            title: 'Timer',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name="Timer"
                focused={focused}
              />
            )
          }}          
        />
      
        <Tabs.Screen 
          name = "clock"
          options ={{
            title: 'Clock',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Clock"
                focused={focused}
              />
            )
          }}          
        />
        <Tabs.Screen 
          name = "settings"
          options ={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Settings"
                focused={focused}
              />
            )
          }}          
        />
        
      </Tabs>
    </>
  )
}

export default TabsLayout