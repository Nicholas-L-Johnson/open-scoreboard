import { createContext, useContext, useEffect, useState } from "react";
import {
    Peripheral
} from 'react-native-ble-manager';

interface GlobalContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    isConnected: boolean;
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
    rightScore: number;
    setRightScore: React.Dispatch<React.SetStateAction<number>>;
    leftScore: number;
    setLeftScore: React.Dispatch<React.SetStateAction<number>>;
    expectedRightScore: number;
    setExpectedRightScore: React.Dispatch<React.SetStateAction<number>>;
    expectedLeftScore: number;
    setExpectedLeftScore: React.Dispatch<React.SetStateAction<number>>;
    isScanning: boolean;
    setIsScanning: React.Dispatch<React.SetStateAction<boolean>>;
    timerMinutes: number;
    setTimerMinutes: React.Dispatch<React.SetStateAction<number>>;
    timerSeconds: number;
    setTimerSeconds: React.Dispatch<React.SetStateAction<number>>;
    timerStarted: number;
    setTimerStarted: React.Dispatch<React.SetStateAction<number>>;
    alarmHour: number;
    setAlarmHour: React.Dispatch<React.SetStateAction<number>>;
    alarmMinute: number;
    setAlarmMinute: React.Dispatch<React.SetStateAction<number>>;
    alarmOn: number;
    setAlarmOn: React.Dispatch<React.SetStateAction<number>>;
    hour: number;
    setHour: React.Dispatch<React.SetStateAction<number>>;
    minute: number;
    setMinute: React.Dispatch<React.SetStateAction<number>>;
    militaryTime: number;
    setMilitaryTime: React.Dispatch<React.SetStateAction<number>>;
    peripheralId: string | null;
    setPeripheralId: React.Dispatch<React.SetStateAction<string | null>>;
    peripherals: Map<string, Peripheral>;
    setPeripherals: React.Dispatch<React.SetStateAction<Map<string, Peripheral>>>;
    bleManagerEmitter2: any;
    setBleManagerEmitter2: React.Dispatch<React.SetStateAction<any>>;
}

// const GlobalContext = createContext<GlobalContextType | undefined>(undefined)
// export const useGlobalContext = () => useContext(GlobalContext);

const GlobalContext = createContext<GlobalContextType>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    user: null,
    setUser: () => {},
    isLoading: true,
    setIsLoading: () => {},
    isConnected: false,
    setIsConnected: () => {},
    rightScore: 0,
    setRightScore: () => {},
    leftScore: 0,
    setLeftScore: () => {},
    expectedRightScore: 0,
    setExpectedRightScore: () => {},
    expectedLeftScore: 0,
    setExpectedLeftScore: () => {},
    isScanning: false,
    setIsScanning: () => {},
    timerMinutes: 0,
    setTimerMinutes: () => {},
    timerSeconds: 0,
    setTimerSeconds: () => {},
    timerStarted: 0,
    setTimerStarted: () => {},
    alarmHour: 0,
    setAlarmHour: () => {},
    alarmMinute: 0,
    setAlarmMinute: () => {},
    alarmOn: 0,
    setAlarmOn: () => {},
    hour: 0,
    setHour: () => {},
    minute: 0,
    setMinute: () => {},
    militaryTime: 0,
    setMilitaryTime: () => {},
    peripheralId: null,
    setPeripheralId: () => {},
    peripherals: new Map(),
    setPeripherals: () => {},
    bleManagerEmitter2: null,
    setBleManagerEmitter2: () => {},
});
export const useGlobalContext = () => useContext(GlobalContext);







const GlobalProvider = ({ children }: {children: React.ReactNode}) => {
    const [isConnected, setIsConnected] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [rightScore, setRightScore] = useState(0)
    const [leftScore, setLeftScore] = useState(0)
    const [expectedRightScore, setExpectedRightScore] = useState(0)
    const [expectedLeftScore, setExpectedLeftScore] = useState(0)
    const [isScanning, setIsScanning] = useState(false);
    const [timerMinutes, setTimerMinutes] = useState(0);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerStarted, setTimerStarted] = useState(0);
    const [alarmHour, setAlarmHour] = useState(0);
    const [alarmMinute, setAlarmMinute] = useState(0);
    const [alarmOn, setAlarmOn] = useState(0);
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [militaryTime, setMilitaryTime] = useState(0);
    const [peripheralId, setPeripheralId] = useState<string | null>(null);
    const [peripherals, setPeripherals] = useState(
        new Map<Peripheral['id'], Peripheral>(),
    );
    const [bleManagerEmitter2, setBleManagerEmitter2] = useState(null)





    useEffect(() => {

    }, []);
    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn, setIsLoggedIn,
                user, setUser,
                isLoading, setIsLoading,
                isConnected, setIsConnected,
                rightScore, setRightScore,
                leftScore, setLeftScore,
                isScanning, setIsScanning,
                peripheralId, setPeripheralId,
                peripherals, setPeripherals,
                bleManagerEmitter2, setBleManagerEmitter2,
                expectedRightScore, setExpectedRightScore,
                expectedLeftScore, setExpectedLeftScore,
                timerSeconds, setTimerSeconds,
                timerMinutes, setTimerMinutes,
                timerStarted, setTimerStarted,
                alarmHour, setAlarmHour,
                alarmMinute, setAlarmMinute,
                alarmOn, setAlarmOn,
                hour, setHour,
                minute, setMinute,
                militaryTime, setMilitaryTime,
            }}
        >
            {children}
        </GlobalContext.Provider>
    )
}
export default GlobalProvider;